'use client';

import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
}

/**
 * Isolates a subtree so it can't take the whole page down. Used around
 * <ChatBot /> — if the widget throws (a bad SSE chunk, a hook bug, whatever),
 * the rest of the site keeps working and we just silently drop the widget
 * rather than showing a broken UI or crashing the page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.error('Widget crashed, isolated by ErrorBoundary:', error);
    }

    render() {
        if (this.state.hasError) return this.props.fallback ?? null;
        return this.props.children;
    }
}
