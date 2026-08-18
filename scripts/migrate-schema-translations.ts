import { prisma } from '../lib/prisma';

async function migrate() {
  console.log('=== Starting Schema Translation Migration ===\n');

  // 1. Create SkillTranslation table
  console.log('1. Creating SkillTranslation table if not exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SkillTranslation" (
      "id" TEXT NOT NULL,
      "skillId" TEXT NOT NULL,
      "locale" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      CONSTRAINT "SkillTranslation_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "SkillTranslation_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "SkillTranslation_skillId_locale_key" ON "SkillTranslation"("skillId", "locale");
  `);
  console.log('✓ SkillTranslation table & index ready.');

  // 2. Add location column to ProfileTranslation
  console.log('2. Adding location column to ProfileTranslation...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ProfileTranslation" ADD COLUMN IF NOT EXISTS "location" TEXT;
  `);
  console.log('✓ ProfileTranslation.location column ready.');

  // 3. Add institution column to ExperienceTranslation
  console.log('3. Adding institution column to ExperienceTranslation...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ExperienceTranslation" ADD COLUMN IF NOT EXISTS "institution" TEXT;
  `);
  console.log('✓ ExperienceTranslation.institution column ready.');

  // 4. Backfill Skill translations
  console.log('4. Backfilling existing Skills into SkillTranslation...');
  const skills = await prisma.skill.findMany();
  console.log(`Found ${skills.length} skills to backfill.`);

  for (const s of skills) {
    const existingId = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM "SkillTranslation" WHERE "skillId" = $1 AND "locale" = 'id'`,
      s.id
    );
    if (existingId.length === 0) {
      const transId = 'st_' + Math.random().toString(36).substring(2, 12);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "SkillTranslation" ("id", "skillId", "locale", "name") VALUES ($1, $2, 'id', $3)`,
        transId,
        s.id,
        s.name
      );
    }
  }
  console.log('✓ Skills backfill completed.');

  // 5. Backfill Profile location
  console.log('5. Backfilling Profile location into ProfileTranslation...');
  const profiles = await prisma.profile.findMany();
  for (const p of profiles) {
    if (p.location) {
      await prisma.$executeRawUnsafe(
        `UPDATE "ProfileTranslation" SET "location" = $1 WHERE "profileId" = $2 AND ("location" IS NULL OR "location" = '')`,
        p.location,
        p.id
      );
    }
  }
  console.log('✓ Profile location backfill completed.');

  // 6. Backfill Experience institution
  console.log('6. Backfilling Experience institution into ExperienceTranslation...');
  const exps = await prisma.experience.findMany();
  for (const e of exps) {
    if (e.institution) {
      await prisma.$executeRawUnsafe(
        `UPDATE "ExperienceTranslation" SET "institution" = $1 WHERE "experienceId" = $2 AND ("institution" IS NULL OR "institution" = '')`,
        e.institution,
        e.id
      );
    }
  }
  console.log('✓ Experience institution backfill completed.');

  console.log('\n=== Schema Translation Migration Completed Successfully! ===');
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
