"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, Megaphone, Loader2 } from "lucide-react";
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
    const [priority, setPriority] = React.useState(0);
    const [saving, setSaving] = React.useState(false);

    const resetForm = () => {
        setTitle("");
        setContent("");
        setIsActive(true);
        setPriority(0);
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
                });
            } else {
                await createAnnouncement({
                    title,
                    content,
                    is_active: isActive,
                    priority,
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
        setPriority(announcement.priority || 0);
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
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            announcement.is_active
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-gray-500/20 text-gray-400"
                                        )}>
                                            {announcement.is_active ? "Active" : "Inactive"}
                                        </span>
                                        {announcement.priority && announcement.priority > 0 && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                                                Priority: {announcement.priority}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{announcement.content}</p>
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
                <DialogContent className="bg-midnight border-electric-cyan/20 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
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
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <Label>Priority (0-10)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={priority}
                                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
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
                                    <label htmlFor="is-active" className="text-sm">Active</label>
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
