"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, Megaphone, Loader2, Globe, LayoutDashboard, Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

const DISPLAY_LOCATIONS = [
    { value: "landing", label: "Landing Page Only", icon: Globe },
    { value: "dashboard", label: "Dashboard Only", icon: LayoutDashboard },
    { value: "both", label: "Both (Landing + Dashboard)", icon: Bell },
];

const DISPLAY_TYPES = [
    { value: "modal", label: "Modal Popup" },
    { value: "banner", label: "Top Banner" },
    { value: "toast", label: "Toast Notification" },
];

const CATEGORIES = [
    { value: "update", label: "Update" },
    { value: "maintenance", label: "Maintenance" },
    { value: "feature", label: "New Feature" },
    { value: "promotion", label: "Promotion" },
    { value: "urgent", label: "Urgent" },
];

const THEMES = [
    { value: "info", label: "Info (Cyan)", color: "bg-cyan-500" },
    { value: "success", label: "Success (Green)", color: "bg-green-500" },
    { value: "warning", label: "Warning (Yellow)", color: "bg-yellow-500" },
    { value: "danger", label: "Danger (Red)", color: "bg-red-500" },
];

const DISMISS_BEHAVIORS = [
    { value: "once", label: "Show Once (User sees it once, then never again)" },
    { value: "session", label: "Per Session (Shows once per browser session)" },
    { value: "always", label: "Always Show (Shows every page load until deactivated)" },
];

export default function AdminAnnouncementsPage() {
    // Convex queries and mutations
    const announcements = useQuery(api.announcements.getAllAnnouncements) || [];
    const createAnnouncement = useMutation(api.announcements.createAnnouncement);
    const updateAnnouncement = useMutation(api.announcements.updateAnnouncement);
    const deleteAnnouncement = useMutation(api.announcements.deleteAnnouncement);

    // Form state
    const [isOpen, setIsOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<Id<"announcements"> | null>(null);
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [isActive, setIsActive] = React.useState(true);
    const [priority, setPriority] = React.useState(5);
    const [displayLocation, setDisplayLocation] = React.useState("both");
    const [displayType, setDisplayType] = React.useState("modal");
    const [category, setCategory] = React.useState("update");
    const [theme, setTheme] = React.useState("info");
    const [dismissBehavior, setDismissBehavior] = React.useState("once");
    const [ctaText, setCtaText] = React.useState("");
    const [ctaLink, setCtaLink] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    const resetForm = () => {
        setTitle("");
        setContent("");
        setIsActive(true);
        setPriority(5);
        setDisplayLocation("both");
        setDisplayType("modal");
        setCategory("update");
        setTheme("info");
        setDismissBehavior("once");
        setCtaText("");
        setCtaLink("");
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) return;
        setSaving(true);

        try {
            if (editingId) {
                await updateAnnouncement({
                    id: editingId,
                    title,
                    content,
                    is_active: isActive,
                    priority,
                    display_location: displayLocation,
                    display_type: displayType,
                    category,
                    theme,
                    dismiss_behavior: dismissBehavior,
                    cta_text: ctaText || undefined,
                    cta_link: ctaLink || undefined,
                });
            } else {
                await createAnnouncement({
                    title,
                    content,
                    is_active: isActive,
                    priority,
                    display_location: displayLocation,
                    display_type: displayType,
                    category,
                    theme,
                    dismiss_behavior: dismissBehavior,
                    cta_text: ctaText || undefined,
                    cta_link: ctaLink || undefined,
                });
            }
            resetForm();
            setIsOpen(false);
        } catch (error) {
            console.error("Error saving announcement:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (announcement: typeof announcements[0]) => {
        setEditingId(announcement._id);
        setTitle(announcement.title);
        setContent(announcement.content);
        setIsActive(announcement.is_active);
        setPriority(announcement.priority || 5);
        setDisplayLocation(announcement.display_location || "both");
        setDisplayType(announcement.display_type || "modal");
        setCategory(announcement.category || "update");
        setTheme(announcement.theme || "info");
        setDismissBehavior(announcement.dismiss_behavior || "once");
        setCtaText(announcement.cta_text || "");
        setCtaLink(announcement.cta_link || "");
        setIsOpen(true);
    };

    const handleDelete = async (id: Id<"announcements">) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await deleteAnnouncement({ id });
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    };

    const handleToggleActive = async (announcement: typeof announcements[0]) => {
        try {
            await updateAnnouncement({
                id: announcement._id,
                is_active: !announcement.is_active,
            });
        } catch (error) {
            console.error("Error toggling announcement:", error);
        }
    };

    const loading = announcements === undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white tracking-wide">Announcements</h1>
                    <p className="text-gray-400 text-sm">Manage system-wide announcements and notifications.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsOpen(true); }}
                    className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                </Button>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-electric-cyan" />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>No announcements yet. Create one to notify users.</p>
                    </div>
                ) : (
                    announcements.map((announcement) => (
                        <div
                            key={announcement._id}
                            className={cn(
                                "bg-midnight/30 border rounded-xl p-6 transition-all",
                                announcement.is_active
                                    ? "border-electric-cyan/30"
                                    : "border-white/10 opacity-60"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            announcement.is_active
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-gray-500/20 text-gray-400"
                                        )}>
                                            {announcement.is_active ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                            {announcement.display_location || "both"}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                            {announcement.display_type || "modal"}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                                            {announcement.category || "update"}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{announcement.content}</p>
                                    {announcement.cta_text && (
                                        <p className="text-xs text-electric-cyan mt-2">
                                            CTA: {announcement.cta_text} → {announcement.cta_link}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-3">
                                        Created {formatDistanceToNow(new Date(announcement.created_at))} ago
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleActive(announcement)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        {announcement.is_active ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(announcement)}
                                        className="text-gray-400 hover:text-electric-cyan"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(announcement._id)}
                                        className="text-gray-400 hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-midnight border-electric-cyan/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Title & Content */}
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-black/20 border-white/10"
                                placeholder="Announcement title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="bg-black/20 border-white/10 min-h-[100px]"
                                placeholder="Announcement message..."
                            />
                        </div>

                        {/* Display Options Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Display Location</Label>
                                <select
                                    value={displayLocation}
                                    onChange={(e) => setDisplayLocation(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    {DISPLAY_LOCATIONS.map(loc => (
                                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Display Type</Label>
                                <select
                                    value={displayType}
                                    onChange={(e) => setDisplayType(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    {DISPLAY_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Category & Theme Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Theme/Color</Label>
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    {THEMES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Priority & Status Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority (1-10, higher = more important)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={priority}
                                    onChange={(e) => setPriority(parseInt(e.target.value) || 5)}
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex items-center gap-2 h-10">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="h-4 w-4"
                                        id="is-active"
                                    />
                                    <label htmlFor="is-active" className="text-sm">Active (visible to users)</label>
                                </div>
                            </div>
                        </div>

                        {/* Dismiss Behavior */}
                        <div className="space-y-2">
                            <Label>Dismiss Behavior</Label>
                            <select
                                value={dismissBehavior}
                                onChange={(e) => setDismissBehavior(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                                aria-label="Dismiss behavior"
                            >
                                {DISMISS_BEHAVIORS.map(b => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">
                                Controls how users can dismiss this announcement
                            </p>
                        </div>

                        {/* Call to Action */}
                        <div className="border-t border-white/10 pt-4 mt-4">
                            <Label className="text-electric-cyan">Call to Action (Optional)</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Button Text</Label>
                                    <Input
                                        value={ctaText}
                                        onChange={(e) => setCtaText(e.target.value)}
                                        className="bg-black/20 border-white/10"
                                        placeholder="e.g., Learn More"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Button Link</Label>
                                    <Input
                                        value={ctaLink}
                                        onChange={(e) => setCtaLink(e.target.value)}
                                        className="bg-black/20 border-white/10"
                                        placeholder="e.g., /dashboard/settings"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !title || !content}
                            isLoading={saving}
                            className="bg-[#09B7B4] text-white"
                        >
                            {editingId ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
