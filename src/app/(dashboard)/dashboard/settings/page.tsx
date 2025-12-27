"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { FormField } from "@/components/forms/FormField";
import { ApiKeyManager } from "@/components/settings/ApiKeyManager";
import { UsageBar } from "@/components/dashboard/UsageBar";
import { User, CreditCard, Key, Shield, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

// Mock data - replace with actual API calls
const MOCK_USAGE = {
    tier: "free" as const,
    optimizationsUsed: 4,
    optimizationsLimit: 10,
    premiumCreditsUsed: 0,
    premiumCreditsLimit: 0,
    hasMcpAccess: false,
};

const MOCK_API_KEYS = [
    {
        id: "1",
        key_prefix: "elk_pro_a1b2c3...",
        name: "Cursor IDE",
        last_used_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        revoked_at: null,
    },
];

const PLAN_DETAILS = {
    free: { name: "Free", price: "$0/mo", color: "bg-muted text-muted-foreground" },
    pro: { name: "Pro", price: "$29/mo", color: "bg-primary text-primary-foreground" },
    team: { name: "Team", price: "$99/mo", color: "bg-accent text-accent-foreground" },
    enterprise: { name: "Enterprise", price: "$249/mo", color: "bg-gradient-to-r from-primary to-accent text-white" },
};

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "security", label: "Security", icon: Shield },
];

function SettingsContent() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") || "profile";
    const [activeTab, setActiveTab] = React.useState(initialTab);
    const { user } = useAuth();

    // Form state
    const [fullName, setFullName] = React.useState(user?.user_metadata?.full_name || "");
    const [isSaving, setIsSaving] = React.useState(false);

    const usage = MOCK_USAGE;
    const plan = PLAN_DETAILS[usage.tier];

    const handleSaveProfile = async () => {
        setIsSaving(true);
        // TODO: Call API to update profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    const handleGenerateKey = async (name: string) => {
        // TODO: Call API to generate key
        await new Promise(resolve => setTimeout(resolve, 500));
        return { key: `elk_pro_${Math.random().toString(36).substring(2, 34)}`, id: Date.now().toString() };
    };

    const handleRevokeKey = async (id: string) => {
        // TODO: Call API to revoke key
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold font-display tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account, subscription, and preferences.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b">
                <nav className="flex space-x-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 pb-3 border-b-2 transition-colors ${activeTab === tab.id
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Email" description="Your email cannot be changed.">
                                <Input value={user?.email || ""} disabled />
                            </FormField>

                            <FormField label="Full Name">
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </FormField>

                            <div className="pt-4">
                                <Button onClick={handleSaveProfile} isLoading={isSaving}>
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
                <div className="space-y-6">
                    {/* Current Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-xl">
                                <div className="flex items-center space-x-4">
                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${plan.color}`}>
                                        {plan.name}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{plan.price}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {usage.tier === "free" ? "Free forever" : "Billed monthly"}
                                        </p>
                                    </div>
                                </div>
                                {usage.tier === "free" && (
                                    <Button>Upgrade to Pro</Button>
                                )}
                                {usage.tier !== "free" && (
                                    <Button variant="outline">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Manage Subscription
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage This Month</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <UsageBar
                                    used={usage.optimizationsUsed}
                                    limit={usage.optimizationsLimit}
                                    label="Optimizations"
                                    showNumbers
                                />
                            </div>
                            {usage.premiumCreditsLimit > 0 && (
                                <div>
                                    <UsageBar
                                        used={usage.premiumCreditsUsed}
                                        limit={usage.premiumCreditsLimit}
                                        label="Premium Credits"
                                        showNumbers
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-bold">{usage.optimizationsUsed}</p>
                                    <p className="text-sm text-muted-foreground">Optimizations used</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-bold">{usage.premiumCreditsUsed}</p>
                                    <p className="text-sm text-muted-foreground">Premium credits used</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Plan Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Compare Plans</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(["free", "pro", "team"] as const).map((tier) => {
                                    const tierPlan = PLAN_DETAILS[tier];
                                    const isCurrentPlan = usage.tier === tier;
                                    return (
                                        <div
                                            key={tier}
                                            className={`p-4 border rounded-xl ${isCurrentPlan ? "border-primary bg-primary/5" : ""}`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-bold">{tierPlan.name}</span>
                                                {isCurrentPlan && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
                                            </div>
                                            <p className="text-2xl font-bold mb-4">{tierPlan.price}</p>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center">
                                                    <Check className="h-4 w-4 text-success mr-2" />
                                                    {tier === "free" ? "10" : tier === "pro" ? "1,000" : "5,000"} optimizations
                                                </li>
                                                <li className="flex items-center">
                                                    <Check className="h-4 w-4 text-success mr-2" />
                                                    {tier === "free" ? "No" : tier === "pro" ? "100" : "500"} premium credits
                                                </li>
                                                <li className="flex items-center">
                                                    <Check className={`h-4 w-4 mr-2 ${tier === "free" ? "text-muted" : "text-success"}`} />
                                                    MCP/IDE integration
                                                </li>
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* API Keys Tab */}
            {activeTab === "api-keys" && (
                <ApiKeyManager
                    apiKeys={usage.hasMcpAccess ? MOCK_API_KEYS : []}
                    onGenerate={handleGenerateKey}
                    onRevoke={handleRevokeKey}
                    hasMcpAccess={usage.hasMcpAccess}
                />
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Current Password">
                                <Input type="password" placeholder="••••••••" />
                            </FormField>
                            <FormField label="New Password">
                                <Input type="password" placeholder="••••••••" />
                            </FormField>
                            <FormField label="Confirm New Password">
                                <Input type="password" placeholder="••••••••" />
                            </FormField>
                            <div className="pt-4">
                                <Button>Update Password</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Irreversible account actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                                <div>
                                    <p className="font-medium">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all data.
                                    </p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function SettingsPage() {
    return (
        <React.Suspense fallback={<div className="p-8 flex justify-center">Loading settings...</div>}>
            <SettingsContent />
        </React.Suspense>
    );
}
