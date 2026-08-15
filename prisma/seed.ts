import { prisma } from '../lib/prisma';

// ============================================================================
// WARNING: DO NOT RUN THIS SCRIPT IN A PRODUCTION ENVIRONMENT
// This script will wipe out existing data in the following tables and 
// replace them with dummy data for development/preview purposes.
// ============================================================================

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Wipe existing data (idempotent setup)
  console.log('🧹 Wiping existing data...');
  await prisma.projectImage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.article.deleteMany();

  // 2. Seed Profile
  console.log('👤 Seeding Profile...');
  await prisma.profile.create({
    data: {
      name: 'Alexender Thorne',
      tagline: 'Crafting digital experiences with precision and code.',
      bio: 'I am a passionate Full-Stack Engineer with over 5 years of experience building scalable web applications. I specialize in the React ecosystem, specifically Next.js, and have a deep appreciation for robust backend architectures using Node.js and Go.\n\nMy approach to software development focuses on clean code, intuitive user interfaces, and performance optimization. When I\'m not coding, you can find me exploring new technologies, contributing to open-source projects, or writing about my learnings on my blog.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&auto=format&fit=crop', // Realistic portrait placeholder
      email: 'alex.thorne@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      socialLinks: [
        { platform: 'github', url: 'https://github.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
        { platform: 'twitter', url: 'https://twitter.com' }
      ],
      resumeUrl: 'https://example.com/resume.pdf',
    },
  });

  // 3. Seed Skills
  console.log('🛠️ Seeding Skills...');
  const skills = [
    // Languages
    { name: 'TypeScript', category: 'LANGUAGE', level: 5, order: 1 },
    { name: 'JavaScript', category: 'LANGUAGE', level: 5, order: 2 },
    { name: 'Go', category: 'LANGUAGE', level: 3, order: 3 },
    { name: 'Python', category: 'LANGUAGE', level: 4, order: 4 },
    { name: 'SQL', category: 'LANGUAGE', level: 4, order: 5 },
    // Frameworks
    { name: 'Next.js', category: 'FRAMEWORK', level: 5, order: 6 },
    { name: 'React', category: 'FRAMEWORK', level: 5, order: 7 },
    { name: 'Node.js', category: 'FRAMEWORK', level: 4, order: 8 },
    { name: 'Express', category: 'FRAMEWORK', level: 4, order: 9 },
    { name: 'Tailwind CSS', category: 'FRAMEWORK', level: 5, order: 10 },
    // Tools
    { name: 'Git', category: 'TOOL', level: 5, order: 11 },
    { name: 'Docker', category: 'TOOL', level: 4, order: 12 },
    { name: 'PostgreSQL', category: 'TOOL', level: 4, order: 13 },
    { name: 'Prisma', category: 'TOOL', level: 5, order: 14 },
    { name: 'AWS', category: 'TOOL', level: 3, order: 15 },
    // Soft Skills
    { name: 'System Design', category: 'SOFT_SKILL', level: 4, order: 16 },
    { name: 'Agile/Scrum', category: 'SOFT_SKILL', level: 5, order: 17 },
    { name: 'Technical Writing', category: 'SOFT_SKILL', level: 4, order: 18 },
  ];

  for (const skill of skills) {
    // @ts-ignore - Ignoring TS error for enum cast in seed
    await prisma.skill.create({ data: skill });
  }

  // 4. Seed Projects
  console.log('🚀 Seeding Projects...');
  const projects = [
    {
      slug: 'nexus-analytics',
      title: 'Nexus Analytics Dashboard',
      summary: 'A real-time data visualization platform for e-commerce businesses tracking user engagement and sales metrics.',
      description: 'Nexus Analytics was built to solve the fragmentation of e-commerce data. By integrating directly with Shopify and Stripe APIs, it provides merchants with a unified dashboard to track their most important metrics in real-time.\n\nThe frontend leverages Next.js App Router for optimal performance and SEO, while the backend utilizes WebSockets to push live updates to the client. The UI was meticulously crafted using Tailwind CSS and Framer Motion to ensure a premium, snappy experience.',
      techStack: ['Next.js', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Socket.io'],
      demoUrl: 'https://demo.example.com',
      repoUrl: 'https://github.com/example/nexus',
      isFeatured: true,
      order: 1,
      images: [
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'Dashboard Overview' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'Data Charts' }
      ]
    },
    {
      slug: 'aether-cms',
      title: 'Aether Headless CMS',
      summary: 'A lightweight, blazing fast headless CMS tailored for digital agencies and content creators.',
      description: 'Aether is a minimalist content management system designed specifically for developers who want complete control over their frontend. It provides a highly customizable GraphQL API and a sleek, intuitive admin interface.\n\nI architected the backend using Go for maximum concurrency and minimal memory footprint. The admin panel is a React Single Page Application (SPA) that communicates with the Go backend via gRPC-web, resulting in incredibly low-latency interactions.',
      techStack: ['Go', 'React', 'GraphQL', 'MongoDB', 'Docker'],
      demoUrl: '',
      repoUrl: 'https://github.com/example/aether',
      isFeatured: true,
      order: 2,
      images: [
        { url: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'CMS Interface' }
      ]
    },
    {
      slug: 'lumina-ui',
      title: 'Lumina UI Component Library',
      summary: 'An open-source React component library focused on accessibility and highly customizable aesthetic.',
      description: 'Built out of frustration with existing UI libraries that were either too opinionated or lacked proper accessibility attributes. Lumina UI provides a set of raw, unstyled primitive components that handle complex accessibility logic (focus trapping, ARIA roles, keyboard navigation) while leaving the styling completely up to the consumer.\n\nIt has garnered over 2,000 stars on GitHub and is actively maintained by a small team of open-source contributors.',
      techStack: ['React', 'TypeScript', 'Radix UI', 'Storybook'],
      demoUrl: 'https://lumina-ui.example.com',
      repoUrl: 'https://github.com/example/lumina',
      isFeatured: false,
      order: 3,
      images: [
        { url: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'Component Showcase' }
      ]
    },
    {
      slug: 'orbital-sync',
      title: 'Orbital File Sync',
      summary: 'A secure, peer-to-peer file synchronization tool for remote teams.',
      description: 'Orbital Sync utilizes WebRTC to establish direct connections between team members, allowing for massive file transfers without the need for an intermediary server. This ensures complete privacy and utilizes the maximum bandwidth available between the peers.\n\nThe desktop application was built using Electron, with a heavy emphasis on native integration for drag-and-drop capabilities and system tray notifications.',
      techStack: ['Electron', 'WebRTC', 'Node.js', 'React'],
      demoUrl: '',
      repoUrl: '',
      isFeatured: false,
      order: 4,
      images: [
        { url: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'Application Window' }
      ]
    },
    {
      slug: 'syntax-theme',
      title: 'Obsidian Syntax Theme',
      summary: 'A dark, high-contrast theme for VS Code designed to reduce eye strain during late-night coding sessions.',
      description: 'A passion project that started as a personal configuration file. Obsidian Syntax uses carefully selected color theory principles to ensure syntax highlighting is both beautiful and legible, particularly for TypeScript and Rust developers.',
      techStack: ['JSON', 'VS Code API'],
      demoUrl: 'https://marketplace.visualstudio.com/',
      repoUrl: 'https://github.com/example/obsidian-theme',
      isFeatured: false,
      order: 5,
      images: [
        { url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'Code Editor Preview' }
      ]
    }
  ];

  for (const proj of projects) {
    const { images, ...projectData } = proj;
    await prisma.project.create({
      data: {
        ...projectData,
        images: {
          create: images
        }
      }
    });
  }

  // 5. Seed Experience
  console.log('💼 Seeding Experience...');
  const experiences = [
    {
      type: 'WORK',
      title: 'Senior Frontend Engineer',
      institution: 'Vanguard Tech Solutions',
      description: 'Leading a team of 4 frontend developers in architecting a massive enterprise resource planning (ERP) system. \n- Migrated the legacy React codebase to Next.js App Router, resulting in a 40% reduction in initial load time.\n- Established internal UI component guidelines and testing standards using Cypress and Jest.',
      startDate: new Date('2022-03-15'),
      endDate: null, // "Present"
      order: 1,
    },
    {
      type: 'WORK',
      title: 'Software Engineer',
      institution: 'Nova Digital Agency',
      description: 'Developed and maintained high-traffic marketing sites and e-commerce platforms for Fortune 500 clients.\n- Built a custom headless Shopify integration that increased client conversion rates by 15%.\n- Mentored junior developers and conducted weekly code review sessions.',
      startDate: new Date('2019-06-01'),
      endDate: new Date('2022-02-28'),
      order: 2,
    },
    {
      type: 'WORK',
      title: 'Junior Web Developer',
      institution: 'Creative Forge Startup',
      description: 'Collaborated with designers to implement pixel-perfect user interfaces using HTML, CSS, and vanilla JavaScript. Assisted in the transition of monolithic PHP apps to decoupled RESTful APIs.',
      startDate: new Date('2017-09-01'),
      endDate: new Date('2019-05-30'),
      order: 3,
    },
    {
      type: 'EDUCATION',
      title: 'B.S. in Computer Science',
      institution: 'University of Technology',
      description: 'Graduated with Honors (Cum Laude). Specialization in Human-Computer Interaction and Distributed Systems. Lead developer for the university\'s robotics club.',
      startDate: new Date('2013-08-15'),
      endDate: new Date('2017-05-20'),
      order: 4,
    }
  ];

  for (const exp of experiences) {
    // @ts-ignore
    await prisma.experience.create({ data: exp });
  }

  // 6. Seed Testimonials
  console.log('🗣️ Seeding Testimonials...');
  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'CTO at Vanguard Tech',
      quote: 'Alex is an exceptional engineer. They don\'t just write code; they understand the business objectives and architect solutions that scale. Their leadership on our recent migration project was invaluable.',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
      order: 1
    },
    {
      name: 'Marcus Chen',
      role: 'Lead Designer',
      quote: 'I\'ve rarely worked with a developer who has such a keen eye for design. Alex translates Figma mockups into reality with pixel-perfect precision and always adds that extra touch of animation magic.',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop',
      order: 2
    }
  ];

  for (const test of testimonials) {
    await prisma.testimonial.create({ data: test });
  }

  // 7. Seed Articles
  console.log('📝 Seeding Articles...');
  const articles = [
    {
      slug: 'mastering-nextjs-app-router',
      title: 'Mastering the Next.js App Router: A Practical Guide',
      excerpt: 'Transitioning from the Pages router can be daunting. Here are the core mental models you need to understand Server Components and layouts.',
      contentMd: '# Mastering the Next.js App Router\n\nThe introduction of the App Router in Next.js 13 represented a massive paradigm shift. No longer are we thinking strictly in terms of `getServerSideProps` vs `getStaticProps`.\n\n## The Server Component Default\n\nBy default, everything is a Server Component. This means your code runs on the server, ships zero JavaScript to the client by default, and allows you to fetch data directly within the component body using `async/await`.\n\n```tsx\n// This is completely valid now!\nexport default async function Page() {\n  const data = await db.query();\n  return <div>{data.name}</div>;\n}\n```\n\n## When to use Client Components\n\nYou only need the `"use client"` directive when you need interactivity: `onClick`, `useState`, `useEffect`, or browser APIs. The trick to a performant Next.js app is pushing the `"use client"` boundary as far down the component tree as possible.',
      coverImage: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1200&h=600&auto=format&fit=crop',
      isPublished: true,
      publishedAt: new Date('2023-11-10'),
    },
    {
      slug: 'css-grid-secrets',
      title: 'CSS Grid Secrets You Probably Don\'t Know',
      excerpt: 'Move beyond basic grid-template-columns. Let\'s explore auto-fit, minmax, and implicit grids.',
      contentMd: '# CSS Grid Secrets\n\nCSS Grid is incredibly powerful, but most developers only scratch the surface. Let\'s look at one of the most useful patterns for responsive design without media queries.\n\n## The Holy Grail of Responsive Grids\n\n```css\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}\n```\n\nThis single line of CSS tells the browser: "Create as many columns as will fit, as long as they are at least 250px wide. If there\'s extra space, distribute it equally (1fr)."',
      coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=1200&h=600&auto=format&fit=crop',
      isPublished: true,
      publishedAt: new Date('2024-01-05'),
    }
  ];

  for (const article of articles) {
    await prisma.article.create({ data: article });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('---');
  console.log(`📊 Summary:`);
  console.log(`  - 1 Profile`);
  console.log(`  - ${skills.length} Skills`);
  console.log(`  - ${projects.length} Projects`);
  console.log(`  - ${experiences.length} Experiences`);
  console.log(`  - ${testimonials.length} Testimonials`);
  console.log(`  - ${articles.length} Articles`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
