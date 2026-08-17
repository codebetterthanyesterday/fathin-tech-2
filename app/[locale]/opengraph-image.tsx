import { ImageResponse } from 'next/og';
import { getPortfolioData } from '@/lib/data';

export const alt = 'Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await getPortfolioData(locale);

  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            background: '#050505',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 60,
            fontWeight: 700,
          }}
        >
          Portfolio
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #111111, #000000)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle Shield/Geometric Background Accent */}
        <svg
          width="800"
          height="800"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', opacity: 0.1, transform: 'scale(1.5)' }}
        >
          <path
            d="M400 100L700 250V550L400 700L100 550V250L400 100Z"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="4 8"
          />
          <path d="M400 50V750" stroke="white" strokeWidth="2" strokeDasharray="4 8" />
        </svg>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 32,
                border: '4px solid rgba(255,255,255,0.1)',
              }}
            />
          ) : (
            <div style={{ width: 80, height: 8, background: 'white', marginBottom: 40 }} />
          )}

          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.05em',
              marginBottom: 16,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            {profile.name}
          </h1>

          <p
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: '#a1a1aa',
              letterSpacing: '0.02em',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            {profile.tagline}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
