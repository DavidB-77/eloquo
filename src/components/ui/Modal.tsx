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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div
                className={cn(
                    "relative z-50 w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg animate-in fade-in zoom-in duration-200",
                    className
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        {title && (
                            <h2 className="text-lg font-semibold font-display">{title}</h2>
                        )}
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
                <div className="py-2">{children}</div>
                {footer && (
                    <div className="mt-6 flex items-center justify-end space-x-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
