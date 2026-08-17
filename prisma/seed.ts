import { prisma } from '../lib/prisma';
import { ExperienceType } from '../app/generated/prisma/client';

// ============================================================================
// WARNING: DO NOT RUN THIS SCRIPT IN A PRODUCTION ENVIRONMENT
// This script will wipe out existing data in the following tables and 
// replace them with dummy data for development/preview purposes.
// ============================================================================

async function main() {
  console.log('🌱 Starting database seeding with bilingual translations...');

  // 1. Wipe existing data (idempotent setup)
  console.log('🧹 Wiping existing data...');
  await prisma.profileTranslation.deleteMany();
  await prisma.projectTranslation.deleteMany();
  await prisma.articleTranslation.deleteMany();
  await prisma.experienceTranslation.deleteMany();
  await prisma.testimonialTranslation.deleteMany();
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
      name: 'Alexander Thorne',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&auto=format&fit=crop',
      email: 'alex.thorne@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      socialLinks: [
        { platform: 'github', url: 'https://github.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
        { platform: 'twitter', url: 'https://twitter.com' }
      ],
      resumeUrl: 'https://example.com/resume.pdf',
      translations: {
        create: [
          {
            locale: 'id',
            tagline: 'Membangun pengalaman digital berkinerja tinggi dengan presisi dan kode.',
            bio: 'Saya adalah seorang Full-Stack Engineer dengan pengalaman lebih dari 5 tahun dalam membangun aplikasi web yang scalable dan tangguh. Spesialisasi saya berada di ekosistem React/Next.js serta arsitektur backend modern menggunakan Node.js dan Go.\n\nFokus utama saya adalah kode yang bersih, antarmuka pengguna yang intuitif, serta optimasi performa kelas atas.',
          },
          {
            locale: 'en',
            tagline: 'Crafting high-performance digital experiences with precision and code.',
            bio: 'I am a passionate Full-Stack Engineer with over 5 years of experience building scalable and resilient web applications. I specialize in the React and Next.js ecosystem, with a deep appreciation for robust backend architectures using Node.js and Go.\n\nMy core focus is on clean code, intuitive user interfaces, and top-tier performance optimization.',
          },
        ],
      },
    },
  });

  // 3. Seed Skills
  console.log('🛠️ Seeding Skills...');
  const skills = [
    { name: 'TypeScript', category: 'LANGUAGE', level: 5, order: 1 },
    { name: 'JavaScript', category: 'LANGUAGE', level: 5, order: 2 },
    { name: 'Go', category: 'LANGUAGE', level: 3, order: 3 },
    { name: 'Python', category: 'LANGUAGE', level: 4, order: 4 },
    { name: 'SQL', category: 'LANGUAGE', level: 4, order: 5 },
    { name: 'Next.js', category: 'FRAMEWORK', level: 5, order: 6 },
    { name: 'React', category: 'FRAMEWORK', level: 5, order: 7 },
    { name: 'Node.js', category: 'FRAMEWORK', level: 4, order: 8 },
    { name: 'Express', category: 'FRAMEWORK', level: 4, order: 9 },
    { name: 'Tailwind CSS', category: 'FRAMEWORK', level: 5, order: 10 },
    { name: 'Git', category: 'TOOL', level: 5, order: 11 },
    { name: 'Docker', category: 'TOOL', level: 4, order: 12 },
    { name: 'PostgreSQL', category: 'TOOL', level: 4, order: 13 },
    { name: 'Prisma', category: 'TOOL', level: 5, order: 14 },
    { name: 'AWS', category: 'TOOL', level: 3, order: 15 },
    { name: 'System Design', category: 'SOFT_SKILL', level: 4, order: 16 },
    { name: 'Agile/Scrum', category: 'SOFT_SKILL', level: 5, order: 17 },
    { name: 'Technical Writing', category: 'SOFT_SKILL', level: 4, order: 18 },
  ];

  for (const skill of skills) {
    // @ts-ignore
    await prisma.skill.create({ data: skill });
  }

  // 4. Seed Projects
  console.log('🚀 Seeding Projects with Translations...');
  const projects = [
    {
      slug: 'nexus-analytics',
      techStack: ['Next.js', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Socket.io'],
      demoUrl: 'https://demo.example.com',
      repoUrl: 'https://github.com/example/nexus',
      isFeatured: true,
      order: 1,
      images: [
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'Dashboard Overview' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'Data Charts' }
      ],
      translations: {
        create: [
          {
            locale: 'id',
            title: 'Nexus Analytics Dashboard',
            summary: 'Platform visualisasi data real-time untuk bisnis e-commerce dalam memantau metrik keterlibatan pengguna dan konversi penjualan.',
            description: 'Nexus Analytics dibangun untuk memecahkan fragmentasi data e-commerce. Terintegrasi dengan API Shopify dan Stripe, sistem ini menyajikan dashboard analitik terpadu.\n\nFrontend menggunakan Next.js App Router untuk efisiensi render dan SEO, didukung WebSockets untuk push update data seketika.',
            role: 'Lead Architect & Full-Stack Engineer',
            duration: '4 Bulan',
            keyMetrics: ['40% peningkatan efisiensi data', 'Latensi < 50ms'],
          },
          {
            locale: 'en',
            title: 'Nexus Analytics Dashboard',
            summary: 'A real-time data visualization platform for e-commerce businesses tracking user engagement and sales conversion metrics.',
            description: 'Nexus Analytics was built to solve the fragmentation of e-commerce data. Integrated directly with Shopify and Stripe APIs, it provides merchants with a unified analytics dashboard.\n\nThe frontend leverages Next.js App Router for optimal rendering and SEO, powered by WebSockets for instant live data pushes.',
            role: 'Lead Architect & Full-Stack Engineer',
            duration: '4 Months',
            keyMetrics: ['40% data efficiency boost', 'Sub-50ms latency'],
          }
        ]
      }
    },
    {
      slug: 'aether-cms',
      techStack: ['Go', 'React', 'GraphQL', 'MongoDB', 'Docker'],
      demoUrl: '',
      repoUrl: 'https://github.com/example/aether',
      isFeatured: true,
      order: 2,
      images: [
        { url: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1200&h=675&auto=format&fit=crop', altText: 'CMS Interface' }
      ],
      translations: {
        create: [
          {
            locale: 'id',
            title: 'Aether Headless CMS',
            summary: 'Headless CMS yang sangat cepat dan ringan, dirancang khusus untuk agensi digital dan kreator konten.',
            description: 'Aether adalah CMS minimalis untuk pengembang yang membutuhkan kendali penuh atas frontend mereka dengan antarmuka admin yang responsif dan GraphQL API fleksibel.',
            role: 'Backend & Systems Engineer',
            duration: '3 Bulan',
          },
          {
            locale: 'en',
            title: 'Aether Headless CMS',
            summary: 'A lightweight, blazing-fast headless CMS tailored for digital agencies and content creators.',
            description: 'Aether is a minimalist content management system designed for developers demanding complete frontend control with an ultra-responsive admin panel and flexible GraphQL APIs.',
            role: 'Backend & Systems Engineer',
            duration: '3 Months',
          }
        ]
      }
    }
  ];

  for (const proj of projects) {
    const { images, translations, ...projectData } = proj;
    await prisma.project.create({
      data: {
        ...projectData,
        images: {
          create: images
        },
        translations: translations
      }
    });
  }

  // 5. Seed Experience
  console.log('💼 Seeding Experience with Translations...');
  const experiences = [
    {
      type: ExperienceType.WORK,
      institution: 'Vanguard Tech Solutions',
      startDate: new Date('2022-03-15'),
      endDate: null,
      order: 1,
      translations: {
        create: [
          {
            locale: 'id',
            title: 'Senior Frontend Engineer',
            description: 'Memimpin tim pengembang frontend dalam membangun sistem ERP perusahaan berskala besar.\n- Migrasi basis kode ke Next.js App Router, menghasilkan pengurangan 40% pada initial load time.\n- Menetapkan standar panduan komponen UI dan otomatisasi pengujian.',
          },
          {
            locale: 'en',
            title: 'Senior Frontend Engineer',
            description: 'Leading a team of frontend engineers building enterprise-grade ERP systems.\n- Migrated legacy codebase to Next.js App Router, resulting in a 40% initial load time reduction.\n- Established internal UI component standards and testing suites.',
          }
        ]
      }
    },
    {
      type: ExperienceType.EDUCATION,
      institution: 'University of Technology',
      startDate: new Date('2013-08-15'),
      endDate: new Date('2017-05-20'),
      order: 2,
      translations: {
        create: [
          {
            locale: 'id',
            title: 'Sarjana Ilmu Komputer (B.S. in Computer Science)',
            description: 'Lulus dengan predikat Pujian (Cum Laude). Spesialisasi dalam Interaksi Manusia dan Komputer serta Sistem Terdistribusi.',
          },
          {
            locale: 'en',
            title: 'B.S. in Computer Science',
            description: 'Graduated with Honors (Cum Laude). Specialization in Human-Computer Interaction and Distributed Systems.',
          }
        ]
      }
    }
  ];

  for (const exp of experiences) {
    const { translations, ...expData } = exp;
    // @ts-ignore
    await prisma.experience.create({
      data: {
        ...expData,
        translations,
      }
    });
  }

  // 6. Seed Testimonials
  console.log('🗣️ Seeding Testimonials with Translations...');
  const testimonials = [
    {
      name: 'Sarah Jenkins',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
      order: 1,
      isVisible: true,
      translations: {
        create: [
          {
            locale: 'id',
            role: 'CTO di Vanguard Tech',
            quote: 'Alexander adalah engineer yang luar biasa. Tidak hanya menulis kode berkualitas tinggi, ia memahami sasaran bisnis dan merancang arsitektur solusi yang scalable.',
          },
          {
            locale: 'en',
            role: 'CTO at Vanguard Tech',
            quote: 'Alexander is an exceptional engineer. They don\'t just write code; they understand business objectives and architect solutions that scale seamlessly.',
          }
        ]
      }
    }
  ];

  for (const test of testimonials) {
    const { translations, ...testData } = test;
    await prisma.testimonial.create({
      data: {
        ...testData,
        translations,
      }
    });
  }

  // 7. Seed Articles
  console.log('📝 Seeding Articles with Translations...');
  const articles = [
    {
      slug: 'mastering-nextjs-app-router',
      coverImage: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1200&h=600&auto=format&fit=crop',
      isPublished: true,
      publishedAt: new Date('2023-11-10'),
      translations: {
        create: [
          {
            locale: 'id',
            title: 'Menguasai Next.js App Router: Panduan Praktis Arsitektur Modern',
            excerpt: 'Memahami model mental Server Components, layouts hierarkis, dan boundary client untuk performa web maksimal.',
            contentMd: '# Menguasai Next.js App Router\n\nPengenalan App Router di Next.js menghadirkan pergeseran paradigma arsitektur web modern.\n\n## Server Component Sebagai Default\n\nSecara bawaan, semua komponen adalah Server Components yang berjalan di server tanpa mengirim JavaScript berlebih ke browser pengguna.',
          },
          {
            locale: 'en',
            title: 'Mastering the Next.js App Router: A Practical Guide',
            excerpt: 'Transitioning from traditional routing: core mental models for Server Components and layout composition.',
            contentMd: '# Mastering the Next.js App Router\n\nThe introduction of the App Router represented a massive paradigm shift in modern web architecture.\n\n## Server Component by Default\n\nBy default, everything is a Server Component, shipping zero runtime client bundle unless interactivity is explicitly required.',
          }
        ]
      }
    }
  ];

  for (const article of articles) {
    const { translations, ...artData } = article;
    await prisma.article.create({
      data: {
        ...artData,
        translations,
      }
    });
  }

  console.log('✅ Bilingual seeding completed successfully!');
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
