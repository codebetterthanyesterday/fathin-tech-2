import { getProjectBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import ProjectGallery from '@/components/public/project-gallery';
import JsonLd from '@/components/public/json-ld';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  const title = project.title;
  const description = project.summary;
  const url = `/projects/${project.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Custom Github Icon SVG
const GithubIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);

  if (!project) {
    notFound();
  }

  const mainImage = project.images[0]?.url;

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
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20 selection:text-white pb-24">
      <JsonLd data={projectSchema} />
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
                {project.title}
              </h1>
              <p className="text-xl sm:text-2xl text-zinc-400 leading-relaxed">
                {project.summary}
              </p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              {project.repoUrl && (
                <a 
                  href={project.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all font-medium text-sm"
                >
                  <GithubIcon className="w-4 h-4" />
                  Repository
                </a>
              )}
              {project.demoUrl && (
                <a 
                  href={project.demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors font-medium text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Main Cover Image */}
          {mainImage && (
            <div className="w-full aspect-[21/9] sm:aspect-[2.5/1] relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 ring-1 ring-white/10 shadow-2xl mb-16">
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

          {/* Tech Stack */}
          <div className="mb-16">
            <h3 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, i) => (
                <span 
                  key={i} 
                  className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm font-mono text-zinc-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="prose prose-invert prose-zinc max-w-3xl prose-p:leading-relaxed prose-p:text-zinc-400 prose-headings:text-white prose-a:text-white hover:prose-a:text-zinc-300 prose-strong:text-zinc-200 text-lg">
              {project.description.split('\n').map((paragraph, idx) => (
                paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
              ))}
            </div>
          )}

          {/* Image Gallery */}
          <ProjectGallery images={project.images} projectTitle={project.title} />
          
        </div>
      </section>
    </main>
  );
}
