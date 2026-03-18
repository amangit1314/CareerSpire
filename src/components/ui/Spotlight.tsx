'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightProps {
    className?: string;
    fill?: string;
}

export const Spotlight = ({ className, fill }: SpotlightProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    const handleMouseEnter = useCallback(() => setOpacity(1), []);
    const handleMouseLeave = useCallback(() => setOpacity(0), []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        window.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "pointer-events-none absolute -inset-px z-30 transition duration-300",
                className
            )}
            style={{
                background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${fill || 'rgba(var(--primary), 0.15)'}, transparent 80%)`,
                opacity,
            }}
        />
    );
};
