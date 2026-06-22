'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, AlertCircle, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatbot, ChatMessage } from '@/hooks/useChatbot';

const SUGGESTED_QUESTIONS = [
    'What projects has Nandu built?',
    "What's Nandu's tech stack?",
    'How can I get in touch?',
    'What certifications does Nandu have?',
];

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
    const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((t) => t.length > 0);
    return tokens.map((t, i) => {
        if (t.startsWith('**') && t.endsWith('**') && t.length > 4) {
            return <strong key={`${keyPrefix}-${i}`} className="font-bold">{t.slice(2, -2)}</strong>;
        }
        if (t.startsWith('`') && t.endsWith('`') && t.length > 2) {
            return (
                <code key={`${keyPrefix}-${i}`} className="px-1 py-0.5 rounded bg-foreground/10 text-[0.85em] font-mono">
                    {t.slice(1, -1)}
                </code>
            );
        }
        return <React.Fragment key={`${keyPrefix}-${i}`}>{t}</React.Fragment>;
    });
}

type Block = { type: 'ol' | 'ul' | 'p'; lines: string[] };

function groupBlocks(text: string): Block[] {
    const blocks: Block[] = [];

    for (const line of text.split('\n')) {
        if (line.trim() === '') continue; // blank lines just become spacing via space-y on the wrapper

        const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
        const unordered = line.match(/^\s*[-*•]\s+(.*)$/);
        const last = blocks[blocks.length - 1];

        if (ordered) {
            if (last?.type === 'ol') last.lines.push(ordered[1]);
            else blocks.push({ type: 'ol', lines: [ordered[1]] });
        } else if (unordered) {
            if (last?.type === 'ul') last.lines.push(unordered[1]);
            else blocks.push({ type: 'ul', lines: [unordered[1]] });
        } else {
            if (last?.type === 'p') last.lines.push(line);
            else blocks.push({ type: 'p', lines: [line] });
        }
    }

    return blocks;
}

function SimpleMarkdown({ text }: { text: string }) {
    const blocks = groupBlocks(text);

    return (
        <div className="space-y-2">
            {blocks.map((block, i) => {
                if (block.type === 'ol') {
                    return (
                        <ol key={i} className="list-decimal list-outside ml-4 space-y-1">
                            {block.lines.map((line, j) => (
                                <li key={j} className="text-sm leading-relaxed pl-0.5">
                                    {parseInline(line, `${i}-${j}`)}
                                </li>
                            ))}
                        </ol>
                    );
                }
                if (block.type === 'ul') {
                    return (
                        <ul key={i} className="list-disc list-outside ml-4 space-y-1">
                            {block.lines.map((line, j) => (
                                <li key={j} className="text-sm leading-relaxed pl-0.5">
                                    {parseInline(line, `${i}-${j}`)}
                                </li>
                            ))}
                        </ul>
                    );
                }
                return (
                    <p key={i} className="text-sm leading-relaxed">
                        {block.lines.map((line, j) => (
                            <React.Fragment key={j}>
                                {j > 0 && <br />}
                                {parseInline(line, `${i}-${j}`)}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex gap-1 items-center h-3 py-1">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-foreground/40"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

const MessageBubble = React.memo(function MessageBubble({ message, onRetry }: { message: ChatMessage; onRetry?: () => void }) {
    const isUser = message.role === 'user';
    const isEmptyStreaming = message.streaming && message.content === '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn('flex gap-2.5 w-full', isUser ? 'flex-row-reverse' : 'flex-row')}
        >
            <div
                className={cn(
                    'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5',
                    isUser ? 'bg-primary/20 border border-primary/30' : 'bg-foreground/10 border border-foreground/10'
                )}
            >
                {isUser ? <User className="w-3.5 h-3.5 text-primary" /> : <Bot className="w-3.5 h-3.5 text-foreground/70" />}
            </div>

            <div className={cn('flex flex-col gap-1 max-w-[82%]', isUser ? 'items-end' : 'items-start')}>
                <div
                    className={cn(
                        'px-3.5 py-2.5 rounded-2xl break-words',
                        isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : message.error
                            ? 'bg-red-500/10 border border-red-500/20 text-red-500 rounded-tl-sm'
                            : 'bg-foreground/8 border border-foreground/8 text-foreground rounded-tl-sm'
                    )}
                >
                    {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : message.error ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <p className="text-sm">{message.content}</p>
                            </div>
                            {onRetry && (
                                <button onClick={onRetry} className="flex items-center gap-1 text-xs underline underline-offset-2 hover:opacity-80 w-fit">
                                    <RotateCcw className="w-3 h-3" /> Retry
                                </button>
                            )}
                        </div>
                    ) : isEmptyStreaming ? (
                        <TypingDots />
                    ) : (
                        <span className="inline">
                            <SimpleMarkdown text={message.content} />
                            {message.streaming && (
                                <motion.span
                                    className="inline-block w-1.5 h-3.5 bg-foreground/50 ml-0.5 align-middle"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity }}
                                />
                            )}
                        </span>
                    )}
                </div>
                <span className="text-[10px] text-foreground/40 px-1">{formatTime(message.timestamp)}</span>
            </div>
        </motion.div>
    );
});

function ChatWindow({
    onClose,
    messages,
    isLoading,
    sendMessage,
    retry,
    clearHistory,
}: {
    onClose: () => void;
    messages: ChatMessage[];
    isLoading: boolean;
    sendMessage: (text: string) => void;
    retry: () => void;
    clearHistory: () => void;
}) {
    const [input, setInput] = useState('');
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const pinnedToBottomRef = useRef(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Instant (non-smooth) scroll for the high-frequency case — called on every
    // streamed chunk. Smooth scrollIntoView fighting itself dozens of times a
    // second was the original "scrolling doesn't work" bug: each call cancelled
    // the previous animation, so the view never actually settled at the bottom.
    const scrollToBottomInstant = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, []);

    const scrollToBottomSmooth = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Auto-scroll only while the user is already at (or near) the bottom — if
    // they've scrolled up to read earlier messages, a streaming reply shouldn't
    // yank them back down.
    useEffect(() => {
        if (pinnedToBottomRef.current) scrollToBottomInstant();
    }, [messages, scrollToBottomInstant]);

    // Always jump to bottom right when the window opens.
    useEffect(() => {
        scrollToBottomInstant();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        pinnedToBottomRef.current = distanceFromBottom < 80;
        setShowScrollBtn(distanceFromBottom > 80);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSend = () => {
        pinnedToBottomRef.current = true;
        sendMessage(input);
        setInput('');
        requestAnimationFrame(scrollToBottomSmooth);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    const showSuggestions = messages.length <= 1;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="fixed z-50 flex flex-col bottom-0 right-0 w-full sm:bottom-24 sm:right-4 md:right-8 sm:w-[380px] h-[85vh] sm:h-[520px] max-h-[85vh] sm:max-h-[80vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-clip bg-background border border-border backdrop-blur-xl max-w-full sm:max-w-[420px]"
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-foreground/[0.03] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-none">Portfolio Assistant</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Ask me anything</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={clearHistory}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Clear chat history"
                        title="Clear chat history"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Close chat">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div ref={scrollContainerRef} onScroll={handleScroll} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-3.5 py-4 space-y-4">
                {messages.map((msg, idx) => (
                    <MessageBubble key={msg.id} message={msg} onRetry={msg.error && idx === messages.length - 1 ? retry : undefined} />
                ))}

                <AnimatePresence>
                    {showSuggestions && !isLoading && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="flex flex-wrap gap-2 pt-1">
                            {SUGGESTED_QUESTIONS.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => {
                                        pinnedToBottomRef.current = true;
                                        sendMessage(q);
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-full border bg-foreground/5 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-foreground active:scale-95 transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            <AnimatePresence>
                {showScrollBtn && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => {
                            pinnedToBottomRef.current = true;
                            scrollToBottomSmooth();
                        }}
                        className="absolute right-3 bottom-20 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-background border border-border shadow-md text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Scroll to latest message"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </AnimatePresence>

            <div className="flex-shrink-0 px-3.5 py-3 border-t border-border bg-foreground/[0.02]">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder="Ask me anything..."
                        aria-label="Chat message"
                        rows={1}
                        className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm bg-foreground/5 border border-border placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:border-primary/40 transition-colors disabled:opacity-50 min-h-[40px] max-h-[120px] leading-relaxed"
                        style={{ height: '40px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                        aria-label="Send message"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center">Press Enter to send, Shift+Enter for a new line</p>
            </div>
        </motion.div>
    );
}

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, isLoading, sendMessage, retry, clearHistory } = useChatbot();
    const toggle = useCallback(() => setIsOpen((p) => !p), []);
    const close = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && isOpen && close();
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, close]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <ChatWindow
                        onClose={close}
                        messages={messages}
                        isLoading={isLoading}
                        sendMessage={sendMessage}
                        retry={retry}
                        clearHistory={clearHistory}
                    />
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    'fixed bottom-6 right-4 md:right-8 z-50 p-3.5 rounded-full shadow-glass transition-all group border border-border',
                    isOpen ? 'bg-primary/20 border-primary/40' : 'bg-background hover:bg-secondary'
                )}
                aria-label="Open portfolio chatbot"
                aria-expanded={isOpen}
            >
                <MessageSquare className={cn('w-5 h-5 transition-colors', isOpen ? 'text-primary' : 'text-foreground/70 group-hover:text-foreground')} />
                {!isOpen && (
                    <motion.span
                        className="absolute inset-0 rounded-full border border-primary/30"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                )}
            </motion.button>
        </>
    );
}
