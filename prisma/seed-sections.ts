/**
 * One-time seed script for PBI-010.
 * Creates the initial Section rows that mirror the current hardcoded homepage layout.
 *
 * Run with: npx tsx prisma/seed-sections.ts
 *
 * This script is idempotent — it checks if sections already exist before inserting.
 * Safe to run multiple times.
 */

import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { DEFAULT_CONTENT } from '../lib/sections/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const INITIAL_SECTIONS = [
  {
    type: 'HERO' as const,
    title: 'Hero',
    content: DEFAULT_CONTENT['HERO'],
    order: 0,
    isVisible: true,
  },
  {
    type: 'SKILLS_GRID' as const,
    title: 'Skills & Expertise',
    content: DEFAULT_CONTENT['SKILLS_GRID'],
    order: 1,
    isVisible: true,
  },
  {
    type: 'PROJECTS_GRID' as const,
    title: 'Featured Work',
    content: DEFAULT_CONTENT['PROJECTS_GRID'],
    order: 2,
    isVisible: true,
  },
  {
    type: 'EXPERIENCE_TIMELINE' as const,
    title: 'Experience',
    content: DEFAULT_CONTENT['EXPERIENCE_TIMELINE'],
    order: 3,
    isVisible: true,
  },
];

async function main() {
  console.log('🌱 Seeding initial sections...');

  const existing = await prisma.section.count();
  if (existing > 0) {
    console.log(`⚠️  Sections table already has ${existing} row(s). Skipping seed to avoid duplicates.`);
    console.log('   To re-seed, delete existing sections from the database first.');
    return;
  }

  for (const section of INITIAL_SECTIONS) {
    await prisma.section.create({ data: section as any });
    console.log(`  ✓ Created ${section.type} (order: ${section.order})`);
  }

  console.log('✅ Done! Initial sections created.');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
