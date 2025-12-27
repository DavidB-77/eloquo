"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-500",
                scrolled
                    ? "glass py-3 rounded-none border-b border-electric-cyan/20 bg-midnight/80"
                    : "bg-transparent py-6"
            )}
        >
            <Container>
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="h-10 w-10 rounded-xl btn-gradient flex items-center justify-center shadow-[0_0_15px_rgba(9,183,180,0.3)] group-hover:shadow-[0_0_25px_rgba(9,183,180,0.5)] transition-all">
                            <Zap className="h-6 w-6 text-white fill-current" />
                        </div>
                        <span className="text-2xl font-display tracking-widest text-white glow-sm group-hover:glow-md transition-all uppercase">ELOQUO</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-xs font-bold text-white/60 hover:text-white hover:text-shadow-neon transition-all uppercase tracking-widest"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-4 ml-6">
                            <Button variant="ghost" size="sm" asChild className="text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 hover:text-neon-magenta transition-all">
                                <Link href="/login">Access Hub</Link>
                            </Button>
                            <Button size="sm" asChild className="btn-gradient px-6 rounded-lg text-xs font-bold uppercase tracking-widest glow-sm hover:glow-md">
                                <Link href="/signup">Initialize</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-muted-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {isOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-background border-b animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col space-y-4 p-6">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <hr />
                            <Link href="/login" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Login</Link>
                            <Button asChild onClick={() => setIsOpen(false)}>
                                <Link href="/signup">Get Started</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </Container>
        </nav>
    );
}
