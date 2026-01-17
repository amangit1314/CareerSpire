import Link from 'next/link';
import { dmSans, inter } from '@/lib/fonts';
import { Github, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { MockyLogo } from './MockyLogo';

const footerLinks = [
    {
        title: 'Product',
        links: [
            { name: 'Features', href: '#features' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'AI Feedback', href: '#' },
            { name: 'Resources', href: '#' },
        ],
    },
    {
        title: 'Company',
        links: [
            { name: 'About', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Blog', href: '#' },
            { name: 'Privacy', href: '#' },
        ],
    },
    {
        title: 'Support',
        links: [
            { name: 'Help Center', href: '#' },
            { name: 'Contact Us', href: 'mailto:support@Mocky.com' },
            { name: 'Terms of Service', href: '#' },
            { name: 'Status', href: '#' },
        ],
    },
];

const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
];

export function Footer() {
    return (
        <footer className="relative border-t glass py-12 md:py-24 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-flex items-center space-x-2 group">
                            <MockyLogo size="lg" />
                        </Link>
                        <p className={`${inter.className} max-w-sm text-base text-muted-foreground/80 leading-relaxed`}>
                            The intersection of artificial intelligence and career success.
                            Join the elite circle of prepared engineers.
                        </p>
                        <div className="flex items-center space-x-5 pt-2">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <social.icon className="h-5 w-5" />
                                    <span className="sr-only">{social.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {footerLinks.map((group) => (
                        <div key={group.title} className="col-span-1 space-y-6">
                            <h3 className={`${dmSans.className} text-xs font-bold text-foreground uppercase tracking-[0.2em]`}>
                                {group.title}
                            </h3>
                            <ul className="space-y-4">
                                {group.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-muted-foreground/70 hover:text-primary transition-all flex items-center group/link"
                                        >
                                            <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all duration-300" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-20 pt-10 border-t border-border/50 flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0 text-muted-foreground/60">
                    <p className="text-sm font-medium">
                        &copy; {new Date().getFullYear()} Mocky. Crafted for excellence.
                    </p>
                    <div className="flex items-center space-x-8 text-sm">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
