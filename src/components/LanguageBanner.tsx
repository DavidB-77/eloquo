"use client";

import * as React from "react";
import { X, Globe } from "lucide-react";
import { getLanguageMessage } from "@/lib/language-messages";

const STORAGE_KEY = "eloquo-language-banner-dismissed";

export function LanguageBanner() {
    const [message, setMessage] = React.useState<string | null>(null);
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        // Check if already dismissed
        if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
            return;
        }

        // Detect browser language
        const browserLang = navigator.language || (navigator as any).userLanguage;
        const langMessage = getLanguageMessage(browserLang);

        if (langMessage) {
            setMessage(langMessage);
            setVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, "true");
    };

    if (!visible || !message) return null;

    return (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{message}</span>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
