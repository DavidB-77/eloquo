"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Copy, Check, ChevronDown, FileText, FileCode, FileJson, File } from "lucide-react";
import { cn } from "@/lib/utils";

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
    };
    targetModel: string;
    onStartNew: () => void;
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
}: ResultsTabsProps) {
    const [activeTab, setActiveTab] = React.useState<TabType>("full");
    const [showDownloadMenu, setShowDownloadMenu] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
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
                // Strip basic markdown
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
                    },
                    null,
                    2
                );
                downloadFile(jsonContent, generateFilename("json"), "application/json");
                break;
            case "pdf":
                // TODO: Call n8n endpoint for PDF generation
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
                {metrics && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Saved {metrics.tokensSaved} tokens ({metrics.percentageSaved}%)
                        <Check className="h-3.5 w-3.5 text-primary" />
                    </p>
                )}
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
        </Card>
    );
}
