"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Rocket, Zap, FileText, Building2, ListChecks, Copy, Check, Download, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/UserProvider";
import { useAuth } from "@/providers/BetterAuthProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import JSZip from "jszip";

const PROJECT_TYPES = [
    { value: "saas", label: "SaaS Application" },
    { value: "website", label: "Website" },
    { value: "mobile-app", label: "Mobile App" },
    { value: "api", label: "API / Backend" },
    { value: "cli-tool", label: "CLI Tool" },
    { value: "browser-extension", label: "Browser Extension" },
    { value: "other", label: "Other" },
];

const PROGRESS_STAGES = [
    { key: "analyzing", label: "Analyzing Project" },
    { key: "prd", label: "Generating PRD" },
    { key: "architecture", label: "Generating Architecture" },
    { key: "stories", label: "Generating Stories" },
];

type Tab = "prd" | "architecture" | "stories";

interface ProjectResult {
    projectName: string;
    projectSummary: string;
    documents: {
        prd: string;
        architecture: string;
        stories: string;
    };
    metrics: {
        totalTokens: number;
        processingTimeMs: number;
        processingTimeSec: number;
    };
}

export default function ProjectProtocolPage() {
    // Form state
    const [projectIdea, setProjectIdea] = React.useState("");
    const [projectType, setProjectType] = React.useState("saas");
    const [techPreferences, setTechPreferences] = React.useState("");
    const [targetAudience, setTargetAudience] = React.useState("");
    const [additionalContext, setAdditionalContext] = React.useState("");

    // UI state
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [currentStage, setCurrentStage] = React.useState(0);
    const [stageProgress, setStageProgress] = React.useState(0);
    const [result, setResult] = React.useState<ProjectResult | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [activeTab, setActiveTab] = React.useState<Tab>("prd");
    const [copied, setCopied] = React.useState(false);

    const { userData, refreshUserData } = useUser();
    const { user } = useAuth();

    const creditsRemaining = userData ? (userData.optimizationsLimit - userData.optimizationsUsed) : 0;
    const canGenerate = creditsRemaining >= 5 && projectIdea.length >= 20;

    const handleGenerate = async () => {
        if (!canGenerate) return;

        setIsGenerating(true);
        setError(null);
        setCurrentStage(0);
        setStageProgress(0);

        // Simulate progress while waiting for API
        const progressInterval = setInterval(() => {
            setStageProgress((prev) => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 5;
            });
        }, 500);

        const stageInterval = setInterval(() => {
            setCurrentStage((prev) => {
                if (prev >= 3) return prev;
                return prev + 1;
            });
        }, 20000);

        try {
            const response = await fetch("/api/project-protocol", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectIdea,
                    projectType,
                    techPreferences,
                    targetAudience,
                    additionalContext,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult({
                    projectName: data.projectName,
                    projectSummary: data.projectSummary,
                    documents: data.documents,
                    metrics: data.metrics,
                });
                await refreshUserData();
            } else {
                setError(data.error || "Generation failed");
            }
        } catch (err) {
            setError("Failed to connect to generation service");
        } finally {
            clearInterval(progressInterval);
            clearInterval(stageInterval);
            setIsGenerating(false);
        }
    };

    const handleCopy = async (content: string) => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyAll = async () => {
        if (!result) return;
        const allContent = `# ${result.projectName}\n\n## PRD\n\n${result.documents.prd}\n\n---\n\n## ARCHITECTURE\n\n${result.documents.architecture}\n\n---\n\n## STORIES\n\n${result.documents.stories}`;
        await handleCopy(allContent);
    };

    const handleDownloadZip = async () => {
        if (!result) return;

        const zip = new JSZip();
        zip.file("PRD.md", result.documents.prd);
        zip.file("ARCHITECTURE.md", result.documents.architecture);
        zip.file("STORIES.md", result.documents.stories);
        zip.file("README.md", `# ${result.projectName}\n\n${result.projectSummary}\n\n## Files\n\n- PRD.md - Product Requirements Document\n- ARCHITECTURE.md - Technical Architecture\n- STORIES.md - Implementation Stories\n\nGenerated by Eloquo Project Protocol`);

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.projectName.toLowerCase().replace(/\s+/g, "-")}-docs.zip`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        setResult(null);
        setProjectIdea("");
        setTechPreferences("");
        setTargetAudience("");
        setAdditionalContext("");
        setActiveTab("prd");
    };

    // Results view
    if (result) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight">Project Protocol</h1>
                        <p className="text-muted-foreground mt-1">Documents generated successfully</p>
                    </div>
                    <Badge variant="pro" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        PRO Feature
                    </Badge>
                </div>

                {/* Success Banner */}
                <Card className="glass border-electric-cyan/30 bg-electric-cyan/5">
                    <CardContent className="py-6">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-electric-cyan/20 flex items-center justify-center">
                                <Check className="h-6 w-6 text-electric-cyan" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-white mb-1">{result.projectName}</h2>
                                <p className="text-sm text-white/60">{result.projectSummary}</p>
                            </div>
                        </div>
                        <div className="flex gap-6 mt-4 pt-4 border-t border-electric-cyan/20">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-white/50">Tokens:</span>
                                <span className="font-bold text-white">{result.metrics.totalTokens.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-white/50">Time:</span>
                                <span className="font-bold text-white">{result.metrics.processingTimeSec}s</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-white/50">Documents:</span>
                                <span className="font-bold text-white">3</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-white/50">Credits Used:</span>
                                <span className="font-bold text-white">5</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Card className="glass border-electric-cyan/20 overflow-hidden">
                    <div className="flex bg-midnight/60 p-2 gap-2 border-b border-electric-cyan/10">
                        {[
                            { key: "prd", label: "PRD", icon: FileText },
                            { key: "architecture", label: "Architecture", icon: Building2 },
                            { key: "stories", label: "Stories", icon: ListChecks },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key as Tab)}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all",
                                    activeTab === key
                                        ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 max-h-[500px] overflow-auto">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result.documents[activeTab]}
                            </ReactMarkdown>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 border-electric-cyan/20"
                        onClick={() => handleCopy(result.documents[activeTab])}
                    >
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? "Copied!" : `Copy ${activeTab.toUpperCase()}`}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-12 border-electric-cyan/20"
                        onClick={handleCopyAll}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                    </Button>
                    <Button
                        variant="gradient"
                        className="flex-1 h-12"
                        onClick={handleDownloadZip}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download .zip
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="text-white/50 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Generate Another
                </Button>
            </div>
        );
    }

    // Generating view
    if (isGenerating) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight">Project Protocol</h1>
                        <p className="text-muted-foreground mt-1">Generating your documents...</p>
                    </div>
                </div>

                <Card className="glass border-purple-500/30 overflow-hidden">
                    <CardContent className="py-12">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
                                <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                                <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">Generating Documents</span>
                            </div>
                        </div>

                        <div className="space-y-4 max-w-xl mx-auto">
                            {PROGRESS_STAGES.map((stage, i) => (
                                <div key={stage.key} className="flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-midnight border border-purple-500/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-electric-cyan transition-all duration-500"
                                            style={{
                                                width: i < currentStage ? "100%" :
                                                    i === currentStage ? `${stageProgress}%` : "0%"
                                            }}
                                        />
                                    </div>
                                    <span className={cn(
                                        "text-xs min-w-[150px] font-medium",
                                        i < currentStage ? "text-electric-cyan" :
                                            i === currentStage ? "text-purple-400" : "text-white/30"
                                    )}>
                                        {i < currentStage ? "✅" : i === currentStage ? "🔄" : "⏳"} {stage.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-white/50 text-sm mt-8">
                            Estimated time: ~90 seconds
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Form view
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Project Protocol</h1>
                    <p className="text-muted-foreground mt-1">
                        Generate PRD, Architecture & Implementation Stories from your project idea
                    </p>
                </div>
                <Badge variant="pro" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    5 Credits per Generation
                </Badge>
            </div>

            {/* Error */}
            {error && (
                <Card className="border-red-500/50 bg-red-500/10">
                    <CardContent className="py-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Project Idea */}
            <Card className="glass border-purple-500/20 p-0.5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-electric-cyan to-purple-500 bg-[length:200%_auto] animate-gradient opacity-30" />
                <CardContent className="relative bg-midnight/90 rounded-[18px] p-6 space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-3 block">
                            Your Project Idea <span className="text-red-400">*</span>
                        </label>
                        <Textarea
                            placeholder="Describe your project idea in detail. What problem does it solve? Who is it for? What are the main features?"
                            value={projectIdea}
                            onChange={(e) => setProjectIdea(e.target.value)}
                            rows={6}
                            className="resize-none bg-midnight border-purple-500/20 focus:border-purple-500 text-white placeholder:text-white/20 rounded-xl"
                        />
                        <div className="flex justify-between mt-2">
                            <span className={cn(
                                "text-xs",
                                projectIdea.length < 20 ? "text-red-400" : "text-white/40"
                            )}>
                                Minimum 20 characters
                            </span>
                            <span className="text-xs text-white/40">{projectIdea.length} characters</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Project Details */}
            <Card className="glass border-electric-cyan/20">
                <CardContent className="p-6 space-y-6">
                    <div className="text-[10px] font-bold text-electric-cyan uppercase tracking-[0.2em]">
                        Project Details (Optional)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs text-white/60 mb-2 block">Project Type</label>
                            <Select
                                value={projectType}
                                onChange={(e) => setProjectType(e.target.value)}
                                className="bg-deep-teal/20 border-electric-cyan/20 text-white rounded-xl"
                            >
                                {PROJECT_TYPES.map((type) => (
                                    <option key={type.value} value={type.value} className="bg-midnight">
                                        {type.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label className="text-xs text-white/60 mb-2 block">Tech Preferences</label>
                            <Input
                                placeholder="e.g., React, Node.js, PostgreSQL"
                                value={techPreferences}
                                onChange={(e) => setTechPreferences(e.target.value)}
                                className="bg-deep-teal/20 border-electric-cyan/20 text-white rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/60 mb-2 block">Target Audience</label>
                            <Input
                                placeholder="e.g., Remote teams, freelancers"
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                className="bg-deep-teal/20 border-electric-cyan/20 text-white rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/60 mb-2 block">Additional Context</label>
                            <Input
                                placeholder="Budget, timeline, existing systems..."
                                value={additionalContext}
                                onChange={(e) => setAdditionalContext(e.target.value)}
                                className="bg-deep-teal/20 border-electric-cyan/20 text-white rounded-xl"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-white/50">
                    Credits remaining: <span className="font-bold text-white">{creditsRemaining}</span>
                </div>
                <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="h-14 px-10 bg-gradient-to-r from-purple-500 to-electric-cyan text-white font-bold uppercase tracking-wider rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
                >
                    <Rocket className="h-5 w-5 mr-3" />
                    Generate Documents (5 Credits)
                </Button>
            </div>
        </div>
    );
}
