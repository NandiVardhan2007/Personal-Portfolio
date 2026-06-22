'use client';

import { useState, ReactNode } from 'react';
import { portfolioData } from '@/data/portfolio';
import { PDFViewerModal } from './PDFViewerModal';

export function ResumeButton({ children, className }: { children: ReactNode; className?: string }) {
    const [open, setOpen] = useState(false);
    const { personal } = portfolioData;

    const handleClick = () => {
        if (window.innerWidth <= 768) {
            window.open(personal.resumeUrl, '_blank');
        } else {
            setOpen(true);
        }
    };

    return (
        <>
            <button onClick={handleClick} className={className} type="button">
                {children}
            </button>
            <PDFViewerModal
                open={open}
                onClose={() => setOpen(false)}
                title={`${personal.name} — Resume`}
                pdfUrl={personal.resumeUrl}
                fileName="Resume.pdf"
            />
        </>
    );
}
