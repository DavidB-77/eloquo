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
import { Copy, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import RatingStars from '@/components/RatingStars';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

interface Optimization {
    _id: string; // Convex ID
    original_prompt: string;
    optimized_prompt: string;
    target_model: string;
    strength: string;
    tokens_original?: number;
    tokens_optimized?: number;
    tokens_saved?: number;
    token_savings_percent?: number;
    improvements?: string[];
    metrics?: {
        qualityScore?: number;
        total_tokens?: number;
        processing_time_sec?: number;
        api_cost_usd?: number;
    };
    quick_reference?: string | null;
    snippet?: string | null;
    was_orchestrated?: boolean;
    created_at: number; // Convex timestamp
    output_mode?: string | null;
    credits_used?: number;
    // PP-specific fields
    project_name?: string | null;
    project_summary?: string | null;
    prd_document?: string | null;
    architecture_document?: string | null;
    stories_document?: string | null;
}

interface Stats {
    total_optimizations: number;
    total_tokens_saved: number;
    avg_savings_percent: number;
}

export default function HistoryPage() {
    const convexHistory = useQuery(api.optimizations.getOptimizationHistory, { limit: 100 });
    const [selectedItem, setSelectedItem] = useState<Optimization | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeDocTab, setActiveDocTab] = useState<'prd' | 'architecture' | 'stories'>('prd');
    const [copied, setCopied] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const history = convexHistory || [];
    const loading = convexHistory === undefined;

    // Estimate stats from history for now
    const stats: Stats = {
        total_optimizations: history.length,
        total_tokens_saved: history.reduce((acc, curr) => acc + (curr.tokens_saved || 0), 0),
        avg_savings_percent: history.length > 0
            ? history.reduce((acc, curr) => acc + (curr.token_savings_percent || 0), 0) / history.length
            : 0
    };

    // Export functions

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

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
        setActiveDocTab('prd'); // Reset to PRD tab when expanding
    };

    const getCurrentPPDocument = (item: Optimization) => {
        switch (activeDocTab) {
            case 'prd': return item.prd_document || 'PRD document not available';
            case 'architecture': return item.architecture_document || 'Architecture document not available';
            case 'stories': return item.stories_document || 'Stories document not available';
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Original Prompt', 'Target Model', 'Tokens Original', 'Tokens Optimized', 'Tokens Saved', 'Quality Score', 'Type'];
        const rows = history.map(opt => [
            new Date(opt.created_at).toISOString().split('T')[0],
            `"${(opt.original_prompt || '').replace(/"/g, '""')}"`,
            opt.target_model,
            opt.tokens_original || 0,
            opt.tokens_optimized || 0,
            opt.tokens_saved || 0,
            opt.metrics?.qualityScore || '',
            opt.output_mode === 'bmad' ? 'project_protocol' : (opt.was_orchestrated ? 'orchestrated' : 'standard'),
            opt.credits_used || (opt.output_mode === 'bmad' ? 5 : 1)
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        downloadFile(csv, 'eloquo-history.csv', 'text/csv');
        setShowExportMenu(false);
    };

    const exportToJSON = () => {
        const data = {
            exported_at: new Date().toISOString(),
            total_records: history.length,
            optimizations: history.map(opt => ({
                id: opt._id,
                created_at: opt.created_at,
                original_prompt: opt.original_prompt,
                optimized_prompt: opt.optimized_prompt,
                target_model: opt.target_model,
                tokens_original: opt.tokens_original,
                tokens_optimized: opt.tokens_optimized,
                tokens_saved: opt.tokens_saved,
                quality_score: opt.metrics?.qualityScore || null,
                type: opt.was_orchestrated ? 'orchestrated' : 'standard'
            }))
        };

        downloadFile(JSON.stringify(data, null, 2), 'eloquo-history.json', 'application/json');
        setShowExportMenu(false);
    };

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadPPDocument = (item: Optimization, type: 'section' | 'all') => {
        const safeName = (item.project_name || 'project').replace(/\s+/g, '-').toLowerCase();
        let content: string;
        let filename: string;

        if (type === 'all') {
            content = `# ${item.project_name || 'Project'} - Complete Documentation

${item.prd_document || ''}

---

${item.architecture_document || ''}

---

${item.stories_document || ''}`;
            filename = `${safeName}-complete.md`;
        } else {
            content = getCurrentPPDocument(item);
            filename = `${safeName}-${activeDocTab}.md`;
        }

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
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


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Optimization History</h1>
                    <p className="text-white/60 mt-1">
                        View your past optimizations and track token savings.
                    </p>
                </div>

                {/* Export Button */}
                {history.length > 0 && (
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 border-electric-cyan/30 hover:bg-electric-cyan/10"
                        >
                            <Download className="h-4 w-4" />
                            Export
                            <ChevronDown className="h-3 w-3" />
                        </Button>

                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 bg-midnight border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                                <button
                                    onClick={exportToCSV}
                                    className="w-full px-4 py-2 text-sm text-left text-white hover:bg-electric-cyan/10 flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={exportToJSON}
                                    className="w-full px-4 py-2 text-sm text-left text-white hover:bg-electric-cyan/10 flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Export as JSON
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-white/40">Total Optimizations</p>
                            <p className="text-2xl font-bold">{stats.total_optimizations}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-white/40">Total Processed Tokens</p>
                            <p className="text-2xl font-bold">
                                {(stats.total_optimizations * 150).toLocaleString()} {/* Estimated */}
                            </p>
                            <p className="text-xs text-white/40 mt-1">Across all optimizations</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* History List */}
            {history.length === 0 ? (
                <Card className="glass border-electric-cyan/10">
                    <CardContent className="p-8 text-center">
                        <p className="text-white/60">No optimization history yet.</p>
                        <p className="text-sm text-white/40 mt-1">
                            Your optimizations will appear here after you use the optimizer.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {history.map((item) => (
                        <Card
                            key={item._id}
                            className={`glass border-electric-cyan/10 transition-all ${expandedId === item._id ? 'border-electric-cyan/40' : 'hover:border-electric-cyan/30'
                                }`}
                        >
                            {/* Header Row - Always Visible */}
                            <CardContent
                                className="p-4 cursor-pointer"
                                onClick={() => toggleExpand(item._id)}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium transition-colors ${expandedId === item._id ? 'text-electric-cyan' : 'text-white'
                                            }`}>
                                            {expandedId === item._id ? item.original_prompt : truncate(item.original_prompt)}
                                        </p>
                                        <p className="text-xs text-white/40 mt-1">
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Type Badge */}
                                        {item.output_mode === 'bmad' ? (
                                            <Badge className="text-xs bg-electric-cyan/10 text-electric-cyan border-electric-cyan/30">
                                                🚀 PP
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs border-white/20 text-white/50">
                                                STD
                                            </Badge>
                                        )}
                                        <span className="text-xs text-white/40 whitespace-nowrap">
                                            {item.tokens_optimized || item.metrics?.total_tokens} tokens
                                        </span>
                                        {item.metrics?.qualityScore && (
                                            <Badge variant="secondary" className="text-xs bg-electric-cyan/10 text-electric-cyan border-electric-cyan/20">
                                                ★ {item.metrics.qualityScore}
                                            </Badge>
                                        )}
                                        {/* Expand Arrow */}
                                        {expandedId === item._id ? (
                                            <ChevronUp className="h-4 w-4 text-electric-cyan" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-white/40" />
                                        )}
                                    </div>
                                </div>
                            </CardContent>

                            {/* Expanded Content */}
                            {expandedId === item._id && (
                                <div className="border-t border-electric-cyan/20 p-4 bg-black/20 space-y-4">
                                    {item.output_mode === 'bmad' ? (
                                        /* Project Protocol Expanded View */
                                        <>
                                            {/* Project Header */}
                                            {item.project_name && (
                                                <div className="bg-electric-cyan/5 border border-electric-cyan/20 rounded-lg p-4">
                                                    <h3 className="text-lg font-bold text-white">{item.project_name}</h3>
                                                    {item.project_summary && (
                                                        <p className="text-white/60 text-sm mt-1">{item.project_summary}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Document Tabs */}
                                            <div className="flex border-b border-electric-cyan/30">
                                                {(['prd', 'architecture', 'stories'] as const).map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={(e) => { e.stopPropagation(); setActiveDocTab(tab); }}
                                                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeDocTab === tab
                                                            ? 'text-electric-cyan border-b-2 border-electric-cyan'
                                                            : 'text-white/50 hover:text-white'
                                                            }`}
                                                    >
                                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Document Content */}
                                            <div className="bg-black/40 border border-electric-cyan/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                                                <pre className="whitespace-pre-wrap font-mono text-sm text-white/80 leading-relaxed">
                                                    {getCurrentPPDocument(item)}
                                                </pre>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(getCurrentPPDocument(item)); }}
                                                    className="border-electric-cyan/50 text-electric-cyan hover:bg-electric-cyan/10"
                                                >
                                                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); downloadPPDocument(item, 'section'); }}
                                                    className="border-electric-cyan/50 text-electric-cyan hover:bg-electric-cyan/10"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download Section
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); downloadPPDocument(item, 'all'); }}
                                                    className="bg-electric-cyan text-midnight hover:bg-electric-cyan/90"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download All
                                                </Button>
                                            </div>

                                            {/* Metrics */}
                                            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs text-white/50 pt-2 border-t border-electric-cyan/20">
                                                {item.metrics?.processing_time_sec && (
                                                    <span>⏱ {item.metrics.processing_time_sec.toFixed(1)}s</span>
                                                )}
                                                <span>📊 {(item.metrics?.total_tokens || item.tokens_optimized)?.toLocaleString()} tokens</span>
                                                {item.metrics?.api_cost_usd && (
                                                    <span>💰 ${item.metrics.api_cost_usd.toFixed(3)}</span>
                                                )}
                                                <span>🎫 {item.credits_used || 5} credits</span>
                                            </div>

                                            {/* Rating */}
                                            <div className="border-t border-electric-cyan/20 pt-2">
                                                <RatingStars requestId={item._id} />
                                            </div>
                                        </>
                                    ) : (
                                        /* Standard Optimization Expanded View */
                                        <>
                                            {/* Original Prompt */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Original Prompt</h4>
                                                    <span className="text-[10px] text-white/40 font-mono">
                                                        {item.tokens_original} tokens
                                                    </span>
                                                </div>
                                                <div className="text-sm bg-deep-teal/20 border border-electric-cyan/10 p-4 rounded-xl whitespace-pre-wrap max-h-40 overflow-y-auto text-white/90 font-mono">
                                                    {item.original_prompt}
                                                </div>
                                            </div>

                                            {/* Optimized Prompt */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-electric-cyan">Optimized Prompt</h4>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(item.optimized_prompt); }}
                                                        className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
                                                    >
                                                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                        <span className="uppercase tracking-tighter font-bold">{copied ? 'Copied!' : 'Copy'}</span>
                                                    </button>
                                                </div>
                                                <div className="text-sm bg-electric-cyan/5 border border-electric-cyan/20 p-4 rounded-xl whitespace-pre-wrap max-h-40 overflow-y-auto text-white font-mono shadow-inner shadow-electric-cyan/5">
                                                    {item.optimized_prompt}
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-electric-cyan/10">
                                                <div>
                                                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Optimized</p>
                                                    <p className="text-lg font-display text-white mt-1">{item.tokens_optimized}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Quality</p>
                                                    <p className="text-lg font-display text-sunset-orange mt-1">
                                                        {item.metrics?.qualityScore ? `${item.metrics.qualityScore}/5` : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Model</p>
                                                    <p className="text-lg font-display text-white mt-1 uppercase tracking-tighter">{item.target_model}</p>
                                                </div>
                                            </div>

                                            {/* Improvements */}
                                            {item.improvements && item.improvements.length > 0 && (
                                                <div className="pt-4 border-t border-electric-cyan/10">
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Improvements Made</h4>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {item.improvements.map((imp, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-xs text-white/80 bg-deep-teal/10 p-2 rounded-lg border border-electric-cyan/5">
                                                                <span className="text-electric-cyan">✓</span>
                                                                {imp}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
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
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Original Prompt</h4>
                                    <span className="text-[10px] text-white/40 font-mono">
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
                                        className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
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
                                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Optimized Tokens</p>
                                    <p className="text-xl font-display text-white mt-1">{selectedItem.tokens_optimized}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Quality Score</p>
                                    <p className="text-xl font-display text-sunset-orange mt-1">
                                        {selectedItem.metrics?.qualityScore ? `${selectedItem.metrics.qualityScore}/5` : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Engine</p>
                                    <p className="text-xl font-display text-white mt-1 uppercase tracking-tighter">{selectedItem.target_model}</p>
                                </div>
                            </div>

                            {/* Improvements */}
                            {selectedItem.improvements && selectedItem.improvements.length > 0 && (
                                <div className="pt-6 border-t border-electric-cyan/10">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Improvements Made</h4>
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
                            <div className="pt-6 border-t border-electric-cyan/10 text-[10px] text-white/40 flex justify-between uppercase tracking-widest font-bold">
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
