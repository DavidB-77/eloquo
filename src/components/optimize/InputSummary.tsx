"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Zap, FileText, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContextFile } from "./FileUpload";

interface InputSummaryProps {
    prompt: string;
    targetModel: string;
    strength: string;
    context?: string;
    files?: ContextFile[];
    onEdit: () => void;
}

const MODEL_LABELS: Record<string, string> = {
    universal: "Universal",
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
    cursor: "Cursor",
};

const STRENGTH_LABELS: Record<string, string> = {
    light: "Light",
    medium: "Medium",
    aggressive: "Aggressive",
};

export function InputSummary({
    prompt,
    targetModel,
    strength,
    context,
    files,
    onEdit,
}: InputSummaryProps) {
    // Show full prompt as requested
    // const truncatedPrompt = prompt.length > 200 ? prompt.substring(0, 200) + "..." : prompt;

    return (
        <Card className="h-full animate-in fade-in duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Your Input
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Prompt Display */}
                <div className="bg-muted/30 border rounded-lg p-4 max-h-60 overflow-y-auto">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        "{prompt}"
                    </p>
                </div>

                {/* Settings Badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                        🎯 {MODEL_LABELS[targetModel] || targetModel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        ⚡ {STRENGTH_LABELS[strength] || strength}
                    </Badge>
                </div>

                {/* Context if provided */}
                {context && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Context:</p>
                        <p className="text-sm text-muted-foreground italic">"{context}"</p>
                    </div>
                )}

                {/* Files if attached */}
                {files && files.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>📎 {files.length} file{files.length > 1 ? "s" : ""} attached</span>
                    </div>
                )}

                {/* Edit Button */}
                <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={onEdit}
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit & Retry
                </Button>
            </CardContent>
        </Card>
    );
}
