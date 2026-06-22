'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink } from 'lucide-react';

interface PDFViewerModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    pdfUrl: string;
    fileName?: string;
}

export function PDFViewerModal({ open, onClose, title, subtitle, pdfUrl, fileName }: PDFViewerModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full h-full max-w-4xl max-h-[90vh] glass-card overflow-hidden flex flex-col bg-background"
                    >
                        <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-4 border-b border-border shrink-0">
                            <div className="min-w-0">
                                <p className="font-bold text-foreground truncate">{title}</p>
                                {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={pdfUrl}
                                    download={fileName}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform"
                                >
                                    <Download size={13} /> Download
                                </a>
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-full border border-border hover:bg-secondary transition-colors"
                                >
                                    <ExternalLink size={13} /> New Tab
                                </a>
                                <button
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-secondary/30 min-h-0">
                            {/* Most desktop browsers render PDFs natively inside an iframe. */}
                            {/* key={pdfUrl} forces a full remount so switching documents never shows stale content. */}
                            <iframe key={pdfUrl} src={`${pdfUrl}#view=FitH`} title={title} className="w-full h-full" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
