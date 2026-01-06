import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Eloquo account to access AI-powered prompt optimization.",
  openGraph: {
    title: "Login to Eloquo",
    description: "Access your Eloquo dashboard and optimized prompts.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
