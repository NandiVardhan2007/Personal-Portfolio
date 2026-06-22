import localFont from 'next/font/local';

// Self-hosted via next/font/local rather than next/font/google for two reasons:
//  1. next/font/google fetches from Google's servers at build time — this repo
//     builds fine without any internet access at all this way.
//  2. We already ship @fontsource's font files as a dependency; reusing them
//     here avoids a second copy while still getting next/font's automatic
//     font-display: swap + preload (the actual fix for the FOIT issue raised
//     in review — the previous plain-CSS @import approach didn't have that).
export const inter = localFont({
    src: [
        { path: '../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
        { path: '../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
        { path: '../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
        { path: '../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
        { path: '../../node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2', weight: '800', style: 'normal' },
        { path: '../../node_modules/@fontsource/inter/files/inter-latin-900-normal.woff2', weight: '900', style: 'normal' },
    ],
    variable: '--font-inter',
    display: 'swap',
});

export const jetbrainsMono = localFont({
    src: [
        { path: '../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
        { path: '../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
        { path: '../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2', weight: '700', style: 'normal' },
    ],
    variable: '--font-jetbrains',
    display: 'swap',
});
