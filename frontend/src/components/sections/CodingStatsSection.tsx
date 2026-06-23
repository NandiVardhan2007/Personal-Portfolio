'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const GitHubCalendar = dynamic(() => import('react-github-calendar'), {
    ssr: false,
    loading: () => <div className="w-full h-[150px] bg-foreground/5 rounded-lg animate-pulse" />
});
import { Github, Loader2, AlertTriangle, Flame, ExternalLink, RefreshCcw, Star } from 'lucide-react';
import { SiLeetcode, SiCodechef, SiHackerrank, SiGeeksforgeeks } from 'react-icons/si';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Counter } from '@/components/ui/Counter';
import { cn } from '@/lib/utils';
import { portfolioData } from '@/data/portfolio';

type StatValue = string | number | undefined | null;

interface LeetCodeStats {
    username?: string;
    total_solved?: number;
    easy?: number;
    medium?: number;
    hard?: number;
    ranking?: number | string;
    contest_rating?: number | string;
    contests_attended?: number;
    global_ranking?: number | string;
    streak?: number;
    total_active_days?: number;
}

interface CodeChefStats {
    username?: string;
    rating?: string;
    stars?: string;
    highest_rating?: string;
    total_problems_solved?: string;
    global_rank?: string;
    country_rank?: string;
    authenticated?: boolean;
}

interface HackerRankBadge {
    name: string;
    stars: number;
}

interface HackerRankStats {
    username?: string;
    name?: string;
    country?: string;
    level?: string;
    followers?: number;
    school?: string;
    badges?: HackerRankBadge[];
    total_solved?: number;
}

interface GfgStats {
    username?: string;
    coding_score?: string;
    total_solved?: string;
    institute_rank?: string;
    streak?: string;
    problems_by_difficulty?: Record<string, string>;
}

interface CodingStatsData {
    leetcode?: LeetCodeStats | null;
    codechef?: CodeChefStats | null;
    hackerrank?: HackerRankStats | null;
    gfg?: GfgStats | null;
}

interface GitHubStatsData {
    followers: number | null;
    publicRepos: number;
    totalStars: number | null;
    contributionsLastYear: number | null;
}

type FetchState<T> = { loading: boolean; error: string | null; data: T | null };

function useApi<T>(url: string): FetchState<T> & { retry: () => void } {
    const [state, setState] = useState<FetchState<T>>({ loading: true, error: null, data: null });
    const [trigger, setTrigger] = useState(0);

    useEffect(() => {
        let active = true;
        setState((s) => ({ ...s, loading: true, error: null }));
        fetch(url)
            .then((r) => r.json())
            .then((json: { ok: boolean; data?: T; error?: string }) => {
                if (!active) return;
                if (json.ok) setState({ loading: false, error: null, data: json.data ?? null });
                else setState({ loading: false, error: json.error || 'Unknown error', data: null });
            })
            .catch((e: unknown) => {
                if (!active) return;
                setState({ loading: false, error: e instanceof Error ? e.message : 'Request failed', data: null });
            });
        return () => {
            active = false;
        };
    }, [url, trigger]);

    return { ...state, retry: () => setTrigger((t) => t + 1) };
}

function toNumber(v: string | number | undefined | null): number {
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

const PLATFORM_STYLES: Record<string, { accent: string; bg: string; ring: string }> = {
    leetcode: { accent: 'text-amber-500', bg: 'bg-amber-500/10', ring: 'hover:border-amber-500/40' },
    codechef: { accent: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-700/10', ring: 'hover:border-amber-700/30' },
    hackerrank: { accent: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'hover:border-emerald-500/40' },
    gfg: { accent: 'text-green-600', bg: 'bg-green-600/10', ring: 'hover:border-green-600/40' },
    github: { accent: 'text-foreground', bg: 'bg-foreground/10', ring: 'hover:border-foreground/30' },
};

function HeadlineStat({ label, value, icon }: { label: string; value: StatValue; icon?: React.ReactNode }) {
    if (value === undefined || value === null || value === '' || value === 'N/A') return null;
    return (
        <div>
            <div className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-baseline gap-1">
                {typeof value === 'number' ? <Counter value={value} duration={1.4} /> : value}
                {icon && <span className="ml-1 text-2xl">{icon}</span>}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">{label}</p>
        </div>
    );
}

function MiniStat({ label, value, icon }: { label: string; value: StatValue; icon?: React.ReactNode }) {
    if (value === undefined || value === null || value === '' || value === 'N/A') return null;
    return (
        <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground/80 flex items-center gap-1">
                {value}
                {icon}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</span>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse flex flex-col gap-4 py-2">
            <div className="h-10 w-24 bg-foreground/10 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="h-8 bg-foreground/10 rounded"></div>
                <div className="h-8 bg-foreground/10 rounded"></div>
            </div>
        </div>
    );
}

function ErrorCard({ error, retry }: { error: string; retry?: () => void }) {
    return (
        <div className="flex flex-col gap-3 py-4">
            <div className="flex items-start gap-2 text-red-500/80 text-xs font-mono bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error || 'Live data unavailable'}</span>
            </div>
            {retry && (
                <button
                    onClick={retry}
                    className="flex items-center gap-1.5 text-xs font-medium bg-secondary text-foreground px-3 py-1.5 rounded-md hover:bg-foreground/10 transition-colors w-fit border border-border shadow-sm active:scale-95"
                >
                    <RefreshCcw size={12} /> Retry
                </button>
            )}
        </div>
    );
}

function PlatformCardWrapper({
    id,
    icon,
    name,
    link,
    loading,
    error,
    retry,
    children,
}: {
    id: keyof typeof PLATFORM_STYLES;
    icon: React.ReactNode;
    name: string;
    link?: string;
    loading: boolean;
    error: boolean;
    retry?: () => void;
    children: React.ReactNode;
}) {
    const style = PLATFORM_STYLES[id];

    return (
        <div className={cn('glass-card p-6 md:p-7 transition-all duration-300 border border-transparent hover:-translate-y-1 shadow-md hover:shadow-xl group flex flex-col', style.ring)}>
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110', style.bg, style.accent)}>
                        {icon}
                    </div>
                    <span className="font-bold text-foreground tracking-tight">{name}</span>
                </div>
                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        aria-label={`View ${name} profile`}
                    >
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-end">
                {loading ? <SkeletonCard /> : error ? <ErrorCard error="Live data unavailable" retry={retry} /> : children}
            </div>
        </div>
    );
}

function DifficultyBar({ easy, medium, hard, total }: { easy?: number; medium?: number; hard?: number; total?: number }) {
    if (!total || total === 0) return null;
    const e = toNumber(easy);
    const m = toNumber(medium);
    const h = toNumber(hard);
    const ep = (e / total) * 100;
    const mp = (m / total) * 100;
    const hp = (h / total) * 100;

    return (
        <div className="mt-5 space-y-2">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                <span className="text-emerald-500">Easy {e}</span>
                <span className="text-amber-500">Med {m}</span>
                <span className="text-red-500">Hard {h}</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full flex overflow-hidden">
                {ep > 0 && <div style={{ width: `${ep}%` }} className="bg-emerald-500 h-full"></div>}
                {mp > 0 && <div style={{ width: `${mp}%` }} className="bg-amber-500 h-full"></div>}
                {hp > 0 && <div style={{ width: `${hp}%` }} className="bg-red-500 h-full"></div>}
            </div>
        </div>
    );
}

function GfgDifficultyBar({ data, total }: { data?: Record<string, string>; total?: number }) {
    if (!data || !total || total === 0) return null;
    const easy = toNumber(data['Easy']) + toNumber(data['Basic']) + toNumber(data['School']);
    const medium = toNumber(data['Medium']);
    const hard = toNumber(data['Hard']);
    return <DifficultyBar easy={easy} medium={medium} hard={hard} total={total} />;
}

export function CodingStatsSection() {
    const coding = useApi<CodingStatsData>('/api/coding-stats');
    const github = useApi<GitHubStatsData>('/api/github-stats');
    const { resolvedTheme } = useTheme();

    const lc = coding.data?.leetcode;
    const cc = coding.data?.codechef;
    const hr = coding.data?.hackerrank;
    const gfg = coding.data?.gfg;

    const totalSolved = toNumber(lc?.total_solved) + toNumber(cc?.total_problems_solved) + toNumber(gfg?.total_solved);
    const aggregateReady = !coding.loading && !coding.error && Boolean(lc || cc || gfg);

    return (
        <section id="coding-stats" className="relative py-28 md:py-36 bg-secondary/30 border-t border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
                    <SectionHeading
                        eyebrow="Coding Statistics"
                        title="Pulled live, not pasted in."
                        description="Synced from GitHub and a self-hosted aggregator that tracks LeetCode, CodeChef, HackerRank, and GeeksforGeeks."
                        className="!mb-0"
                    />

                    {aggregateReady && totalSolved > 0 && (
                        <Reveal className="glass-card px-8 py-6 flex items-center gap-4">
                            <Flame className="text-amber-500" size={28} />
                            <div>
                                <div className="text-4xl font-black text-foreground">
                                    <Counter value={totalSolved} duration={1.6} suffix="+" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
                                    Problems Solved Across Platforms
                                </p>
                            </div>
                        </Reveal>
                    )}
                </div>

                <Reveal className="glass-card p-6 md:p-8 overflow-x-auto mb-8">
                    <div className="flex items-center gap-2 mb-5 text-foreground">
                        <Github size={16} />
                        <span className="eyebrow !text-foreground">GitHub Activity</span>
                    </div>
                    <GitHubCalendar
                        username={portfolioData.personal.socialLinks.find(s => s.platform === 'GitHub')?.username || "NandiVardhan2007"}
                        colorScheme={resolvedTheme === 'light' ? 'light' : 'dark'}
                        fontSize={12}
                        blockSize={10}
                    />
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <PlatformCardWrapper
                        id="github"
                        icon={<Github size={18} />}
                        name="GitHub"
                        link={portfolioData.personal.socialLinks.find(s => s.platform === 'GitHub')?.url}
                        loading={github.loading}
                        error={!!github.error}
                        retry={github.retry}
                    >
                        {github.data && (
                            <>
                                <HeadlineStat label="Public Repos" value={github.data.publicRepos} />
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                                    <MiniStat label="Followers" value={github.data.followers} />
                                    <MiniStat label="Contribs/yr" value={github.data.contributionsLastYear} />
                                    <MiniStat label="Stars" value={github.data.totalStars} />
                                </div>
                            </>
                        )}
                    </PlatformCardWrapper>

                    <PlatformCardWrapper
                        id="leetcode"
                        icon={<SiLeetcode size={18} />}
                        name="LeetCode"
                        link={lc?.username ? `https://leetcode.com/${lc.username}` : undefined}
                        loading={coding.loading}
                        error={!!coding.error || !lc}
                        retry={coding.retry}
                    >
                        {lc && (
                            <>
                                <HeadlineStat label="Problems Solved" value={lc.total_solved} />
                                <DifficultyBar easy={lc.easy} medium={lc.medium} hard={lc.hard} total={lc.total_solved} />
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                                    <MiniStat label="Contest" value={lc.contest_rating} />
                                    <MiniStat label="Streak" value={lc.streak} icon={lc.streak && lc.streak > 0 ? <Flame size={12} className="text-amber-500" /> : null} />
                                    <MiniStat label="Global Rank" value={lc.global_ranking} />
                                </div>
                            </>
                        )}
                    </PlatformCardWrapper>

                    <PlatformCardWrapper
                        id="codechef"
                        icon={<SiCodechef size={18} />}
                        name="CodeChef"
                        link={cc?.username ? `https://www.codechef.com/users/${cc.username}` : undefined}
                        loading={coding.loading}
                        error={!!coding.error || !cc}
                        retry={coding.retry}
                    >
                        {cc && (
                            <>
                                <HeadlineStat label={`Rating · ${cc.stars}`} value={cc.rating} icon={<Star size={16} className="text-amber-500 fill-amber-500" />} />
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                                    <MiniStat label="Solved" value={cc.total_problems_solved} />
                                    <MiniStat label="Global Rank" value={cc.global_rank} />
                                    <MiniStat label="Country Rank" value={cc.country_rank} />
                                </div>
                            </>
                        )}
                    </PlatformCardWrapper>

                    <PlatformCardWrapper
                        id="hackerrank"
                        icon={<SiHackerrank size={18} />}
                        name="HackerRank"
                        link={hr?.username ? `https://www.hackerrank.com/${hr.username}` : undefined}
                        loading={coding.loading}
                        error={!!coding.error || !hr}
                        retry={coding.retry}
                    >
                        {hr && (
                            <>
                                <HeadlineStat
                                    label={hr.total_solved ? 'Problems Solved' : hr.badges?.[0]?.name ?? 'Followers'}
                                    value={hr.total_solved ?? (hr.badges?.[0] ? `${hr.badges[0].stars}★` : hr.followers)}
                                />
                                {hr.badges && hr.badges.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {hr.badges.slice(0, 3).map((badge, i) => (
                                            <div key={i} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-foreground/5 px-2 py-1 rounded-full text-foreground/80 border border-border">
                                                <span>{badge.name}</span>
                                                <span className="text-emerald-500">{badge.stars}★</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                                    <MiniStat label="Level" value={hr.level !== 'N/A' ? hr.level : undefined} />
                                    <MiniStat label="Country" value={hr.country} />
                                    <MiniStat label="School" value={hr.school !== 'N/A' ? hr.school : undefined} />
                                </div>
                            </>
                        )}
                    </PlatformCardWrapper>

                    <PlatformCardWrapper
                        id="gfg"
                        icon={<SiGeeksforgeeks size={18} />}
                        name="GeeksforGeeks"
                        link={gfg?.username ? `https://auth.geeksforgeeks.org/user/${gfg.username}` : undefined}
                        loading={coding.loading}
                        error={!!coding.error || !gfg}
                        retry={coding.retry}
                    >
                        {gfg && (
                            <>
                                <HeadlineStat label="Problems Solved" value={gfg.total_solved} />
                                <GfgDifficultyBar data={gfg.problems_by_difficulty} total={toNumber(gfg.total_solved)} />
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                                    <MiniStat label="Score" value={gfg.coding_score} />
                                    <MiniStat label="Inst. Rank" value={gfg.institute_rank} />
                                    <MiniStat label="Streak" value={gfg.streak} icon={gfg.streak && toNumber(gfg.streak) > 0 ? <Flame size={12} className="text-green-600" /> : null} />
                                </div>
                            </>
                        )}
                    </PlatformCardWrapper>
                </div>
            </div>
        </section>
    );
}
