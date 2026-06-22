'use client';

import { motion, MotionValue, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { Achievement } from '@/types';
import { PDFViewerModal } from './PDFViewerModal';

type ColumnProps = { items: Achievement[]; y: MotionValue<number>; onSelect: (a: Achievement) => void };

function Column({ items, y, onSelect }: ColumnProps) {
    return (
        <motion.div
            className="relative -top-[45%] flex h-full w-1/3 min-w-[200px] flex-col gap-[2vw] md:gap-[3vw] first:top-[-45%] [&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-[-65%] will-change-transform"
            style={{ y, translateZ: 0 }}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => item.pdfUrl && onSelect(item)}
                    className="group relative w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-border text-left"
                    style={{ paddingTop: '75%' }}
                >
                    {item.image && (
                        <Image
                            key={item.image}
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            className="pointer-events-none object-cover"
                        />
                    )}
                    {item.pdfUrl && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20">
                                <FileText size={12} /> View PDF
                            </span>
                        </div>
                    )}
                    <span className="absolute bottom-2 left-2 right-2 truncate text-[10px] font-bold text-white/0 group-hover:text-white/90 bg-black/0 group-hover:bg-black/40 rounded-lg px-2 py-1 transition-colors">
                        {item.title}
                    </span>
                </button>
            ))}
        </motion.div>
    );
}

/**
 * Builds 3 columns of up to 6 tiles each from the achievements list, using plain
 * slicing + explicit rotation (no modulo math) so it's easy to verify every tile
 * maps to a distinct achievement whenever there are enough unique items to fill it.
 */
function buildColumns(achievements: Achievement[]): [Achievement[], Achievement[], Achievement[]] {
    const n = achievements.length;
    const perColumn = 6;

    if (n === 0) return [[], [], []];

    const rotate = (offset: number) =>
        Array.from({ length: Math.min(perColumn, n) }, (_, i) => achievements[(offset + i) % n]);

    // Stagger each column's starting point so the three columns don't show
    // identical sequences even when n < perColumn.
    const colA = rotate(0);
    const colB = rotate(Math.floor(n / 3) || 1);
    const colC = rotate(Math.floor((n * 2) / 3) || 2);

    return [colA, colB, colC];
}

export function CertificateMarquee({ achievements }: { achievements: Achievement[] }) {
    const gallery = useRef<HTMLDivElement>(null);
    const [dimension, setDimension] = useState({ height: 0 });
    const [selected, setSelected] = useState<Achievement | null>(null);

    const { scrollYProgress } = useScroll({ target: gallery, offset: ['start end', 'end start'] });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 20, damping: 15, mass: 0.2, restDelta: 0.001 });

    const { height } = dimension;
    const y = useTransform(smoothProgress, [0, 1], [0, height * 1.2]);
    const y2 = useTransform(smoothProgress, [0, 1], [0, height * 2.0]);
    const y3 = useTransform(smoothProgress, [0, 1], [0, height * 0.8]);

    useEffect(() => {
        const resize = () => setDimension({ height: window.innerHeight });
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const [colA, colB, colC] = useMemo(() => buildColumns(achievements), [achievements]);

    return (
        <>
            <div ref={gallery} className="relative box-border flex h-[90vh] md:h-[120vh] gap-[2vw] md:gap-[3vw] overflow-hidden rounded-3xl">
                <Column items={colA} y={y} onSelect={setSelected} />
                <Column items={colB} y={y2} onSelect={setSelected} />
                <Column items={colC} y={y3} onSelect={setSelected} />
            </div>

            <PDFViewerModal
                key={selected?.id ?? 'none'}
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
                title={selected?.title ?? ''}
                subtitle={selected?.issuer}
                pdfUrl={selected?.pdfUrl ?? ''}
                fileName={selected ? `${selected.title.replace(/\s+/g, '_')}.pdf` : undefined}
            />
        </>
    );
}
