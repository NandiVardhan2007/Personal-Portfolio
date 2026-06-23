'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';

export function ProjectsClient() {
    const { projects } = portfolioData;
    const [filter, setFilter] = useState('All');

    const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

    const filteredProjects = filter === 'All' 
        ? projects 
        : projects.filter(p => p.category === filter);

    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="max-w-2xl mb-12">
                    <span className="eyebrow">All Projects</span>
                    <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight text-foreground">
                        Things I&apos;ve <span className="text-shiny">built</span>.
                    </h1>
                    <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                        From desktop simulations to an evolving AI assistant — here&apos;s what I&apos;ve shipped so far.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                                filter === cat 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {filteredProjects.map((project) => (
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
                
                {filteredProjects.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        No projects found in this category.
                    </div>
                )}
            </div>
        </div>
    );
}
