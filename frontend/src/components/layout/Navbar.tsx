'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

function Clock() {
    const [time, setTime] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const update = () => {
            const now = new Date();
            let hours = now.getHours();
            const period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const h = String(hours).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            setTime(`${h}:${m}:${s} ${period}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return <span className="font-mono text-sm font-black opacity-0">00:00:00 AM</span>;

    return (
        <span className="font-mono text-sm font-black text-gradient tracking-widest hover:tracking-[0.2em] transition-all duration-300">
            {time}
        </span>
    );
}

const HOME_SECTIONS = [
    { label: 'About', href: '/#about' },
    { label: 'Stats', href: '/#stats' },
    { label: 'Stack', href: '/#stack' },
    { label: 'Projects', href: '/projects' },
    { label: 'Achievements', href: '/achievements' },
    { label: 'Coding', href: '/#coding-stats' },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { scrollY } = useScroll();

    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        if (isMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (isMenuOpen) return;
        const direction = latest > lastScrollY ? 'down' : 'up';
        setIsScrolled(latest > 50);
        setIsVisible(!(direction === 'down' && latest > 100));
        setLastScrollY(latest);
    });

    const toggleMenu = useCallback(() => setIsMenuOpen((p) => !p), []);

    // Section links (/#about etc.) need explicit handling: Next.js's Link only
    // auto-scrolls to a hash on actual navigation, which is unreliable when
    // we're already on "/" (no navigation happens, so nothing tells it to
    // scroll — this was the root cause of links "defaulting to the hero").
    const handleSectionClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
            const hash = href.split('#')[1];
            if (!hash) return;

            if (pathname === '/') {
                e.preventDefault();
                document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
                window.history.replaceState(null, '', href);
            } else {
                // Navigating from another page: let the router go to "/", then
                // scroll once the target section actually exists in the DOM.
                e.preventDefault();
                router.push(href);
                let attempts = 0;
                const tryScroll = () => {
                    const el = document.getElementById(hash);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                    } else if (attempts < 20) {
                        attempts += 1;
                        setTimeout(tryScroll, 100);
                    }
                };
                setTimeout(tryScroll, 100);
            }
            setIsMenuOpen(false);
        },
        [pathname, router]
    );

    return (
        <motion.header
            animate={{ y: isVisible ? 0 : -100 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                'fixed top-0 inset-x-0 z-50 transition-colors duration-500',
                isScrolled ? 'bg-background/80 backdrop-blur-2xl border-b border-border' : 'bg-transparent'
            )}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight text-foreground">Nandu.</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {HOME_SECTIONS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            onClick={l.href.includes('#') ? (e) => handleSectionClick(e, l.href) : undefined}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {l.label}
                        </Link>
                    ))}
                    <Link
                        href="/contact"
                        className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                        Contact
                    </Link>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Clock />
                    <AnimatedThemeToggler />
                </div>

                <div className="md:hidden flex items-center gap-2">
                    <Link
                        href="/contact"
                        className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-border text-foreground"
                    >
                        Contact
                    </Link>
                    <AnimatedThemeToggler />
                    <button onClick={toggleMenu} aria-label="Toggle menu" className="text-foreground">
                        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden overflow-hidden bg-background border-b border-border"
                    >
                        <div className="flex flex-col px-6 py-4 gap-4">
                            {HOME_SECTIONS.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={l.href.includes('#') ? (e) => handleSectionClick(e, l.href) : () => setIsMenuOpen(false)}
                                    className="text-sm font-bold uppercase tracking-widest text-muted-foreground"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
