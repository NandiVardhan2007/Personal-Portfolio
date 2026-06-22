import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
    className,
}: {
    eyebrow: string;
    title: ReactNode;
    description?: string;
    align?: 'left' | 'center';
    className?: string;
}) {
    return (
        <Reveal className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
            <div className={cn('flex items-center gap-4 mb-4', align === 'center' && 'justify-center')}>
                <span className="w-10 h-px bg-primary/30" />
                <span className="eyebrow">{eyebrow}</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
                {title}
            </h2>
            {description && (
                <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
                    {description}
                </p>
            )}
        </Reveal>
    );
}
