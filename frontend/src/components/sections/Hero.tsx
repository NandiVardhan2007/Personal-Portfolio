'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { ResumeButton } from '@/components/ui/ResumeButton';
import { Github, Linkedin, Instagram, ArrowDownRight, Zap, Bot } from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import { ProfileCard } from '@/components/ui/profile-card';
import { Spotlight } from '@/components/ui/spotlight-new';
import gsap from 'gsap';

export function Hero({ isExiting }: { isExiting?: boolean }) {
    const { personal } = portfolioData;
    const [showProfile, setShowProfile] = useState(false);
    const githubRef = useRef(null);
    const linkedinRef = useRef(null);
    const instagramRef = useRef(null);
    const zapRef = useRef(null);
    const botRef = useRef(null);

    const social = (platform: string) => personal.socialLinks.find((s) => s.platform === platform)?.url;

    useEffect(() => {
        if (!isExiting) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                githubRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    onComplete: () => {
                        gsap.to(githubRef.current, { y: -10, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
                    },
                }
            );
            gsap.fromTo(
                linkedinRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    delay: 0.1,
                    ease: 'power3.out',
                    onComplete: () => {
                        gsap.to(linkedinRef.current, { y: 10, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
                    },
                }
            );
            gsap.fromTo(
                instagramRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    delay: 0.2,
                    ease: 'power3.out',
                    onComplete: () => {
                        gsap.to(instagramRef.current, { x: 10, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
                    },
                }
            );
            gsap.to(zapRef.current, { scale: 1.2, duration: 0.6, repeat: -1, yoyo: true, ease: 'power2.inOut' });
            gsap.to(botRef.current, { rotation: 8, y: -10, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        });

        return () => ctx.revert();
    }, [isExiting]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen w-full flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary/20"
        >
            <div className="w-full absolute h-full z-0 bg-[radial-gradient(circle,_#888_0.5px,_transparent_0.5px)] dark:bg-[radial-gradient(circle,_#444_0.5px,_transparent_0.5px)] opacity-20 [background-size:24px_24px]" />

            <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
                <Spotlight duration={10} xOffset={120} translateY={-300} />
            </div>

            <main className="relative flex-1 flex flex-col justify-center pt-40 pb-20 z-10">
                <div className="flex relative gap-4 px-6 md:items-center w-full flex-col justify-center">
                    {/* Line 1 */}
                    <div className="md:flex gap-8 items-center relative">
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-[10px] md:text-xs text-muted-foreground text-start md:text-right leading-relaxed max-w-[200px] md:max-w-[220px] font-medium uppercase tracking-[0.2em]"
                        >
                            Hi, I&apos;m {personal.nickname}. I build practical software, automations, and AI assistants.
                        </motion.p>
                        <div className="relative">
                            <div ref={githubRef} className="absolute -top-4 right-0 md:right-2 text-primary/60 hover:text-primary z-20 opacity-0">
                                <a href={social('GitHub')} target="_blank" rel="noopener noreferrer" className="block">
                                    <Github size={32} />
                                </a>
                            </div>
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[clamp(3rem,11vw,13rem)] font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-4"
                            >
                                SOFTWARE
                            </motion.h1>
                        </div>
                    </div>

                    {/* Line 2 */}
                    <div className="flex flex-col md:flex-row gap-8 items-center relative">
                        <div className="relative">
                            <div ref={linkedinRef} className="absolute -top-8 left-4 text-primary/60 hover:text-primary z-20 opacity-0">
                                <a href={social('LinkedIn')} target="_blank" rel="noopener noreferrer" className="block">
                                    <Linkedin size={32} />
                                </a>
                            </div>
                            <div ref={instagramRef} className="absolute -bottom-12 right-24 md:right-36 text-primary/60 hover:text-primary z-20 opacity-0">
                                <a href={social('Instagram')} target="_blank" rel="noopener noreferrer" className="block">
                                    <Instagram size={32} />
                                </a>
                            </div>
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[clamp(3rem,11vw,13rem)] flex flex-wrap items-center justify-center md:justify-start font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-4"
                            >
                                <span>AUTO</span>
                                <div ref={zapRef} className="mx-[0.05em]">
                                    <Zap className="w-[0.8em] h-[0.8em] text-sky-400" strokeWidth={1.5} />
                                </div>
                                <span>MATION</span>
                            </motion.h1>
                        </div>
                    </div>

                    {/* Line 3 */}
                    <div className="flex flex-col md:flex-row gap-8 items-center relative">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[clamp(3rem,11vw,13rem)] flex flex-wrap items-center justify-center md:justify-start font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-4"
                        >
                            <span>EN</span>
                            <div ref={botRef} className="mx-[0.05em] relative">
                                <Bot className="w-[0.85em] h-[0.85em] text-yellow-500 fill-yellow-500/10" />
                            </div>
                            <span>GINEER</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-[10px] md:text-xs text-muted-foreground pt-4 md:pt-8 leading-relaxed max-w-[250px] md:max-w-[200px] font-medium uppercase tracking-widest"
                        >
                            Open to internships, collaborations, and interesting problems to solve.
                        </motion.p>
                    </div>
                </div>

                <div className="mx-auto max-w-[105rem] w-full px-4 md:px-20 mt-12 md:mt-24">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Separator className="flex-1 h-[1px] bg-foreground/10 hidden md:block" />
                        <div className="text-[10px] md:text-xs whitespace-nowrap font-bold tracking-[0.3em] text-muted-foreground uppercase">
                            ANDHRA PRADESH, IN — 2026
                        </div>
                        <ResumeButton className="group flex items-center">
                            <motion.div className="relative flex items-center bg-zinc-100 dark:bg-white h-12 w-12 group-hover:w-44 rounded-full transition-all duration-500 ease-smooth-out overflow-hidden shadow-xl">
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-150 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-black pl-6 pr-12">
                                    View Resume
                                </span>
                                <div className="absolute right-0 flex items-center justify-center size-12 text-zinc-900 dark:text-black group-hover:rotate-45 transition-transform duration-500">
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
                >
                    <div className="relative z-50">
                        <motion.div
                            whileHover={{ x: 10 }}
                            className="bg-white text-black py-10 px-4 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl rounded-r-3xl border-r border-y border-zinc-200 cursor-pointer"
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
