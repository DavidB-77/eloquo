"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className
}: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden glass glass-hover border-electric-cyan/20", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-electric-cyan/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-electric-cyan" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            trend.isPositive
                                ? "bg-electric-cyan/10 text-electric-cyan border-electric-cyan/20"
                                : "bg-terracotta/10 text-terracotta border-terracotta/20"
                        )}>
                            {trend.isPositive ? "↑" : "↓"} {trend.value}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-xs font-medium text-dusty-rose mb-1 uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-display text-white">{value}</h3>
                    {description && (
                        <p className="text-xs text-dusty-rose mt-2 leading-relaxed">{description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
