import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(120deg, #3b82f6, #1e40af)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '20px',
          fontWeight: 900,
          fontFamily: 'sans-serif',
        }}
      >
        N
      </div>
    ),
    {
      ...size,
    }
  );
}
