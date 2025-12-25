"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, ChevronDown, ChevronUp, Layers, ArrowRight } from "lucide-react";

interface Segment {
    order: number;
    name: string;
    targetPlatform: string;
    purpose: string;
    prompt: string;
    instructions: string;
}

interface OrchestrationResultsProps {
    summary: string;
    segments: Segment[];
    premiumCreditsUsed: number;
}

function SegmentCard({ segment, isLast }: { segment: Segment; isLast: boolean }) {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(segment.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getPlatformColor = (platform: string) => {
        switch (platform.toLowerCase()) {
            case "claude": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
            case "chatgpt": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "gemini": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "cursor": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
            default: return "bg-primary/10 text-primary border-primary/20";
        }
    };

    return (
        <div className="relative">
            {/* Connector Line */}
            {!isLast && (
                <div className="absolute left-6 top-full w-0.5 h-6 bg-border z-0" />
            )}

            <Card className="relative z-10">
                <CardHeader
                    className="pb-3 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                {segment.order}
                            </div>
                            <div>
                                <CardTitle className="text-base">{segment.name}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">{segment.purpose}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={`text-[10px] uppercase ${getPlatformColor(segment.targetPlatform)}`}>
                                {segment.targetPlatform}
                            </Badge>
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                    </div>
                </CardHeader>

                {isExpanded && (
                    <CardContent className="space-y-4">
                        {/* Instructions */}
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                Instructions
                            </div>
                            <p className="text-sm">{segment.instructions}</p>
                        </div>

                        {/* Prompt */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Optimized Prompt
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                                    className="h-7 text-xs"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3 w-3 mr-1 text-success" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="bg-background border p-4 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                                {segment.prompt}
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}

export function OrchestrationResults({
    summary,
    segments,
    premiumCreditsUsed
}: OrchestrationResultsProps) {
    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <Card className="bg-primary/5 border-primary">
                <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{summary}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {segments.length} segments optimized for different AI models
                                </p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {premiumCreditsUsed} premium {premiumCreditsUsed === 1 ? 'credit' : 'credits'} used
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Workflow Guide */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
                <ArrowRight className="h-4 w-4" />
                <span>Follow this workflow from top to bottom for best results</span>
            </div>

            {/* Segments */}
            <div className="space-y-6">
                {segments
                    .sort((a, b) => a.order - b.order)
                    .map((segment, index) => (
                        <SegmentCard
                            key={segment.order}
                            segment={segment}
                            isLast={index === segments.length - 1}
                        />
                    ))}
            </div>
        </div>
    );
}
