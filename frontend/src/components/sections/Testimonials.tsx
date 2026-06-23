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
                
                <Reveal className="mt-16 text-center py-16 border border-border border-dashed rounded-3xl bg-secondary/20 flex flex-col items-center justify-center">
                    <MessageSquareQuote size={48} className="text-muted-foreground/30 mb-6" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Testimonials</h3>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                        This section will be updated with recommendations and feedback from my upcoming internships, hackathons, and collaborative projects.
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
