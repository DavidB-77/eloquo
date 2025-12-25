"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: "left" | "right";
    className?: string;
}

export function Dropdown({
    trigger,
    children,
    align = "right",
    className,
}: DropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

            {isOpen && (
                <div
                    className={cn(
                        "absolute z-50 mt-2 w-56 rounded-md border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100 focus:outline-none",
                        align === "right" ? "right-0" : "left-0",
                        className
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

import { Slot } from "@radix-ui/react-slot";

export function DropdownItem({
    children,
    onClick,
    className,
    disabled,
    asChild = false,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            onClick={(e: any) => {
                if (disabled) return;
                onClick?.();
            }}
            className={cn(
                "flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                disabled && "pointer-events-none opacity-50",
                className
            )}
        >
            {children}
        </Comp>
    );
}

export function DropdownSeparator() {
    return <div className="my-1 h-px bg-muted" />;
}
