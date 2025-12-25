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
}) => <div className={cn("border-b", className)}>{children}</div>;

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
            "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
            className
        )}
        onClick={onClick}
        data-state={isOpen ? "open" : "closed"}
    >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
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
            "overflow-hidden text-sm transition-all duration-200",
            isOpen ? "max-h-[1000px] py-4" : "max-h-0",
            className
        )}
    >
        {children}
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
        <div className={cn("w-full", className)}>
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
