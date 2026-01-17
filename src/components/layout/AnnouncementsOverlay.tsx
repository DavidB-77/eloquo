"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Megaphone, AlertTriangle, CheckCircle, Info, AlertCircle, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

// Theme styles mapping
const themeStyles = {
    info: {
        icon: Info,
        iconBg: "bg-electric-cyan/10",
        iconColor: "text-electric-cyan",
        border: "border-electric-cyan/30",
    },
    warning: {
        icon: AlertTriangle,
        iconBg: "bg-yellow-500/10",
        iconColor: "text-yellow-500",
        border: "border-yellow-500/30",
    },
    success: {
        icon: CheckCircle,
        iconBg: "bg-green-500/10",
        iconColor: "text-green-500",
        border: "border-green-500/30",
    },
    danger: {
        icon: AlertCircle,
        iconBg: "bg-red-500/10",
        iconColor: "text-red-500",
        border: "border-red-500/30",
    },
};

interface Announcement {
    _id: string;
    title: string;
    content: string;
    priority?: number;
    display_location?: string;
    display_type?: string;
    category?: string;
    theme?: string;
    cta_text?: string;
    cta_link?: string;
    start_date?: number;
    end_date?: number;
}

export function AnnouncementsOverlay({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [announcement, setAnnouncement] = React.useState<Announcement | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [bannerAnnouncements, setBannerAnnouncements] = React.useState<Announcement[]>([]);

    // Fetch active announcements from Convex
    const announcements = useQuery(api.announcements.getActiveAnnouncements) || [];

    const setOpen = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };

    const pathname = usePathname();

    // Determine current location context
    const isLandingPage = pathname === "/" || pathname === "";
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");
    const currentLocation = isLandingPage ? "landing" : isDashboard ? "dashboard" : "other";

    React.useEffect(() => {
        if (announcements.length === 0) {
            setAnnouncement(null);
            setBannerAnnouncements([]);
            return;
        }

        // Check dismissed announcements
        const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');

        // Filter by location
        const locationFiltered = announcements.filter((a: Announcement) => {
            const loc = a.display_location || "both";
            if (loc === "all" || loc === "both") return true;
            if (loc === "landing" && isLandingPage) return true;
            if (loc === "dashboard" && isDashboard) return true;
            return false;
        });

        // Sort by priority (higher first)
        const sorted = [...locationFiltered].sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // Separate by display type
        const modals = sorted.filter(a => (a.display_type || "modal") === "modal");
        const banners = sorted.filter(a => a.display_type === "banner");

        // Set banner announcements (show all undismissed banners)
        setBannerAnnouncements(banners.filter(a => !dismissed.includes(a._id)));

        // Find first undismissed modal
        const nextModal = modals.find(a => !dismissed.includes(a._id));

        if (nextModal) {
            setAnnouncement(nextModal);
            setOpen(true);
        } else {
            setAnnouncement(null);
        }
    }, [announcements, pathname, isLandingPage, isDashboard]);

    const handleDismiss = (id?: string) => {
        const targetId = id || announcement?._id;
        if (!targetId) return;
        const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
        localStorage.setItem('dismissed_announcements', JSON.stringify([...dismissed, targetId]));
        if (id) {
            // Dismissing a banner
            setBannerAnnouncements(prev => prev.filter(a => a._id !== id));
        } else {
            // Dismissing the modal
            setOpen(false);
        }
    };

    const getTheme = (themeName?: string) => themeStyles[themeName as keyof typeof themeStyles] || themeStyles.info;

    return (
        <>
            {/* Banner Announcements */}
            {bannerAnnouncements.map((banner) => {
                const theme = getTheme(banner.theme);
                const Icon = theme.icon;
                return (
                    <div
                        key={banner._id}
                        className={`fixed top-0 left-0 right-0 z-50 bg-midnight/95 backdrop-blur-sm border-b ${theme.border} px-4 py-3`}
                    >
                        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Icon className={`h-5 w-5 ${theme.iconColor}`} />
                                <span className="font-medium">{banner.title}</span>
                                <span className="text-gray-400">{banner.content}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {banner.cta_text && banner.cta_link && (
                                    <Link href={banner.cta_link}>
                                        <Button size="sm" variant="outline" className="border-electric-cyan text-electric-cyan hover:bg-electric-cyan/10">
                                            {banner.cta_text}
                                        </Button>
                                    </Link>
                                )}
                                <button onClick={() => handleDismiss(banner._id)} className="text-gray-400 hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Modal Announcement */}
            {announcement && (
                <Dialog open={isOpen} onOpenChange={() => handleDismiss()}>
                    <DialogContent className={`sm:max-w-md bg-midnight border ${getTheme(announcement.theme).border} text-white`}>
                        <DialogHeader>
                            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${getTheme(announcement.theme).iconBg} mb-4`}>
                                {React.createElement(getTheme(announcement.theme).icon, {
                                    className: `h-6 w-6 ${getTheme(announcement.theme).iconColor}`
                                })}
                            </div>
                            <DialogTitle className="text-center text-xl">{announcement.title}</DialogTitle>
                            {announcement.category && (
                                <span className="text-center text-xs text-gray-500 uppercase tracking-wide">
                                    {announcement.category}
                                </span>
                            )}
                        </DialogHeader>
                        <div className="text-center text-gray-300 py-4 whitespace-pre-wrap">
                            {announcement.content}
                        </div>
                        <DialogFooter className="sm:justify-center gap-2">
                            {announcement.cta_text && announcement.cta_link && (
                                <Link href={announcement.cta_link}>
                                    <Button className="bg-electric-cyan hover:bg-electric-cyan/90 text-black">
                                        {announcement.cta_text}
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="outline"
                                className="border-gray-600 hover:bg-gray-800"
                                onClick={() => handleDismiss()}
                            >
                                {announcement.cta_text ? "Maybe Later" : "Got it"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
