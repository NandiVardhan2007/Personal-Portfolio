import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { portfolioData } from '@/data/portfolio';
import { TechItem } from '@/types';

const GROUPS: { label: string; category: TechItem['category'] }[] = [
    { label: 'Languages', category: 'language' },
    { label: 'Frameworks & Libraries', category: 'framework' },
    { label: 'Databases', category: 'database' },
    { label: 'Cloud & Systems', category: 'cloud' },
    { label: 'Tools', category: 'tool' },
];

export function TechStack() {
    const { techStack, softSkills } = portfolioData;

    return (
        <section id="stack" className="relative py-28 md:py-36 bg-background">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <SectionHeading
                    eyebrow="Tech Stack & Ecosystem"
                    title="The toolkit I reach for."
                    description="Languages, frameworks, and tools I use when turning ideas into working software."
                />

                <div className="mt-16 space-y-12">
                    {GROUPS.map((group, gi) => {
                        const items = techStack.filter((t) => t.category === group.category);
                        if (!items.length) return null;
                        return (
                            <Reveal key={group.category} delay={gi * 0.06}>
                                <p className="eyebrow mb-5">{group.label}</p>
                                <div className="flex flex-wrap gap-3">
                                    {items.map((item) => (
                                        <div
                                            key={item.name}
                                            className="group flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-border hover:border-primary/40 hover:bg-secondary/60 transition-all duration-300"
                                        >
                                            <div className="relative w-5 h-5 shrink-0">
                                                <Image
                                                    src={item.icon}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain opacity-70 group-hover:opacity-100 transition-opacity dark:invert"
                                                    unoptimized
                                                />
                                            </div>
                                            <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                                                {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>
                        );
                    })}
                </div>

                <Reveal delay={0.3} className="mt-16 pt-12 border-t border-border">
                    <p className="eyebrow mb-5">Soft Skills</p>
                    <div className="flex flex-wrap gap-3">
                        {softSkills.map((s) => (
                            <span key={s.name} className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full text-foreground border border-border">
                                {s.name}
                            </span>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
