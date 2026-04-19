import Link from 'next/link';
import { dmSans, inter } from '@/lib/fonts';
import { Github, Twitter, Linkedin, ArrowRight, X, Instagram } from 'lucide-react';
import { CareerSpireLogo } from './CareerSpireLogo';

const footerLinks = [
    {
        title: 'Product',
        links: [
            { name: 'Mock Interview', href: '/mock/new' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Resources', href: '/resources' },
            { name: 'Practice', href: '/practice' },
            { name: 'Community', href: '/community' },
        ],
    },
    {
        title: 'Company',
        links: [
            { name: 'About', href: '/about' },
            { name: 'Privacy', href: '/privacy' },
            { name: 'Cookies', href: '/cookies' },
            { name: 'Changelog', href: '/changelog' },
            { name: 'Roadmap', href: '/roadmap' },
            { name: 'Press Kit', href: '/press-kit' },
            { name: 'Funding', href: '/funding' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { name: 'Privacy Policy', href: '/privacy-policy' },
            { name: 'Terms of Service', href: '/terms-of-service' },
            { name: 'Refund & Billing', href: '/refund-billing' },
            { name: 'Cancellation Policy', href: '/cancellation-policy' },
            { name: 'Cookie Policy', href: '/cookie-policy' },
            { name: 'License', href: '/license' },
        ],
    },
    {
        title: 'Support',
        links: [
            { name: 'Contact Us', href: 'mailto:support@CareerSpire.com' },
            { name: 'Help Center', href: '/faqs' },
            { name: 'Report Issue', href: '/report-issue' },
            { name: 'Give Feedback', href: '/feedback' },
            { name: 'Request a Feature', href: '/request-feature' },
        ],
    },
];

const socialLinks = [
    // { name: 'GitHub', icon: Github, href: 'https://github.com' },
    { name: 'X', icon: X, href: 'https://x.com' },
     { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    // { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
];

export function Footer() {
    return (
        <footer className="relative border-t glass py-10 sm:py-12 md:py-16 overflow-hidden w-full">
            <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6 relative z-10">
                {/* Logo and Brand Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-10 sm:gap-12 lg:gap-8 mb-10 sm:mb-14 lg:mb-16">
                    <div className="w-full lg:w-2/5">
                        <Link href="/" className="inline-flex items-center space-x-3 mb-4 sm:mb-6">
                            <CareerSpireLogo size="xl" />
                        </Link>
                        <p className={`${inter.className} text-sm sm:text-base lg:text-lg text-muted-foreground/80 leading-relaxed max-w-md`}>
                            The intersection of artificial intelligence and career success.
                            Join the elite circle of prepared engineers.
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    aria-label={social.name}
                                    className="p-2.5 sm:p-3 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <social.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    <span className="sr-only">{social.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="w-full lg:w-3/5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8 sm:gap-6 lg:gap-8">
                            {footerLinks.map((group) => (
                                <div key={group.title} className="space-y-4 sm:space-y-6 min-w-0">
                                    <h3 className={`${dmSans.className} text-xs sm:text-sm font-bold text-foreground uppercase tracking-[0.2em]`}>
                                        {group.title}
                                    </h3>
                                    <ul className="space-y-3 sm:space-y-4">
                                        {group.links.map((link) => (
                                            <li key={link.name}>
                                                <Link
                                                    href={link.href}
                                                    className="text-xs sm:text-sm text-muted-foreground/70 hover:text-primary transition-all flex flex-wrap justify-start items-center gap-y-1 group/link hover:translate-x-1 break-words"
                                                >
                                                    <ArrowRight className="h-4 w-4 mr-3 opacity-0 -ml-7 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all duration-300 hidden md:block flex-shrink-0" />
                                                    <span>{link.name}</span>
                                                    {('upcoming' in link && link.upcoming === true) && (
                                                        <span className="ml-2 rounded-full bg-primary/10 text-primary text-[0.625rem] px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                                                            Soon
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-6 sm:pt-8 lg:pt-10 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-6 text-center sm:text-left">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground/60">
                        &copy; {new Date().getFullYear()} CareerSpire. Crafted for excellence.
                    </p>
                    <div className="flex items-center text-xs sm:text-sm md:text-base">
                        <span className="flex items-center">
                            <span className='text-muted-foreground/60'>By</span>{' '}
                            <Link
                                href="https://next-level-portfolio.vercel.app/"
                                className={`ml-2 tracking-tight text-black dark:text-white hover:text-primary dark:hover:text-primary/80 transition-colors font-semibold ${dmSans.className}`}
                            >
                                Aman Soni
                            </Link>
                        </span>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-1/4 left-1/4 w-[12.5rem] md:w-[31.25rem] h-[12.5rem] md:h-[31.25rem] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[9.375rem] md:w-[18.75rem] h-[9.375rem] md:h-[18.75rem] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        </footer>
    );
}
