"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Check } from 'lucide-react';

interface Optimization {
    id: string;
    original_prompt: string;
    optimized_prompt: string;
    target_model: string;
    strength: string;
    tokens_original: number;
    tokens_optimized: number;
    tokens_saved: number;
    token_savings_percent: number;
    improvements: string[];
    metrics: { qualityScore?: number };
    quick_reference: string | null;
    snippet: string | null;
    was_orchestrated: boolean;
    created_at: string;
}

interface Stats {
    total_optimizations: number;
    total_tokens_saved: number;
    avg_savings_percent: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<Optimization[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Optimization | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/history');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch history');
            }

            setHistory(data.history || []);
            setStats(data.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const truncate = (text: string, length: number = 80) => {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-20" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-600">Error: {error}</p>
                        <button
                            onClick={fetchHistory}
                            className="mt-2 text-sm text-red-600 underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-display tracking-tight">Optimization History</h1>
                <p className="text-muted-foreground mt-1">
                    View your past optimizations and track token savings.
                </p>
            </div>

            {/* Stats Cards */}
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Optimizations</p>
                            <p className="text-2xl font-bold">{stats.total_optimizations}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Processed Tokens</p>
                            <p className="text-2xl font-bold">
                                {(stats.total_optimizations * 150).toLocaleString()} {/* Estimated */}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Across all optimizations</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* History List */}
            {history.length === 0 ? (
                <Card className="glass border-electric-cyan/10">
                    <CardContent className="p-8 text-center">
                        <p className="text-dusty-rose">No optimization history yet.</p>
                        <p className="text-sm text-dusty-rose/60 mt-1">
                            Your optimizations will appear here after you use the optimizer.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {history.map((item) => (
                        <Card
                            key={item.id}
                            className="glass border-electric-cyan/10 cursor-pointer hover:border-electric-cyan/30 transition-all group"
                            onClick={() => setSelectedItem(item)}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate group-hover:text-electric-cyan transition-colors">
                                            {truncate(item.original_prompt)}
                                        </p>
                                        <p className="text-xs text-dusty-rose mt-1">
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge variant="outline" className="text-xs border-electric-cyan/20 text-electric-cyan bg-electric-cyan/5">
                                            {item.target_model}
                                        </Badge>
                                        <span className="text-xs text-dusty-rose/60 whitespace-nowrap">
                                            {item.tokens_optimized} tokens
                                        </span>
                                        {item.metrics?.qualityScore && (
                                            <Badge variant="secondary" className="text-xs bg-electric-cyan/10 text-electric-cyan border-electric-cyan/20">
                                                ★ {item.metrics.qualityScore}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass bg-midnight border-electric-cyan/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-display uppercase tracking-widest text-lg text-white">Optimization Details</DialogTitle>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-6 pt-4">
                            {/* Original Prompt */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-dusty-rose">Original Prompt</h4>
                                    <span className="text-[10px] text-dusty-rose/60 font-mono">
                                        {selectedItem.tokens_original} tokens
                                    </span>
                                </div>
                                <div className="text-sm bg-deep-teal/20 border border-electric-cyan/10 p-4 rounded-xl whitespace-pre-wrap max-h-40 overflow-y-auto text-white/90 font-mono">
                                    {selectedItem.original_prompt}
                                </div>
                            </div>

                            {/* Optimized Prompt */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-electric-cyan">Optimized Prompt</h4>
                                    <button
                                        onClick={() => copyToClipboard(selectedItem.optimized_prompt)}
                                        className="text-xs text-dusty-rose hover:text-white transition-colors flex items-center gap-1.5"
                                    >
                                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        <span className="uppercase tracking-tighter font-bold">{copied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                </div>
                                <div className="text-sm bg-electric-cyan/5 border border-electric-cyan/20 p-4 rounded-xl whitespace-pre-wrap max-h-40 overflow-y-auto text-white font-mono shadow-inner shadow-electric-cyan/5">
                                    {selectedItem.optimized_prompt}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center pt-6 border-t border-electric-cyan/10">
                                <div>
                                    <p className="text-[10px] text-dusty-rose uppercase tracking-widest font-bold">Optimized Tokens</p>
                                    <p className="text-xl font-display text-white mt-1">{selectedItem.tokens_optimized}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-dusty-rose uppercase tracking-widest font-bold">Quality Score</p>
                                    <p className="text-xl font-display text-sunset-orange mt-1">
                                        {selectedItem.metrics?.qualityScore ? `${selectedItem.metrics.qualityScore}/5` : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-dusty-rose uppercase tracking-widest font-bold">Engine</p>
                                    <p className="text-xl font-display text-white mt-1 uppercase tracking-tighter">{selectedItem.target_model}</p>
                                </div>
                            </div>

                            {/* Improvements */}
                            {selectedItem.improvements && selectedItem.improvements.length > 0 && (
                                <div className="pt-6 border-t border-electric-cyan/10">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-dusty-rose mb-3">Improvements Made</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {selectedItem.improvements.map((imp, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-white/80 bg-deep-teal/10 p-2 rounded-lg border border-electric-cyan/5">
                                                <span className="text-electric-cyan">✓</span>
                                                {imp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="pt-6 border-t border-electric-cyan/10 text-[10px] text-dusty-rose/60 flex justify-between uppercase tracking-widest font-bold">
                                <span>Mode: {selectedItem.strength}</span>
                                <span>{new Date(selectedItem.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
