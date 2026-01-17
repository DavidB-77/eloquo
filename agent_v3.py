import logging
logger = logging.getLogger(__name__)
"""
import logging
logger = logging.getLogger(__name__)
Eloquo Agent V3 - Built with Agno Framework
Multi-agent prompt optimization with structured outputs
"""
import os
import json
import time
from datetime import datetime
from typing import Any,  Optional, Literal
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

import csv
import io
from datetime import timedelta
from fastapi.responses import StreamingResponse

# Agno imports
from agno.agent import Agent
from agno.models.openrouter import OpenRouter

# Langfuse imports
from langfuse import get_client, observe

load_dotenv()

# Initialize Langfuse
langfuse = get_client()

# ============== CONFIGURATION ==============
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# ============== CONFIGURATION ==============
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Model configuration per tier
TIER_MODELS = {
    "basic": {
        "classify": "google/gemini-2.0-flash-lite-preview-02-05",
        "analyze": "google/gemini-2.0-flash-001",
        "generate": "google/gemini-2.0-flash-001",
    },
    "pro": {
        "classify": "google/gemini-2.0-flash-lite-preview-02-05",
        "analyze": "google/gemini-2.0-flash-001",
        "generate": "google/gemini-2.0-flash-001",
    },
    "business": {
        "classify": "google/gemini-2.0-flash-lite-preview-02-05",
        "analyze": "google/gemini-2.0-flash-001",
        "generate": "google/gemini-2.0-flash-001",
    },
    "enterprise": {
        "classify": "google/gemini-2.0-flash-lite-preview-02-05",
        "analyze": "google/gemini-2.0-flash-001",
        "generate": "google/gemini-2.0-flash-001",
    },
}

def get_models_for_tier(tier: str):
    return TIER_MODELS.get(tier, TIER_MODELS["business"])
# Cost per 1M tokens (input/output)
MODEL_COSTS = {
    "google/gemini-2.5-flash-lite": {"input": 0.10, "output": 0.40},
    "google/gemini-2.5-flash": {"input": 0.30, "output": 2.50},
    "deepseek/deepseek-chat": {"input": 0.14, "output": 0.28},
}


# ============== DOMAIN PERSONAS ==============
DOMAIN_PERSONAS = {
    "technical": "You are an experienced software engineer with deep expertise in clean code, best practices, debugging, and technical documentation. You write production-ready solutions.",
    "education": "You are a patient, knowledgeable educator who explains concepts clearly at the appropriate level, uses helpful examples, and checks for understanding.",
    "business": "You are a strategic business consultant who provides actionable, ROI-focused advice with clear next steps and measurable outcomes.",
    "career": "You are an experienced career coach with recruiting and hiring background who provides practical, industry-aware guidance.",
    "creative": "You are a creative professional who balances imagination with practical execution, offering fresh perspectives while respecting constraints.",
    "health": "You are a health-informed guide providing evidence-based wellness information. You always recommend consulting healthcare professionals for medical decisions.",
    "personal": "You are a helpful life assistant who provides practical, actionable guidance for everyday challenges and decisions.",
    "home": "You are a knowledgeable DIY and home expert who explains projects clearly with attention to safety, skill level, and budget.",
    "research": "You are a thorough academic researcher who values accuracy, proper methodology, and balanced presentation of evidence.",
    "marketing": "You are a marketing strategist focused on engagement, conversion, brand voice, and measurable results.",
    "legal": "You are a legal information resource providing general guidance on legal concepts. You always recommend consulting a licensed attorney for specific legal advice.",
    "communication": "You are a communication expert skilled in tone, clarity, audience awareness, and persuasive writing.",
    "finance": "You are a financial information guide who explains concepts clearly. You always recommend consulting a licensed financial advisor for investment decisions.",
    "travel": "You are an experienced travel advisor who provides practical tips, local insights, and helps plan memorable experiences within budget.",
    "food": "You are a culinary guide who provides clear recipes, cooking techniques, and meal planning advice adapted to skill level and dietary needs.",
    "parenting": "You are a supportive parenting resource who provides practical, age-appropriate guidance while respecting diverse parenting styles.",
    "productivity": "You are a productivity coach who helps optimize workflows, manage time effectively, and build sustainable habits.",
    "entertainment": "You are an entertainment guide who provides thoughtful recommendations based on preferences and helps discover new content.",
}

# Chain-of-thought phrases by domain
COT_PHRASES = {
    "default": "Think through this step by step before providing your answer.",
    "technical": "Break down the problem systematically, consider edge cases, then provide your solution.",
    "research": "Analyze the available information methodically before drawing conclusions.",
    "business": "Consider the key factors and tradeoffs before providing your recommendation.",
    "education": "Think through how to explain this clearly, then present your explanation.",
    "creative": "Explore different angles and possibilities before settling on your approach.",
}

# Models that do internal reasoning (don't add CoT to these)
REASONING_MODELS = ["o1", "o3", "o3-mini", "o4-mini"]


def get_persona_for_domain(domain: str) -> str:
    """Get the appropriate persona for a domain."""
    return DOMAIN_PERSONAS.get(domain, "")


def get_cot_phrase(domain: str, complexity: str, target_model: str = "auto") -> str:
    """Get chain-of-thought phrase if appropriate."""
    # Don't add CoT for simple tasks
    if complexity == "simple":
        return ""
    
    # Don't add CoT for reasoning models (they do it internally)
    # Check both the target_model setting and REASONING_MODELS list
    if target_model == "reasoning" or target_model in REASONING_MODELS:
        return ""
    
    # For "auto" mode, we add CoT (user hasn't specified reasoning model)
    # Get domain-specific or default CoT phrase
    return COT_PHRASES.get(domain, COT_PHRASES["default"])
def get_self_refine_instruction(user_tier: str, complexity: str) -> str:
    """Get self-refine instruction. Enabled for ALL tiers to ensure quality showcase."""
    # We enable this for everyone now
    # if user_tier not in ["pro", "business"]: return ""
    
    # Only skip for very simple tasks where it might be overkill
    if complexity == "simple":
        return ""
    
    return """

Before finalizing your response:
1. Review for completeness - have you addressed all aspects of the request?
2. Check accuracy - are your facts, recommendations, and examples sound?
3. Verify structure - does the response follow the requested format?
4. Refine as needed, then present your polished final answer."""

# File analysis model (needs vision)
FILE_ANALYSIS_MODEL = "google/gemini-2.5-flash"

# ============== PYDANTIC MODELS ==============
class QuestionOption(BaseModel):
    value: str = Field(..., description="Option value to store")
    label: str = Field(..., description="Option label to display")

class ClarifyingQuestion(BaseModel):
    id: str = Field(..., description="Unique identifier for the question")
    question: str = Field(..., description="The clarifying question to ask")
    type: Literal["text", "select", "number"] = Field(..., description="Input type")
    options: Optional[list[QuestionOption]] = Field(default=None, description="Options for select type")

class ClassifyResult(BaseModel):
    complexity: Literal["simple", "moderate", "complex"] = Field(..., description="Prompt complexity level")
    domain: str = Field(..., description="Domain category like coding, writing, business, etc")
    needs_clarification: bool = Field(..., description="Whether clarifying questions are needed")
    questions: list[ClarifyingQuestion] = Field(default=[], description="Clarifying questions if needed")

class AnalyzeResult(BaseModel):
    key_elements: list[str] = Field(..., description="Key elements identified in the prompt")
    missing_context: list[str] = Field(..., description="Missing context that would improve the prompt")
    optimization_opportunities: list[str] = Field(..., description="Specific ways to improve the prompt")
    target_audience: Optional[str] = Field(default=None, description="Identified target audience")
    suggested_tone: Optional[str] = Field(default=None, description="Suggested tone for the output")

class GenerateResult(BaseModel):
    optimized_prompt: str = Field(..., description="The main optimized prompt")
    full_version: str = Field(..., description="Comprehensive version with all details")
    quick_ref: str = Field(..., description="Short reference version")
    snippet: str = Field(..., description="Ultra-short version for quick use")
    improvements: list[str] = Field(..., description="List of improvements made")
    quality_score: float = Field(..., ge=0, le=10, description="Quality score 0-10")
    techniques_applied: list[str] = Field(default=[], description="List of optimization techniques applied")
    # Pro tier fields
    why_this_works: Optional[str] = Field(default=None, description="Explanation of why the optimizations work")
    pro_tips: Optional[list[str]] = Field(default=None, description="Additional tips for better results")
    # Business tier fields
    alternative_approaches: Optional[list[str]] = Field(default=None, description="Alternative ways to frame the prompt")
    ab_variants: Optional[list[str]] = Field(default=None, description="A/B test variations of the prompt")

class OptimizeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000)
    user_tier: Literal["basic", "pro", "business", "enterprise"] = Field(default="basic")
    context: Optional[str] = Field(default=None)
    clarification_answers: Optional[dict] = Field(default=None)
    files: Optional[list[dict]] = Field(default=None, description="Base64 encoded files")
    target_model: Optional[str] = Field(default="auto", description="Target AI model: auto, gpt, claude, gemini, reasoning, cursor")

class OptimizeResponse(BaseModel):
    status: Literal["success", "needs_clarification", "error"]
    questions: Optional[list[ClarifyingQuestion]] = None
    message: Optional[str] = None
    optimized_prompt: Optional[str] = None
    full_version: Optional[str] = None
    quick_ref: Optional[str] = None
    snippet: Optional[str] = None
    improvements: list[str] = []
    quality_score: Optional[float] = None
    processing_time_ms: int = 0
    stages_used: list[str] = []
    domain: Optional[str] = None
    metrics: Optional[dict] = None
    techniques_applied: Optional[list[str]] = None
    # Pro tier fields
    why_this_works: Optional[str] = None
    pro_tips: Optional[list[str]] = None
    # Business tier fields
    alternative_approaches: Optional[list[str]] = None
    ab_variants: Optional[list[str]] = None
    analytics: Optional[dict] = None # New field for passing detailed logs to Convex

# ============== AGENT PROMPTS ==============

CLASSIFY_SYSTEM = """You are an expert prompt classifier. Analyze the user's prompt and return JSON.

Determine:
1. complexity: "simple" | "moderate" | "complex"
2. domain: coding, writing, business, creative, technical, educational, personal, health, finance, marketing, legal, home, travel, food, etc.
3. needs_clarification: true only if prompt is vague or missing critical details

=== CLARIFYING QUESTIONS RULES ===

If needs_clarification is true, generate 2-4 clarifying questions.

**CRITICAL: ALWAYS use "select" type with dropdown options. NEVER use "text" type.**

Every question MUST be a dropdown with 3-8 realistic options. Transform any question into a selection:

WRONG (text): "What is the reason for your request?"
RIGHT (select): "What's the main reason?" with options: Personal appointment, Family matter, Medical, Mental health day, Other

WRONG (text): "What details would you like to include?"
RIGHT (select): "What should be emphasized?" with options: Coverage arranged, Urgent matter, Flexible timing, Will be reachable, Work caught up

WRONG (text): "Describe your target audience"
RIGHT (select): "Who is your target audience?" with options: Small businesses, Enterprise, Consumers, Developers, Students, General public

**Question Design Guidelines:**
- 3-8 options per question (never more than 8)
- Include "Other" or "Not sure" as last option when appropriate
- Options should cover 90% of common answers
- Make options mutually understandable at a glance

=== EXAMPLE OUTPUT FORMAT ===

{
  "complexity": "moderate",
  "domain": "business",
  "needs_clarification": true,
  "questions": [
    {
      "id": "1",
      "question": "What's the main reason for time off?",
      "type": "select",
      "options": [
        {"value": "personal", "label": "Personal appointment"},
        {"value": "family", "label": "Family matter"},
        {"value": "medical", "label": "Medical"},
        {"value": "mental_health", "label": "Mental health day"},
        {"value": "home", "label": "Home repair/delivery"},
        {"value": "other", "label": "Other"}
      ]
    },
    {
      "id": "2",
      "question": "What's your relationship with your boss?",
      "type": "select",
      "options": [
        {"value": "formal", "label": "Formal/Professional"},
        {"value": "friendly", "label": "Friendly but professional"},
        {"value": "casual", "label": "Casual/Informal"},
        {"value": "new", "label": "New (still establishing)"}
      ]
    },
    {
      "id": "3",
      "question": "Is coverage arranged?",
      "type": "select",
      "options": [
        {"value": "yes_named", "label": "Yes, specific colleague"},
        {"value": "yes_team", "label": "Yes, team will handle"},
        {"value": "no_needed", "label": "No, but needed"},
        {"value": "not_needed", "label": "Not needed for my role"}
      ]
    }
  ]
}

=== DOMAIN-SPECIFIC DROPDOWN EXAMPLES ===

**Coding:** Language, Framework, Experience level, Purpose (learning/production/prototype)
**Writing:** Tone, Audience, Length, Format (email/report/post)
**Business:** Company size, Industry, Timeline, Budget range
**Creative:** Style, Medium, Mood, Target audience
**Educational:** Student level, Subject, Learning goal, Format preference

Return ONLY valid JSON, no markdown. ALL questions MUST be "select" type with options array."""
ANALYZE_SYSTEM = """You are an expert prompt analyst. Given a prompt and its classification, perform deep analysis:
1. Identify all key elements and requirements
2. Find missing context that would improve results
3. Identify specific optimization opportunities
4. Determine target audience and appropriate tone

Be thorough but concise. Focus on actionable insights."""

GENERATE_SYSTEM = """You are an elite prompt engineer who transforms basic prompts into professional-grade, highly effective prompts using proven techniques from Google, OpenAI, and industry research.

YOUR MISSION: Take the user's original prompt and create dramatically improved versions that will get significantly better results from any AI.

=== CRITICAL OUTPUT STRUCTURE ===
Every optimized prompt MUST follow this section order (OpenAI recommended for maximum effectiveness):

1. **IDENTITY** (when applicable)
   - Who should the AI act as? What expertise?
   - Example: "You are an experienced financial advisor specializing in retirement planning..."

2. **INSTRUCTIONS**
   - Clear rules and behaviors to follow
   - What to do AND what NOT to do
   - Specific constraints (length, tone, format, audience)
   - Example: "Provide 3-5 actionable recommendations. Use plain language, avoid jargon. Include specific examples."

3. **CONTEXT** (user's specific situation)
   - Background information provided by user
   - Relevant details that shape the response
   - Any constraints (budget, time, skill level)

4. **REQUEST**
   - The clear, specific task to accomplish
   - What output is expected

=== UNIVERSAL IMPROVEMENT TECHNIQUES ===

**Specificity Transformation:**
- Replace vague words with concrete details
- "good" → specific criteria like "under budget, completed by Friday, approved by stakeholders"
- "some" → actual numbers or ranges
- "help me with" → exactly what kind of help (review, create, explain, compare)

**Output Definition:**
- Specify format: bullet points, numbered steps, table, narrative, code block
- Define length: "in 3-5 sentences", "under 200 words", "comprehensive with sections"
- Request structure: "organize by priority", "include pros and cons", "start with summary"

**Constraint Extraction:**
- Identify and make explicit any mentioned: budget, timeline, audience, skill level, preferences
- Add guardrails: what to include, what to avoid, what assumptions to state

**Actionability Boost:**
- Ensure the prompt asks for something the AI can actually deliver
- Break complex requests into clear components
- Request specific deliverables, not vague "help"

=== DOMAIN-SPECIFIC ENHANCEMENTS ===

**Technical/Coding:**
- Specify language, framework, version requirements
- Request error handling, edge cases, comments
- Ask for explanation of approach, not just code
- Include performance or security considerations if relevant

**Writing/Communication:**
- Define tone (formal, conversational, persuasive)
- Specify audience (executives, beginners, peers)
- Request specific structure (intro, body, conclusion)
- Include word count or length guidance

**Business/Strategy:**
- Add stakeholder context
- Request measurable outcomes or KPIs
- Ask for prioritized recommendations
- Include timeline or resource constraints

**Education/Learning:**
- Specify current knowledge level
- Request examples and analogies
- Ask for practice problems or next steps
- Include what format helps learning (visual, step-by-step)

**Creative:**
- Provide style references or mood
- Set creative constraints that spark ideas
- Request multiple options or variations
- Include what makes it unique or fresh

**Research/Analysis:**
- Request sources or evidence
- Ask for balanced perspectives
- Specify depth (overview vs. deep dive)
- Include how conclusions should be presented

=== OUTPUT REQUIREMENTS ===

Generate these versions:

1. **optimized_prompt**: The main production-ready prompt
   - Apply ALL relevant techniques above
   - Use the IDENTITY → INSTRUCTIONS → CONTEXT → REQUEST structure
   - This is your PRIMARY deliverable - make it comprehensive and valuable
   - Should be CLEARLY better than what a free AI would produce if asked to "improve this prompt"

2. **full_version**: Extended version with maximum detail
   - Everything in optimized_prompt PLUS additional context
   - More examples, more specificity, more guardrails
   - For users who want the most thorough prompt possible

3. **quick_ref**: Condensed version keeping key improvements
   - Core structure and main enhancements
   - For quick use when full version is too long
   - Still significantly better than original

4. **snippet**: Ultra-short essence (1-2 sentences)
   - The core request distilled
   - Useful for simple AI interactions

5. **improvements**: List of SPECIFIC techniques applied
   - Be concrete: "Added expert persona (financial advisor)", "Specified output format (numbered list)", "Extracted budget constraint ($500 limit)"
   - NOT vague like "made it clearer" - say exactly what you did

6. **quality_score**: Rate 0-10 based on:
   - Structure clarity (2 pts): Does it follow IDENTITY→INSTRUCTIONS→CONTEXT→REQUEST?
   - Specificity (2 pts): Are vague words replaced with concrete details?
   - Output definition (2 pts): Is the expected output format clear?
   - Constraints (2 pts): Are limitations and requirements explicit?
   - Actionability (2 pts): Can the AI clearly deliver what's asked?

=== IMPORTANT REMINDERS ===

- Your optimized prompts work for ANYONE: students, parents, developers, executives, hobbyists
- The improvement should be OBVIOUS - users should immediately see the value
- Don't over-complicate simple requests - match complexity to the task
- Preserve the user's core intent while enhancing structure and clarity
- If the original prompt is already good, enhance it subtly rather than over-engineering"""

# ============== FEW-SHOT EXAMPLES (Business Tier) ==============
BUSINESS_EXAMPLES = """
=== EXAMPLE TRANSFORMATIONS ===

**Example 1: Vague Request → Structured Professional Prompt**

BEFORE: "Help me write a business email"

AFTER: "As an experienced business communication specialist, draft a professional email with the following specifications:

CONTEXT: I need to follow up with a potential client who attended our product demo last week but hasn't responded to my initial outreach.

INSTRUCTIONS:
- Tone: Professional but warm, not pushy
- Length: 150-200 words maximum
- Include a specific reference to something from the demo
- Propose a clear next step with two time options
- Avoid generic phrases like 'just checking in' or 'circling back'

OUTPUT: The complete email ready to send, with subject line included."

---

**Example 2: Simple Question → Comprehensive Analysis Request**

BEFORE: "What marketing strategies should I use?"

AFTER: "As a senior marketing strategist with expertise in digital and traditional channels, analyze and recommend marketing strategies for my situation:

CONTEXT: B2B SaaS startup, $50K monthly marketing budget, target audience is HR directors at mid-size companies (200-2000 employees), currently have 500 email subscribers and minimal social presence.

INSTRUCTIONS:
- Prioritize strategies by expected ROI
- For each strategy, include: estimated cost, timeline to results, required resources
- Focus on lead generation over brand awareness at this stage
- Consider our limited team (2 marketers)

OUTPUT: A prioritized list of 5-7 strategies in table format, followed by a recommended 90-day action plan with specific milestones."

---

**Example 3: Technical Request → Production-Ready Specification**

BEFORE: "Write code to process CSV files"

AFTER: "As a senior Python developer focused on data processing and reliability, create a CSV processing module with these specifications:

REQUIREMENTS:
- Read CSV files of varying sizes (up to 1GB)
- Handle common issues: missing values, inconsistent date formats, encoding problems
- Support both local files and S3 URLs
- Memory-efficient processing for large files

TECHNICAL CONSTRAINTS:
- Python 3.9+, use pandas for processing
- Include type hints and docstrings
- Implement proper error handling with informative messages
- Add logging for debugging

OUTPUT:
1. Main processing class with clear public interface
2. Example usage showing common operations
3. Brief explanation of design decisions for handling edge cases"

=== NOW APPLY THESE PATTERNS ===
Transform the user's prompt using the same level of enhancement shown above.
"""

# ============== HELPER FUNCTIONS ==============


# ============== RATING MODELS ==============

class RatingRequest(BaseModel):
    request_id: str = Field(..., description="The agent request ID to rate")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5 stars")
    feedback: Optional[str] = Field(default=None, max_length=1000, description="Optional feedback text")

class RatingResponse(BaseModel):
    status: Literal["success", "error"]
    message: str

def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate cost for a model call."""
    costs = MODEL_COSTS.get(model, {"input": 0.5, "output": 1.5})
    return (input_tokens * costs["input"] / 1_000_000) + (output_tokens * costs["output"] / 1_000_000)

    return (input_tokens * costs["input"] / 1_000_000) + (output_tokens * costs["output"] / 1_000_000)

# Supabase logging removed - analytics passed in response for handling by main app

# ============== EXPORT MODELS ==============

class ExportRequest(BaseModel):
    format: Literal["json", "csv"] = Field(default="json", description="Export format")
    user_id: str = Field(..., description="User ID to export data for")
    user_tier: Literal["basic", "pro", "business"] = Field(default="basic")

# ============== PROMPT LOADER ==============
# Load trained prompts on startup (if available)

import json as _json
from pathlib import Path as _Path

def _load_trained_prompts():
    """Load trained prompts from JSON file if available"""
    prompts_path = _Path("/opt/eloquo-agent/trained_prompts.json")
    if prompts_path.exists():
        try:
            with open(prompts_path) as f:
                data = _json.load(f)
                trained = {}
                for name, info in data.get("prompts", {}).items():
                    trained[name] = info.get("improved", info.get("original", ""))
                logger.info(f"✓ Loaded {len(trained)} trained prompts")
                return trained
        except Exception as e:
            logger.warning(f"Could not load trained prompts: {e}")
    return {}

# Load on module import
_TRAINED_PROMPTS = _load_trained_prompts()

# ============== PROJECT PROTOCOL MODELS ==============

class ProjectProtocolRequest(BaseModel):
    """Request for BMAD document generation"""
    project_idea: str = Field(..., min_length=20, description="Describe your project idea in detail")
    project_type: str = Field(default="saas", description="Type: saas, webapp, mobile, api, tool")
    tech_preferences: Optional[str] = Field(default=None, description="Preferred tech stack")
    target_audience: Optional[str] = Field(default=None, description="Who is this for")
    additional_context: Optional[str] = Field(default=None, description="Any other context")
    user_id: str = Field(..., description="User ID for credit deduction")
    user_email: Optional[str] = Field(default=None, description="User email for fallback lookup")
    user_tier: str = Field(default="basic", description="User tier for tracking")

class ProjectAnalysis(BaseModel):
    """Intermediate analysis result"""
    project_name: str
    project_summary: str
    problem_statement: str
    target_users: list[str]
    core_features: list[str]
    mvp_scope: list[str]
    suggested_stack: dict[str, str]
    technical_complexity: str
    risks: list[str]

class ProjectProtocolResponse(BaseModel):
    """Response with generated BMAD documents"""
    success: bool
    request_id: Optional[str] = None  # For rating this generation
    project_name: str
    project_summary: str
    documents: dict[str, str]  # prd, architecture, stories
    analysis: dict[str, Any]
    metrics: dict[str, Any]
    credits_used: int = 5


# Credit cost for Project Protocol
PROJECT_PROTOCOL_COST = 5


# Tier-based history limits (in days)
HISTORY_LIMITS = {
    "basic": 180,      # 6 months
    "pro": 365,        # 1 year
    "business": None   # Unlimited
}


# ============== AGENT FACTORY ==============

@observe(as_type="generation")

# ============== FILE ANALYSIS ==============

async def analyze_files(files: list[dict]) -> str:
    """Analyze uploaded files using Gemini 2.5 Flash vision."""
    if not files:
        return ""
    
    try:
        # Build multimodal content
        content_parts = [{
            "type": "text",
            "text": """Analyze the uploaded file(s) and extract:
1. What type of content this is (screenshot, diagram, document, code, etc.)
2. Key information relevant to prompt optimization
3. Any specific details that should be incorporated

Be concise but thorough. Return a summary that can be used as context."""
        }]
        
        for file in files:
            if file.get("base64") and file.get("mimeType"):
                content_parts.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{file['mimeType']};base64,{file['base64']}"
                    }
                })
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://eloquo.io",
                    "X-Title": "Eloquo",
                    "Content-Type": "application/json",
                },
                json={
                    "model": FILE_ANALYSIS_MODEL,
                    "messages": [{"role": "user", "content": content_parts}],
                    "max_tokens": 1500,
                    "temperature": 0.2,
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"File analysis error: {e}")
        return ""
def create_classifier(model_id: str) -> Agent:
    """Create classifier agent."""
    return Agent(
        name="Classifier",
        model=OpenRouter(id=model_id, api_key=OPENROUTER_API_KEY, timeout=50),
        description=CLASSIFY_SYSTEM,
        output_schema=ClassifyResult,
        markdown=False,
    )

@observe(as_type="generation")
def create_analyzer(model_id: str) -> Agent:
    """Create analyzer agent."""
    return Agent(
        name="Analyzer",
        model=OpenRouter(id=model_id, api_key=OPENROUTER_API_KEY, timeout=50),
        description=ANALYZE_SYSTEM,
        output_schema=AnalyzeResult,
        markdown=False,
    )

@observe(as_type="generation")
def create_generator(model_id: str) -> Agent:
    """Create generator agent."""
    return Agent(
        name="Generator",
        model=OpenRouter(id=model_id, api_key=OPENROUTER_API_KEY, timeout=50),
        description=GENERATE_SYSTEM,
        output_schema=GenerateResult,
        markdown=False,
    )

# ============== FASTAPI APP ==============

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Eloquo Agent V3 (Agno) starting...")
    print(f"📡 OpenRouter: {'✓' if OPENROUTER_API_KEY else '✗'}")
    print(f"📊 Supabase: {'✓' if SUPABASE_URL else '✗'}")
    yield
    print("👋 Eloquo Agent V3 shutting down...")

app = FastAPI(
    title="Eloquo Agent V3",
    description="Multi-agent prompt optimization powered by Agno",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== ENDPOINTS ==============

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": "3.0.0",
        "framework": "agno",
        "openrouter_configured": bool(OPENROUTER_API_KEY),
        "framework": "agno",
        "openrouter_configured": bool(OPENROUTER_API_KEY),
        "langfuse_configured": bool(os.getenv("LANGFUSE_SECRET_KEY")),
    }

@app.post("/optimize", response_model=OptimizeResponse)
async def optimize(request: OptimizeRequest):
    """Main optimization endpoint."""
    start_time = time.time()
    metrics = {
        "total_tokens": 0,
        "total_cost": 0,
        "stages": {}
    }
    stages_used = []
    
    try:

        # Stage 0: File Analysis (if files uploaded)
        file_context = ""
        if request.files:
            logger.info(f"[STAGE 0] Starting File Analysis for {len(request.files)} files...")
            file_ts = time.time()
            file_context = await analyze_files(request.files)
            logger.info(f"[STAGE 0] File Analysis complete in {time.time() - file_ts:.2f}s")
            if file_context:
                stages_used.append("file_analysis")
                metrics["stages"]["file_analysis"] = {
                    "model": FILE_ANALYSIS_MODEL,
                    "files_count": len(request.files)
                }
        models = get_models_for_tier(request.user_tier)
        
        # Stage 1: Classify
        logger.info(f"[STAGE 1] Starting Classification (Model: {models['classify']})...")
        classify_ts = time.time()
        classifier = create_classifier(models["classify"])
        classify_prompt = f"Analyze this prompt:\n\n{request.prompt}"
        if request.context:
            classify_prompt += f"\n\nAdditional context: {request.context}"
        if file_context:
            classify_prompt += f"\n\nFile analysis: {file_context}"
        classify_response = classifier.run(classify_prompt)
        classification: ClassifyResult = classify_response.content
        logger.info(f"[STAGE 1] Classification complete in {time.time() - classify_ts:.2f}s (Result: {classification.complexity})")
        stages_used.append("classify")
        
        # Track metrics (Agno doesn't expose token counts directly, estimate)
        metrics["stages"]["classify"] = {
            "model": models["classify"],
            "complexity": classification.complexity,
            "domain": classification.domain
        }
        
        # Check if clarification needed
        if classification.needs_clarification and not request.clarification_answers:
            processing_time = int((time.time() - start_time) * 1000)
            return OptimizeResponse(
                status="needs_clarification",
                questions=classification.questions,
                message="To create the best optimized prompt, I need a bit more context:",
                processing_time_ms=processing_time,
                stages_used=stages_used,
                domain=classification.domain,
            )
        
        # Stage 2: Analyze (for moderate/complex)
        analysis = None
        if classification.complexity in ["moderate", "complex"]:
            logger.info(f"[STAGE 2] Starting Analysis (Model: {models['analyze']})...")
            analyze_ts = time.time()
            analyzer = create_analyzer(models["analyze"])
            analyze_prompt = f"""Original prompt: {request.prompt}
Classification: {classification.complexity} complexity, {classification.domain} domain
"""
            if request.clarification_answers:
                analyze_prompt += f"User provided context: {json.dumps(request.clarification_answers)}"
            
            analyze_response = analyzer.run(analyze_prompt)
            analysis: AnalyzeResult = analyze_response.content
            logger.info(f"[STAGE 2] Analysis complete in {time.time() - analyze_ts:.2f}s")
            stages_used.append("analyze")
            
            metrics["stages"]["analyze"] = {
                "model": models["analyze"],
                "key_elements": len(analysis.key_elements),
                "opportunities": len(analysis.optimization_opportunities)
            }
        
        # Stage 3: Generate
        logger.info(f"[STAGE 3] Starting Generation (Model: {models['generate']})...")
        gen_ts = time.time()
        generator = create_generator(models["generate"])
        generate_prompt = f"""Original prompt: {request.prompt}
Domain: {classification.domain}
Complexity: {classification.complexity}
User Tier: {request.user_tier}
"""
        if analysis:
            generate_prompt += f"""
Key elements: {', '.join(analysis.key_elements)}
Missing context: {', '.join(analysis.missing_context)}
Optimization opportunities: {', '.join(analysis.optimization_opportunities)}
"""
        if request.clarification_answers:
            generate_prompt += f"\n\nCRITICAL USER CONTEXT (Must be incorporated):\n{json.dumps(request.clarification_answers, indent=2)}"
        
        
        
        # === PHASE 1 & 2 ENHANCEMENTS ===
        techniques_applied = []
        
        # Add domain persona
        persona = get_persona_for_domain(classification.domain)
        if persona:
            generate_prompt = f"Domain expertise context: {persona}\n\n{generate_prompt}"
            techniques_applied.append(f"Domain persona: {classification.domain}")
        
        # Add chain-of-thought for moderate/complex tasks (respects target_model)
        target_model = getattr(request, 'target_model', 'auto') or 'auto'
        cot_phrase = get_cot_phrase(classification.domain, classification.complexity, target_model)
        if cot_phrase:
            generate_prompt += f"\n\nReasoning instruction: {cot_phrase}"
            techniques_applied.append("Chain-of-thought reasoning")
        
        # Add self-refine for Pro/Business complex tasks
        self_refine = get_self_refine_instruction(request.user_tier, classification.complexity)
        if self_refine:
            generate_prompt += self_refine
            techniques_applied.append("Self-refine instruction")
        
        # Track additional techniques based on what GENERATE_SYSTEM applies
        techniques_applied.append("Structured output format (Identity→Instructions→Context→Request)")
        if classification.complexity in ["moderate", "complex"]:
            techniques_applied.append("Specificity enhancement")
        if request.clarification_answers:
            techniques_applied.append("User context integration")
        # === END PHASE 1 & 2 ENHANCEMENTS ===
        # Add few-shot examples for Business tier
        if request.user_tier == "business":
            generate_prompt = BUSINESS_EXAMPLES + "\n\n" + generate_prompt
            techniques_applied.append("Few-shot examples for enhanced quality")
        
        
        generate_response = generator.run(generate_prompt)
        result: GenerateResult = generate_response.content
        logger.info(f"[STAGE 3] Generation complete in {time.time() - gen_ts:.2f}s")
        stages_used.append("generate")
        
        metrics["stages"]["generate"] = {
            "model": models["generate"],
            "quality_score": result.quality_score
        }
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Log to Supabase
        await log_to_supabase({
            "user_tier": request.user_tier,
            "domain": classification.domain,
            "complexity": classification.complexity,
            "quality_score": result.quality_score,
            "processing_time_ms": processing_time,
            "stages_used": stages_used,
            "agent_version": "3.0.0"
        })
        
        # Prepare analytics payload for Convex
        analytics_payload = {
            "status": "success",
            "completion_tokens": metrics["total_tokens"], # Approx total
            "total_tokens": metrics["total_tokens"],
            "total_cost": metrics["total_cost"],
            "stages_used": stages_used,
            "complexity": classification.complexity,
            "domain": classification.domain,
            "models": {
                "classify": metrics["stages"].get("classify", {}).get("model"),
                "analyze": metrics["stages"].get("analyze", {}).get("model"),
                "generate": metrics["stages"].get("generate", {}).get("model"),
            },
            # Add granular costs if tracked in metrics["stages"]
        }

        return OptimizeResponse(
            status="success",
            optimized_prompt=result.optimized_prompt,
            full_version=result.full_version,
            quick_ref=result.quick_ref,
            snippet=result.snippet,
            improvements=result.improvements,
            techniques_applied=techniques_applied,
            quality_score=result.quality_score,
            processing_time_ms=processing_time,
            stages_used=stages_used,
            domain=classification.domain,
            metrics=metrics,
            analytics=analytics_payload,
            why_this_works=result.why_this_works,
            pro_tips=result.pro_tips,
            alternative_approaches=result.alternative_approaches,
            ab_variants=result.ab_variants,
        )
        
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        return OptimizeResponse(
            status="error",
            message=str(e),
            processing_time_ms=processing_time,
            stages_used=stages_used,
        )

@app.get("/admin/metrics")
async def get_metrics():
    """Basic metrics endpoint."""
    return {
        "version": "3.0.0",
        "framework": "agno",
        "status": "operational"
    }

# ============== RUN ==============


# ============== PROJECT PROTOCOL ENDPOINT (PARALLEL) ==============

import asyncio

# Model configuration - Gemini 3 Flash for frontier quality
PP_MODEL = "google/gemini-3-flash-preview"  # $0.50/$3.00 per 1M tokens - Best quality
PP_MODEL_ANALYSIS = "google/gemini-3-flash-preview"  # Same for analysis

# Pricing per 1M tokens (for cost calculation)
PP_MODEL_INPUT_COST = 0.50   # $ per 1M input tokens
PP_MODEL_OUTPUT_COST = 3.00  # $ per 1M output tokens

# Alternative models (uncomment to try):
# PP_MODEL = "google/gemini-2.5-flash-lite"  # $0.10/$0.40 - cheaper, good quality
# PP_MODEL = "google/gemini-2.5-flash-lite"  # $0.075/$0.30 - cheapest

# ---------------------------------------------------------
# SYSTEM PROMPTS - Uses trained prompts if available
# ---------------------------------------------------------

if 'SYSTEM_PROMPTS' not in globals():
    SYSTEM_PROMPTS = {}

# Load trained prompts if available
if '_TRAINED_PROMPTS' in globals():
    _trained = _TRAINED_PROMPTS
else:
    _trained = {}

SYSTEM_PROMPTS['pp_analyze'] = _trained.get('pp_analyze', """You are a senior product analyst. Analyze this project idea and extract structured information.

Output a JSON object with these exact fields:
{
  "project_name": "Short, catchy name for the project",
  "project_summary": "2-3 sentence summary",
  "problem_statement": "The core problem being solved",
  "target_users": ["User type 1", "User type 2"],
  "core_features": ["Feature 1", "Feature 2", "Feature 3"],
  "mvp_scope": ["MVP feature 1", "MVP feature 2"],
  "suggested_stack": {
    "frontend": "Suggested frontend tech",
    "backend": "Suggested backend tech",
    "database": "Suggested database",
    "hosting": "Suggested hosting"
  },
  "technical_complexity": "simple|moderate|complex",
  "risks": ["Risk 1", "Risk 2"]
}

Respond ONLY with valid JSON, no markdown or explanation.""")

SYSTEM_PROMPTS['pp_prd'] = _trained.get('pp_prd', """You are a senior Product Manager creating a comprehensive PRD.

Create a detailed Product Requirements Document in Markdown format with these sections:

# Product Requirements Document: [Project Name]

## 1. Executive Summary
Brief overview of the product and its value proposition.

## 2. Problem Statement
What problem does this solve? Who has this problem?

## 3. Goals & Success Metrics
- Primary goals
- Key metrics (KPIs)
- Success criteria

## 4. Target Users
User personas with their needs and pain points.

## 5. Functional Requirements
For each feature:
- **FR-01**: [Feature Name]
  - Description
  - User Story: As a [user], I want [goal] so that [benefit]
  - Acceptance Criteria
  - Priority: Must Have | Should Have | Nice to Have

## 6. Non-Functional Requirements
- **NFR-01**: Performance requirements
- **NFR-02**: Security requirements
- **NFR-03**: Scalability requirements

## 7. MVP Scope
What's included in MVP vs post-MVP.

## 8. User Flows
Key user journeys with steps.

## 9. Risks & Mitigations
| Risk | Impact | Likelihood | Mitigation |

## 10. Open Questions
Unresolved questions needing stakeholder input.

Be specific, actionable, and thorough. This document should be usable by a development team.""")

SYSTEM_PROMPTS['pp_architecture'] = _trained.get('pp_architecture', """You are a senior Software Architect creating a technical architecture document.

Create a comprehensive Architecture Document in Markdown format:

# Architecture Document: [Project Name]

## 1. System Overview
High-level architecture description and diagram (describe in text or Mermaid syntax).

## 2. Tech Stack
| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | | |
| Backend | | |
| Database | | |
| Auth | | |
| Hosting | | |

## 3. System Components
Describe each major component, its responsibility, and how it interacts with others.

## 4. Database Schema
```sql
-- Provide complete schema with tables, relationships, indexes
CREATE TABLE...
```

## 5. API Design
For each endpoint:
- **Endpoint**: METHOD /path
- **Purpose**: What it does
- **Request**: Schema/example
- **Response**: Schema/example
- **Auth**: Required/Optional

## 6. Authentication & Authorization
- Auth method (JWT, OAuth, etc.)
- Permission model
- Security considerations

## 7. Data Flow
How data moves through the system for key operations.

## 8. Scalability Considerations
- Potential bottlenecks
- Scaling strategies
- Caching approach

## 9. Third-Party Integrations
External services and how they're integrated.

## 10. Deployment Architecture
Infrastructure diagram, CI/CD approach, environments.

Be specific with technology choices. Include actual SQL schemas and API contracts.""")

SYSTEM_PROMPTS['pp_stories'] = _trained.get('pp_stories', """You are a senior Scrum Master creating implementation stories.

Create a detailed Implementation Stories document in Markdown format:

# Implementation Stories: [Project Name]

## Sprint Overview
Organize stories into logical sprints/phases.

## Sprint 1: Foundation
### Story 1.1: [Title]
**Description**: What we're building
**Acceptance Criteria**:
- [ ] Given... When... Then...
- [ ] Given... When... Then...
**Technical Notes**: Implementation guidance
**Dependencies**: What this depends on
**Estimated Effort**: S/M/L

### Story 1.2: [Title]
...

## Sprint 2: Core Features
### Story 2.1: [Title]
...

## Sprint 3: Polish & Launch
### Story 3.1: [Title]
...

## Technical Debt & Future Considerations
Items to address post-MVP.

## Definition of Done
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Deployed to staging

Create at least 10-15 stories covering the full MVP scope. Each story should be specific enough for a developer to implement.""")


async def call_openrouter_async(
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 2000
) -> dict[str, Any]:
    """Async helper to call OpenRouter API"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://eloquo.io",
                "X-Title": "Eloquo"
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "max_tokens": max_tokens,
                "temperature": 0.4
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"OpenRouter API error: {response.text}"
            )
        
        data = response.json()
        return {
            "content": data["choices"][0]["message"]["content"],
            "tokens": data.get("usage", {}).get("total_tokens", 0)
        }


@app.post("/project-protocol", response_model=ProjectProtocolResponse)
@observe(name="project-protocol-parallel")
async def generate_project_protocol(request: ProjectProtocolRequest):
    """
    Generate BMAD-compatible project documents.
    Cost: 5 credits
    
    PARALLEL VERSION: PRD, Architecture, and Stories generate simultaneously
    after analysis completes. ~30-35 seconds total (down from 70s).
    
    Returns PRD, Architecture, and Implementation Stories.
    """
    start_time = datetime.utcnow()
    total_tokens = 0
    
    try:
        # Step 1: Check and deduct credits via Eloquo API (Convex)
        eloquo_api_url = os.getenv("ELOQUO_API_URL", "http://localhost:3000")
        agent_secret = os.getenv("AGENT_SECRET", "eloquo-agent-internal-key")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Check credits first
            credits_response = await client.post(
                f"{eloquo_api_url}/api/agent/credits",
                headers={
                    "Authorization": f"Bearer {agent_secret}",
                    "Content-Type": "application/json",
                },
                json={
                    "user_id": request.user_id,
                    "email": request.user_email,
                    "action": "check"
                }
            )

            if credits_response.status_code == 404:
                raise HTTPException(status_code=404, detail="User not found")
            if credits_response.status_code != 200:
                logger.error(f"Credits check failed: {credits_response.text}")
                raise HTTPException(status_code=500, detail="Failed to check credits")

            credits_data = credits_response.json()
            current_credits = credits_data.get("comprehensive_credits_remaining", 0)
            
            if current_credits < PROJECT_PROTOCOL_COST:
                raise HTTPException(
                    status_code=402,
                    detail=f"Insufficient credits. Need {PROJECT_PROTOCOL_COST}, have {current_credits}"
                )

            # Deduct credits
            deduct_response = await client.post(
                f"{eloquo_api_url}/api/agent/credits",
                headers={
                    "Authorization": f"Bearer {agent_secret}",
                    "Content-Type": "application/json",
                },
                json={
                    "user_id": request.user_id,
                    "email": request.user_email,
                    "action": "deduct",
                    "amount": PROJECT_PROTOCOL_COST
                }
            )

            if deduct_response.status_code != 200:
                logger.error(f"Credits deduction failed: {deduct_response.text}")
                raise HTTPException(status_code=500, detail="Failed to deduct credits")
        
        # Step 2: Analyze project idea (must complete first)
        logger.info(f"Project Protocol: Analyzing project idea for user {request.user_id}")
        
        analysis_response = await call_openrouter_async(
            model=PP_MODEL_ANALYSIS,
            system_prompt=SYSTEM_PROMPTS['pp_analyze'],
            user_prompt=f"""Analyze this project:

PROJECT IDEA: {request.project_idea}
PROJECT TYPE: {request.project_type}
TECH PREFERENCES: {request.tech_preferences or 'No preference'}
TARGET AUDIENCE: {request.target_audience or 'General'}
ADDITIONAL CONTEXT: {request.additional_context or 'None'}""",
            max_tokens=1500
        )
        
        # Parse analysis JSON
        try:
            analysis_text = analysis_response["content"]
            if "```json" in analysis_text:
                analysis_text = analysis_text.split("```json")[1].split("```")[0]
            elif "```" in analysis_text:
                analysis_text = analysis_text.split("```")[1].split("```")[0]
            analysis = json.loads(analysis_text.strip())
        except json.JSONDecodeError:
            logger.error(f"Failed to parse analysis: {analysis_response['content']}")
            analysis = {
                "project_name": "Untitled Project",
                "project_summary": request.project_idea[:200],
                "problem_statement": "To be determined",
                "target_users": ["General users"],
                "core_features": ["Core functionality"],
                "mvp_scope": ["Basic features"],
                "suggested_stack": {"frontend": "React", "backend": "Node.js", "database": "PostgreSQL", "hosting": "Vercel"},
                "technical_complexity": "moderate",
                "risks": ["Technical feasibility"]
            }
        
        total_tokens += analysis_response.get("tokens", 0)
        analysis_time = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Analysis complete in {analysis_time:.1f}s")
        
        # Step 3: Generate PRD, Architecture, and Stories IN PARALLEL
        logger.info("Project Protocol: Generating documents in parallel...")
        parallel_start = datetime.utcnow()
        
        # Prepare prompts for parallel execution
        prd_prompt = f"""Create a PRD for:

PROJECT NAME: {analysis.get('project_name', 'Project')}
SUMMARY: {analysis.get('project_summary', '')}
PROBLEM: {analysis.get('problem_statement', '')}
TARGET USERS: {', '.join(analysis.get('target_users', []))}
CORE FEATURES: {', '.join(analysis.get('core_features', []))}
MVP SCOPE: {', '.join(analysis.get('mvp_scope', []))}
COMPLEXITY: {analysis.get('technical_complexity', 'moderate')}
RISKS: {', '.join(analysis.get('risks', []))}

ORIGINAL IDEA: {request.project_idea}
TARGET AUDIENCE: {request.target_audience or 'See analysis'}
ADDITIONAL CONTEXT: {request.additional_context or 'None'}"""

        arch_prompt = f"""Create an Architecture Document for:

PROJECT NAME: {analysis.get('project_name', 'Project')}
SUMMARY: {analysis.get('project_summary', '')}
FEATURES: {', '.join(analysis.get('core_features', []))}
SUGGESTED STACK: {json.dumps(analysis.get('suggested_stack', {}))}
COMPLEXITY: {analysis.get('technical_complexity', 'moderate')}
TECH PREFERENCES: {request.tech_preferences or 'Use suggested stack'}
MVP SCOPE: {', '.join(analysis.get('mvp_scope', []))}"""

        stories_prompt = f"""Create Implementation Stories for:

PROJECT NAME: {analysis.get('project_name', 'Project')}
MVP SCOPE: {', '.join(analysis.get('mvp_scope', []))}
CORE FEATURES: {', '.join(analysis.get('core_features', []))}
SUGGESTED STACK: {json.dumps(analysis.get('suggested_stack', {}))}
COMPLEXITY: {analysis.get('technical_complexity', 'moderate')}

Create detailed, actionable stories organized into sprints."""

        # Run all three in parallel using asyncio.gather
        prd_task = call_openrouter_async(
            model=PP_MODEL,
            system_prompt=SYSTEM_PROMPTS['pp_prd'],
            user_prompt=prd_prompt,
            max_tokens=4000
        )
        
        arch_task = call_openrouter_async(
            model=PP_MODEL,
            system_prompt=SYSTEM_PROMPTS['pp_architecture'],
            user_prompt=arch_prompt,
            max_tokens=4000
        )
        
        stories_task = call_openrouter_async(
            model=PP_MODEL,
            system_prompt=SYSTEM_PROMPTS['pp_stories'],
            user_prompt=stories_prompt,
            max_tokens=4000
        )
        
        # Wait for all to complete
        prd_response, arch_response, stories_response = await asyncio.gather(
            prd_task, arch_task, stories_task
        )
        
        parallel_time = (datetime.utcnow() - parallel_start).total_seconds()
        logger.info(f"Parallel generation complete in {parallel_time:.1f}s")
        
        # Extract content and tokens
        prd_content = prd_response["content"]
        arch_content = arch_response["content"]
        stories_content = stories_response["content"]
        
        total_tokens += prd_response.get("tokens", 0)
        total_tokens += arch_response.get("tokens", 0)
        total_tokens += stories_response.get("tokens", 0)
        
        # Calculate metrics
        end_time = datetime.utcnow()
        processing_time_ms = int((end_time - start_time).total_seconds() * 1000)
        
        # Calculate actual cost based on token usage
        # Estimate input vs output tokens (roughly 30% input, 70% output for this use case)
        input_tokens = int(total_tokens * 0.30)
        output_tokens = int(total_tokens * 0.70)
        actual_cost = (input_tokens / 1_000_000 * PP_MODEL_INPUT_COST) + (output_tokens / 1_000_000 * PP_MODEL_OUTPUT_COST)
        
        # Calculate revenue based on credits used (5 credits)
        # We'll store the credit value and calculate revenue in analytics
        credits_used = PROJECT_PROTOCOL_COST
        
        # Log to Supabase with full financial data
        async with httpx.AsyncClient() as client:
            log_response = await client.post(
                f"{SUPABASE_URL}/rest/v1/agent_requests",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json={
                    "user_id": request.user_id,
                    "user_tier": request.user_tier,
                    "prompt_preview": request.project_idea[:500],
                    "prompt_length": len(request.project_idea),
                    "target_model": PP_MODEL,
                    "strength": "comprehensive",
                    "domain": request.project_type,
                    "complexity": analysis.get("technical_complexity", "moderate"),
                    "output_mode": "bmad",
                    "processing_time_ms": processing_time_ms,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "total_tokens": total_tokens,
                    "total_cost": actual_cost,  # Actual API cost
                    "credits_used": credits_used,  # Credits charged to user
                    "quality_score": 8.5,
                    "status": "completed",
                    "project_name": analysis.get("project_name", "Project"),
                    "project_summary": analysis.get("project_summary", ""),
                    "prd_document": prd_content,
                    "architecture_document": arch_content,
                    "stories_document": stories_content
                }
            )
            
            request_id = None
            if log_response.status_code in [200, 201]:
                log_data = log_response.json()
                if log_data and len(log_data) > 0:
                    request_id = log_data[0].get("id")
        
        logger.info(f"Project Protocol complete: {analysis.get('project_name')} in {processing_time_ms}ms ({processing_time_ms/1000:.1f}s)")
        
        return ProjectProtocolResponse(
            success=True,
            request_id=request_id,
            project_name=analysis.get("project_name", "Project"),
            project_summary=analysis.get("project_summary", ""),
            documents={
                "prd": prd_content,
                "architecture": arch_content,
                "stories": stories_content
            },
            analysis=analysis,
            metrics={
                "total_tokens": total_tokens,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "processing_time_ms": processing_time_ms,
                "processing_time_sec": round(processing_time_ms / 1000, 1),
                "analysis_time_sec": round(analysis_time, 1),
                "parallel_gen_time_sec": round(parallel_time, 1),
                "model": PP_MODEL,
                "api_cost_usd": round(actual_cost, 6)
            },
            credits_used=PROJECT_PROTOCOL_COST
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Project Protocol failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    import uvicorn
    # Use port 8001 to match Next.js API configuration
    uvicorn.run(app, host="0.0.0.0", port=8001)


# ============== RATING ENDPOINT ==============

@app.post("/rate", response_model=RatingResponse)
@observe(name="rate-optimization")
async def rate_optimization(request: RatingRequest):
    """
    Rate a previous optimization.
    Used by the Adaptive Intelligence Engine for self-improvement.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/agent_requests",
                params={"id": f"eq.{request.request_id}"},
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                json={
                    "user_rating": request.rating,
                    "user_feedback": request.feedback,
                    "rated_at": datetime.utcnow().isoformat()
                }
            )
            
            if response.status_code not in [200, 204]:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to save rating: {response.text}"
                )
        
        return RatingResponse(
            status="success",
            message=f"Thank you for your {request.rating}-star rating!"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return RatingResponse(
            status="error",
            message=str(e)
        )


# ============== EXPORT ENDPOINT ==============

@app.get("/export")
@observe(name="export-library")
async def export_library(
    user_id: str,
    format: str = "json",
    user_tier: str = "basic"
):
    """
    Export user's prompt library as JSON or CSV.
    Respects tier-based history limits.
    """
    try:
        # Calculate date cutoff based on tier
        history_days = HISTORY_LIMITS.get(user_tier)
        
        async with httpx.AsyncClient() as client:
            # Build query URL
            url = f"{SUPABASE_URL}/rest/v1/agent_requests"
            params = {
                "select": "id,created_at,prompt_preview,target_model,strength,domain,complexity,quality_score,user_rating,user_feedback,rated_at",
                "user_id": f"eq.{user_id}",
                "order": "created_at.desc"
            }
            
            # Add date filter for non-business tiers
            if history_days:
                cutoff_date = (datetime.utcnow() - timedelta(days=history_days)).isoformat()
                params["created_at"] = f"gte.{cutoff_date}"
            
            response = await client.get(
                url,
                params=params,
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to fetch data: {response.text}"
                )
            
            data = response.json()
            
            if not data:
                raise HTTPException(
                    status_code=404,
                    detail="No prompts found for this user"
                )
            
            # Format response
            if format.lower() == "csv":
                return _export_csv(data, user_id)
            else:
                return _export_json(data, user_id)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _export_json(data: list, user_id: str):
    """Export as JSON file"""
    export_data = {
        "exported_at": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "total_prompts": len(data),
        "prompts": data
    }
    
    json_str = json.dumps(export_data, indent=2, default=str)
    
    return StreamingResponse(
        io.BytesIO(json_str.encode()),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=eloquo-export-{user_id[:8]}.json"
        }
    )


def _export_csv(data: list, user_id: str):
    """Export as CSV file"""
    if not data:
        return StreamingResponse(
            io.BytesIO(b"No data"),
            media_type="text/csv"
        )
    
    output = io.StringIO()
    
    # Define CSV columns
    fieldnames = [
        "id", "created_at", "prompt_preview", 
        "target_model", "strength", "domain", "complexity",
        "quality_score", "user_rating", "user_feedback", "rated_at"
    ]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    
    for row in data:
        # Clean up text fields for CSV
        if row.get("prompt_preview"):
            row["prompt_preview"] = row["prompt_preview"].replace("\n", " ").replace("\r", "")
        if row.get(""):
            row[""] = row[""].replace("\n", " ").replace("\r", "")
        writer.writerow(row)
    
    csv_bytes = output.getvalue().encode('utf-8')
    
    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=eloquo-export-{user_id[:8]}.csv"
        }
    )


# ============== REFINE ENDPOINT ==============
class RefineRequest(BaseModel):
    original_prompt: str = Field(..., description="The original optimized prompt")
    instruction: str = Field(..., description="How to refine it")
    user_tier: Literal["basic", "pro", "business"] = Field(default="basic")

class RefineResponse(BaseModel):
    status: Literal["success", "error"]
    refined_prompt: str = None
    changes_made: list[str] = []
    error: str = None

@app.post("/refine", response_model=RefineResponse)
async def refine_prompt(request: RefineRequest):
    """Refine an already optimized prompt based on user instruction."""
    try:
        models = TIER_MODELS[request.user_tier]

        refine_system = """You are an expert prompt engineer. Refine the prompt based on the instruction.

OUTPUT FORMAT - Use this EXACT JSON structure:
{"refined_prompt": "your refined prompt here", "changes": ["change 1", "change 2", "change 3"]}

Rules:
- refined_prompt: Complete refined prompt, NO markdown, NO labels
- changes: List of 3-5 brief changes you made
- Return ONLY the JSON object, nothing else"""

        refine_user = f"""Original prompt:
{request.original_prompt}

Instruction: {request.instruction}"""

        response = await call_openrouter_async(
            model=models["generate"],
            system_prompt=refine_system,
            user_prompt=refine_user,
            max_tokens=2000
        )

        # Parse JSON response
        import json as json_mod
        raw = response.get("content", "").strip()
        
        try:
            # Clean markdown code blocks if present
            if "```" in raw:
                raw = raw.split("```json")[-1].split("```")[0] if "```json" in raw else raw.split("```")[1].split("```")[0]
            data = json_mod.loads(raw.strip())
            refined = data.get("refined_prompt", raw)
            changes = data.get("changes", [])
        except:
            # Fallback: clean markdown from response
            refined = raw
            for prefix in ["**Refined Prompt:**", "Refined Prompt:", "Refined:"]:
                if prefix in refined:
                    refined = refined.split(prefix, 1)[-1]
            for marker in ["**Specific Changes", "**Changes Made", "Changes made:", "Changes:"]:
                if marker in refined:
                    refined = refined.split(marker)[0]
            refined = refined.strip()
            changes = []

        return RefineResponse(
            status="success",
            refined_prompt=refined,
            changes_made=changes[:5]
        )

    except Exception as e:
        logger.error(f"Refine error: {e}")
        return RefineResponse(status="error", error=str(e))
