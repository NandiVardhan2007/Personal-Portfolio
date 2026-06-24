'use client';

import { useEffect, useRef } from 'react';

export function ConsoleEasterEgg() {
    const hasLogged = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || hasLogged.current) return;
        hasLogged.current = true;

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

        const warningStyle1 = 'color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;';
        const warningStyle2 = 'font-size: 16px; color: white; background: red; padding: 10px 20px; font-weight: bold; border-radius: 5px;';

        console.log(`%c${asciiArt}`, style1);
        console.log('%cWait, what are you doing here? You should be looking at the UI, not the console! 🚀', style2);
        console.log('%cIf you really want to see the code, go check out the repo:', style2);
        console.log('%chttps://github.com/NandiVardhan2007', style3);

        console.log('%cHOLD UP!', warningStyle1);
        console.log('%cTrying to use developer tools to download content or modify the site is not allowed.', warningStyle2);
    }, []);

    return null;
}
