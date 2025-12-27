"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Copy, Check, ChevronDown, FileText, FileCode, FileJson, File, Lightbulb, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateTokenSavings } from "@/lib/tokenizer";
import { TokenInfoTooltip } from "./TokenInfoTooltip";

type TabType = "full" | "quickRef" | "snippet";

interface ResultsTabsProps {
    results: {
        full: string;
        quickRef: string;
        snippet: string;
    };
    metrics?: {
        originalTokens: number;
        optimizedTokens: number;
        tokensSaved: number;
        percentageSaved: number;
        accuracy?: number;
        qualityScore?: number; // Ensure this is supported
    };
    targetModel: string;
    onStartNew: () => void;
    improvements?: string[];
    validation?: {
        approved: boolean;
        score: number;
    };
}

const TAB_CONFIG = {
    full: {
        label: "Full Version",
        description: "Complete prompt",
    },
    quickRef: {
        label: "Quick-Ref",
        description: "Condensed",
    },
    snippet: {
        label: "Snippet",
        description: "Ultra-short",
    },
};

export function ResultsTabs({
    results,
    metrics,
    targetModel,
    onStartNew,
    improvements,
    validation,
}: ResultsTabsProps) {
    const [activeTab, setActiveTab] = React.useState<TabType>("full");
    const [showDownloadMenu, setShowDownloadMenu] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [showImprovements, setShowImprovements] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const currentContent = results[activeTab];

    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateFilename = (ext: string) => {
        const date = new Date().toISOString().split("T")[0];
        const tabName = activeTab === "quickRef" ? "quickref" : activeTab;
        return `eloquo-${targetModel}-${tabName}-${date}.${ext}`;
    };

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownload = (format: string) => {
        setShowDownloadMenu(false);

        switch (format) {
            case "md":
                downloadFile(currentContent, generateFilename("md"), "text/markdown");
                break;
            case "txt":
                const plainText = currentContent
                    .replace(/#{1,6}\s/g, "")
                    .replace(/\*\*(.*?)\*\*/g, "$1")
                    .replace(/\*(.*?)\*/g, "$1")
                    .replace(/`(.*?)`/g, "$1");
                downloadFile(plainText, generateFilename("txt"), "text/plain");
                break;
            case "json":
                const jsonContent = JSON.stringify(
                    {
                        optimizedPrompt: currentContent,
                        targetModel,
                        version: activeTab,
                        createdAt: new Date().toISOString(),
                        metrics,
                        improvements,
                    },
                    null,
                    2
                );
                downloadFile(jsonContent, generateFilename("json"), "application/json");
                break;
            case "pdf":
                alert("PDF download coming soon!");
                break;
        }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDownloadMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <Card className="flex flex-col h-full animate-in slide-in-from-right-5 duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        ✨ Optimized Result
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onStartNew}>
                        🔄 New
                    </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4 text-sm bg-muted/20 px-3 py-1.5 rounded-md border border-muted/20">
                        {/* Token count */}
                        {metrics && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Tokens</span>
                                <span className="font-semibold text-foreground">{metrics.optimizedTokens}</span>
                                <TokenInfoTooltip targetModel={targetModel} accuracy={metrics.accuracy || 95} />
                            </div>
                        )}

                        <div className="w-px h-3 bg-border" />

                        {/* Quality score */}
                        {validation && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Quality</span>
                                <Badge variant="outline" className="h-5 px-1.5 gap-1 font-semibold text-green-600 bg-green-500/5 border-green-500/20">
                                    {validation.score}/5
                                </Badge>
                            </div>
                        )}

                        <div className="w-px h-3 bg-border" />

                        {/* Target model */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Model</span>
                            <span className="font-medium text-foreground">{targetModel}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                {/* Tab Bar */}
                <div className="flex border-b px-4">
                    {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-3 px-2 text-sm font-medium transition-colors text-center",
                                activeTab === tab
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div>{TAB_CONFIG[tab].label}</div>
                            <div className="text-xs font-normal text-muted-foreground/70 mt-0.5">
                                {TAB_CONFIG[tab].description}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-muted/30 border rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {currentContent}
                    </div>
                </div>

                {/* Improvements Section */}
                {improvements && improvements.length > 0 && (
                    <div className="px-4 pb-4">
                        <button
                            onClick={() => setShowImprovements(!showImprovements)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <span>View {improvements.length} improvements made</span>
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    showImprovements && "rotate-180"
                                )}
                            />
                        </button>
                        {showImprovements && (
                            <div className="mt-3 p-4 bg-primary/5 border border-primary/10 rounded-lg animate-in slide-in-from-top-2 duration-200">
                                <ul className="space-y-2 text-sm">
                                    {improvements.map((improvement, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            <span className="text-foreground">{improvement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 p-4 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="flex-1"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </>
                        )}
                    </Button>

                    <div className="relative flex-1" ref={dropdownRef}>
                        <Button
                            size="sm"
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            className="w-full"
                        >
                            💾 Download
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>

                        {showDownloadMenu && (
                            <div className="absolute bottom-full mb-2 left-0 right-0 bg-popover border rounded-lg shadow-lg py-1 z-10">
                                {[
                                    { format: "md", label: "Markdown", icon: FileText },
                                    { format: "txt", label: "Plain Text", icon: File },
                                    { format: "json", label: "JSON", icon: FileJson },
                                    { format: "pdf", label: "PDF", icon: FileText },
                                ].map(({ format, label, icon: Icon }) => (
                                    <button
                                        key={format}
                                        onClick={() => handleDownload(format)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                    >
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        {label} (.{format})
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Start New (bottom) */}
                <div className="p-4 pt-0 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onStartNew}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        🔄 Start New Optimization
                    </Button>
                </div>
            </CardContent>
        </Card >
    );
}
