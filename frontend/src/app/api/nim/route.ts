import { NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/chatbotContext';

/** Read exclusively from env — never hardcode a backend URL in source. */
const BASE_URL = process.env.NIM_API_URL?.trim();
const NIM_ENDPOINT = BASE_URL ? `${BASE_URL}/api/nim` : '';

interface NimMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const dynamic = 'force-dynamic';

/**
 * Proxies to the real backend's /api/nim endpoint.
 *
 * Important: that backend holds its own NIM_API_KEY server-side — per its docs,
 * it returns 500 "NIM_API_KEY is not configured on the server" if ITS key is
 * missing, and never asks callers for one. So this route sends no Authorization
 * header at all; it's not part of the documented contract.
 *
 * Only `messages` is required from our client. We prepend a system prompt built
 * from the live portfolio data (src/lib/chatbotContext.ts) so the model has real
 * facts to answer from, then forward everything else (model/temperature/
 * max_tokens/stream) as given, defaulting `stream` to true for a faster-feeling
 * reply if the client didn't specify it.
 */
export async function POST(req: Request) {
    let body: { messages?: NimMessage[]; model?: string; temperature?: number; max_tokens?: number; stream?: boolean };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "A 'messages' array is required." }, { status: 400 });
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        return NextResponse.json({ error: "A 'messages' array is required." }, { status: 400 });
    }

    const hasSystemMessage = body.messages.some((m) => m.role === 'system');
    const messages = hasSystemMessage ? body.messages : [{ role: 'system' as const, content: buildSystemPrompt() }, ...body.messages];

    const wantsStream = body.stream ?? true;

    if (!BASE_URL) {
        return createFallbackResponse(wantsStream);
    }

    const payload = {
        messages,
        ...(body.model && { model: body.model }),
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 1024,
        stream: wantsStream,
    };

    let upstream: Response;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);

        upstream = await fetch(NIM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
            cache: 'no-store',
        });
        clearTimeout(timeout);
    } catch (err: unknown) {
        return createFallbackResponse(wantsStream);
    }

    if (!upstream.ok) {
        // Relay the backend's own error shape ({ error, details? }) where possible.
        let errBody: { error?: string; details?: string } | null = null;
        try {
            errBody = await upstream.json();
        } catch {
            /* upstream didn't return JSON */
        }
        return createFallbackResponse(wantsStream);
    }

    if (wantsStream && upstream.body) {
        // Pass the SSE stream straight through to the client.
        return new Response(upstream.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
            },
        });
    }

    // Non-streaming: relay the full OpenAI-shaped completion as-is.
    const data = await upstream.json();
    return NextResponse.json(data);
}

function createFallbackResponse(stream: boolean) {
    const fallbackMessage = "I'm currently offline and can't reach my AI backend right now. Please explore the portfolio or use the contact form to reach out to Nandu directly!";
    
    if (stream) {
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: fallbackMessage } }] })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            }
        });
        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
            },
        });
    }
    
    return NextResponse.json({
        choices: [{ message: { content: fallbackMessage } }]
    });
}
