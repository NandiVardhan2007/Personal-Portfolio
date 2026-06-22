'use client';

import { useEffect } from 'react';

export function ConsoleEasterEgg() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const asciiArt = `
 ███╗   ██╗  █████╗  ███╗   ██╗██████╗  ██╗   ██╗
 ████╗  ██║ ██╔══██╗ ████╗  ██║██╔══██╗ ██║   ██║
 ██╔██╗ ██║ ███████║ ██╔██╗ ██║██║  ██║ ██║   ██║
 ██║╚██╗██║ ██╔══██║ ██║╚██╗██║██║  ██║ ██║   ██║
 ██║ ╚████║ ██║  ██║ ██║ ╚████║██████╔╝ ╚██████╔╝
 ╚═╝  ╚═══╝ ╚═╝  ╚═╝ ╚═╝  ╚═══╝╚═════╝   ╚═════╝ 
`;

        const style1 = 'font-family: monospace; font-size: 14px; font-weight: bold; color: #8b5cf6; text-shadow: 0px 0px 8px rgba(139, 92, 246, 0.4);';
        const style2 = 'font-family: sans-serif; font-size: 14px; font-weight: bold; color: #6b7280; padding-top: 10px;';
        const style3 = 'font-family: sans-serif; font-size: 14px; color: #8b5cf6; text-decoration: underline; padding-top: 10px;';

        console.log(`%c${asciiArt}`, style1);
        console.log('%cWait, what are you doing here? You should be looking at the UI, not the console! 🚀', style2);
        console.log('%cIf you really want to see the code, go check out the repo:', style2);
        console.log('%chttps://github.com/NandiVardhan2007', style3);
    }, []);

    return null;
}
