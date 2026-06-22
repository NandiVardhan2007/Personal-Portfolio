import { NextResponse } from 'next/server';

const GITHUB_USERNAME = 'NandiVardhan2007';
const TOKEN = process.env.GITHUB_TOKEN;

export const dynamic = 'force-dynamic';

interface GitHubStatsResult {
    followers: number | null;
    publicRepos: number;
    totalStars: number | null;
    contributionsLastYear: number | null;
    commits: number | null;
    pullRequests: number | null;
    source: 'graphql' | 'rest';
}

interface GraphQLRepoNode {
    stargazerCount: number;
}

interface GraphQLResponse {
    errors?: { message: string }[];
    data?: {
        user: {
            followers: { totalCount: number };
            repositories: { totalCount: number; nodes: GraphQLRepoNode[] };
            contributionsCollection: {
                contributionCalendar: { totalContributions: number };
                totalCommitContributions: number;
                totalPullRequestContributions: number;
            };
        };
    };
}

interface GitHubUserResponse {
    followers: number;
    public_repos: number;
}

async function fetchWithToken(): Promise<GitHubStatsResult> {
    const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
        followers { totalCount }
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
          totalCount
          nodes { stargazerCount }
        }
        contributionsCollection {
          contributionCalendar { totalContributions }
          totalCommitContributions
          totalPullRequestContributions
        }
      }
    }`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': `${GITHUB_USERNAME}-portfolio`,
        },
        body: JSON.stringify({ query }),
        cache: 'no-store',
        signal: controller.signal,
    });
    clearTimeout(timeout);

    const json: GraphQLResponse = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);
    if (!json.data) throw new Error('GraphQL response missing data.');

    const u = json.data.user;
    const stars = u.repositories.nodes.reduce((sum: number, r: GraphQLRepoNode) => sum + r.stargazerCount, 0);

    return {
        followers: u.followers.totalCount,
        publicRepos: u.repositories.totalCount,
        totalStars: stars,
        contributionsLastYear: u.contributionsCollection.contributionCalendar.totalContributions,
        commits: u.contributionsCollection.totalCommitContributions,
        pullRequests: u.contributionsCollection.totalPullRequestContributions,
        source: 'graphql',
    };
}

async function fetchPublic(): Promise<GitHubStatsResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        cache: 'no-store',
        headers: {
            'User-Agent': `${GITHUB_USERNAME}-portfolio`,
            Accept: 'application/vnd.github+json',
        },
        signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`GitHub user lookup failed (${res.status})`);
    const u: GitHubUserResponse = await res.json();

    return {
        followers: u.followers,
        publicRepos: u.public_repos,
        totalStars: null,
        contributionsLastYear: null,
        commits: null,
        pullRequests: null,
        source: 'rest',
    };
}

export async function GET() {
    try {
        const data = TOKEN ? await fetchWithToken() : await fetchPublic();
        return NextResponse.json({ ok: true, data });
    } catch {
        try {
            // Fall back to the public endpoint if the token-based call failed.
            const data = await fetchPublic();
            return NextResponse.json({ ok: true, data });
        } catch (fallbackErr: unknown) {
            const message = fallbackErr instanceof Error ? fallbackErr.message : 'Unable to reach GitHub';
            return NextResponse.json({ ok: false, error: message }, { status: 502 });
        }
    }
}
