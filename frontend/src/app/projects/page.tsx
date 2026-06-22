import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';

export const metadata = {
    title: 'Projects',
    description: 'Desktop apps, games, and an evolving AI assistant — projects built by Kovvuri Nandi Vardhan Reddy (Nandu).',
};

export default function ProjectsPage() {
    const { projects } = portfolioData;

    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="max-w-2xl mb-16">
                    <span className="eyebrow">All Projects</span>
                    <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight text-foreground">
                        Things I&apos;ve <span className="text-shiny">built</span>.
                    </h1>
                    <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                        From desktop simulations to an evolving AI assistant — here&apos;s what I&apos;ve shipped so far.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.slug}`}
                            className="group glass-card overflow-hidden flex flex-col"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <Image
                                    src={project.cover}
                                    alt={`${project.title} cover image`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    unoptimized={project.cover.endsWith('.svg')}
                                />
                                {project.status === 'ongoing' && (
                                    <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-background/90 backdrop-blur px-3 py-1.5 rounded-full">
                                        In Progress
                                    </span>
                                )}
                            </div>
                            <div className="p-6 flex flex-col gap-3 flex-1">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{project.category}</span>
                                <h2 className="text-2xl font-black tracking-tight text-foreground">{project.title}</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{project.description}</p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {project.techStack.slice(0, 4).map((t) => (
                                        <span key={t} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold pt-2 group-hover:gap-2.5 transition-all">
                                    View Project <ArrowUpRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
