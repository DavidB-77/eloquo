import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background border-t py-12 md:py-24">
            <Container>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    {/* Logo Column */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-6">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">E</span>
                            </div>
                            <span className="text-2xl font-bold font-display tracking-tight text-foreground">Eloquo</span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs mb-6">
                            Empowering businesses to master AI communication through expert prompt optimization and cost analysis.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</Link></li>
                            <li><Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Sales</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Docs</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Prompt Guides</Link></li>
                            <li><Link href="#faq" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Eloquo. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-xs text-muted-foreground">
                        <Link href="mailto:hello@eloquo.io" className="hover:text-primary transition-colors">hello@eloquo.io</Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
