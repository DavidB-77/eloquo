"use client";

import * as React from "react";
import { Save, Plus, Check, X, Loader2, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { getGeneralSettings, updateSystemSetting, GeneralSettings } from "@/lib/settings";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";

// Integration Settings Component
function IntegrationSettings() {
    const [deposited, setDeposited] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [saved, setSaved] = React.useState(false);

    const currentValue = useQuery(api.settings.getSettings, { key: "openrouter_deposited_amount" });
    const updateSetting = useMutation(api.settings.updateSettings);

    React.useEffect(() => {
        if (currentValue !== undefined && currentValue !== null) {
            setDeposited(String(currentValue));
        }
    }, [currentValue]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSetting({ key: "openrouter_deposited_amount", value: deposited });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error("Failed to save:", e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">🔗 Integration Settings</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-white">OpenRouter Deposited Amount</p>
                        <p className="text-xs text-gray-500">Total USD deposited in OpenRouter (for balance calculation)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">$</span>
                        <Input
                            type="number"
                            step="0.01"
                            value={deposited}
                            onChange={(e) => setDeposited(e.target.value)}
                            className="w-24 bg-[#111] border-white/10 text-white text-right"
                            placeholder="35"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSave}
                            disabled={saving}
                            className="h-9 border-white/10 hover:bg-white/5"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : saved ? (
                                <Check className="h-4 w-4 text-green-400" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                    Balance is calculated as: Deposited - API Usage. Update this when you add more credits.
                </p>
            </div>
        </section>
    );
}


export default function AdminSettingsPage() {
    const [settings, setSettings] = React.useState<GeneralSettings | null>(null);
    const [loadingSettings, setLoadingSettings] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Admin Users State
    const [loadingAdmins, setLoadingAdmins] = React.useState(true);

    // Add Admin Modal State
    const [showAddAdmin, setShowAddAdmin] = React.useState(false);
    const [newAdminEmail, setNewAdminEmail] = React.useState("");
    const [addAdminLoading, setAddAdminLoading] = React.useState(false);
    const [addAdminMessage, setAddAdminMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Convex data and actions
    const convex = useConvex();
    const adminsRaw = useQuery(api.admin.getAdmins);
    const updateAdminStatus = useMutation(api.profiles.updateAdminStatus);

    // Fetch initial settings
    const fetchSettings = React.useCallback(async () => {
        try {
            const data = await getGeneralSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoadingSettings(false);
        }
    }, []);

    React.useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    React.useEffect(() => {
        if (adminsRaw !== undefined) {
            setLoadingAdmins(false);
        }
    }, [adminsRaw]);

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

        try {
            // 1. Find user by email (using on-demand query)
            const user = await convex.query(api.profiles.getProfileByEmail, { email: newAdminEmail });

            if (!user) {
                setAddAdminMessage({ type: 'error', text: "User not found with that email." });
                return;
            }

            // 2. Update user to be admin
            await updateAdminStatus({ userId: user.userId, isAdmin: true });

            setAddAdminMessage({ type: 'success', text: "Admin added successfully!" });
            setNewAdminEmail("");

            // Close modal after delay
            setTimeout(() => {
                setShowAddAdmin(false);
                setAddAdminMessage(null);
            }, 1500);

        } catch (error: unknown) {
            const err = error as Error;
            console.error("Error adding admin:", err);
            setAddAdminMessage({ type: 'error', text: err.message || "Failed to add admin" });
        } finally {
            setAddAdminLoading(false);
        }
    };

    const formattedAdmins = adminsRaw?.map((user: Doc<"profiles">) => ({
        id: user._id,
        name: user.full_name || user.display_name || "Unknown",
        email: user.email,
        role: "Admin",
        added: user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : "Unknown"
    })) || [];

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
                            <p className="text-sm font-medium text-white">Basic Plan Monthly Limit</p>
                            <p className="text-xs text-gray-500">Number of optimizations for basic tier users</p>
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
                            aria-label={settings.maintenance_mode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
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

                    {/* Free Tier Settings */}
                    <div className="border-t border-zinc-800 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Free Tier Settings</h4>

                        {/* Enable Free Tier Toggle */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm text-white">Enable Free Tier</p>
                                <p className="text-xs text-gray-500">Allow non-paying users to use limited optimizations</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('free_tier_enabled')}
                                aria-label={settings?.free_tier_enabled ? "Disable Free Tier" : "Enable Free Tier"}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                                    settings?.free_tier_enabled ? "bg-[#09B7B4]" : "bg-zinc-700"
                                )}
                            >
                                <span className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all pointer-events-none",
                                    settings?.free_tier_enabled ? "left-7" : "left-1"
                                )} />
                            </button>
                        </div>

                        {/* Free Tier Weekly Limit */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm text-white">Weekly Limit</p>
                                <p className="text-xs text-gray-500">Optimizations per week for free users</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={settings?.free_tier_weekly_limit || 3}
                                    onChange={(e) => setSettings(s => s ? { ...s, free_tier_weekly_limit: parseInt(e.target.value) || 3 } : s)}
                                    className="w-20 h-8 text-center bg-zinc-800 border-zinc-700"
                                    min={1}
                                    max={10}
                                />
                                <Button
                                    size="sm"
                                    onClick={saveLimit}
                                    disabled={isSaving}
                                    className="h-8"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
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
                                aria-label={settings[flag.key as keyof GeneralSettings] ? `Disable ${flag.label}` : `Enable ${flag.label}`}
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

            {/* Integration Settings */}
            <IntegrationSettings />

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
                        formattedAdmins.map((admin: { id: string; name: string; email: string; role: string; added: string }) => (
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
                    {!loadingAdmins && formattedAdmins.length === 0 && (
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
                            aria-label="Close"
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
