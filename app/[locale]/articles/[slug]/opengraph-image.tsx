import { ImageResponse } from 'next/og';
import { getPublishedArticleBySlug } from '@/app/actions/article';
import { getPortfolioData } from '@/lib/data';

export const alt = 'Article Detail';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const [article, { profile }] = await Promise.all([
    getPublishedArticleBySlug(resolvedParams.slug, resolvedParams.locale),
    getPortfolioData(resolvedParams.locale),
  ]);

  if (!article) {
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
          Article Not Found
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
          padding: '60px',
        }}
      >
        {/* Subtle Geometric Background */}
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
        </svg>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: '8px 24px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 50,
              color: '#d4d4d8',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 32,
            }}
          >
            Article
          </div>

          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.04em',
              marginBottom: 24,
              textAlign: 'center',
              maxWidth: 1000,
              lineHeight: 1.15,
            }}
          >
            {article.title}
          </h1>

          {profile?.name && (
            <p
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: '#a1a1aa',
                letterSpacing: '0.05em',
              }}
            >
              By {profile.name}
            </p>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
