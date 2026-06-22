import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const base =
    'inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 px-6 py-3 rounded-full disabled:opacity-50';

const variants = {
    primary: 'bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-glass',
    outline: 'border border-border text-foreground hover:bg-secondary',
    ghost: 'text-muted-foreground hover:text-foreground',
};

export function Button({
    children,
    className,
    variant = 'primary',
    ...props
}: { children: ReactNode; variant?: keyof typeof variants; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button className={cn(base, variants[variant], className)} {...props}>
            {children}
        </button>
    );
}

export function LinkButton({
    children,
    className,
    variant = 'primary',
    ...props
}: { children: ReactNode; variant?: keyof typeof variants; className?: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
        <a className={cn(base, variants[variant], className)} {...props}>
            {children}
        </a>
    );
}
