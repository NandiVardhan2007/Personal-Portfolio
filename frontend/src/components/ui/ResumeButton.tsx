'use client';

import { useState, ReactNode } from 'react';
import { portfolioData } from '@/data/portfolio';
import { PDFViewerModal } from './PDFViewerModal';

export function ResumeButton({ children, className }: { children: ReactNode; className?: string }) {
    const [open, setOpen] = useState(false);
    const { personal } = portfolioData;

    return (
        <>
            <button onClick={() => setOpen(true)} className={className} type="button">
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
