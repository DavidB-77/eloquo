"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Copy, Check, ChevronDown, FileText, FileCode, FileJson, File, Lightbulb, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenInfoTooltip } from "./TokenInfoTooltip";
import { motion, AnimatePresence } from "framer-motion";

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
        tokensSaved?: number;
        percentageSaved?: number;
        accuracy?: number;
        qualityScore?: number;
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
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col h-full glass overflow-hidden border-electric-cyan/20 shadow-2xl relative"
        >
            <div className="absolute inset-0 bg-deep-teal/20 backdrop-blur-2xl -z-10" />

            <CardHeader className="pb-3 border-b border-electric-cyan/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3 text-white font-display uppercase tracking-widest">
                        <Sparkles className="h-5 w-5 text-electric-cyan glow-sm" />
                        Optimized Result
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onStartNew}
                        className="text-dusty-rose hover:text-white hover:bg-electric-cyan/10"
                    >
                        🔄 New
                    </Button>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-6 text-sm">
                        {/* Token count with count-up */}
                        {metrics && (
                            <div className="flex flex-col">
                                <span className="text-dusty-rose text-[10px] uppercase tracking-widest font-bold mb-1">Optimized Tokens</span>
                                <div className="flex items-center gap-2">
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-display text-2xl text-white"
                                    >
                                        <Counter value={metrics.optimizedTokens} />
                                    </motion.span>
                                    <TokenInfoTooltip targetModel={targetModel} accuracy={metrics.accuracy || 95} />
                                </div>
                            </div>
                        )}

                        <div className="w-px h-8 bg-electric-cyan/10" />

                        {/* Quality score */}
                        {validation && (
                            <div className="flex flex-col">
                                <span className="text-dusty-rose text-[10px] uppercase tracking-widest font-bold mb-1">Quality Score</span>
                                <div className="flex items-center gap-2">
                                    <motion.span
                                        className="font-display text-2xl text-electric-cyan glow-sm"
                                    >
                                        {validation.score.toFixed(1)}
                                    </motion.span>
                                    <span className="text-dusty-rose/40 text-xs font-bold">/ 5.0</span>
                                </div>
                            </div>
                        )}

                        <div className="w-px h-8 bg-electric-cyan/10" />

                        {/* Model */}
                        <div className="flex flex-col">
                            <span className="text-dusty-rose text-[10px] uppercase tracking-widest font-bold mb-1">Engine</span>
                            <span className="font-bold text-white uppercase text-xs tracking-wider">{targetModel}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                {/* Tab Bar */}
                <div className="flex bg-midnight/40 p-1.5 gap-1.5 border-b border-electric-cyan/10">
                    {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300",
                                activeTab === tab
                                    ? "bg-electric-cyan text-midnight shadow-[0_0_15px_rgba(9,183,180,0.3)]"
                                    : "text-dusty-rose hover:text-white hover:bg-electric-cyan/5"
                            )}
                        >
                            {TAB_CONFIG[tab].label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6 md:p-8 bg-midnight/20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="relative group h-full"
                        >
                            <div className="bg-midnight/60 border border-electric-cyan/10 rounded-2xl p-6 font-mono text-sm md:text-md leading-relaxed whitespace-pre-wrap text-white/90 shadow-inner min-h-[300px] selection:bg-electric-cyan/30">
                                {currentContent}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Improvements Section */}
                {improvements && improvements.length > 0 && (
                    <div className="px-6 pb-6">
                        <button
                            onClick={() => setShowImprovements(!showImprovements)}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-electric-cyan hover:text-white transition-colors"
                        >
                            <Lightbulb className="h-3 w-3" />
                            <span>{improvements.length} Improvements applied</span>
                            <ChevronDown
                                className={cn(
                                    "h-3 w-3 transition-transform",
                                    showImprovements && "rotate-180"
                                )}
                            />
                        </button>
                        <AnimatePresence>
                            {showImprovements && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4 p-5 bg-deep-teal/20 border border-electric-cyan/10 rounded-xl space-y-3">
                                        {improvements.map((improvement, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="h-1.5 w-1.5 rounded-full bg-electric-cyan mt-1.5 shrink-0 shadow-[0_0_5px_rgba(9,183,180,0.8)]" />
                                                <span className="text-xs text-dusty-rose leading-relaxed">{improvement}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 p-6 border-t border-electric-cyan/10 bg-midnight/20">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleCopy}
                        className="flex-1 h-12 border-electric-cyan/20 bg-deep-teal/10 text-white hover:bg-electric-cyan/10 rounded-xl"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2 text-electric-cyan" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Prompt
                            </>
                        )}
                    </Button>

                    <div className="relative flex-1" ref={dropdownRef}>
                        <Button
                            size="lg"
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            className="w-full h-12 btn-gradient rounded-xl"
                        >
                            💾 Download
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>

                        {showDownloadMenu && (
                            <div className="absolute bottom-full mb-3 left-0 right-0 glass border-electric-cyan/20 overflow-hidden shadow-2xl py-1 z-50">
                                {[
                                    { format: "md", label: "Markdown", icon: FileText },
                                    { format: "txt", label: "Plain Text", icon: File },
                                    { format: "json", label: "JSON Explorer", icon: FileJson },
                                ].map(({ format, label, icon: Icon }) => (
                                    <button
                                        key={format}
                                        onClick={() => handleDownload(format)}
                                        className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-dusty-rose hover:text-white hover:bg-electric-cyan/10 flex items-center gap-3 transition-colors"
                                    >
                                        <Icon className="h-4 w-4 text-electric-cyan" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </motion.div >
    );
}

// Simple counter component for metrics
function Counter({ value }: { value: number }) {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        let totalMiliseconds = 1500;
        let incrementTime = (totalMiliseconds / end) * 5;

        let timer = setInterval(() => {
            start += Math.ceil(end / 40);
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 20);

        return () => clearInterval(timer);
    }, [value]);

    return <>{count.toLocaleString()}</>;
}
