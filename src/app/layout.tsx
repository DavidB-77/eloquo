import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import { cn } from "@/lib/utils";
import { UserProvider } from "@/providers/UserProvider";
import { MaintenanceBanner } from "@/components/layout/MaintenanceBanner";
import { AnnouncementsOverlay } from "@/components/layout/AnnouncementsOverlay";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
          inter.variable
        )}
      >
        <QueryProvider>
          <AuthProvider>
            <UserProvider>
              <MaintenanceBanner />
              <AnnouncementsOverlay />
              {children}
            </UserProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
