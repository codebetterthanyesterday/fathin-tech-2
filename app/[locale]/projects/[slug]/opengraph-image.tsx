import { ImageResponse } from 'next/og';
import { getProjectBySlug } from '@/lib/data';

export const alt = 'Project Detail';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', background: '#050505', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 60, fontWeight: 700 }}>
          Project Not Found
        </div>
      ),
      { ...size }
    );
  }

  const primaryTech = project.techStack.length > 0 ? project.techStack[0] : '';

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
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', opacity: 0.1, transform: 'scale(1.5)' }}>
          <path d="M400 100L700 250V550L400 700L100 550V250L400 100Z" stroke="white" strokeWidth="2" strokeDasharray="4 8"/>
          <path d="M400 50V750" stroke="white" strokeWidth="2" strokeDasharray="4 8"/>
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div
            style={{
              padding: '8px 24px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 50,
              color: '#d4d4d8',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            Project
          </div>
          
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.05em',
              marginBottom: 24,
              textAlign: 'center',
              maxWidth: 1000,
            }}
          >
            {project.title}
          </h1>
          
          {primaryTech && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: 'white' }} />
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color: '#a1a1aa',
                  letterSpacing: '0.05em',
                }}
              >
                {primaryTech}
              </p>
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
