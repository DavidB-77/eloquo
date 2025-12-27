"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: ModalProps) {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEsc);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div
                className="fixed inset-0 bg-midnight/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />
            <div
                className={cn(
                    "relative z-[110] w-full max-w-lg glass border-electric-cyan/30 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300",
                    className
                )}
            >
                <div className="flex items-start justify-between mb-8">
                    <div className="space-y-1">
                        {title && (
                            <h2 className="text-xl font-normal font-display text-white uppercase tracking-widest glow-sm">{title}</h2>
                        )}
                        {description && (
                            <p className="text-sm text-white/60 font-medium leading-relaxed">{description}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-10 w-10 rounded-xl hover:bg-white/5 group"
                    >
                        <X className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
                <div className="relative">{children}</div>
                {footer && (
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end space-x-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
