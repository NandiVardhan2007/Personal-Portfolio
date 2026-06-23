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
                
                <div className="mt-16 text-center py-20 border border-border border-dashed rounded-3xl bg-secondary/20">
                    <h3 className="text-xl font-bold text-foreground mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        I&apos;m currently writing my first few articles. Check back soon for technical content and tutorials!
                    </p>
                </div>
            </div>
        </div>
    );
}
