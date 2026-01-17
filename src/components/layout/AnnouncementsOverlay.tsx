"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle, Info, AlertCircle, X } from "lucide-react";
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
        toastBg: "bg-cyan-900/90",
    },
    warning: {
        icon: AlertTriangle,
        iconBg: "bg-yellow-500/10",
        iconColor: "text-yellow-500",
        border: "border-yellow-500/30",
        toastBg: "bg-yellow-900/90",
    },
    success: {
        icon: CheckCircle,
        iconBg: "bg-green-500/10",
        iconColor: "text-green-500",
        border: "border-green-500/30",
        toastBg: "bg-green-900/90",
    },
    danger: {
        icon: AlertCircle,
        iconBg: "bg-red-500/10",
        iconColor: "text-red-500",
        border: "border-red-500/30",
        toastBg: "bg-red-900/90",
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
    dismiss_behavior?: string;
    cta_text?: string;
    cta_link?: string;
    start_date?: number;
    end_date?: number;
}

// Helper to check if announcement should be shown based on dismiss behavior
function shouldShowAnnouncement(announcement: Announcement): boolean {
    const behavior = announcement.dismiss_behavior || "once";
    const storageKey = `dismissed_${announcement._id}`;

    if (behavior === "always") {
        // Always show, never dismiss permanently
        return true;
    }

    if (behavior === "session") {
        // Check sessionStorage (clears when browser closes)
        return !sessionStorage.getItem(storageKey);
    }

    // "once" - check localStorage (permanent)
    const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
    return !dismissed.includes(announcement._id);
}

// Helper to dismiss announcement based on behavior
function dismissAnnouncement(announcement: Announcement) {
    const behavior = announcement.dismiss_behavior || "once";
    const storageKey = `dismissed_${announcement._id}`;

    if (behavior === "always") {
        // Don't persist dismissal, just hide for this render
        return;
    }

    if (behavior === "session") {
        sessionStorage.setItem(storageKey, "true");
        return;
    }

    // "once" - save to localStorage permanently
    const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
    if (!dismissed.includes(announcement._id)) {
        localStorage.setItem('dismissed_announcements', JSON.stringify([...dismissed, announcement._id]));
    }
}

export function AnnouncementsOverlay({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [modalAnnouncement, setModalAnnouncement] = React.useState<Announcement | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [bannerAnnouncements, setBannerAnnouncements] = React.useState<Announcement[]>([]);
    const [toastAnnouncements, setToastAnnouncements] = React.useState<Announcement[]>([]);
    const [sessionDismissed, setSessionDismissed] = React.useState<Set<string>>(new Set());

    // Fetch active announcements from Convex
    const announcements = useQuery(api.announcements.getActiveAnnouncements) || [];

    const setOpen = (open: boolean) => {
        setIsModalOpen(open);
        onOpenChange?.(open);
    };

    const pathname = usePathname();

    // Determine current location context
    const isLandingPage = pathname === "/" || pathname === "";
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

    React.useEffect(() => {
        if (announcements.length === 0) {
            setModalAnnouncement(null);
            setBannerAnnouncements([]);
            setToastAnnouncements([]);
            return;
        }

        // Filter by location and check if should show
        const locationFiltered = announcements.filter((a: Announcement) => {
            const loc = a.display_location || "both";
            if (loc === "all" || loc === "both") return true;
            if (loc === "landing" && isLandingPage) return true;
            if (loc === "dashboard" && isDashboard) return true;
            return false;
        }).filter((a: Announcement) => {
            // Check dismiss behavior
            if (sessionDismissed.has(a._id)) return false;
            return shouldShowAnnouncement(a);
        });

        // Sort by priority (higher first)
        const sorted = [...locationFiltered].sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // Separate by display type
        const modals = sorted.filter(a => (a.display_type || "modal") === "modal");
        const banners = sorted.filter(a => a.display_type === "banner");
        const toasts = sorted.filter(a => a.display_type === "toast");

        // Set states
        setBannerAnnouncements(banners);
        setToastAnnouncements(toasts);

        // Find first modal to show
        const nextModal = modals[0];
        if (nextModal) {
            setModalAnnouncement(nextModal);
            setOpen(true);
        } else {
            setModalAnnouncement(null);
            setOpen(false);
        }
    }, [announcements, pathname, isLandingPage, isDashboard, sessionDismissed]);

    const handleDismiss = React.useCallback((announcement: Announcement) => {
        // Dismiss based on behavior
        dismissAnnouncement(announcement);

        // Also track in session state for "always" announcements (hide for this session at least)
        setSessionDismissed(prev => new Set([...prev, announcement._id]));

        // Update UI states
        if (announcement.display_type === "banner") {
            setBannerAnnouncements(prev => prev.filter(a => a._id !== announcement._id));
        } else if (announcement.display_type === "toast") {
            setToastAnnouncements(prev => prev.filter(a => a._id !== announcement._id));
        } else {
            // Modal
            setOpen(false);
            setModalAnnouncement(null);
        }
    }, [setOpen]);

    // Auto-dismiss toasts after 8 seconds
    React.useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        toastAnnouncements.forEach(toast => {
            const timer = setTimeout(() => {
                handleDismiss(toast);
            }, 8000);
            timers.push(timer);
        });
        return () => timers.forEach(t => clearTimeout(t));
    }, [toastAnnouncements, handleDismiss]);

    const getTheme = (themeName?: string) => themeStyles[themeName as keyof typeof themeStyles] || themeStyles.info;

    return (
        <>
            {/* Banner Announcements - Top of screen */}
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
                                <button
                                    onClick={() => handleDismiss(banner)}
                                    className="text-gray-400 hover:text-white p-1"
                                    aria-label="Dismiss banner"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Toast Announcements - Bottom right corner */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md">
                {toastAnnouncements.map((toast) => {
                    const theme = getTheme(toast.theme);
                    const Icon = theme.icon;
                    return (
                        <div
                            key={toast._id}
                            className={`${theme.toastBg} backdrop-blur-sm border ${theme.border} rounded-xl p-4 shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`${theme.iconBg} p-2 rounded-lg flex-shrink-0`}>
                                    <Icon className={`h-4 w-4 ${theme.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-white text-sm">{toast.title}</h4>
                                        <button
                                            onClick={() => handleDismiss(toast)}
                                            className="text-gray-400 hover:text-white flex-shrink-0"
                                            aria-label="Dismiss toast"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1">{toast.content}</p>
                                    {toast.cta_text && toast.cta_link && (
                                        <Link href={toast.cta_link} className="mt-2 inline-block">
                                            <span className={`text-sm ${theme.iconColor} hover:underline`}>
                                                {toast.cta_text} →
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            {/* Progress bar for auto-dismiss */}
                            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${theme.iconColor.replace('text-', 'bg-')} animate-shrink`}
                                    style={{ animation: 'shrink 8s linear forwards' }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Announcement */}
            {modalAnnouncement && (
                <Dialog open={isModalOpen} onOpenChange={() => handleDismiss(modalAnnouncement)}>
                    <DialogContent className={`sm:max-w-md bg-midnight border ${getTheme(modalAnnouncement.theme).border} text-white`}>
                        <DialogHeader>
                            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${getTheme(modalAnnouncement.theme).iconBg} mb-4`}>
                                {React.createElement(getTheme(modalAnnouncement.theme).icon, {
                                    className: `h-6 w-6 ${getTheme(modalAnnouncement.theme).iconColor}`
                                })}
                            </div>
                            <DialogTitle className="text-center text-xl">{modalAnnouncement.title}</DialogTitle>
                            {modalAnnouncement.category && (
                                <span className="text-center text-xs text-gray-500 uppercase tracking-wide block">
                                    {modalAnnouncement.category}
                                </span>
                            )}
                        </DialogHeader>
                        <div className="text-center text-gray-300 py-4 whitespace-pre-wrap">
                            {modalAnnouncement.content}
                        </div>
                        <DialogFooter className="sm:justify-center gap-2">
                            {modalAnnouncement.cta_text && modalAnnouncement.cta_link && (
                                <Link href={modalAnnouncement.cta_link}>
                                    <Button className="bg-electric-cyan hover:bg-electric-cyan/90 text-black">
                                        {modalAnnouncement.cta_text}
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="outline"
                                className="border-gray-600 hover:bg-gray-800"
                                onClick={() => handleDismiss(modalAnnouncement)}
                            >
                                {modalAnnouncement.cta_text ? "Maybe Later" : "Got it"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Add CSS for shrink animation */}
            <style jsx global>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-shrink {
                    animation: shrink 8s linear forwards;
                }
            `}</style>
        </>
    );
}
