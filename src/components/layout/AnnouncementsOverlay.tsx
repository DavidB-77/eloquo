"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
// import { createClient } from "@/lib/supabase/client";
import { Megaphone, X } from "lucide-react";

export function AnnouncementsOverlay({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [announcement, setAnnouncement] = React.useState<any>(null);
    const [isOpen, setIsOpen] = React.useState(false);

    const setOpen = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };
    // const supabase = createClient();
    const pathname = usePathname();

    React.useEffect(() => {
        const checkAnnouncements = async () => {
            /*
            const now = new Date().toISOString();
            const { data } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .or(`expires_at.is.null,expires_at.gt.${now}`)
                .order('created_at', { ascending: false });

            if (!data || data.length === 0) return;

            // Filter based on Target
            const filtered = data.filter((a: any) => {
                const target = a.target || 'both';
                if (target === 'both') return true;
                if (target === 'dashboard' && pathname?.startsWith('/dashboard')) return true;
                if (target === 'landing' && pathname === '/') return true;
                return false;
            });

            if (filtered.length === 0) return;

            // Simple Priority Sorting
            const priorityMap: Record<string, number> = { critical: 4, high: 3, normal: 2, low: 1 };
            const sorted = filtered.sort((a, b) => (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0));

            // Find first undismissed
            const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
            const next = sorted.find(a => !dismissed.includes(a.id));

            if (next) {
                setAnnouncement(next);
                setOpen(true);
            }
            */
            setAnnouncement(null);
        };

        checkAnnouncements();
    }, [pathname]);

    const handleDismiss = () => {
        if (!announcement) return;
        const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
        localStorage.setItem('dismissed_announcements', JSON.stringify([...dismissed, announcement.id]));
        setOpen(false);
        // Optionally show next? for now just close.
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
