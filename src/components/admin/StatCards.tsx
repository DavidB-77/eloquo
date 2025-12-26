"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: {
        value: string;
        positive?: boolean;
    };
    icon?: React.ReactNode;
    loading?: boolean;
    warning?: boolean;
    critical?: boolean;
}

export function StatCard({
    title,
    value,
    change,
    icon,
    loading = false,
    warning = false,
    critical = false,
}: StatCardProps) {
    return (
        <div
            className={cn(
                "bg-[#1a1a1a] border rounded-xl p-5 transition-all",
                critical ? "border-red-500/50" : warning ? "border-yellow-500/50" : "border-white/10",
                "hover:border-white/20"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-gray-400">{title}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-white/10 animate-pulse rounded" />
                    ) : (
                        <p
                            className={cn(
                                "text-2xl font-bold font-mono",
                                critical ? "text-red-400" : warning ? "text-yellow-400" : "text-white"
                            )}
                        >
                            {value}
                        </p>
                    )}
                    {change && !loading && (
                        <p
                            className={cn(
                                "text-xs",
                                change.positive ? "text-green-400" : "text-red-400"
                            )}
                        >
                            {change.positive ? "↑" : "↓"} {change.value}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

interface BankAccountCardProps {
    name: string;
    emoji: string;
    balance: number;
    change?: string;
    changePositive?: boolean;
    loading?: boolean;
}

export function BankAccountCard({
    name,
    emoji,
    balance,
    change,
    changePositive,
    loading = false,
}: BankAccountCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{emoji}</span>
                <span className="text-sm text-gray-400">{name}</span>
            </div>
            {loading ? (
                <div className="h-8 w-28 bg-white/10 animate-pulse rounded" />
            ) : (
                <>
                    <p className="text-2xl font-bold font-mono text-white">
                        {formatCurrency(balance)}
                    </p>
                    {change && (
                        <p
                            className={cn(
                                "text-xs mt-1",
                                changePositive ? "text-green-400" : "text-red-400"
                            )}
                        >
                            {changePositive ? "+" : ""}{change} today
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

interface AlertItemProps {
    severity: "warning" | "critical";
    message: string;
}

export function AlertItem({ severity, message }: AlertItemProps) {
    return (
        <div
            className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                severity === "critical" ? "bg-red-500/10" : "bg-yellow-500/10"
            )}
        >
            <span className="text-lg">
                {severity === "critical" ? "🚨" : "⚠️"}
            </span>
            <p
                className={cn(
                    "text-sm",
                    severity === "critical" ? "text-red-300" : "text-yellow-300"
                )}
            >
                {message}
            </p>
        </div>
    );
}

interface ServiceStatusProps {
    name: string;
    status: "healthy" | "warning" | "error";
    detail?: string;
}

export function ServiceStatus({ name, status, detail }: ServiceStatusProps) {
    return (
        <div className="flex items-center gap-3 px-4 py-2">
            <div
                className={cn(
                    "h-2 w-2 rounded-full",
                    status === "healthy" && "bg-green-500",
                    status === "warning" && "bg-yellow-500",
                    status === "error" && "bg-red-500"
                )}
            />
            <span className="text-sm text-gray-300">{name}</span>
            {detail && <span className="text-xs text-gray-500">({detail})</span>}
        </div>
    );
}
