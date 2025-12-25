"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "bg-background/80 py-3 backdrop-blur-lg shadow-sm border-b"
                    : "bg-transparent py-5"
            )}
        >
            <Container>
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">E</span>
                        </div>
                        <span className="text-xl font-bold font-display tracking-tight">Eloquo</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-3 ml-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button size="sm" asChild className="shadow-lg">
                                <Link href="/signup">Get Started</Link>
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
