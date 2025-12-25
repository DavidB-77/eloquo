"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, ArrowRight, Zap, TrendingUp, Hash } from "lucide-react";

interface ResultDisplayProps {
    originalPrompt: string;
    optimizedPrompt: string;
    improvements: string[];
    metrics: {
        originalTokens: number;
        optimizedTokens: number;
        complexityScore: number;
    };
    targetModel: string;
}

export function ResultDisplay({
    originalPrompt,
    optimizedPrompt,
    improvements,
    metrics,
    targetModel,
}: ResultDisplayProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(optimizedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tokenChange = metrics.optimizedTokens - metrics.originalTokens;
    const tokenChangePercent = Math.round((tokenChange / metrics.originalTokens) * 100);

    return (
        <div className="space-y-6">
            {/* Metrics Bar */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                            <Hash className="h-4 w-4" />
                            <span className="text-xs font-medium">Original Tokens</span>
                        </div>
                        <div className="text-2xl font-bold">{metrics.originalTokens}</div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-medium">Optimized Tokens</span>
                        </div>
                        <div className="text-2xl font-bold flex items-center">
                            {metrics.optimizedTokens}
                            <Badge
                                variant={tokenChange > 0 ? "warning" : "success"}
                                className="ml-2 text-[10px]"
                            >
                                {tokenChange > 0 ? "+" : ""}{tokenChangePercent}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                            <Zap className="h-4 w-4" />
                            <span className="text-xs font-medium">Complexity</span>
                        </div>
                        <div className="text-2xl font-bold">{metrics.complexityScore}/10</div>
                    </CardContent>
                </Card>
            </div>

            {/* Comparison View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original */}
                <Card className="border-muted">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Original Prompt</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap">
                            {originalPrompt}
                        </div>
                    </CardContent>
                </Card>

                {/* Optimized */}
                <Card className="border-primary bg-primary/5">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-primary flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            Optimized for {targetModel}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-1 text-success" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-background border border-primary/20 p-4 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap">
                            {optimizedPrompt}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Improvements List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Improvements Made</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start space-x-3 text-sm">
                                <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="h-3 w-3 text-success" />
                                </div>
                                <span>{improvement}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
