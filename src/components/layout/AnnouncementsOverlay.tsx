"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Megaphone } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AnnouncementsOverlay({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [announcement, setAnnouncement] = React.useState<any>(null);
    const [isOpen, setIsOpen] = React.useState(false);

    // Fetch active announcements from Convex
    const announcements = useQuery(api.announcements.getActiveAnnouncements) || [];

    const setOpen = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };

    const pathname = usePathname();

    React.useEffect(() => {
        if (announcements.length === 0) {
            setAnnouncement(null);
            return;
        }

        // Check dismissed announcements
        const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');

        // Sort by priority (higher first)
        const sorted = [...announcements].sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // Find first undismissed
        const next = sorted.find(a => !dismissed.includes(a._id));

        if (next) {
            setAnnouncement(next);
            setOpen(true);
        } else {
            setAnnouncement(null);
        }
    }, [announcements, pathname]);

    const handleDismiss = () => {
        if (!announcement) return;
        const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
        localStorage.setItem('dismissed_announcements', JSON.stringify([...dismissed, announcement._id]));
        setOpen(false);
    };

    if (!announcement) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleDismiss}>
            <DialogContent className="sm:max-w-md bg-midnight border-electric-cyan/30 text-white">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-electric-cyan/10 mb-4">
                        <Megaphone className="h-6 w-6 text-electric-cyan" />
                    </div>
                    <DialogTitle className="text-center text-xl">{announcement.title}</DialogTitle>
                </DialogHeader>
                <div className="text-center text-gray-300 py-4 whitespace-pre-wrap">
                    {announcement.content}
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button
                        className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white w-full sm:w-auto min-w-[120px]"
                        onClick={handleDismiss}
                    >
                        Got it
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
