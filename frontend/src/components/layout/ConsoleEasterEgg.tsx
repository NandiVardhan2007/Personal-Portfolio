'use client';

import { useEffect } from 'react';

export function ConsoleEasterEgg() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const style1 = 'font-size: 60px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; color: transparent; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);';
        const style2 = 'font-size: 14px; font-weight: bold; color: #6b7280; padding-top: 10px;';
        const style3 = 'font-size: 14px; color: #8b5cf6; text-decoration: underline; padding-top: 10px;';

        console.log('%cNANDU', style1);
        console.log('%cWait, what are you doing here? You should be looking at the UI, not the console! 🚀', style2);
        console.log('%cIf you really want to see the code, go check out the repo:', style2);
        console.log('%chttps://github.com/NandiVardhan2007', style3);
    }, []);

    return null;
}
