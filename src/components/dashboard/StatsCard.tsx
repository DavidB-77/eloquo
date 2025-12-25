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
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full",
                            trend.isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                            {trend.isPositive ? "+" : "-"}{trend.value}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
