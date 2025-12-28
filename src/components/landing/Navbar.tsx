"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

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

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-500",
                scrolled
                    ? "py-3 border-b border-white/10 bg-black/70 backdrop-blur-md"
                    : "bg-transparent py-6"
            )}
        >
            <Container>
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group -ml-2">
                        <span className="text-3xl font-display font-medium tracking-widest text-white glow-sm group-hover:glow-md transition-all uppercase" style={{ fontFamily: 'Comodo', letterSpacing: '0.05em' }}>ELOQUO</span>
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
                                    ) : (
                                        <>
                                            <Button variant="ghost" size="sm" asChild className="text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 hover:text-neon-magenta transition-all">
                                                <Link href="/login">Sign In</Link>
                                            </Button>
                                            <Button size="sm" asChild className="btn-gradient px-6 rounded-lg text-xs font-bold uppercase tracking-widest glow-sm hover:glow-md">
                                                <Link href="/signup">Initialize</Link>
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
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
                            {isLoggedIn ? (
                                <Button asChild onClick={() => setIsOpen(false)}>
                                    <Link href="/dashboard">Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Link href="/login" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Sign In</Link>
                                    <Button asChild onClick={() => setIsOpen(false)}>
                                        <Link href="/signup">Initialize</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Container>
        </nav>
    );
}
