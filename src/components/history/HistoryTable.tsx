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
            <Card className="glass border-electric-cyan/20 bg-deep-teal/5">
                <CardHeader className="border-b border-electric-cyan/10 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-xl font-normal font-display text-white uppercase tracking-widest glow-sm">Optimization History</CardTitle>
                        <div className="relative max-w-xs group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-electric-cyan transition-colors" />
                            <Input
                                placeholder="SEARCH_HISTORY..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-midnight/40 border-electric-cyan/10 focus-visible:ring-electric-cyan/30 text-white placeholder:text-white/20 uppercase tracking-widest text-[10px] font-bold h-10 rounded-xl"
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
                                                    size="icon"
                                                    onClick={() => setSelectedOptimization(opt)}
                                                    className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
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
                title="PROTOCOL_LOG: DETAIL"
                description="Viewing historical data for optimization sequence"
            >
                {selectedOptimization && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                                    SOURCE_INPUT
                                </span>
                            </div>
                            <div className="bg-midnight/60 border border-white/5 p-5 rounded-2xl text-xs leading-relaxed text-white/40 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                                {selectedOptimization.original_prompt}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-electric-cyan glow-sm">
                                    OPTIMIZED_OUTPUT
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(selectedOptimization.optimized_prompt)}
                                    className="h-8 text-[9px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3 w-3 mr-1.5 text-electric-cyan" />
                                            COPIED
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3 mr-1.5" />
                                            COPY_NODE
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="bg-electric-cyan/5 border border-electric-cyan/20 p-6 rounded-2xl text-sm leading-relaxed text-white font-mono whitespace-pre-wrap max-h-60 overflow-y-auto selection:bg-electric-cyan/30">
                                {selectedOptimization.optimized_prompt}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/5">
                            <Badge variant="outline" className="h-5">{selectedOptimization.target_model}</Badge>
                            <Badge variant="secondary" className="h-5">{selectedOptimization.strength}</Badge>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-auto">
                                {formatDate(selectedOptimization.created_at)}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
