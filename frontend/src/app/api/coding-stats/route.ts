import { NextResponse } from 'next/server';

const BASE_URL = process.env.CODING_STATS_API_URL || 'https://personal-portfolio-u9e1.onrender.com';

export const dynamic = 'force-dynamic';

/**
 * Identify a platform's data block by the fields it actually contains, rather than
 * trusting whatever key the backend nested it under. This guards against the
 * HackerRank/GeeksforGeeks fields showing up swapped — if the upstream `/api/stats`
 * response ever puts GFG-shaped data under the "hackerrank" key (or vice versa), the
 * UI still lands on the right card.
 *
 * I couldn't reach personal-portfolio-u9e1.onrender.com from the sandbox this was built in (it's
 * not on the egress allowlist), so this is a defensive best-guess rather than a fix
 * verified against your live response. If stats still look wrong after this, send me
 * the raw JSON from /api/stats and I'll match the exact field names precisely.
 */
type PlatformBlock = Record<string, unknown> | null | undefined;
type Platform = 'leetcode' | 'codechef' | 'hackerrank' | 'gfg';

function identifyPlatform(block: unknown): Platform | null {
    if (!block || typeof block !== 'object') return null;
    const b = block as Record<string, unknown>;
    if ('problems_by_difficulty' in b || 'coding_score' in b || 'institute_rank' in b) return 'gfg';
    if ('badges' in b || 'school' in b || 'level' in b) return 'hackerrank';
    if ('highest_rating' in b || 'global_rank' in b || 'country_rank' in b) return 'codechef';
    if ('contest_rating' in b || 'global_ranking' in b || ('easy' in b && 'medium' in b && 'hard' in b)) return 'leetcode';
    return null;
}

function normalize(raw: unknown): Record<Platform, PlatformBlock> | unknown {
    if (!raw || typeof raw !== 'object') return raw;
    const rawObj = raw as Record<string, unknown>;

    const out: Record<Platform, PlatformBlock> = { leetcode: null, codechef: null, hackerrank: null, gfg: null };
    const claimed = new Set<Platform>();

    // Pass 1 — identify each block by its actual shape.
    for (const key of Object.keys(rawObj)) {
        const identity = identifyPlatform(rawObj[key]);
        if (identity && !claimed.has(identity)) {
            out[identity] = rawObj[key] as PlatformBlock;
            claimed.add(identity);
        }
    }

    // Pass 2 — fall back to the backend's own key names for anything unidentified
    // (covers fields this function doesn't know about yet).
    (['leetcode', 'codechef', 'hackerrank', 'gfg'] as Platform[]).forEach((key) => {
        if (!out[key] && rawObj[key]) out[key] = rawObj[key] as PlatformBlock;
    });

    return out;
}

export async function GET() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`${BASE_URL}/api/stats`, {
            signal: controller.signal,
            cache: 'no-store',
        });
        clearTimeout(timeout);

        if (!res.ok) {
            throw new Error(`Upstream responded with ${res.status}`);
        }

        const raw = await res.json();
        return NextResponse.json({ ok: true, data: normalize(raw) });
    } catch (err: unknown) {
        // The backend may be cold-starting (Render free tier) or briefly unreachable —
        // surface a clear error instead of crashing the section.
        const message = err instanceof Error ? err.message : 'Unable to reach coding-stats backend';
        return NextResponse.json({ ok: false, error: message }, { status: 502 });
    }
}
