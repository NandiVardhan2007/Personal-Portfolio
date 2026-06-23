import { Counter } from '@/components/ui/Counter';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { portfolioData } from '@/data/portfolio';

export function ProfessionalStats() {
    const { stats } = portfolioData;
    const yearsCoding = Math.max(1, new Date().getFullYear() - stats.codingSince);

    const items = [
        { label: 'Years Coding', value: yearsCoding, suffix: '+' },
        { label: 'Projects Shipped', value: stats.projectsBuilt, suffix: '' },
        { label: 'Technologies Used', value: stats.technologies, suffix: '+' },
        { label: 'Certifications Earned', value: stats.certifications, suffix: '' },
    ];

    return (
        <section id="stats" className="relative py-28 md:py-36 bg-secondary/30 border-y border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <SectionHeading
                    eyebrow="Professional Statistics"
                    title="A quick read on the work so far."
                    description="Still climbing — these numbers move every month."
                />

                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {items.map((item, i) => (
                        <Reveal key={item.label} delay={i * 0.08} className="glass-card p-8 md:p-10 text-center">
                            <div className="font-black text-4xl md:text-5xl text-shiny">
                                <Counter value={item.value} suffix={item.suffix} duration={1.6} />
                            </div>
                            <p className="eyebrow mt-3">{item.label}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
