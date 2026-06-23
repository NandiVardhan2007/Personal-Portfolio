'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useMotionTemplate,
} from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { portfolioData } from '@/data/portfolio';
import { Project } from '@/types';
import { usePerformance } from '@/hooks/usePerformance';

function ProjectListRow({
    project,
    index,
    isLowPowerMode,
}: {
    project: Project;
    index: number;
    isLowPowerMode?: boolean;
}) {
    const router = useRouter();
    const itemRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
    const rafRef = useRef<number | null>(null);

    const isOngoing = project.status === 'ongoing';
    const displayIndex = String(index + 1).padStart(2, '0');
    const techText = project.techStack.join(' • ');
    const statusColor = isOngoing ? 'text-emerald-500 dark:text-emerald-400' : 'text-blue-500 dark:text-blue-400';

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!itemRef.current) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const rect = itemRef.current.getBoundingClientRect();
        rafRef.current = requestAnimationFrame(() => {
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        });
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
        }
        setIsHovered(true);
    };

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const bgGradient = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, hsl(var(--foreground) / 0.04), transparent 40%)`;

    return (
        <Link href={`/projects/${project.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
            <motion.div
                ref={itemRef}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
            >
            <motion.div
                className={cn(
                    'relative cursor-pointer overflow-hidden rounded-2xl border-b border-border transition-colors duration-300',
                    isHovered && 'bg-foreground/[0.025]'
                )}
            >
                {!isLowPowerMode && (
                    <motion.div
                        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 hidden sm:block"
                        style={{ opacity: isHovered ? 1 : 0, background: bgGradient }}
                    />
                )}

                <div className="relative z-10 flex items-center gap-3 sm:gap-6 md:gap-8 py-5 sm:py-8 md:py-10 px-3 sm:px-6 md:px-8">
                    <motion.span
                        className={cn(
                            'shrink-0 text-xl sm:text-3xl md:text-5xl font-black tabular-nums transition-colors duration-500',
                            isHovered ? statusColor : 'text-muted-foreground/20'
                        )}
                        animate={{ scale: isHovered ? 1.08 : 1, x: isHovered ? 4 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {displayIndex}
                    </motion.span>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                            <motion.h3
                                className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate max-w-full"
                                animate={{ x: isHovered ? 6 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {project.title}
                            </motion.h3>
                            <span
                                className={cn(
                                    'shrink-0 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider',
                                    isOngoing
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-500/20'
                                        : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 dark:border-blue-500/20'
                                )}
                            >
                                {isOngoing ? 'ongoing' : 'done'}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm md:text-base line-clamp-1 sm:line-clamp-2 max-w-2xl">
                            {project.description}
                        </p>
                    </div>

                    {/* Always-visible thumbnail — present at every breakpoint so the row
                        never looks bare on mobile/tablet where hover effects don't apply. */}
                    <motion.div
                        className="shrink-0 relative w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border border-border"
                        animate={{ scale: isHovered ? 1.04 : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Image
                            src={project.cover}
                            alt={project.title}
                            fill
                            sizes="96px"
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            unoptimized={project.cover.endsWith('.svg')}
                        />
                    </motion.div>

                    <motion.div
                        className="shrink-0 hidden md:flex items-center gap-2"
                        animate={{ x: isHovered ? -4 : 0, opacity: isHovered ? 1 : 0.4 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">view</span>
                        <motion.div animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.3 }}>
                            <ArrowRight className={cn('w-5 h-5 transition-colors', isHovered ? statusColor : 'text-muted-foreground')} />
                        </motion.div>
                    </motion.div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0 md:hidden" />
                </div>

                {!isLowPowerMode && (
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden border-t border-border bg-foreground/[0.02] hidden sm:block"
                            >
                                <div className="relative py-3 overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
                                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
                                    <motion.div
                                        className="flex whitespace-nowrap"
                                        animate={{ x: [0, -500] }}
                                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                                    >
                                        {[...Array(4)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={cn(
                                                    'mx-4 text-sm font-mono tracking-wider',
                                                    isOngoing ? 'text-emerald-600/60 dark:text-emerald-400/60' : 'text-blue-600/60 dark:text-blue-400/60'
                                                )}
                                            >
                                                {techText} •
                                            </span>
                                        ))}
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </motion.div>

            {/* Big cursor-following preview — desktop-only bonus, layered on top of the
                always-visible thumbnail above rather than replacing it. */}
            {!isLowPowerMode && (
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, exit: { duration: 0.1 }, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed pointer-events-none z-50 hidden xl:block"
                            style={{ left: cursorX, top: cursorY, x: '-50%', y: '-50%' }}
                        >
                            <div className="w-[420px] h-[260px] rounded-2xl overflow-hidden border border-border backdrop-blur-xl relative shadow-2xl bg-secondary">
                                <Image
                                    src={project.cover}
                                    alt={project.title}
                                    fill
                                    sizes="420px"
                                    className="object-cover opacity-90 grayscale"
                                    unoptimized={project.cover.endsWith('.svg')}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
            </motion.div>
        </Link>
    );
}

function FeaturedSpotlight({ project }: { project: Project }) {
    return (
        <Link
            href={`/projects/${project.slug}`}
            className="group relative block mb-12 sm:mb-16 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent"
        >
            <div className="absolute -top-1/2 -right-1/4 w-2/3 h-[200%] bg-primary/[0.04] rotate-12 pointer-events-none" />

            <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] items-stretch">
                <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center gap-5 sm:gap-7">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                            ⭐ Flagship Project
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Actively Building
                        </span>
                    </div>

                    <h3 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground">
                        {project.title}
                    </h3>

                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                        {project.longDescription}
                    </p>

                    <ul className="grid sm:grid-cols-2 gap-2 max-w-lg">
                        {project.highlights.slice(0, 4).map((h) => (
                            <li key={h} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                {h}
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-wrap gap-2 pt-1">
                        {project.techStack.map((t) => (
                            <span key={t} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-border text-muted-foreground">
                                {t}
                            </span>
                        ))}
                    </div>

                    <span className="inline-flex items-center gap-2 font-bold text-sm pt-2 group-hover:gap-3 transition-all text-blue-600 dark:text-blue-400">
                        Explore the build <ArrowRight size={16} />
                    </span>
                </div>

                <div className="relative min-h-[220px] sm:min-h-[320px] lg:min-h-full">
                    <Image
                        src={project.cover}
                        alt={project.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized={project.cover.endsWith('.svg')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-l" />
                </div>
            </div>
        </Link>
    );
}

export function ProjectsSection() {
    const { projects } = portfolioData;
    const { isLowPowerMode } = usePerformance();
    const featured = projects.find((p) => p.featured);

    return (
        <section id="projects" className="relative py-24 sm:py-32 md:py-44 bg-background border-y border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
                <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-14">
                    <div className="space-y-3 sm:space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <span className="w-8 sm:w-10 h-px bg-primary/30" />
                            <span className="eyebrow">The Work</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground">
                            What I&apos;ve <span className="text-shiny">shipped</span>.
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-md">
                            {projects.length} projects, spanning desktop apps, games, and an ever-growing AI assistant.
                        </p>
                    </div>
                    <Link
                        href="/projects"
                        className="text-[11px] sm:text-xs font-bold uppercase tracking-widest border border-border rounded-full px-4 sm:px-5 py-2 sm:py-2.5 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shrink-0 shadow-sm hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                        All Projects →
                    </Link>
                </div>

                {featured && <FeaturedSpotlight project={featured} />}

                <div className="divide-y divide-border">
                    {projects.map((p, i) => (
                        <ProjectListRow key={p.id} project={p} index={i} isLowPowerMode={isLowPowerMode} />
                    ))}
                </div>
            </div>
        </section>
    );
}
