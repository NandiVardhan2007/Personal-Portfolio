'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowUpRight,
    ChevronDown,
    ExternalLink,
    Facebook,
    Github,
    Instagram,
    Linkedin,
    Mail,
    Twitter,
} from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const ICONS: Record<string, LucideIcon> = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    instagram: Instagram,
    facebook: Facebook,
};

function SocialTicker() {
    const { socialLinks } = portfolioData.personal;
    const items = [...socialLinks, ...socialLinks];

    return (
        <div className="relative w-full overflow-hidden py-2 select-none">
            <motion.div
                className="flex gap-4 flex-nowrap"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
                style={{ width: 'max-content' }}
            >
                {items.map((item, idx) => {
                    const Icon = ICONS[item.icon] ?? Github;
                    return (
                        <a
                            key={`${item.platform}-${idx}`}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex h-[100px] sm:h-[130px] w-[200px] sm:w-[260px] flex-shrink-0 flex-col justify-between rounded-2xl sm:rounded-3xl border border-border bg-secondary/40 p-4 sm:p-6 transition-all hover:bg-secondary hover:-translate-y-1"
                        >
                            <div className="absolute -top-6 -right-6 p-6 opacity-[0.04] group-hover:opacity-10 transition-opacity">
                                <Icon className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-foreground tracking-tight">{item.platform}</span>
                                    <span className="text-xs text-muted-foreground">@{item.username}</span>
                                </div>
                            </div>
                            <div className="relative z-10 flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Connect</span>
                                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    );
                })}
            </motion.div>
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
    );
}

function ContactCTA() {
    const { email } = portfolioData.personal;

    return (
        <div className="glass-card p-6 sm:p-8 md:p-10 flex flex-col gap-6">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-snug">
                Got a project, an internship, or just want to say hi? The full contact form lives on its own page.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-6">
                <Link
                    href="/contact"
                    className="group inline-flex justify-center w-full sm:w-auto items-center gap-2 bg-primary text-primary-foreground rounded-full font-bold text-sm px-7 py-4 hover:scale-105 active:scale-95 transition-transform"
                >
                    Go to Contact Page
                    <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform duration-300" />
                </Link>
                <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors w-full sm:w-auto justify-center sm:justify-start py-2 sm:py-0"
                >
                    <Mail size={15} /> {email}
                </a>
            </div>
        </div>
    );
}

function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const { faqs } = portfolioData;

    return (
        <div className="divide-y divide-border">
            {faqs.map((faq, i) => (
                <div key={faq.question}>
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full flex items-center justify-between gap-4 py-5 text-left"
                    >
                        <span className="font-bold text-foreground">{faq.question}</span>
                        <ChevronDown
                            size={18}
                            className={`shrink-0 text-muted-foreground transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <AnimatePresence initial={false}>
                        {openIndex === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <p className="text-muted-foreground text-sm leading-relaxed pb-5 max-w-xl">{faq.answer}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}

export function ContactSection() {
    return (
        <section id="contact" className="relative py-28 md:py-36 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <SectionHeading
                    eyebrow="Get In Touch"
                    title={
                        <>
                            Let&apos;s build something <span className="text-shiny">together</span>.
                        </>
                    }
                    description="Open to internships, collaborations, and interesting problems worth solving."
                />

                <div className="mt-12 lg:mt-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16">
                    <Reveal>
                        <ContactCTA />
                    </Reveal>

                    <Reveal delay={0.1} className="space-y-10 lg:space-y-12">
                        <div>
                            <p className="eyebrow mb-5">Elsewhere</p>
                            <SocialTicker />
                        </div>
                        <div>
                            <p className="eyebrow mb-2">FAQ</p>
                            <FAQAccordion />
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
