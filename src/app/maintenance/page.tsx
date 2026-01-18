"use client";

import { Container } from "@/components/layout/Container";
import { Wrench, ShieldCheck } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-midnight flex items-center justify-center overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-electric-cyan/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-deep-purple/5 rounded-full blur-[120px]" />
            </div>

            <Container className="max-w-xl relative z-10 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-electric-cyan/20 blur-xl rounded-full animate-pulse" />
                        <div className="h-20 w-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm relative z-10">
                            <Wrench className="h-10 w-10 text-electric-cyan animate-[spin_10s_linear_infinite]" />
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                    System Maintenance
                </h1>

                <p className="text-lg text-white/60 mb-8 leading-relaxed">
                    We are currently performing critical system upgrades to ensure the highest level of security and performance.
                    <br className="hidden md:block" />
                    We will be back shortly.
                </p>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-center gap-3 col-span-1 md:col-span-2">
                    <ShieldCheck className="h-5 w-5 text-green-400" />
                    <div className="text-left">
                        <div className="text-sm font-medium text-white">Security Upgrade</div>
                        <div className="text-xs text-white/40">Ensuring data protection</div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
