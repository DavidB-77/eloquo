"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search, Eye, Copy, Layers, Zap, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Optimization {
    id: string;
    original_prompt: string;
    optimized_prompt: string;
    target_model: string;
    strength: string;
    was_orchestrated: boolean;
    segments_count: number;
    created_at: string;
}

interface HistoryTableProps {
    optimizations: Optimization[];
    isLoading?: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function HistoryTable({
    optimizations,
    isLoading,
    currentPage,
    totalPages,
    onPageChange
}: HistoryTableProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedOptimization, setSelectedOptimization] = React.useState<Optimization | null>(null);
    const [copied, setCopied] = React.useState(false);

    const filteredOptimizations = optimizations.filter(opt =>
        opt.original_prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.optimized_prompt?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const truncate = (text: string, length: number = 60) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>Optimization History</CardTitle>
                        <div className="relative max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search prompts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredOptimizations.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No optimizations found</p>
                            <p className="text-sm mt-1">Start optimizing prompts to build your history</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Original Prompt</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOptimizations.map((opt) => (
                                        <TableRow key={opt.id}>
                                            <TableCell className="max-w-xs">
                                                <p className="truncate font-medium">{truncate(opt.original_prompt)}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] uppercase">
                                                    {opt.target_model}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {opt.was_orchestrated ? (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        <Layers className="h-3 w-3 mr-1" />
                                                        {opt.segments_count} segments
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="default" className="text-[10px]">
                                                        <Zap className="h-3 w-3 mr-1" />
                                                        Single
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(opt.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedOptimization(opt)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </p>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onPageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onPageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedOptimization}
                onClose={() => setSelectedOptimization(null)}
                title="Optimization Details"
            >
                {selectedOptimization && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Original Prompt
                                </span>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {selectedOptimization.original_prompt}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Optimized Prompt
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(selectedOptimization.optimized_prompt)}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3 w-3 mr-1 text-success" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {selectedOptimization.optimized_prompt}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{selectedOptimization.target_model}</Badge>
                            <Badge variant="secondary">{selectedOptimization.strength}</Badge>
                            <span>{formatDate(selectedOptimization.created_at)}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
