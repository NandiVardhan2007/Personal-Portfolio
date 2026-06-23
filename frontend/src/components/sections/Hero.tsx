'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { ResumeButton } from '@/components/ui/ResumeButton';
import { Github, Linkedin, Instagram, ArrowDownRight, Zap, Bot } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import { ProfileCard } from '@/components/ui/profile-card';
import { Spotlight } from '@/components/ui/spotlight-new';

export function Hero({ isExiting }: { isExiting?: boolean }) {
    const { personal } = portfolioData;
    const [showProfile, setShowProfile] = useState(false);
    const social = (platform: string) => personal.socialLinks.find((s) => s.platform === platform)?.url;
    const currentYear = new Date().getFullYear();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen w-full flex flex-col bg-background text-foreground selection:bg-primary/20"
        >
            <div aria-hidden="true" className="w-full absolute h-full z-0 bg-[radial-gradient(circle,_#888_0.5px,_transparent_0.5px)] dark:bg-[radial-gradient(circle,_#444_0.5px,_transparent_0.5px)] opacity-20 [background-size:24px_24px]" />

            <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
                <Spotlight duration={10} xOffset={120} translateY={-300} />
            </div>

            <main className="relative flex-1 flex flex-col justify-center pt-40 pb-20 z-10">
                <h1 className="sr-only">Software Automation Engineer</h1>
                <div className="flex relative gap-4 px-6 md:items-center w-full flex-col justify-center">
                    {/* Line 1 */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center relative">
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-[10px] md:text-xs text-muted-foreground text-center md:text-right leading-relaxed max-w-[280px] md:max-w-[220px] font-medium uppercase tracking-[0.2em] mb-2 md:mb-0"
                        >
                            Hi, I&apos;m {personal.nickname}. I build practical software, automations, and AI assistants.
                        </motion.p>
                        <div className="relative">
                            <motion.div
                                animate={isExiting ? { y: [0, 10, 0] } : {}}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-6 right-2 md:-top-4 md:right-2 text-primary/60 hover:text-primary z-20"
                            >
                                <a href={social('GitHub')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm group">
                                    <Github size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-primary">GitHub</span>
                                </a>
                            </motion.div>
                            <motion.div
                                aria-hidden="true"
                                role="presentation"
                                initial={{ opacity: 0, y: 30 }}
                                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[clamp(2.5rem,8vw,11rem)] text-center md:text-left font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-4"
                            >
                                SOFTWARE
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center relative">
                        <div className="relative">
                            <motion.div
                                animate={isExiting ? { y: [0, -10, 0] } : {}}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-6 left-0 md:-top-8 md:left-4 text-primary/60 hover:text-primary z-20"
                            >
                                <a href={social('LinkedIn')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm group">
                                    <Linkedin size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-primary">LinkedIn</span>
                                </a>
                            </motion.div>
                            <motion.div
                                animate={isExiting ? { y: [0, 10, 0] } : {}}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -bottom-8 right-6 md:-bottom-12 md:right-36 text-primary/60 hover:text-primary z-20"
                            >
                                <a href={social('Instagram')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm group">
                                    <Instagram size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-primary">Instagram</span>
                                </a>
                            </motion.div>
                            <motion.div
                                aria-hidden="true"
                                role="presentation"
                                initial={{ opacity: 0, y: 30 }}
                                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[clamp(2.5rem,8vw,11rem)] flex flex-wrap items-center justify-center md:justify-start font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-4"
                            >
                                <span>AUTO</span>
                                <motion.div
                                    animate={isExiting ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                                    className="mx-[0.05em]"
                                >
                                    <Zap className="w-[0.8em] h-[0.8em] text-sky-400" strokeWidth={1.5} />
                                </motion.div>
                                <span>MATION</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Line 3 */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center relative">
                        <motion.div
                            aria-hidden="true"
                            role="presentation"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[clamp(2.5rem,8vw,11rem)] flex flex-wrap items-center justify-center md:justify-start font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-4"
                        >
                            <span>EN</span>
                            <motion.div
                                animate={isExiting ? { rotate: [0, 8, 0, -8, 0], y: [0, -10, 0] } : {}}
                                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                                className="mx-[0.05em] relative"
                            >
                                <Bot className="w-[0.85em] h-[0.85em] text-yellow-500 fill-yellow-500/10" />
                            </motion.div>
                            <span>GINEER</span>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-[10px] md:text-xs text-muted-foreground text-center md:text-left mt-2 md:mt-0 pt-0 md:pt-8 leading-relaxed max-w-[280px] md:max-w-[200px] font-medium uppercase tracking-widest"
                        >
                            Open to internships, collaborations, and interesting problems to solve.
                        </motion.p>
                    </div>
                </div>

                <div className="mx-auto max-w-[105rem] w-full px-4 md:px-20 mt-12 md:mt-24">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Separator className="flex-1 h-[1px] bg-foreground/10 hidden md:block" />
                        <div className="text-[10px] md:text-xs whitespace-nowrap font-bold tracking-[0.3em] text-muted-foreground uppercase">
                            ANDHRA PRADESH, IN — {currentYear}
                        </div>
                        <ResumeButton className="group flex items-center">
                            <motion.div className="relative flex items-center bg-zinc-100 dark:bg-white h-12 w-12 group-hover:w-44 rounded-full transition-all duration-500 ease-smooth-out overflow-hidden shadow-xl border border-transparent group-hover:border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-150 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-black group-hover:text-blue-600 dark:group-hover:text-blue-600 pl-6 pr-12">
                                    View Resume
                                </span>
                                <div className="absolute right-0 flex items-center justify-center size-12 text-zinc-900 dark:text-black group-hover:rotate-45 transition-transform duration-500 group-hover:text-blue-600 dark:group-hover:text-blue-600">
                                    <ArrowDownRight className="w-5 h-5" />
                                </div>
                            </motion.div>
                        </ResumeButton>
                    </div>
                </div>

                <div
                    className="absolute left-0 top-1/2 z-50 hidden md:flex items-center transform -translate-y-1/2"
                    onMouseEnter={() => setShowProfile(true)}
                    onMouseLeave={() => setShowProfile(false)}
                    onClick={() => setShowProfile(!showProfile)}
                >
                    <div className="relative z-50">
                        <motion.div
                            whileHover={{ x: 10 }}
                            className="bg-primary/5 hover:bg-primary/10 text-foreground py-10 px-4 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl rounded-r-3xl border-r border-y border-border cursor-pointer backdrop-blur-sm transition-colors"
                        >
                            <span className="rotate-0 [writing-mode:vertical-rl]">OPEN TO OPPORTUNITIES</span>
                        </motion.div>
                    </div>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="pl-4 pointer-events-auto"
                                style={{ width: 'max-content' }}
                            >
                                <ProfileCard
                                    name={personal.name}
                                    title={personal.title}
                                    description={personal.bio}
                                    imageUrl={personal.avatar}
                                    githubUrl={social('GitHub')}
                                    linkedinUrl={social('LinkedIn')}
                                    instagramUrl={social('Instagram')}
                                    className="!max-w-4xl scale-[0.8] origin-left"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </motion.div>
    );
}
