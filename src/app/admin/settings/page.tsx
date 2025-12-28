"use client";

import * as React from "react";
import { Save, RefreshCw, Plus, Trash2, Check, X, Loader2, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { getGeneralSettings, updateSystemSetting, GeneralSettings } from "@/lib/settings";

export default function AdminSettingsPage() {
    const [settings, setSettings] = React.useState<GeneralSettings | null>(null);
    const [loadingSettings, setLoadingSettings] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Admin Users State
    const [adminUsers, setAdminUsers] = React.useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = React.useState(true);

    // Add Admin Modal State
    const [showAddAdmin, setShowAddAdmin] = React.useState(false);
    const [newAdminEmail, setNewAdminEmail] = React.useState("");
    const [addAdminLoading, setAddAdminLoading] = React.useState(false);
    const [addAdminMessage, setAddAdminMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch initial data
    const fetchSettings = async () => {
        try {
            const data = await getGeneralSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoadingSettings(false);
        }
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, display_name, created_at, is_admin')
                .eq('is_admin', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setAdminUsers(data.map(user => ({
                    id: user.id,
                    name: user.full_name || user.display_name || "Unknown",
                    email: user.email,
                    role: "Admin",
                    added: user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : "Unknown"
                })));
            }
        } catch (err) {
            console.error("Error fetching admin users:", err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    React.useEffect(() => {
        fetchSettings();
        fetchAdmins();
    }, []);

    const handleToggle = async (key: keyof GeneralSettings) => {
        if (!settings) return;

        const newValue = !settings[key];
        const newSettings = { ...settings, [key]: newValue };
        setSettings(newSettings); // Optimistic update

        try {
            await updateSystemSetting('general_settings', newSettings);
        } catch (error) {
            console.error("Failed to update setting:", error);
            setSettings({ ...settings, [key]: !newValue }); // Revert on error
        }
    };

    const handleLimitChange = async (value: string) => {
        if (!settings) return;
        const numValue = parseInt(value);
        if (isNaN(numValue)) return;

        setSettings({ ...settings, free_plan_monthly_limit: numValue });
    };

    const saveLimit = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await updateSystemSetting('general_settings', settings);
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!newAdminEmail) return;
        setAddAdminLoading(true);
        setAddAdminMessage(null);

        const supabase = createClient();
        try {
            // 1. Find user by email
            const { data: users, error: searchError } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('email', newAdminEmail)
                .single();

            if (searchError || !users) {
                setAddAdminMessage({ type: 'error', text: "User not found with that email." });
                return;
            }

            // 2. Update user to be admin
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_admin: true })
                .eq('id', users.id);

            if (updateError) throw updateError;

            setAddAdminMessage({ type: 'success', text: "Admin added successfully!" });
            setNewAdminEmail("");
            fetchAdmins(); // Refresh list

            // Close modal after delay
            setTimeout(() => {
                setShowAddAdmin(false);
                setAddAdminMessage(null);
            }, 1500);

        } catch (error: any) {
            console.error("Error adding admin:", error);
            setAddAdminMessage({ type: 'error', text: error.message || "Failed to add admin" });
        } finally {
            setAddAdminLoading(false);
        }
    };

    if (loadingSettings) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-electric-cyan" />
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="space-y-8 max-w-4xl relative">
            {/* Test Mode Banner */}
            {settings.test_mode_enabled && (
                <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4 flex items-center gap-3 mb-6 animate-pulse">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <p className="text-orange-200 text-sm font-medium">
                        Test Mode is ENABLED. Optimizations will use mock data and not consume API credits.
                    </p>
                </div>
            )}

            {/* Platform Settings */}
            <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">⚙️ Platform Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Free Plan Monthly Limit</p>
                            <p className="text-xs text-gray-500">Number of optimizations for free users</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={settings.free_plan_monthly_limit}
                                onChange={(e) => handleLimitChange(e.target.value)}
                                className="w-24 bg-[#111] border-white/10 text-white text-right"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={saveLimit}
                                disabled={isSaving}
                                className="h-9 border-white/10 hover:bg-white/5"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-white/5">
                        <div>
                            <p className="text-sm font-medium text-white">Maintenance Mode</p>
                            <p className="text-xs text-gray-500">Shows a maintenance banner site-wide</p>
                        </div>
                        <button
                            onClick={() => handleToggle('maintenance_mode')}
                            className={cn(
                                "w-12 h-6 rounded-full transition-colors relative",
                                "transition-all duration-300",
                                settings.maintenance_mode ? "bg-red-500" : "bg-gray-600"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    settings.maintenance_mode ? "left-7" : "left-1"
                                )}
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Flags */}
            <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">🚀 Feature Flags</h2>
                <div className="space-y-4">
                    {[
                        { key: "enable_team_plan", label: "Enable Team Plan Features" },
                        { key: "enable_api_access", label: "Enable API/MCP Access" },
                        { key: "allow_new_signups", label: "Allow New User Signups" },
                        { key: "show_changelog_popup", label: "Show Changelog Popup" },
                        { key: "test_mode_enabled", label: "Test Mode (Mock API Results)", danger: true },
                    ].map((flag) => (
                        <div
                            key={flag.key}
                            className="flex items-center justify-between py-2"
                        >
                            <p className={cn("text-sm", flag.danger ? "text-orange-400" : "text-white")}>
                                {flag.label}
                            </p>
                            <button
                                onClick={() => handleToggle(flag.key as keyof GeneralSettings)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    settings[flag.key as keyof GeneralSettings]
                                        ? "bg-[#09B7B4]"
                                        : "bg-gray-600",
                                    flag.danger && settings[flag.key as keyof GeneralSettings] && "bg-orange-500"
                                )}
                            >
                                <div
                                    className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                        settings[flag.key as keyof GeneralSettings]
                                            ? "left-7"
                                            : "left-1"
                                    )}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Integration Settings (Placeholder for now, keeping UI) */}
            <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 opacity-60 pointer-events-none grayscale">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">🔗 Integration Settings</h2>
                    <span className="text-xs border border-white/20 px-2 py-1 rounded text-white/50">Coming Soon</span>
                </div>
                {/* Simplified placeholder content to save space, assuming integrations are next sprint */}
                <p className="text-sm text-gray-500">Integration configuration will be available in the next update.</p>
            </section>

            {/* Admin Users */}
            <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">👤 Admin Users</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => setShowAddAdmin(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Admin
                    </Button>
                </div>
                <div className="space-y-3">
                    {loadingAdmins ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-electric-cyan" />
                        </div>
                    ) : (
                        adminUsers.map((admin) => (
                            <div
                                key={admin.id}
                                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">{admin.name}</p>
                                    <p className="text-xs text-gray-500">{admin.email}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400">{admin.role}</span>
                                    <span className="text-xs text-gray-500">Added {admin.added}</span>
                                </div>
                            </div>
                        ))
                    )}
                    {!loadingAdmins && adminUsers.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">No admin users found.</p>
                    )}
                </div>
            </section>

            {/* Add Admin Modal Overlay */}
            {showAddAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowAddAdmin(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-2">Add New Admin</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Enter the email address of an existing user to grant them admin privileges.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1.5 block">User Email</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="pl-9 bg-[#111] border-white/10 text-white"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {addAdminMessage && (
                                <div className={cn(
                                    "p-3 rounded-lg text-sm flex items-center gap-2",
                                    addAdminMessage.type === 'success' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {addAdminMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                    {addAdminMessage.text}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    className="flex-1 text-gray-400 hover:text-white"
                                    onClick={() => setShowAddAdmin(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-[#09B7B4] hover:bg-[#08a5a3] text-white"
                                    onClick={handleAddAdmin}
                                    disabled={addAdminLoading || !newAdminEmail}
                                    isLoading={addAdminLoading}
                                >
                                    Grant Admin Access
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
