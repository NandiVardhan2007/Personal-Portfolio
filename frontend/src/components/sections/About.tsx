import Image from 'next/image';
import { GraduationCap, MapPin, Briefcase } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function About() {
    const { personal, education, experience } = portfolioData;
    const currentEducation = education[0];
    const currentRole = experience[0];

    return (
        <section id="about" className="relative py-28 md:py-36 bg-background">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <SectionHeading
                    eyebrow="About Me"
                    title={
                        <>
                            Building things that <span className="text-shiny">actually work</span>.
                        </>
                    }
                />

                <div className="mt-16 grid md:grid-cols-[340px_1fr] gap-12 md:gap-16 items-start">
                    <Reveal className="relative">
                        <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl glass-card">
                            <Image
                                src={personal.avatar}
                                alt={`${personal.name} headshot`}
                                fill
                                sizes="(max-width: 768px) 100vw, 384px"
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <MapPin size={12} /> {personal.location}
                        </div>
                    </Reveal>

                    <Reveal delay={0.1} className="space-y-8">
                        <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">{personal.bio}</p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="glass-card p-6">
                                <div className="flex items-center gap-2 mb-2 text-primary">
                                    <GraduationCap size={16} />
                                    <span className="eyebrow !text-foreground">Education</span>
                                </div>
                                <p className="text-sm text-foreground/80">{currentEducation.degree}, {currentEducation.major}</p>
                                <p className="text-xs text-muted-foreground mt-1">{currentEducation.institution} · {currentEducation.dates}</p>
                            </div>
                            <div className="glass-card p-6">
                                <div className="flex items-center gap-2 mb-2 text-primary">
                                    <Briefcase size={16} />
                                    <span className="eyebrow !text-foreground">Currently</span>
                                </div>
                                <p className="text-sm text-foreground/80">{currentRole.position}</p>
                                <p className="text-xs text-muted-foreground mt-1">{currentRole.organization} · {currentRole.dates}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {personal.languages.map((l) => (
                                <span key={l.name} className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-border text-muted-foreground">
                                    {l.name} · {l.level}
                                </span>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
