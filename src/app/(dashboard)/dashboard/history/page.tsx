"use client";

import * as React from "react";
import { HistoryTable } from "@/components/history/HistoryTable";

// Mock data for now - will be replaced with API call
const MOCK_HISTORY = [
    {
        id: "1",
        original_prompt: "Write me a blog post about AI trends in 2025",
        optimized_prompt: "You are an expert technology journalist. Write a comprehensive, SEO-optimized blog post about the top 5 emerging AI trends in 2025. Include specific examples, statistics where available, and actionable insights. Target audience: tech-savvy business professionals. Format: Introduction, 5 main sections with subheadings, conclusion with key takeaways. Word count: 1500-2000 words.",
        target_model: "chatgpt",
        strength: "medium",
        was_orchestrated: false,
        segments_count: 1,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: "2",
        original_prompt: "Help me write a research paper on climate change",
        optimized_prompt: "Research paper workflow with 4 segments",
        target_model: "claude",
        strength: "aggressive",
        was_orchestrated: true,
        segments_count: 4,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: "3",
        original_prompt: "Create a marketing email for our new product launch",
        optimized_prompt: "You are a senior email marketing copywriter with 10+ years of experience in product launches. Create a compelling marketing email for a new product launch...",
        target_model: "universal",
        strength: "light",
        was_orchestrated: false,
        segments_count: 1,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: "4",
        original_prompt: "Debug this React component that has performance issues",
        optimized_prompt: "You are a senior React performance engineer. Analyze the following React component for performance issues...",
        target_model: "cursor",
        strength: "medium",
        was_orchestrated: false,
        segments_count: 1,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
];

export default function HistoryPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);

    // TODO: Replace with actual API call
    const optimizations = MOCK_HISTORY;
    const totalPages = 1;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-display tracking-tight">History</h1>
                <p className="text-muted-foreground mt-1">
                    View and reuse your past prompt optimizations.
                </p>
            </div>

            <HistoryTable
                optimizations={optimizations}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
