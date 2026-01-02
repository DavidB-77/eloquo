import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import { cn } from "@/lib/utils";
import { UserProvider } from "@/providers/UserProvider";
import { OverlayManager } from "@/components/layout/OverlayManager";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eloquo | AI Prompt Optimization SaaS",
  description: "Transform your AI prompts into powerful results. Optimize for ChatGPT, Claude, and Gemini while reducing token costs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          outfit.variable
        )}
      >
        <QueryProvider>
          <AuthProvider>
            <UserProvider>
              <OverlayManager />
              {children}
            </UserProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
