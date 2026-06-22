import { Trophy, ExternalLink } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import { formatDate } from '@/lib/utils';
import { CertificateCard } from '@/components/ui/CertificateCard';

export const metadata = {
    title: 'Achievements',
    description: 'Certifications, hackathon awards, and milestones earned by Kovvuri Nandi Vardhan Reddy (Nandu).',
};

export default function AchievementsPage() {
    const { achievements } = portfolioData;
    const awards = achievements.filter((a) => a.category === 'award');
    const certifications = achievements.filter((a) => a.category === 'certification');

    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="max-w-6xl mx-auto px-6 md:px-10">
                <div className="max-w-2xl mb-16">
                    <span className="eyebrow">Achievements</span>
                    <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight text-foreground">
                        Awards & <span className="text-shiny">certifications</span>.
                    </h1>
                    <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                        Hackathons, certifications, and milestones collected along the way.
                    </p>
                </div>

                {awards.length > 0 && (
                    <div className="mb-16 space-y-6">
                        <p className="eyebrow">Awards</p>
                        {awards.map((a) => (
                            <div key={a.id} className="glass-card p-8 flex flex-wrap items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                    <Trophy size={20} />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <div className="flex flex-wrap items-baseline gap-3">
                                        <h3 className="text-xl font-black text-foreground">{a.title}</h3>
                                        {a.date && <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{a.issuer}</p>
                                    <p className="text-sm text-foreground/70 mt-2 max-w-xl">{a.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {a.tags.map((t) => (
                                            <span key={t} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-6">
                    <p className="eyebrow">Certifications ({certifications.length})</p>
                    <p className="text-sm text-muted-foreground">Click any card to open the full certificate as a PDF.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certifications.map((c) => (
                            <div key={c.id}>
                                <CertificateCard achievement={c} />
                                {c.credentialUrl && (
                                    <a
                                        href={c.credentialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold mt-3 hover:gap-2 transition-all"
                                    >
                                        View Credential <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
