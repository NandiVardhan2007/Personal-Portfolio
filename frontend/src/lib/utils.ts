import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(input: string): string {
    if (!input) return '';
    const date = new Date(input);
    if (isNaN(date.getTime())) return input;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
