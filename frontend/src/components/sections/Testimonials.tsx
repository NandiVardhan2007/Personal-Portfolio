'use client';

import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { MessageSquareQuote } from 'lucide-react';

export function TestimonialsSection() {
    return (
        <section className="relative py-24 sm:py-32 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <SectionHeading
                    eyebrow="Recommendations"
                    title={<>What people <span className="text-shiny">say</span>.</>}
                    description="Feedback from mentors, teammates, and collaborators."
                />
                
                <Reveal className="mt-16 relative w-full max-w-3xl mx-auto">
                    {/* Glowing background orbs */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute w-64 h-64 bg-glow-pink/20 blur-[80px] rounded-full animate-glow-pulse" />
                        <div className="absolute w-64 h-64 bg-glow-purple/20 blur-[80px] rounded-full animate-glow-pulse -translate-x-20" />
                    </div>

                    <div className="relative text-center py-20 px-6 border border-border rounded-[2.5rem] glass-card flex flex-col items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-glow-pink/[0.03] via-transparent to-glow-purple/[0.03] pointer-events-none" />
                        <MessageSquareQuote size={48} className="text-glow-pink/40 mb-6 relative z-10" />
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-glow-pink to-glow-purple mb-4 tracking-tight">Awaiting Testimonials</h3>
                        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed relative z-10">
                            This section will be updated with recommendations and feedback from my upcoming internships, hackathons, and collaborative projects.
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
