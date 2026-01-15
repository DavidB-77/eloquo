import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexProvider";
import { BetterAuthProvider } from "@/providers/BetterAuthProvider";
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

export const viewport: Viewport = {
  themeColor: "#09B7B4",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://eloquo.io'),
  title: {
    default: "Eloquo | AI Prompt Optimizer - Transform Your Prompts for ChatGPT, Claude & Gemini",
    template: "%s | Eloquo"
  },
  description: "The AI prompt optimizer that learns. Transform basic prompts into production-ready instructions for ChatGPT, Claude, and Gemini. Get better AI outputs with our adaptive optimization engine. Free to start.",
  keywords: [
    "AI prompt optimizer",
    "prompt engineering tool",
    "ChatGPT prompt optimizer",
    "Claude prompt optimizer",
    "Gemini prompt optimizer",
    "AI prompt generator",
    "prompt improvement tool",
    "LLM prompt optimization",
    "AI prompt enhancer",
    "prompt engineering software",
    "better AI prompts",
    "prompt quality tool",
    "AI writing assistant",
    "prompt refinement",
    "AI communication tool"
  ],
  authors: [{ name: "Eloquo", url: "https://eloquo.io" }],
  creator: "Eloquo",
  publisher: "Eloquo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eloquo.io",
    siteName: "Eloquo",
    title: "Eloquo | AI Prompt Optimizer That Learns",
    description: "Transform your AI prompts into powerful results. The only prompt optimizer that learns from real user feedback to continuously improve. Works with ChatGPT, Claude, Gemini.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eloquo - AI Prompt Optimization Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eloquo | AI Prompt Optimizer That Learns",
    description: "Transform your AI prompts into powerful results. Works with ChatGPT, Claude, Gemini. Free to start.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://eloquo.io",
  },
  category: "Technology",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://eloquo.io/#website",
      "url": "https://eloquo.io",
      "name": "Eloquo",
      "description": "AI Prompt Optimization Platform",
      "publisher": {
        "@id": "https://eloquo.io/#organization"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://eloquo.io/#organization",
      "name": "Eloquo",
      "url": "https://eloquo.io",
      "logo": {
        "@type": "ImageObject",
        "url": "https://eloquo.io/og-image.png"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://eloquo.io/#software",
      "name": "Eloquo",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "7.00",
        "priceCurrency": "USD"
      },
      "description": "AI-powered prompt optimization tool that learns from user feedback to improve prompts for ChatGPT, Claude, and Gemini.",
      "featureList": [
        "AI-Powered Prompt Optimization",
        "Multi-Model Support (ChatGPT, Claude, Gemini)",
        "Adaptive Learning from User Feedback",
        "Quality Scoring System",
        "Prompt History & Export",
        "File & Image Analysis",
        "MCP Server Integration",
        "REST API Access"
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Eloquo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Eloquo is an AI-powered prompt optimization platform that transforms basic prompts into production-ready instructions for ChatGPT, Claude, Gemini, and other AI models. Unlike static tools, Eloquo learns from real user feedback to continuously improve its optimization strategies."
          }
        },
        {
          "@type": "Question",
          "name": "How does AI prompt optimization work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Eloquo uses a 4-stage AI pipeline: Classify (understand intent), Analyze (evaluate structure), Generate (create optimized versions), and Validate (quality score verification). Every prompt passes through all stages to ensure the best possible output."
          }
        },
        {
          "@type": "Question",
          "name": "What AI models does Eloquo support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Eloquo supports all major AI models including ChatGPT (GPT-4, GPT-4o), Claude (Sonnet, Opus, Haiku), Gemini (Pro, Flash), and more. You can optimize for a specific model or use Universal mode for cross-platform compatibility."
          }
        },
        {
          "@type": "Question",
          "name": "How much does Eloquo cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Eloquo offers three plans: Basic at $7/month (150 optimizations), Pro at $9/month (400 optimizations, API access), and Business at $20/month (1000 optimizations, priority support). Founding member pricing locks in discounted rates forever."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://eloquo.io" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          outfit.variable
        )}
      >
        <QueryProvider>
          <ConvexClientProvider>
            <BetterAuthProvider>
              <UserProvider>
                <OverlayManager />
                {children}
              </UserProvider>
            </BetterAuthProvider>
          </ConvexClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
