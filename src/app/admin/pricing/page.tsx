"use client";

import * as React from "react";
import {
    getPricingConfig,
    getFoundingMemberConfig,
    getAnnualDiscountConfig,
    updateSystemSetting,
    PricingConfig,
    FoundingMemberConfig,
    AnnualDiscountConfig
} from "@/lib/settings";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input"; // Assuming these exist, otherwise use html input
import { Badge } from "@/components/ui/Badge";
import { Loader2, Save } from "lucide-react";

export default function AdminPricingPage() {
    // const { toast } = useToast(); 
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    const [pricing, setPricing] = React.useState<PricingConfig | null>(null);
    const [founding, setFounding] = React.useState<FoundingMemberConfig | null>(null);
    const [annual, setAnnual] = React.useState<AnnualDiscountConfig | null>(null);

    React.useEffect(() => {
        async function load() {
            try {
                const [p, f, a] = await Promise.all([
                    getPricingConfig(),
                    getFoundingMemberConfig(),
                    getAnnualDiscountConfig()
                ]);
                setPricing(p);
                setFounding(f);
                setAnnual(a);
            } catch (e) {
                console.error("Failed to load settings", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleSavePricing = async () => {
        if (!pricing) return;
        setSaving(true);
        try {
            await updateSystemSetting('pricing_tiers', pricing);
            alert("Pricing tiers saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save pricing");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveFounding = async () => {
        if (!founding) return;
        setSaving(true);
        try {
            await updateSystemSetting('founding_member', founding);
            alert("Founding member settings saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save founding settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAnnual = async () => {
        if (!annual) return;
        setSaving(true);
        try {
            await updateSystemSetting('annual_discount', annual);
            alert("Annual settings saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save annual settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !pricing || !founding || !annual) {
        return <div className="p-8 text-white">Loading configuration...</div>;
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto text-white">
            <h1 className="text-3xl font-display uppercase tracking-widest mb-8">Pricing Configuration</h1>

            {/* SECTION 1: PRICING TIERS */}
            <Card className="bg-midnight border-electric-cyan/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-electric-cyan uppercase tracking-widest">💰 Pricing Tiers</CardTitle>
                    <Button onClick={handleSavePricing} disabled={saving} className="bg-electric-cyan text-midnight hover:bg-electric-cyan/80">
                        {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Tiers
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(Object.keys(pricing) as Array<keyof PricingConfig>).map((tierKey) => (
                        <div key={tierKey} className="p-4 border border-white/10 rounded-xl bg-white/5">
                            <h3 className="text-lg font-bold uppercase mb-4 text-white/80 border-b border-white/10 pb-2">{tierKey}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs uppercase text-white/40 font-bold block mb-1">Monthly ($)</label>
                                    <input
                                        type="number"
                                        value={pricing[tierKey].monthly_price}
                                        onChange={e => setPricing({ ...pricing, [tierKey]: { ...pricing[tierKey], monthly_price: Number(e.target.value) } })}
                                        className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-white/40 font-bold block mb-1">Annual ($)</label>
                                    <input
                                        type="number"
                                        value={pricing[tierKey].annual_price}
                                        onChange={e => setPricing({ ...pricing, [tierKey]: { ...pricing[tierKey], annual_price: Number(e.target.value) } })}
                                        className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-white/40 font-bold block mb-1">Optimizations</label>
                                    <input
                                        type="number"
                                        value={pricing[tierKey].optimizations}
                                        onChange={e => setPricing({ ...pricing, [tierKey]: { ...pricing[tierKey], optimizations: Number(e.target.value) } })}
                                        className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-white/40 font-bold block mb-1">History Days (0=Unl)</label>
                                    <input
                                        type="number"
                                        value={pricing[tierKey].history_days}
                                        onChange={e => setPricing({ ...pricing, [tierKey]: { ...pricing[tierKey], history_days: Number(e.target.value) } })}
                                        className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={pricing[tierKey].api_access}
                                            onChange={e => setPricing({ ...pricing, [tierKey]: { ...pricing[tierKey], api_access: e.target.checked } })}
                                            className="form-checkbox bg-black/50 border-white/20 rounded text-electric-cyan"
                                        />
                                        <span className="text-sm font-bold text-white/80">API Access</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* SECTION 2: FOUNDING MEMBER */}
            <Card className="bg-midnight border-electric-cyan/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-neon-orange uppercase tracking-widest">🚀 Founding Member Program</CardTitle>
                    <Button onClick={handleSaveFounding} disabled={saving} className="bg-neon-orange text-midnight hover:bg-neon-orange/80">
                        {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Program
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <label className="flex items-center space-x-2 cursor-pointer bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <input
                                type="checkbox"
                                checked={founding.enabled}
                                onChange={e => setFounding({ ...founding, enabled: e.target.checked })}
                                className="form-checkbox bg-black/50 border-white/20 rounded text-neon-orange"
                            />
                            <span className="font-bold">Enable Program</span>
                        </label>
                        <div className="flex items-center space-x-2">
                            <span className="text-white/40 text-sm font-mono">Current Count:</span>
                            <input
                                type="number"
                                value={founding.current_count}
                                onChange={e => setFounding({ ...founding, current_count: Number(e.target.value) })}
                                className="w-24 bg-black/50 border border-white/20 rounded-md px-2 py-1 text-sm text-center font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase text-white/60">Wave Configuration</h3>
                        {founding.waves.map((wave, idx) => (
                            <div key={wave.wave} className="flex items-center space-x-4 p-3 border border-white/10 rounded-lg bg-white/[0.02]">
                                <div className="w-20 font-bold text-neon-orange">Wave {wave.wave}</div>
                                <div>
                                    <label className="text-[10px] uppercase text-white/40 block">Spots</label>
                                    <input
                                        type="number"
                                        value={wave.spots}
                                        onChange={e => {
                                            const newWaves = [...founding.waves];
                                            newWaves[idx].spots = Number(e.target.value);
                                            setFounding({ ...founding, waves: newWaves });
                                        }}
                                        className="w-20 bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase text-white/40 block">Pro Price ($)</label>
                                    <input
                                        type="number"
                                        value={wave.pro_price}
                                        onChange={e => {
                                            const newWaves = [...founding.waves];
                                            newWaves[idx].pro_price = Number(e.target.value);
                                            setFounding({ ...founding, waves: newWaves });
                                        }}
                                        className="w-20 bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase text-white/40 block">Biz Price ($)</label>
                                    <input
                                        type="number"
                                        value={wave.business_price}
                                        onChange={e => {
                                            const newWaves = [...founding.waves];
                                            newWaves[idx].business_price = Number(e.target.value);
                                            setFounding({ ...founding, waves: newWaves });
                                        }}
                                        className="w-20 bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Popup Settings Separator */}
                    <div className="border-t border-white/10 pt-6 mt-6">
                        <h3 className="text-sm font-bold uppercase text-white/60 mb-4">Popup Settings</h3>
                        <div className="space-y-4">
                            {/* Enable & Frequency */}
                            <div className="flex items-center gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={founding.popup_settings.enabled}
                                        onChange={e => setFounding({ ...founding, popup_settings: { ...founding.popup_settings, enabled: e.target.checked } })}
                                        className="form-checkbox bg-black/50 border-white/20 rounded text-neon-orange"
                                    />
                                    <span className="text-sm font-bold">Enable Popup</span>
                                </label>
                                <div>
                                    <select
                                        value={founding.popup_settings.show_frequency}
                                        onChange={e => setFounding({ ...founding, popup_settings: { ...founding.popup_settings, show_frequency: e.target.value as any } })}
                                        className="bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
                                    >
                                        <option value="session">Once per session</option>
                                        <option value="once">Once ever per user</option>
                                    </select>
                                </div>
                            </div>

                            {/* Triggers */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Delay (seconds)</label>
                                    <input
                                        type="number"
                                        value={founding.popup_settings.delay}
                                        onChange={e => setFounding({ ...founding, popup_settings: { ...founding.popup_settings, delay: Number(e.target.value) } })}
                                        className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center space-x-2 text-xs text-white/40 mb-1">
                                        <input
                                            type="checkbox"
                                            checked={founding.popup_settings.trigger_on_scroll.enabled}
                                            onChange={e => setFounding({ ...founding, popup_settings: { ...founding.popup_settings, trigger_on_scroll: { ...founding.popup_settings.trigger_on_scroll, enabled: e.target.checked } } })}
                                            className="form-checkbox bg-black/50 border-white/20 rounded"
                                        />
                                        <span>Trigger on Scroll (%)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={founding.popup_settings.trigger_on_scroll.percentage}
                                        onChange={e => setFounding({ ...founding, popup_settings: { ...founding.popup_settings, trigger_on_scroll: { ...founding.popup_settings.trigger_on_scroll, percentage: Number(e.target.value) } } })}
                                        disabled={!founding.popup_settings.trigger_on_scroll.enabled}
                                        className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-sm disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Headline</label>
                                    <input
                                        type="text"
                                        value={founding.popup_settings.headline}
                                        onChange={e => setFounding({ ...founding, popup_settings: { ...founding.popup_settings, headline: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Description</label>
                                    <textarea
                                        value={founding.popup_settings.description}
                                        onChange={e => setFounding({ ...founding, popup_settings: { ...founding.popup_settings, description: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-sm min-h-[80px]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Button Text</label>
                                    <input
                                        type="text"
                                        value={founding.popup_settings.button_text}
                                        onChange={e => setFounding({ ...founding, popup_settings: { ...founding.popup_settings, button_text: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 3: ANNUAL SETTINGS */}
            <Card className="bg-midnight border-electric-cyan/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white uppercase tracking-widest">📅 Annual Billing</CardTitle>
                    <Button onClick={handleSaveAnnual} disabled={saving} className="bg-white/10 text-white hover:bg-white/20">
                        {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Settings
                    </Button>
                </CardHeader>
                <CardContent className="flex items-center space-x-8">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={annual.enabled}
                            onChange={e => setAnnual({ ...annual, enabled: e.target.checked })}
                            className="form-checkbox bg-black/50 border-white/20 rounded text-electric-cyan"
                        />
                        <span className="bg-transparent text-sm font-bold">Enable Annual Discount</span>
                    </label>

                    <div className="flex items-center space-x-3">
                        <label className="text-sm text-white/60">Discount Percentage (%):</label>
                        <input
                            type="number"
                            value={annual.percent}
                            onChange={e => setAnnual({ ...annual, percent: Number(e.target.value) })}
                            className="w-20 bg-black/50 border border-white/20 rounded px-3 py-2 text-sm font-bold text-center"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
