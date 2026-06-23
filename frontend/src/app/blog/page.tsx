import { SectionHeading } from '@/components/ui/SectionHeading';

export const metadata = {
    title: 'Blog',
    description: 'Thoughts, tutorials, and technical writing.',
};

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <SectionHeading
                    eyebrow="Writing"
                    title={<>My <span className="text-shiny">Thoughts</span>.</>}
                    description="Technical writing, tutorials, and reflections on building software."
                />
                
                <div className="mt-16 relative w-full max-w-2xl mx-auto">
                    {/* Glowing background orbs */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute w-64 h-64 bg-glow-cyan/20 blur-[80px] rounded-full animate-glow-pulse" />
                        <div className="absolute w-64 h-64 bg-glow-purple/20 blur-[80px] rounded-full animate-glow-pulse translate-x-20" />
                    </div>

                    <div className="relative text-center py-24 px-6 border border-border rounded-[2.5rem] glass-card overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-glow-cyan/[0.03] via-transparent to-glow-purple/[0.03] pointer-events-none" />
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-glow-cyan to-glow-purple mb-4 tracking-tight">Coming Soon</h3>
                        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed relative z-10">
                            I&apos;m currently writing my first few articles. Check back soon for technical content, deep dives, and tutorials!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
