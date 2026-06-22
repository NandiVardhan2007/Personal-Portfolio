import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import { Reveal } from '@/components/ui/Reveal';
import { CertificateMarquee } from '@/components/ui/CertificateMarquee';

export function AchievementsSection() {
    const { achievements } = portfolioData;
    const awards = achievements.filter((a) => a.category === 'award');
    const certsWithImages = achievements.filter((a) => a.category === 'certification' && a.image);

    return (
        <section id="achievements" className="relative bg-background py-28 md:py-36 overflow-hidden">
            <div className="max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 mb-16">
                <Reveal className="flex flex-col items-center text-center gap-6">
                    <span className="eyebrow">Certifications & Achievements</span>
                    <h2 className="text-3xl md:text-4xl lg:text-6xl font-black leading-[1.05] tracking-tight max-w-3xl text-foreground">
                        Hands-on learning, validated by <span className="text-shiny">real certifications</span>.
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                        A growing collection of certifications across programming, systems, and AI — plus the occasional hackathon.
                    </p>
                    <Link
                        href="/achievements"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full font-bold text-sm px-8 py-4 hover:scale-105 active:scale-95 transition-transform shadow-glass"
                    >
                        View All Achievements <ArrowRight size={15} />
                    </Link>
                </Reveal>
            </div>

            {awards.map((a) => (
                <div key={a.id} className="max-w-4xl mx-auto px-6 mb-16">
                    <Reveal className="glass-card p-8 flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <p className="eyebrow !text-amber-500 mb-1">Award</p>
                            <h3 className="text-xl font-black text-foreground">{a.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{a.issuer}</p>
                            <p className="text-sm text-foreground/70 mt-2 max-w-xl">{a.description}</p>
                        </div>
                    </Reveal>
                </div>
            ))}

            {certsWithImages.length > 0 && (
                <div className="w-full max-w-[1600px] mx-auto px-4 md:px-16 lg:px-24">
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-6">
                        Click any certificate to open the full PDF
                    </p>
                    <CertificateMarquee achievements={certsWithImages} />
                </div>
            )}
        </section>
    );
}
