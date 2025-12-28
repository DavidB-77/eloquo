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
        <Card className="relative p-0.5 overflow-hidden glass rounded-[20px] shadow-2xl h-full">
            {/* Gradient border to match OptimizeForm */}
            <div className="absolute inset-0 bg-gradient-to-r from-sunset-orange via-electric-cyan to-sunset-orange bg-[length:200%_auto] animate-gradient opacity-40" />

            <CardContent className="relative bg-midnight/90 rounded-[18px] p-6 md:p-8 space-y-6 h-full flex flex-col">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <span className="font-display text-2xl text-white tracking-widest uppercase glow-md">
                            A FEW QUESTIONS
                        </span>
                    </div>
                    <p className="text-white/60 text-sm">
                        Help us optimize your prompt better
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
                    {/* Classification badges */}
                    <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize border-electric-cyan/20 text-electric-cyan bg-deep-teal/20">
                            📂 {classification.domain}
                        </Badge>
                        <Badge variant="outline" className="capitalize border-electric-cyan/20 text-electric-cyan bg-deep-teal/20">
                            📊 {classification.complexity}
                        </Badge>
                    </div>

                    {/* Questions content */}
                    <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                        {questions.map((question, index) => (
                            <div key={question.id} className="space-y-2">
                                <label
                                    htmlFor={question.id}
                                    className="text-sm font-medium flex items-start gap-2 text-white/80"
                                >
                                    <span className="text-electric-cyan font-bold">{index + 1}.</span>
                                    {question.question}
                                </label>

                                {question.type === "select" && question.options ? (
                                    <Select
                                        id={question.id}
                                        value={answers[question.id] || ""}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        className="bg-deep-teal/20 border-electric-cyan/20 text-white"
                                    >
                                        <option value="">Select an option...</option>
                                        {question.options.map((option, idx) => {
                                            const value = typeof option === "string" ? option : option.value;
                                            const label = typeof option === "string" ? option : option.label;
                                            return (
                                                <option key={value || idx} value={value} className="bg-midnight">
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
                                        className="bg-deep-teal/20 border-electric-cyan/20 text-white placeholder:text-white/20"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-electric-cyan/10 space-y-4 mt-auto">
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Zap className="h-3 w-3 text-electric-cyan" />
                            <span>
                                Will use {creditsWillUse} credit{creditsWillUse !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                className="flex-1 text-white/60 hover:text-white hover:bg-white/5"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] btn-gradient text-midnight font-bold"
                                disabled={!allAnswered || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Submitting...
                                    </div>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export type { ClarificationQuestion };
