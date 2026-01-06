"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { WaitlistModal } from "./WaitlistModal";

const NAV_LINKS = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
];

// Beta mode check - set to true to show waitlist instead of signup
const BETA_MODE = process.env.NEXT_PUBLIC_BETA_MODE === "true";

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showWaitlist, setShowWaitlist] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const checkUser = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setIsLoading(false);
        };

        checkUser();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleCTAClick = () => {
        if (BETA_MODE) {
            setShowWaitlist(true);
        }
    };

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 z-50 w-full transition-all duration-500",
                    scrolled
                        ? "py-3 border-b border-white/10 bg-black/[0.38] backdrop-blur-md"
                        : "bg-transparent py-6"
                )}
            >
                <Container>
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-3 group -ml-2">
                            <span className="text-3xl font-display font-medium tracking-widest text-white glow-sm group-hover:glow-md transition-all uppercase" style={{ fontFamily: 'Comodo', letterSpacing: '0.05em' }}>ELOQUO</span>
                            {BETA_MODE && (
                                <Badge className="bg-sunset-orange/20 text-sunset-orange border border-sunset-orange/40 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                                    BETA
                                </Badge>
                            )}
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
                                {!isLoading && (
                                    <>
                                        {isLoggedIn ? (
                                            <Button size="sm" asChild className="btn-gradient px-6 rounded-lg text-xs font-bold uppercase tracking-widest glow-sm hover:glow-md">
                                                <Link href="/dashboard">Dashboard</Link>
                                            </Button>
                                        ) : BETA_MODE ? (
                                            <Button
                                                size="sm"
                                                className="btn-gradient px-6 rounded-lg text-xs font-bold uppercase tracking-widest glow-sm hover:glow-md"
                                                onClick={handleCTAClick}
                                            >
                                                Get Early Access
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="ghost" size="sm" asChild className="text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 hover:text-neon-magenta transition-all">
                                                    <Link href="/login">Sign In</Link>
                                                </Button>
                                                <Button size="sm" asChild className="btn-gradient px-6 rounded-lg text-xs font-bold uppercase tracking-widest glow-sm hover:glow-md">
                                                    <Link href="/signup">Get Started</Link>
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            aria-label="Toggle menu" className="md:hidden p-2 text-muted-foreground"
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
                                {isLoggedIn ? (
                                    <Button asChild onClick={() => setIsOpen(false)}>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </Button>
                                ) : BETA_MODE ? (
                                    <Button onClick={() => { setIsOpen(false); setShowWaitlist(true); }}>
                                        Get Early Access
                                    </Button>
                                ) : (
                                    <>
                                        <Link href="/login" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Sign In</Link>
                                        <Button asChild onClick={() => setIsOpen(false)}>
                                            <Link href="/signup">Get Started</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </Container>
            </nav>

            {/* Waitlist Modal */}
            <WaitlistModal
                isOpen={showWaitlist}
                onClose={() => setShowWaitlist(false)}
            />
        </>
    );
}
