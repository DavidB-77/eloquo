import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Choose your Eloquo plan. Basic $7/mo, Pro $9/mo, or Business $20/mo. AI-powered prompt optimization for ChatGPT, Claude, and Gemini.",
  keywords: ["eloquo pricing", "AI prompt optimizer cost", "prompt engineering pricing", "ChatGPT optimizer price"],
  openGraph: {
    title: "Eloquo Pricing - AI Prompt Optimizer Plans",
    description: "Transform your prompts starting at $7/month. Choose Basic, Pro, or Business plans.",
  },
};

export default function SelectPlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
