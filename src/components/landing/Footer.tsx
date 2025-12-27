"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Twitter, Linkedin, Github, Zap } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-24 border-t border-electric-cyan/10 bg-transparent relative overflow-hidden">
            <Container>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    {/* Logo Column */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 mb-8 group -ml-2">
                            <span className="text-3xl font-display font-medium tracking-widest text-white uppercase glow-sm" style={{ fontFamily: 'Comodo', letterSpacing: '0.05em' }}>Eloquo</span>
                        </Link>
                        <p className="text-white/60 text-sm max-w-xs mb-8 font-medium leading-relaxed">
                            Empowering elite operators to master neuro-optimization through expert prompt protocols and cost-efficient scaling.
                        </p>
                        <div className="flex space-x-6">
                            <Link href="#" className="text-white/40 hover:text-electric-cyan transition-colors"><Twitter className="h-5 w-5" /></Link>
                            <Link href="#" className="text-white/40 hover:text-electric-cyan transition-colors"><Linkedin className="h-5 w-5" /></Link>
                            <Link href="#" className="text-white/40 hover:text-electric-cyan transition-colors"><Github className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-display text-[10px] uppercase tracking-[0.3em] text-white mb-8">Protocol</h4>
                        <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest">
                            <li><Link href="#features" className="text-white/60 hover:text-white transition-colors">Modules</Link></li>
                            <li><Link href="#how-it-works" className="text-white/60 hover:text-white transition-colors">Sequence</Link></li>
                            <li><Link href="#pricing" className="text-white/60 hover:text-white transition-colors">Credits</Link></li>
                            <li><Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">Terminal</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-display text-[10px] uppercase tracking-[0.3em] text-white mb-8">Intel</h4>
                        <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest">
                            <li><Link href="#faq" className="text-white/60 hover:text-white transition-colors">Support (FAQ)</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-electric-cyan/10 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                        © 2025 ELOQUO NEURAL SYSTEMS. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex space-x-8 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                        <Link href="mailto:hello@eloquo.io" className="hover:text-electric-cyan transition-colors">LINK_STABLIZED: hello@eloquo.io</Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
