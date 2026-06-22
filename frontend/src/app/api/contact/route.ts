import { NextResponse } from 'next/server';

/** Read exclusively from env — never hardcode a backend URL in source.
 *  Falls back to NIM_API_URL since they're typically the same backend. */
const BASE_URL = process.env.CONTACT_API_URL?.trim() || process.env.NIM_API_URL?.trim();
const CONTACT_ENDPOINT = BASE_URL ? `${BASE_URL}/api/contact` : '';

interface ContactPayload {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}

export const dynamic = 'force-dynamic';

/**
 * Proxies to the real backend's /api/contact, which (per its docs):
 *   1. Drafts a personalized AI auto-reply via NIM
 *   2. Emails that reply to the visitor via Brevo
 *   3. Emails a notification to Nandu
 * and returns one of:
 *   200 { status: "success", message }
 *   207 { status: "partial", message, warnings: string[] }
 *   400 { error }
 * We relay that shape straight through rather than reinventing it.
 */
export async function POST(req: Request) {
    if (!BASE_URL) {
        return NextResponse.json(
            { error: 'Service Unavailable: CONTACT_API_URL environment variable is not configured.' },
            { status: 503 }
        );
    }

    let body: ContactPayload;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "'name', 'email', and 'message' are required." }, { status: 400 });
    }

    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
        return NextResponse.json({ error: "'name', 'email', and 'message' are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);

        const upstream = await fetch(CONTACT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: body.name,
                email: body.email,
                subject: body.subject?.trim() || 'Contact Form Submission',
                message: body.message,
            }),
            signal: controller.signal,
            cache: 'no-store',
        });
        clearTimeout(timeout);

        const upstreamText = await upstream.text();
        let data: Record<string, unknown> | null = null;
        try {
            data = upstreamText ? JSON.parse(upstreamText) as Record<string, unknown> : null;
        } catch {
            const message = upstreamText.trim() || upstream.statusText || 'Unknown upstream response';
            return NextResponse.json(
                { error: `Contact backend returned ${upstream.status}: ${message}` },
                { status: upstream.ok ? 502 : upstream.status }
            );
        }

        if (!data) {
            return NextResponse.json({ error: 'Backend returned an unexpected response.' }, { status: 502 });
        }

        const headers = new Headers();
        ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset'].forEach((h) => {
            if (upstream.headers.has(h)) headers.set(h, upstream.headers.get(h)!);
        });

        // Relay the backend's own status code and shape (200 success / 207 partial / 400 validation).
        return NextResponse.json(data, { status: upstream.status, headers });
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
            return NextResponse.json({ error: 'The backend took too long to respond. Please try again.' }, { status: 504 });
        }
        return NextResponse.json({ error: 'Network error reaching the backend. Please try again later.' }, { status: 502 });
    }
}
