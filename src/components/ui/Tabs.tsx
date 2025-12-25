"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
    tabs: { label: string; id: string }[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
    return (
        <div className={cn("flex space-x-1 rounded-lg bg-muted p-1", className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        activeTab === tab.id
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
