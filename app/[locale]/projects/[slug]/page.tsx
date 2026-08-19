import { getProjectBySlug } from '@/lib/data';
import { renderMarkdownServer } from '@/lib/markdown/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ExternalLink, ArrowLeft, AlertTriangle, Lightbulb } from 'lucide-react';
import ProjectGallery from '@/components/public/project-gallery';
import JsonLd from '@/components/public/json-ld';
import ThemeToggle from '@/components/public/layout/theme-toggle';
import SearchTrigger from '@/components/public/search/search-trigger';
import LanguageSwitcher from '@/components/public/layout/language-switcher';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface ProjectDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  const title = project.title;
  const description = project.summary;
  const url = `/${locale}/projects/${project.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages: {
        id: `/id/projects/${project.slug}`,
        en: `/en/projects/${project.slug}`,
        'x-default': `/id/projects/${project.slug}`,
      },
    },
  };
}

// Custom Github Icon SVG
const GithubIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('projects');
  const project = await getProjectBySlug(slug, locale);

  if (!project) {
    notFound();
  }

  const mainImage = project.images[0]?.url;
  const renderedDescription = await renderMarkdownServer(project.description || '');
  const renderedChallenges = await renderMarkdownServer(project.challenges || '');
  const renderedSolutions = await renderMarkdownServer(project.solutions || '');

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.summary,
    ...(mainImage ? { image: mainImage } : {}),
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
    ...(project.demoUrl ? { url: project.demoUrl } : {}),
    programmingLanguage: project.techStack,
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] pb-24">
      <JsonLd data={projectSchema} />
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--bg-elevated)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] rounded-md py-1 px-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('backToHome')}
          </Link>
          
          <div className="flex items-center gap-3">
            <SearchTrigger variant="compact" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-8">
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4 opacity-30" 
          style={{ backgroundColor: 'var(--glow-color)' }}
        />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
                {project.title}
              </h1>
              <p className="text-xl sm:text-2xl text-[var(--text-secondary)] leading-relaxed">
                {project.summary}
              </p>
            </div>
          </div>

          {/* Main Cover Image */}
          {mainImage && (
            <div className="w-full aspect-[21/9] sm:aspect-[2.5/1] relative rounded-3xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl mb-12 lg:mb-16">
              <Image
                src={mainImage}
                alt={`${project.title} Cover`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          )}

          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 lg:items-start">
            
            {/* Sidebar / Meta Rail */}
            <aside className="order-first lg:order-last space-y-12 mb-16 lg:mb-0 lg:sticky lg:top-32">
              
              {/* Action Buttons */}
              {(project.demoUrl || project.repoUrl) && (
                <div className="flex flex-col gap-3">
                  {project.demoUrl && (
                    <a 
                      href={project.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-2xl bg-[var(--accent-btn-bg)] text-[var(--accent-btn-fg)] hover:brightness-110 transition-colors font-semibold text-sm shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('liveDemo')}
                    </a>
                  )}
                  {project.repoUrl && (
                    <a 
                      href={project.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all font-semibold text-sm shadow-sm"
                    >
                      <GithubIcon className="w-4 h-4" />
                      {t('repository')}
                    </a>
                  )}
                </div>
              )}

              {/* Key Project Meta (Role, Duration, Team) */}
              {(project.role || project.duration || project.teamSize) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl">
                  {project.role && (
                    <div>
                      <p className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-1.5">{t('role')}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{project.role}</p>
                    </div>
                  )}
                  {project.duration && (
                    <div>
                      <p className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-1.5">{t('duration')}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{project.duration}</p>
                    </div>
                  )}
                  {project.teamSize && (
                    <div>
                      <p className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-1.5">{t('teamSize')}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{project.teamSize} {t('people')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Key Metrics */}
              {project.keyMetrics && project.keyMetrics.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-4">{t('keyImpact')}</h3>
                  <div className="flex flex-col gap-3">
                    {project.keyMetrics.map((metric: string, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-[var(--accent-text)] shrink-0 opacity-70" />
                        <p className="text-[var(--text-primary)] text-sm font-medium leading-relaxed">{metric}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack & Categories */}
              <div className="space-y-8">
                {project.techStack.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-4">{t('technologies')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-3.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-xs font-mono text-[var(--text-secondary)] shadow-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {project.categories && project.categories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-4">{t('categories')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.categories.map((cat: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-3.5 py-1.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-xs font-semibold shadow-sm"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-16 min-w-0">
              
              {/* Description */}
              {renderedDescription && (
                <div className="prose dark:prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-a:text-[var(--text-primary)] hover:prose-a:text-[var(--accent-text)] prose-strong:text-[var(--text-primary)] text-lg"
                     dangerouslySetInnerHTML={{ __html: renderedDescription }} />
              )}

              {/* Video URL */}
              {project.videoUrl && (
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('videoWalkthrough')}</h3>
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-xl bg-[var(--bg-surface-solid)]">
                    <iframe
                      src={project.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Challenges & Solutions */}
              {(renderedChallenges || renderedSolutions) && (
                <div className="space-y-10 bg-[var(--bg-surface)] p-8 sm:p-10 lg:p-12 border border-[var(--border-subtle)] rounded-3xl shadow-sm">
                  {renderedChallenges && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-subtle)] text-[var(--accent-text)] flex-shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                          {t('challengesHurdles')}
                        </h3>
                      </div>
                      <div
                        className="prose dark:prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-ul:text-[var(--text-secondary)] prose-ol:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)] prose-li:marker:text-[var(--accent-text)] prose-a:text-[var(--accent-text)] hover:prose-a:underline prose-code:text-[var(--text-primary)] prose-code:bg-[var(--bg-card)] prose-code:border prose-code:border-[var(--border-subtle)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-xs prose-pre:bg-[var(--bg-card)] prose-pre:border prose-pre:border-[var(--border-subtle)] prose-pre:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-l-[var(--accent-color)] prose-blockquote:bg-[var(--bg-card)] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-[var(--text-secondary)] prose-blockquote:not-italic"
                        dangerouslySetInnerHTML={{ __html: renderedChallenges }}
                      />
                    </div>
                  )}

                  {renderedChallenges && renderedSolutions && (
                    <hr className="border-t border-[var(--border-subtle)] my-6" />
                  )}

                  {renderedSolutions && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-subtle)] text-[var(--accent-text)] flex-shrink-0">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                          {t('solutionsArchitecture')}
                        </h3>
                      </div>
                      <div
                        className="prose dark:prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-ul:text-[var(--text-secondary)] prose-ol:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)] prose-li:marker:text-[var(--accent-text)] prose-a:text-[var(--accent-text)] hover:prose-a:underline prose-code:text-[var(--text-primary)] prose-code:bg-[var(--bg-card)] prose-code:border prose-code:border-[var(--border-subtle)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-xs prose-pre:bg-[var(--bg-card)] prose-pre:border prose-pre:border-[var(--border-subtle)] prose-pre:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-l-[var(--accent-color)] prose-blockquote:bg-[var(--bg-card)] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-[var(--text-secondary)] prose-blockquote:not-italic"
                        dangerouslySetInnerHTML={{ __html: renderedSolutions }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Image Gallery */}
              <ProjectGallery images={project.images} projectTitle={project.title} />

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
