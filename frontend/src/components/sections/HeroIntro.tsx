'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Hero } from '@/components/sections/Hero';

/**
 * The only part of the homepage that actually needs to be a client component —
 * everything else (About, Stats, Stack, Projects, etc.) is plain server-rendered
 * markup in page.tsx now, which both helps SEO/initial load and means section
 * DOM nodes (#about, #stack, ...) always exist immediately, instead of only
 * appearing once `isLoading` flips false. That gap was the root cause of navbar
 * links sometimes "defaulting to the hero" — a hash-scroll could fire before its
 * target existed in the DOM at all.
 */
export function HeroIntro() {
    const [isLoading, setIsLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const hasLoaded = sessionStorage.getItem('portfolioLoaded');
        if (hasLoaded) {
            setIsLoading(false);
            setIsExiting(true);
        }
    }, []);

    const handleLoadingComplete = () => {
        setIsLoading(false);
        sessionStorage.setItem('portfolioLoaded', 'true');
    };

    const handleExitStart = () => setIsExiting(true);

    return (
        <>
            {isLoading && (
                <LoadingScreen onComplete={handleLoadingComplete} onExitStart={handleExitStart} duration={2200} />
            )}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.8 } }}
                className="relative overflow-x-clip"
            >
                <Hero isExiting={isExiting || !isLoading} />
            </motion.div>
        </>
    );
}
