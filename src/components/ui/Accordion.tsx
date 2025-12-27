"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AccordionItem = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => <div className={cn("border-b border-electric-cyan/10 last:border-none", className)}>{children}</div>;

const AccordionTrigger = ({
    children,
    isOpen,
    onClick,
    className,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
    className?: string;
}) => (
    <button
        type="button"
        className={cn(
            "flex w-full items-center justify-between py-6 font-display text-sm uppercase tracking-[0.2em] text-dusty-rose transition-all hover:text-white group",
            isOpen && "text-white",
            className
        )}
        onClick={onClick}
        data-state={isOpen ? "open" : "closed"}
    >
        <span className={cn("transition-all", isOpen && "glow-sm")}>{children}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-electric-cyan/40 transition-transform duration-300 group-hover:text-electric-cyan", isOpen && "rotate-180 text-electric-cyan")} />
    </button>
);

const AccordionContent = ({
    children,
    isOpen,
    className,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    className?: string;
}) => (
    <div
        className={cn(
            "overflow-hidden text-sm transition-all duration-300 ease-in-out",
            isOpen ? "max-h-[1000px] pb-6" : "max-h-0",
            className
        )}
    >
        <div className="text-dusty-rose/60 font-medium leading-relaxed max-w-2xl">
            {children}
        </div>
    </div>
);

export function Accordion({
    items,
    className,
}: {
    items: { title: string; content: React.ReactNode; id: string }[];
    className?: string;
}) {
    const [openId, setOpenId] = React.useState<string | null>(null);

    return (
        <div className={cn("w-full px-8 glass border-electric-cyan/20 bg-deep-teal/5", className)}>
            {items.map((item) => (
                <AccordionItem key={item.id}>
                    <AccordionTrigger
                        isOpen={openId === item.id}
                        onClick={() => setOpenId(openId === item.id ? null : item.id)}
                    >
                        {item.title}
                    </AccordionTrigger>
                    <AccordionContent isOpen={openId === item.id}>
                        {item.content}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </div>
    );
}
