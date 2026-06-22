import { NextResponse } from 'next/server';

const DEFAULT_BACKEND_URL = 'https://personal-portfolio-u9e1.onrender.com';

function toOrigin(value: string | undefined) {
    if (!value?.trim()) return null;
    try {
        return new URL(value.trim()).origin;
    } catch {
        return null;
    }
}

function getBackendBaseUrl(...values: Array<string | undefined>) {
    const frontendOrigin = toOrigin(process.env.NEXT_PUBLIC_SITE_URL);

    for (const value of values) {
        const origin = toOrigin(value);
        if (origin && origin !== frontendOrigin) return origin;
    }

    return DEFAULT_BACKEND_URL;
}

const BASE_URL = getBackendBaseUrl(process.env.CONTACT_API_URL, process.env.NIM_API_URL);
const CONTACT_ENDPOINT = `${BASE_URL}/api/contact`;

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

        // Relay the backend's own status code and shape (200 success / 207 partial / 400 validation).
        return NextResponse.json(data, { status: upstream.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error reaching the contact backend.';
        return NextResponse.json({ error: message }, { status: 502 });
    }
}
