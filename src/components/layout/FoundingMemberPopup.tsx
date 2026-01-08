"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Rocket, X } from "lucide-react";
import { getFoundingMemberConfig, FoundingMemberConfig } from "@/lib/settings";

interface FoundingMemberPopupProps {
    canShow: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function FoundingMemberPopup({ canShow, onOpenChange }: FoundingMemberPopupProps) {
    const [config, setConfig] = React.useState<FoundingMemberConfig | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [hasScrolled, setHasScrolled] = React.useState(false);

    // Fetch Config
    React.useEffect(() => {
        getFoundingMemberConfig().then(setConfig);
    }, []);

    // Scroll Listener
    React.useEffect(() => {
        if (!config?.popup_settings?.trigger_on_scroll?.enabled) return;

        const handleScroll = () => {
            const percent = config.popup_settings!.trigger_on_scroll.percentage;
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent >= percent) {
                setHasScrolled(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [config]);

    // Trigger Logic
    React.useEffect(() => {
        if (!config || !canShow || isOpen) return;

        const { popup_settings } = config;
        if (!popup_settings?.enabled) return;

        // Check Frequency
        const storage = popup_settings.show_frequency === "once" ? localStorage : sessionStorage;
        if (storage.getItem("founding_popup_shown")) return;

        // Check Triggers
        const scrollTrigger = popup_settings.trigger_on_scroll.enabled;
        if (scrollTrigger && !hasScrolled) return;

        // Delay
        const timer = setTimeout(() => {
            setIsOpen(true);
            onOpenChange?.(true);
            storage.setItem("founding_popup_shown", "true");
        }, (popup_settings.delay || 0) * 1000);

        return () => clearTimeout(timer);
    }, [config, canShow, isOpen, hasScrolled, onOpenChange]);

    const handleClose = () => {
        setIsOpen(false);
        onOpenChange?.(false);
    };

    if (!config || !config.popup_settings) return null;

    const { headline, description, button_text } = config.popup_settings;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-midnight border-neon-orange/30 text-white">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neon-orange/10 mb-4">
                        <Rocket className="h-6 w-6 text-neon-orange" />
                    </div>
                    <DialogTitle className="text-center text-xl font-display tracking-wide uppercase text-neon-orange">
                        {headline}
                    </DialogTitle>
                </DialogHeader>
                <div className="text-center text-gray-300 py-4 whitespace-pre-wrap leading-relaxed">
                    {description}
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button
                        className="bg-neon-orange hover:bg-neon-orange/80 text-midnight font-bold w-full sm:w-auto min-w-[200px]"
                        onClick={() => {
                            window.location.href = "/dashboard/settings?tab=subscription";
                            handleClose();
                        }}
                    >
                        {button_text}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
