import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

// Moved from lib/pricing.ts — pure formatter, no dependency on Plan/pricing
// types, but was reused in 5 unrelated files that had no reason to import
// the pricing module just for this.
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
