import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Eloquo account and start optimizing prompts with AI. Get better results from ChatGPT, Claude, and Gemini.",
  openGraph: {
    title: "Sign Up for Eloquo - AI Prompt Optimizer",
    description: "Join Eloquo and transform basic prompts into production-ready instructions.",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
