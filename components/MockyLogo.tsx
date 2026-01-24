import { cn } from '@/lib/utils';
import { dmSans } from '@/lib/fonts';

interface MockyLogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
}

export function MockyLogo({ className, size = 'md', showText = true }: MockyLogoProps) {
    const sizes = {
        sm: { icon: 'w-6 h-6 text-xs', text: 'text-lg' },
        md: { icon: 'w-8 h-8 text-sm', text: 'text-2xl' },
        lg: { icon: 'w-10 h-10 text-base', text: 'text-3xl' },
        xl: { icon: 'w-12 h-12 text-lg', text: 'text-4xl' },
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Logo Icon - Letter M with modern design */}
            <div className={cn(
                "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 font-bold text-white shadow-lg shadow-primary/30",
                sizes[size].icon
            )}>
                <span className={cn("font-black", dmSans.className)}>M</span>
                {/* <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" /> */}
            </div>

            {/* Text */}
            {showText && (
                <span className={cn(
                    "font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent",
                    sizes[size].text,
                    dmSans.className
                )}>
                    Mocky
                </span>
            )}
        </div>
    );
}
