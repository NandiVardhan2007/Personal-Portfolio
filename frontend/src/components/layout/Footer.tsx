'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Github, Linkedin, Twitter, Instagram, Facebook, Mail, Copy, Check, ChevronUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import { ResumeButton } from '@/components/ui/ResumeButton';

const ICONS: Record<string, LucideIcon> = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    instagram: Instagram,
    facebook: Facebook,
};

const MARQUEE_ITEMS = ['BUILD', 'AUTOMATE', 'SHIP', 'ITERATE', 'LEARN'];

function Marquee() {
    return (
        <div className="relative flex overflow-hidden py-4 bg-secondary/40 border-y border-border">
            <motion.div
                className="flex gap-12 whitespace-nowrap"
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
                {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((word, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm font-mono tracking-widest uppercase text-muted-foreground/80">
                        <span>{word}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 600);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 left-4 md:left-8 z-40 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glass hover:scale-110 transition-transform"
                    aria-label="Back to top"
                >
                    <ChevronUp size={18} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}

export function Footer() {
    const { personal } = portfolioData;
    const year = new Date().getFullYear();
    const [copied, setCopied] = useState(false);

    const copyEmail = useCallback(() => {
        navigator.clipboard.writeText(personal.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    }, [personal.email]);

    return (
        <footer className="relative bg-background border-t border-border">
            <Marquee />
            <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <div className="grid md:grid-cols-3 gap-10">
                    <div>
                        <p className="font-black text-2xl tracking-tight mb-2">{personal.name}</p>
                        <p className="text-sm text-muted-foreground max-w-xs">{personal.subtitle}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="eyebrow mb-1">Contact</span>
                        <button
                            onClick={copyEmail}
                            className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors w-fit"
                        >
                            <Mail size={14} /> {personal.email}
                            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="opacity-40" />}
                        </button>
                        <span className="text-sm text-foreground/60">{personal.location}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="eyebrow mb-1">Elsewhere</span>
                        <div className="flex items-center gap-3">
                            {personal.socialLinks.map((s) => {
                                const Icon = ICONS[s.icon] ?? Github;
                                return (
                                    <a
                                        key={s.platform}
                                        href={s.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.platform}
                                        className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                                    >
                                        <Icon size={16} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
                    <span>© {year} {personal.name}. All rights reserved.</span>
                    <div className="flex gap-4">
                        <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
                        <Link href="/achievements" className="hover:text-foreground transition-colors">Achievements</Link>
                        <ResumeButton className="hover:text-foreground transition-colors">Resume</ResumeButton>
                    </div>
                </div>
            </div>
            <BackToTop />
        </footer>
    );
}
