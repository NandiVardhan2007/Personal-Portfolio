import { ImageResponse } from 'next/og';
import { portfolioData } from '@/data/portfolio';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
    const { personal } = portfolioData;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: 80,
                    background: '#000',
                    color: '#fff',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 28, letterSpacing: 6, color: '#888', textTransform: 'uppercase', marginBottom: 24 }}>
                    Portfolio
                </div>
                <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, marginBottom: 28 }}>{personal.name}</div>
                <div style={{ fontSize: 32, color: '#aaa', maxWidth: 900 }}>{personal.subtitle}</div>
            </div>
        ),
        { ...size, fonts: [] }
    );
}
