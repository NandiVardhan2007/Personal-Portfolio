import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';

export function generateStaticParams() {
    return portfolioData.projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
    const project = portfolioData.projects.find((p) => p.slug === params.slug);
    return { title: project?.title ?? 'Project', description: project?.description };
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
    const project = portfolioData.projects.find((p) => p.slug === params.slug);
    if (!project) notFound();

    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="max-w-5xl mx-auto px-6 md:px-10">
                <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-10">
                    <ArrowLeft size={15} /> All Projects
                </Link>

                <div className="flex items-center gap-4 mb-5">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/70">{project.category}</span>
                    {project.status === 'ongoing' && (
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500">· In Progress</span>
                    )}
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6">{project.title}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">{project.longDescription}</p>

                <div className="flex flex-wrap items-center gap-4 mb-12">
                    {project.repoUrl && (
                        <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full font-bold text-xs uppercase tracking-widest px-6 py-3 hover:scale-105 transition-transform"
                        >
                            <Github size={14} /> View Source
                        </a>
                    )}
                    {project.demoUrl && (
                        <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 border border-border rounded-full font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-secondary transition-colors"
                        >
                            <ExternalLink size={14} /> Live Demo
                        </a>
                    )}
                </div>

                <div className="relative aspect-video w-full rounded-3xl overflow-hidden glass-card mb-16">
                    <Image src={project.cover} alt={`${project.title} cover image`} fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" unoptimized={project.cover.endsWith('.svg')} />
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-xl font-black tracking-tight mb-5">Highlights</h2>
                            <ul className="space-y-2.5">
                                {project.highlights.map((h) => (
                                    <li key={h} className="flex items-start gap-3 text-foreground/80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {project.features.length > 0 && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-5">Features</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {project.features.map((group) => (
                                        <div key={group.title} className="glass-card p-5">
                                            <p className="eyebrow !text-foreground mb-3">{group.title}</p>
                                            <ul className="space-y-1.5 text-sm text-foreground/70">
                                                {group.items.map((item) => (
                                                    <li key={item}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.challenges && project.challenges.length > 0 && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-5">Challenges & Solutions</h2>
                                <div className="space-y-4">
                                    {project.challenges.map((c, i) => (
                                        <div key={i} className="glass-card p-5">
                                            <p className="text-sm font-bold text-foreground/90 mb-1.5">{c.problem}</p>
                                            <p className="text-sm text-muted-foreground">{c.solution}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.gallery.length > 0 && (
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-5">Gallery</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {project.gallery.map((src) =>
                                        src.endsWith('.mp4') ? (
                                            <video key={src} src={src} controls className="w-full rounded-2xl border border-border" />
                                        ) : (
                                            <div key={src} className="relative aspect-video rounded-2xl overflow-hidden border border-border">
                                                <Image src={src} alt={`${project.title} screenshot`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="glass-card p-6">
                            <p className="eyebrow !text-foreground mb-4">Project Info</p>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Role</dt>
                                    <dd className="text-foreground/80 text-right">{project.role}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Team</dt>
                                    <dd className="text-foreground/80 text-right">{project.team}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Status</dt>
                                    <dd className="text-foreground/80 text-right capitalize">{project.status}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="glass-card p-6">
                            <p className="eyebrow !text-foreground mb-4">Tech Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((t) => (
                                    <span key={t} className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border border-border text-muted-foreground">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
