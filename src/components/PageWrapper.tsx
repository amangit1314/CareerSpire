// Lightweight wrapper — no framer-motion import (saves ~40KB from every page).
// CSS transition handles the fade-in without JavaScript animation overhead.
export default function PageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            {children}
        </div>
    );
}
