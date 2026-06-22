'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, CheckCircle, AlertTriangle, AlertCircle, Mail, Phone, MapPin, Github, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import { FloatingInput } from '@/components/ui/FloatingInput';

const ICONS: Record<string, LucideIcon> = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    instagram: Instagram,
    facebook: Facebook,
};

type Status = 'idle' | 'loading' | 'success' | 'partial' | 'error';

interface ContactResponse {
    status?: 'success' | 'partial';
    message?: string;
    warnings?: string[];
    error?: string;
}

export function ContactPageClient() {
    const { personal } = portfolioData;
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<Status>('idle');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setFeedback(null);
        setWarnings([]);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const responseText = await res.text();
            let data: ContactResponse = {};
            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch {
                throw new Error(responseText || 'The contact backend returned an invalid response.');
            }

            if (res.status === 400 || !res.ok && res.status !== 207) {
                throw new Error(data.error || 'Something went wrong.');
            }

            if (res.status === 207 || data.status === 'partial') {
                setStatus('partial');
                setWarnings(data.warnings || []);
                setFeedback(data.message || 'Your message was processed, but something only partially succeeded.');
            } else {
                setStatus('success');
                setFeedback(data.message || "Your message has been received! Check your email for a confirmation.");
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (err: unknown) {
            setStatus('error');
            setFeedback(err instanceof Error ? err.message : "Couldn't send your message. Please try emailing directly.");
        }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="max-w-6xl mx-auto px-6 md:px-10">
                <div className="max-w-2xl mb-16">
                    <span className="eyebrow">Contact</span>
                    <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight text-foreground">
                        Let&apos;s build something <span className="text-shiny">together</span>.
                    </h1>
                    <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                        Open to internships, collaborations, and interesting problems worth solving.
                        Send a message below, or reach out directly.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16">
                    <form onSubmit={handleSubmit}>
                        <FloatingInput label="Name" name="name" value={formData.name} onChange={handleChange} required />
                        <FloatingInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <FloatingInput label="Subject" name="subject" value={formData.subject} onChange={handleChange} />
                        <FloatingInput label="Message" name="message" type="textarea" value={formData.message} onChange={handleChange} required />

                        <motion.button
                            type="submit"
                            disabled={status === 'loading'}
                            className="group relative w-full flex items-center justify-between border-b-2 border-foreground py-7 text-left hover:bg-foreground/5 transition-colors disabled:opacity-50"
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground group-hover:pl-4 transition-all duration-300">
                                {status === 'loading' ? 'Sending…' : 'Send Message'}
                            </span>
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground text-background group-hover:scale-110 transition-transform duration-500 shrink-0">
                                <ArrowUpRight className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
                            </div>
                        </motion.button>

                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-2.5 mt-4 text-sm ${
                                    status === 'error' ? 'text-red-500' : status === 'partial' ? 'text-amber-500' : 'text-emerald-500'
                                }`}
                            >
                                {status === 'error' ? (
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                ) : status === 'partial' ? (
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                ) : (
                                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                                )}
                                <span>
                                    {feedback}
                                    {warnings.length > 0 && (
                                        <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                                            {warnings.map((w) => (
                                                <li key={w}>{w}</li>
                                            ))}
                                        </ul>
                                    )}
                                </span>
                            </motion.div>
                        )}
                    </form>

                    <div className="space-y-10">
                        <div className="glass-card p-7 space-y-3">
                            <p className="eyebrow !text-foreground mb-2">Direct Contact</p>
                            <a
                                href={`mailto:${personal.email}`}
                                className="flex items-center gap-3 text-foreground font-bold hover:text-primary transition-colors"
                            >
                                <Mail size={16} /> {personal.email}
                            </a>
                            {personal.phone && (
                                <a
                                    href={`tel:${personal.phone.replace(/\s+/g, '')}`}
                                    className="flex items-center gap-3 text-foreground font-bold hover:text-primary transition-colors"
                                >
                                    <Phone size={16} /> {personal.phone}
                                </a>
                            )}
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPin size={16} /> {personal.location}
                            </div>
                        </div>

                        <div>
                            <p className="eyebrow mb-5">Elsewhere</p>
                            <div className="grid grid-cols-2 gap-3">
                                {personal.socialLinks.map((s) => {
                                    const Icon = ICONS[s.icon] ?? Github;
                                    return (
                                        <a
                                            key={s.platform}
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`${personal.nickname} on ${s.platform}`}
                                            className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-primary/40 hover:bg-secondary/60 transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <Icon size={15} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{s.platform}</p>
                                                <p className="text-xs text-muted-foreground truncate">@{s.username}</p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
