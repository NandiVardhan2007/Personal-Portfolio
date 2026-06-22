'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BadgeCheck, FileText } from 'lucide-react';
import { Achievement } from '@/types';
import { PDFViewerModal } from './PDFViewerModal';

export function CertificateCard({ achievement, className = '' }: { achievement: Achievement; className?: string }) {
    const [open, setOpen] = useState(false);
    const canExpand = Boolean(achievement.pdfUrl);

    const handleClick = () => {
        if (!canExpand) return;
        if (window.innerWidth <= 768) {
            window.open(achievement.pdfUrl!, '_blank');
        } else {
            setOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                disabled={!canExpand}
                className={`text-left glass-card overflow-hidden group w-full ${canExpand ? 'cursor-pointer' : 'cursor-default'} ${className}`}
            >
                {achievement.image && (
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-border">
                        <Image
                            src={achievement.image}
                            alt={`${achievement.title} certificate preview`}
                            fill
                            sizes="(max-width: 768px) 50vw, 300px"
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        {canExpand && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                                    <FileText size={13} /> View PDF
                                </span>
                            </div>
                        )}
                    </div>
                )}
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <BadgeCheck size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Certification</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground leading-snug">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5">{achievement.issuer}</p>
                </div>
            </button>

            {canExpand && (
                <PDFViewerModal
                    open={open}
                    onClose={() => setOpen(false)}
                    title={achievement.title}
                    subtitle={achievement.issuer}
                    pdfUrl={achievement.pdfUrl!}
                    fileName={`${achievement.title.replace(/\s+/g, '_')}.pdf`}
                />
            )}
        </>
    );
}
