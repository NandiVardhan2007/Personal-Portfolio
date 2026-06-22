'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import GitHubCalendar from 'react-github-calendar';
import { Github, Loader2, AlertTriangle, Flame } from 'lucide-react';
import { SiLeetcode, SiCodechef, SiHackerrank, SiGeeksforgeeks } from 'react-icons/si';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Counter } from '@/components/ui/Counter';
import { cn } from '@/lib/utils';

type StatValue = string | number | undefined | null;

interface LeetCodeStats {
    total_solved?: number;
    easy?: number;
    medium?: number;
    hard?: number;
    contest_rating?: number;
    streak?: number;
}

interface CodeChefStats {
    rating?: string;
    stars?: string;
    total_problems_solved?: string;
    global_rank?: string;
    country_rank?: string;
}

interface HackerRankBadge {
    name: string;
    stars: number;
}

interface HackerRankStats {
    followers?: number;
    country?: string;
    level?: string;
    total_solved?: number;
    badges?: HackerRankBadge[];
}

interface GfgStats {
    coding_score?: string;
    total_solved?: string;
    institute_rank?: string;
    streak?: string;
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

function useApi<T>(url: string): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({ loading: true, error: null, data: null });

    useEffect(() => {
        let active = true;
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
    }, [url]);

    return state;
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

function HeadlineStat({ label, value }: { label: string; value: StatValue }) {
    if (value === undefined || value === null || value === '' || value === 'N/A') return null;
    return (
        <div>
            <div className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                {typeof value === 'number' ? <Counter value={value} duration={1.4} /> : value}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">{label}</p>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: StatValue }) {
    if (value === undefined || value === null || value === '' || value === 'N/A') return null;
    return (
        <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground/80">{value}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</span>
        </div>
    );
}

function PlatformCard({
    id,
    icon,
    name,
    headline,
    headlineLabel,
    rest,
    loading,
    error,
}: {
    id: keyof typeof PLATFORM_STYLES;
    icon: React.ReactNode;
    name: string;
    headline?: StatValue;
    headlineLabel?: string;
    rest: { label: string; value: StatValue }[];
    loading: boolean;
    error: boolean;
}) {
    const style = PLATFORM_STYLES[id];

    return (
        <div className={cn('glass-card p-7 transition-colors border border-transparent', style.ring)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', style.bg, style.accent)}>
                        {icon}
                    </div>
                    <span className="font-bold text-foreground">{name}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono py-4">
                    <Loader2 size={13} className="animate-spin" /> Syncing...
                </div>
            ) : error ? (
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono py-4">
                    <AlertTriangle size={13} /> Live data unavailable
                </div>
            ) : (
                <>
                    {headline !== undefined && <HeadlineStat label={headlineLabel ?? ''} value={headline} />}
                    {rest.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                            {rest.map((s) => <MiniStat key={s.label} {...s} />)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
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
                <div className="flex flex-wrap items-end justify-between gap-8 mb-16">
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
                        username="NandiVardhan2007"
                        colorScheme={resolvedTheme === 'light' ? 'light' : 'dark'}
                        fontSize={12}
                        blockSize={10}
                    />
                </Reveal>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PlatformCard
                        id="github"
                        icon={<Github size={18} />}
                        name="GitHub"
                        headline={github.data?.publicRepos}
                        headlineLabel="Public Repos"
                        rest={[
                            { label: 'Followers', value: github.data?.followers ?? undefined },
                            { label: 'Contrib / yr', value: github.data?.contributionsLastYear ?? undefined },
                            { label: 'Stars', value: github.data?.totalStars ?? undefined },
                        ]}
                        loading={github.loading}
                        error={!!github.error}
                    />

                    <PlatformCard
                        id="leetcode"
                        icon={<SiLeetcode size={18} />}
                        name="LeetCode"
                        headline={lc?.total_solved}
                        headlineLabel="Problems Solved"
                        rest={[
                            { label: 'Rating', value: lc?.contest_rating },
                            { label: 'Streak', value: lc?.streak },
                            { label: 'Hard', value: lc?.hard },
                        ]}
                        loading={coding.loading}
                        error={!!coding.error || !lc}
                    />

                    <PlatformCard
                        id="codechef"
                        icon={<SiCodechef size={18} />}
                        name="CodeChef"
                        headline={cc?.rating}
                        headlineLabel={`Rating · ${cc?.stars ?? ''}`}
                        rest={[
                            { label: 'Solved', value: cc?.total_problems_solved },
                            { label: 'Global Rank', value: cc?.global_rank },
                            { label: 'Country Rank', value: cc?.country_rank },
                        ]}
                        loading={coding.loading}
                        error={!!coding.error || !cc}
                    />

                    <PlatformCard
                        id="hackerrank"
                        icon={<SiHackerrank size={18} />}
                        name="HackerRank"
                        headline={hr?.total_solved ?? (hr?.badges?.[0] ? `${hr.badges[0].stars}★` : undefined)}
                        headlineLabel={hr?.total_solved ? 'Problems Solved' : hr?.badges?.[0]?.name ?? 'Badge'}
                        rest={[
                            { label: 'Followers', value: hr?.followers },
                            { label: 'Country', value: hr?.country },
                            { label: 'Level', value: hr?.level !== 'N/A' ? hr?.level : undefined },
                        ]}
                        loading={coding.loading}
                        error={!!coding.error || !hr}
                    />

                    <PlatformCard
                        id="gfg"
                        icon={<SiGeeksforgeeks size={18} />}
                        name="GeeksforGeeks"
                        headline={gfg?.total_solved}
                        headlineLabel="Problems Solved"
                        rest={[
                            { label: 'Score', value: gfg?.coding_score },
                            { label: 'Inst. Rank', value: gfg?.institute_rank },
                            { label: 'Streak', value: gfg?.streak },
                        ]}
                        loading={coding.loading}
                        error={!!coding.error || !gfg}
                    />
                </div>
            </div>
        </section>
    );
}
