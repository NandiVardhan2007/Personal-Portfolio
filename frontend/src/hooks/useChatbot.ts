'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { portfolioData } from '@/data/portfolio';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    error?: boolean;
    streaming?: boolean;
}

const STORAGE_KEY = 'nandu-portfolio-chat-history';
const MAX_STORED_MESSAGES = 50;

function generateId(): string {
    return Math.random().toString(36).slice(2, 11);
}

function greeting(): ChatMessage {
    return {
        id: generateId(),
        role: 'assistant',
        content: `Hi! Ask me about ${portfolioData.personal.nickname}'s projects, tech stack, or achievements.`,
        timestamp: new Date(),
    };
}

function loadPersisted(): ChatMessage[] | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as (Omit<ChatMessage, 'timestamp'> & { timestamp: string })[];
        if (!Array.isArray(parsed) || parsed.length === 0) return null;
        return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp), streaming: false }));
    } catch {
        return null;
    }
}

function persist(messages: ChatMessage[]) {
    if (typeof window === 'undefined') return;
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
    } catch {
        // Storage full or unavailable (private browsing, etc.) — non-fatal, chat just won't persist.
    }
}

/**
 * Chat state + send/retry logic, talking to /api/nim (which proxies the real
 * backend at personal-portfolio-u9e1.onrender.com/api/nim).
 *
 * Two things this hook owns that the UI doesn't need to know about:
 *  - Persistence: history is saved to sessionStorage on every change and reloaded
 *    on mount, so closing/reopening the widget (or this tab) keeps the
 *    conversation. (Cleared when the tab/session ends — intentional, so a shared
 *    machine doesn't keep a stranger's chat forever.)
 *  - Typewriter reveal: raw SSE chunks land in a ref and a steady ~24ms ticker
 *    reveals characters from it, decoupled from how bursty the network chunks
 *    are. This is what makes replies look like smooth typing instead of chunky
 *    pops, even right after a slow cold-start burst of tokens.
 */
export function useChatbot() {
    const [messages, setMessages] = useState<ChatMessage[]>(() => loadPersisted() ?? [greeting()]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const rawTextRef = useRef('');
    const revealedRef = useRef(0);
    const streamDoneRef = useRef(false);
    const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        persist(messages);
    }, [messages]);

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
            if (revealTimerRef.current) clearInterval(revealTimerRef.current);
        };
    }, []);

    const setLastAssistantContent = useCallback((content: string, overrides?: Partial<ChatMessage>) => {
        setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'assistant') next[next.length - 1] = { ...last, content, ...overrides };
            return next;
        });
    }, []);

    const stopReveal = useCallback(() => {
        if (revealTimerRef.current) {
            clearInterval(revealTimerRef.current);
            revealTimerRef.current = null;
        }
    }, []);

    const startReveal = useCallback(() => {
        if (revealTimerRef.current) return;
        revealTimerRef.current = setInterval(() => {
            const target = rawTextRef.current.length;
            if (revealedRef.current < target) {
                const remaining = target - revealedRef.current;
                const step = remaining > 60 ? 5 : remaining > 16 ? 2 : 1;
                revealedRef.current = Math.min(target, revealedRef.current + step);
                setLastAssistantContent(rawTextRef.current.slice(0, revealedRef.current));
            } else if (streamDoneRef.current) {
                stopReveal();
                if (target === 0) {
                    setLastAssistantContent("I didn't get a response back — please try again.", { streaming: false, error: true });
                } else {
                    setLastAssistantContent(rawTextRef.current, { streaming: false });
                }
                setIsLoading(false);
            }
        }, 24);
    }, [setLastAssistantContent, stopReveal]);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;

            setLastUserMessage(trimmed);

            const userMsg: ChatMessage = { id: generateId(), role: 'user', content: trimmed, timestamp: new Date() };
            const placeholder: ChatMessage = { id: generateId(), role: 'assistant', content: '', timestamp: new Date(), streaming: true };

            const apiMessages = [...messages, userMsg].filter((m) => !m.error).map(({ role, content }) => ({ role, content }));

            rawTextRef.current = '';
            revealedRef.current = 0;
            streamDoneRef.current = false;

            setMessages((prev) => [...prev, userMsg, placeholder]);
            setIsLoading(true);

            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            try {
                const res = await fetch('/api/nim', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: apiMessages, stream: true }),
                    signal: abortControllerRef.current.signal,
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => null);
                    throw new Error(errData?.error || errData?.details || 'Something went wrong — please try again.');
                }

                if (!res.body) throw new Error('No response stream from server.');

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';

                    for (const rawLine of lines) {
                        const line = rawLine.trim();
                        if (!line || !line.startsWith('data:')) continue;
                        const jsonStr = line.slice(5).trim();
                        if (jsonStr === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            const content = parsed?.choices?.[0]?.delta?.content;
                            if (content) {
                                rawTextRef.current += content;
                                startReveal();
                            }
                        } catch {
                            // Skip unparseable SSE lines rather than failing the whole stream.
                        }
                    }
                }

                streamDoneRef.current = true;
                startReveal(); // ensure the ticker is running so it can finalize even if no startReveal() ran yet (e.g. empty reply)
            } catch (err: unknown) {
                stopReveal();
                if (err instanceof Error && err.name === 'AbortError') return;
                const errorMsg = err instanceof Error ? err.message : 'Unknown error.';
                setLastAssistantContent(errorMsg, { streaming: false, error: true });
                setIsLoading(false);
            }
        },
        [messages, isLoading, startReveal, stopReveal, setLastAssistantContent]
    );

    const retry = useCallback(() => {
        if (!lastUserMessage) return;
        setMessages((prev) => {
            const last = prev[prev.length - 1];
            const secondLast = prev[prev.length - 2];
            if (last?.error && secondLast?.role === 'user') return prev.slice(0, -2);
            if (last?.error) return prev.slice(0, -1);
            return prev;
        });
        sendMessage(lastUserMessage);
    }, [lastUserMessage, sendMessage]);

    const clearHistory = useCallback(() => {
        const fresh = [greeting()];
        setMessages(fresh);
        persist(fresh);
    }, []);

    return { messages, isLoading, sendMessage, retry, clearHistory };
}
