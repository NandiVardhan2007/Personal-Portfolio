import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
import { ThemeAwareClickSpark } from '@/components/ui/ThemeAwareClickSpark';
import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('@/components/layout/ChatBot').then((mod) => mod.ChatBot), { ssr: false });
const ConsoleEasterEgg = dynamic(() => import('@/components/layout/ConsoleEasterEgg').then((mod) => mod.ConsoleEasterEgg), { ssr: false });
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { portfolioData } from '@/data/portfolio';
import { inter, jetbrainsMono } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const { personal } = portfolioData;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: `${personal.name} — Portfolio`,
    description: personal.subtitle,
    openGraph: {
        title: `${personal.name} — Portfolio`,
        description: personal.subtitle,
        url: siteUrl,
        siteName: `${personal.nickname}'s Portfolio`,
        images: [personal.avatar],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: `${personal.name} — Portfolio`,
        description: personal.subtitle,
        images: [personal.avatar],
    },
};

const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personal.name,
    alternateName: personal.nickname,
    jobTitle: personal.title,
    description: personal.bio,
    email: personal.email,
    address: { '@type': 'PostalAddress', addressLocality: personal.location },
    url: siteUrl,
    sameAs: personal.socialLinks.map((s) => s.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
                />
            </head>
            <body className={cn(inter.variable, jetbrainsMono.variable, 'font-sans')}>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-primary text-primary-foreground font-bold rounded-md transition-transform duration-200">
                    Skip to content
                </a>
                <ThemeProvider>
                    <SmoothScrollProvider>
                        <ThemeAwareClickSpark>
                            <ConsoleEasterEgg />
                            <Navbar />
                            <main id="main-content">{children}</main>
                            <Footer />
                            <ErrorBoundary>
                                <ChatBot />
                            </ErrorBoundary>
                        </ThemeAwareClickSpark>
                    </SmoothScrollProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
