"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { HelpCircle, Zap, ArrowRight, X } from "lucide-react";

interface ClarificationQuestion {
    id: string;
    question: string;
    type: "select" | "text";
    options?: Array<string | { value: string; label: string }>;
}

interface QuestionsFormProps {
    questions: ClarificationQuestion[];
    originalPrompt: string;
    creditsWillUse: number;
    classification: {
        domain: string;
        complexity: string;
    };
    onSubmit: (answers: Record<string, string>) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export function QuestionsForm({
    questions,
    originalPrompt,
    creditsWillUse,
    classification,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: QuestionsFormProps) {
    const [answers, setAnswers] = React.useState<Record<string, string>>({});

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(answers);
    };

    const allAnswered = questions.every((q) => answers[q.id]?.trim());

    return (
        <Card className="border-primary/20 bg-card/50 animate-in fade-in duration-300">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <HelpCircle className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">A few quick questions</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    To create the best optimized prompt for you, we need a bit more context:
                </p>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Original prompt preview */}
                    <div className="p-3 bg-muted/50 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Your prompt:</p>
                        <p className="text-sm line-clamp-3">{originalPrompt}</p>
                    </div>

                    {/* Classification badges */}
                    <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                            📂 {classification.domain}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                            📊 {classification.complexity}
                        </Badge>
                    </div>

                    {/* Questions */}
                    <div className="space-y-5">
                        {questions.map((question, index) => (
                            <div key={question.id} className="space-y-2">
                                <label
                                    htmlFor={question.id}
                                    className="text-sm font-medium flex items-start gap-2"
                                >
                                    <span className="text-primary font-bold">{index + 1}.</span>
                                    {question.question}
                                </label>

                                {question.type === "select" && question.options ? (
                                    <Select
                                        id={question.id}
                                        value={answers[question.id] || ""}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    >
                                        <option value="">Select an option...</option>
                                        {question.options.map((option, idx) => {
                                            const value = typeof option === "string" ? option : option.value;
                                            const label = typeof option === "string" ? option : option.label;
                                            return (
                                                <option key={value || idx} value={value}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </Select>
                                ) : (
                                    <Input
                                        id={question.id}
                                        value={answers[question.id] || ""}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        placeholder="Type your answer..."
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-primary" />
                        <span>
                            Will use {creditsWillUse} credit{creditsWillUse !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!allAnswered || isSubmitting} isLoading={isSubmitting}>
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}

export type { ClarificationQuestion };
