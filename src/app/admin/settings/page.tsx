"use client";

import * as React from "react";
import { Save, RefreshCw, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

// Mock data
const MOCK_SETTINGS = {
    freePlanLimit: 10,
    maintenanceMode: false,
    featureFlags: {
        teamPlan: true,
        mcpAccess: true,
        newSignups: true,
        changelogPopup: false,
    },
    integrations: {
        n8nUrl: "https://n8n.eloquo.io/webhook/optimize",
        lemonSqueezyWebhook: "https://eloquo.io/api/webhooks/lemonsqueezy",
        mercuryConnected: true,
        openRouterConnected: true,
    },
    email: {
        fromAddress: "hello@eloquo.io",
        replyTo: "support@eloquo.io",
    },
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = React.useState(MOCK_SETTINGS);
    const [isSaving, setIsSaving] = React.useState(false);

    // Admin Users State
    const [adminUsers, setAdminUsers] = React.useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = React.useState(true);

    React.useEffect(() => {
        const fetchAdmins = async () => {
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
                        role: "Admin", // For now just generic 'Admin'
                        added: user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : "Unknown"
                    })));
                }
            } catch (err) {
                console.error("Error fetching admin users:", err);
            } finally {
                setLoadingAdmins(false);
            }
        };

        fetchAdmins();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    const toggleFeature = (key: keyof typeof settings.featureFlags) => {
        setSettings({
            ...settings,
            featureFlags: {
                ...settings.featureFlags,
                [key]: !settings.featureFlags[key],
            },
        });
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Platform Settings */}
            <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">⚙️ Platform Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Free Plan Monthly Limit</p>
                            <p className="text-xs text-gray-500">Number of optimizations for free users</p>
                        </div>
                        <Input
                            type="number"
                            value={settings.freePlanLimit}
                            onChange={(e) => setSettings({ ...settings, freePlanLimit: parseInt(e.target.value) })}
                            className="w-24 bg-[#111] border-white/10 text-white text-right"
                        />
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-white/5">
                        <div>
                            <p className="text-sm font-medium text-white">Maintenance Mode</p>
                            <p className="text-xs text-gray-500">Shows a maintenance banner site-wide</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                            className={cn(
                                "w-12 h-6 rounded-full transition-colors relative",
                                "transition-all duration-300",
                                settings.maintenanceMode ? "bg-[#09B7B4]" : "bg-gray-600"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    settings.maintenanceMode ? "left-7" : "left-1"
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
                        { key: "teamPlan", label: "Enable Team Plan Features" },
                        { key: "mcpAccess", label: "Enable API/MCP Access" },
                        { key: "newSignups", label: "Allow New User Signups" },
                        { key: "changelogPopup", label: "Show Changelog Popup" },
                    ].map((flag) => (
                        <div
                            key={flag.key}
                            className="flex items-center justify-between py-2"
                        >
                            <p className="text-sm text-white">{flag.label}</p>
                            <button
                                onClick={() => toggleFeature(flag.key as keyof typeof settings.featureFlags)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    settings.featureFlags[flag.key as keyof typeof settings.featureFlags]
                                        ? "bg-[#09B7B4]"
                                        : "bg-gray-600"
                                )}
                            >
                                <div
                                    className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                        settings.featureFlags[flag.key as keyof typeof settings.featureFlags]
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
            <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">🔗 Integration Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">n8n Webhook URL</label>
                        <div className="flex gap-2">
                            <Input
                                value={settings.integrations.n8nUrl}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        integrations: { ...settings.integrations, n8nUrl: e.target.value },
                                    })
                                }
                                className="flex-1 bg-[#111] border-white/10 text-white font-mono text-sm"
                            />
                            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                                Test
                            </Button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Lemon Squeezy Webhook URL</label>
                        <Input
                            value={settings.integrations.lemonSqueezyWebhook}
                            readOnly
                            className="bg-[#111] border-white/10 text-gray-500 font-mono text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", settings.integrations.mercuryConnected ? "bg-green-500" : "bg-red-500")} />
                            <span className="text-sm text-gray-400">Mercury API</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", settings.integrations.openRouterConnected ? "bg-green-500" : "bg-red-500")} />
                            <span className="text-sm text-gray-400">OpenRouter API</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Admin Users */}
            <section className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">👤 Admin Users</h2>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
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

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} isLoading={isSaving} className="bg-[#09B7B4] hover:bg-[#08a5a3] text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
