"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, Megaphone, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Announcement = {
    id: string;
    title: string;
    content: string;
    is_active: boolean;
    priority: "low" | "normal" | "high" | "critical";
    starts_at: string | null;
    expires_at: string | null;
    created_at: string;
};

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);

    // Form State
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [priority, setPriority] = React.useState("normal");
    const [isActive, setIsActive] = React.useState(true);
    const [expiresAt, setExpiresAt] = React.useState("");

    const supabase = createClient();

    const fetchAnnouncements = React.useCallback(async () => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setAnnouncements(data);
        setLoading(false);
    }, [supabase]);

    React.useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) return;

        const payload = {
            title,
            content,
            priority,
            is_active: isActive,
            expires_at: expiresAt || null,
        };

        if (editingId) {
            await supabase.from('announcements').update(payload).eq('id', editingId);
        } else {
            await supabase.from('announcements').insert([payload]);
        }

        resetForm();
        fetchAnnouncements();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        await supabase.from('announcements').delete().eq('id', id);
        fetchAnnouncements();
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setTitle(announcement.title);
        setContent(announcement.content);
        setPriority(announcement.priority);
        setIsActive(announcement.is_active);
        setExpiresAt(announcement.expires_at ? announcement.expires_at.split('T')[0] : "");
        setIsCreateOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle("");
        setContent("");
        setPriority("normal");
        setIsActive(true);
        setExpiresAt("");
        setIsCreateOpen(false);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await supabase.from('announcements').update({ is_active: !currentStatus }).eq('id', id);
        fetchAnnouncements();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white tracking-wide">Announcements</h1>
                    <p className="text-gray-400">Manage system-wide announcements and notifications.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => !open && resetForm()}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-midnight border-white/10 text-white sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-black/20 border-white/10" placeholder="Announcement Title" />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea value={content} onChange={e => setContent(e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]" placeholder="Message content..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <select
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Expires At (Optional)</Label>
                                    <Input
                                        type="date"
                                        value={expiresAt}
                                        onChange={e => setExpiresAt(e.target.value)}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    className="rounded border-gray-600 bg-black/20 text-electric-cyan focus:ring-offset-0"
                                />
                                <Label htmlFor="isActive">Active immediately</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-[#09B7B4] text-white">Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 flex justify-between items-start group hover:border-[#09B7B4]/30 transition-colors">
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider",
                                    announcement.is_active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                                )}>
                                    {announcement.is_active ? "Active" : "Inactive"}
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border",
                                    announcement.priority === 'critical' ? "border-red-500 text-red-400" :
                                        announcement.priority === 'high' ? "border-orange-500 text-orange-400" :
                                            "border-blue-500 text-blue-400"
                                )}>
                                    {announcement.priority}
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm whitespace-pre-wrap">{announcement.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                                <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Created: {new Date(announcement.created_at).toLocaleDateString()}
                                </span>
                                {announcement.expires_at && (
                                    <span className="flex items-center text-orange-400/80">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" className="h-8 border-white/10 hover:bg-white/10" onClick={() => toggleStatus(announcement.id, announcement.is_active)}>
                                {announcement.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => handleEdit(announcement)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400" onClick={() => handleDelete(announcement.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {announcements.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No announcements found. Create one to notify users.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
