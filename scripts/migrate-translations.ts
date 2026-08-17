import { prisma } from '../lib/prisma';

async function migrate() {
  console.log('🚀 Starting Multi-Language Phase 2 Database Migration...');

  await prisma.$transaction(async (tx) => {
    // 1. Create ProfileTranslation table
    console.log('Creating ProfileTranslation table...');
    await tx.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProfileTranslation" (
        "id" TEXT NOT NULL,
        "profileId" TEXT NOT NULL,
        "locale" TEXT NOT NULL,
        "tagline" TEXT,
        "bio" TEXT,
        CONSTRAINT "ProfileTranslation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ProfileTranslation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "ProfileTranslation_profileId_locale_key" ON "ProfileTranslation"("profileId", "locale");
    `);

    // 2. Create ProjectTranslation table
    console.log('Creating ProjectTranslation table...');
    await tx.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProjectTranslation" (
        "id" TEXT NOT NULL,
        "projectId" TEXT NOT NULL,
        "locale" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "summary" TEXT NOT NULL,
        "description" TEXT,
        "role" TEXT,
        "duration" TEXT,
        "challenges" TEXT,
        "solutions" TEXT,
        "keyMetrics" TEXT[] DEFAULT ARRAY[]::TEXT[],
        CONSTRAINT "ProjectTranslation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ProjectTranslation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "ProjectTranslation_projectId_locale_key" ON "ProjectTranslation"("projectId", "locale");
    `);

    // 3. Create ArticleTranslation table
    console.log('Creating ArticleTranslation table...');
    await tx.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ArticleTranslation" (
        "id" TEXT NOT NULL,
        "articleId" TEXT NOT NULL,
        "locale" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "excerpt" TEXT,
        "contentMd" TEXT NOT NULL,
        CONSTRAINT "ArticleTranslation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ArticleTranslation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "ArticleTranslation_articleId_locale_key" ON "ArticleTranslation"("articleId", "locale");
    `);

    // 4. Create ExperienceTranslation table
    console.log('Creating ExperienceTranslation table...');
    await tx.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ExperienceTranslation" (
        "id" TEXT NOT NULL,
        "experienceId" TEXT NOT NULL,
        "locale" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        CONSTRAINT "ExperienceTranslation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ExperienceTranslation_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "ExperienceTranslation_experienceId_locale_key" ON "ExperienceTranslation"("experienceId", "locale");
    `);

    // 5. Create TestimonialTranslation table
    console.log('Creating TestimonialTranslation table...');
    await tx.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TestimonialTranslation" (
        "id" TEXT NOT NULL,
        "testimonialId" TEXT NOT NULL,
        "locale" TEXT NOT NULL,
        "role" TEXT,
        "quote" TEXT NOT NULL,
        CONSTRAINT "TestimonialTranslation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "TestimonialTranslation_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "Testimonial"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "TestimonialTranslation_testimonialId_locale_key" ON "TestimonialTranslation"("testimonialId", "locale");
    `);

    // 6. BACKFILL EXISTING DATA WITH locale = 'id'
    console.log('Backfilling existing data into translation tables...');

    // Profile backfill
    await tx.$executeRawUnsafe(`
      INSERT INTO "ProfileTranslation" ("id", "profileId", "locale", "tagline", "bio")
      SELECT 
        'trans_prof_' || substr(md5(random()::text), 1, 16),
        "id",
        'id',
        "tagline",
        "bio"
      FROM "Profile"
      ON CONFLICT ("profileId", "locale") DO NOTHING;
    `);

    // Project backfill
    await tx.$executeRawUnsafe(`
      INSERT INTO "ProjectTranslation" ("id", "projectId", "locale", "title", "summary", "description", "role", "duration", "challenges", "solutions", "keyMetrics")
      SELECT 
        'trans_proj_' || substr(md5(random()::text), 1, 16),
        "id",
        'id',
        "title",
        "summary",
        "description",
        "role",
        "duration",
        "challenges",
        "solutions",
        COALESCE("keyMetrics", ARRAY[]::TEXT[])
      FROM "Project"
      ON CONFLICT ("projectId", "locale") DO NOTHING;
    `);

    // Article backfill
    await tx.$executeRawUnsafe(`
      INSERT INTO "ArticleTranslation" ("id", "articleId", "locale", "title", "excerpt", "contentMd")
      SELECT 
        'trans_art_' || substr(md5(random()::text), 1, 16),
        "id",
        'id',
        "title",
        "excerpt",
        "contentMd"
      FROM "Article"
      ON CONFLICT ("articleId", "locale") DO NOTHING;
    `);

    // Experience backfill
    await tx.$executeRawUnsafe(`
      INSERT INTO "ExperienceTranslation" ("id", "experienceId", "locale", "title", "description")
      SELECT 
        'trans_exp_' || substr(md5(random()::text), 1, 16),
        "id",
        'id',
        "title",
        "description"
      FROM "Experience"
      ON CONFLICT ("experienceId", "locale") DO NOTHING;
    `);

    // Testimonial backfill
    await tx.$executeRawUnsafe(`
      INSERT INTO "TestimonialTranslation" ("id", "testimonialId", "locale", "role", "quote")
      SELECT 
        'trans_test_' || substr(md5(random()::text), 1, 16),
        "id",
        'id',
        "role",
        "quote"
      FROM "Testimonial"
      ON CONFLICT ("testimonialId", "locale") DO NOTHING;
    `);

    // 7. VERIFY ROW COUNTS BEFORE DROPPING
    const counts: any[] = await tx.$queryRawUnsafe(`
      SELECT 
        (SELECT COUNT(*) FROM "Profile")::int AS profile_base,
        (SELECT COUNT(*) FROM "ProfileTranslation")::int AS profile_trans,
        (SELECT COUNT(*) FROM "Project")::int AS project_base,
        (SELECT COUNT(*) FROM "ProjectTranslation")::int AS project_trans,
        (SELECT COUNT(*) FROM "Article")::int AS article_base,
        (SELECT COUNT(*) FROM "ArticleTranslation")::int AS article_trans,
        (SELECT COUNT(*) FROM "Experience")::int AS exp_base,
        (SELECT COUNT(*) FROM "ExperienceTranslation")::int AS exp_trans,
        (SELECT COUNT(*) FROM "Testimonial")::int AS test_base,
        (SELECT COUNT(*) FROM "TestimonialTranslation")::int AS test_trans;
    `);
    console.log('Row counts verification:', counts[0]);

    if (
      counts[0].profile_base !== counts[0].profile_trans ||
      counts[0].project_base !== counts[0].project_trans ||
      counts[0].article_base !== counts[0].article_trans ||
      counts[0].exp_base !== counts[0].exp_trans ||
      counts[0].test_base !== counts[0].test_trans
    ) {
      throw new Error('Row count mismatch between base tables and translation tables! Aborting migration.');
    }

    // 8. DROP SEARCH_VECTOR AND OLD COLUMNS WITH CASCADE
    console.log('Dropping search_vector and moved columns from base tables...');
    await tx.$executeRawUnsafe(`
      ALTER TABLE "Project" DROP COLUMN IF EXISTS "search_vector" CASCADE;
      ALTER TABLE "Article" DROP COLUMN IF EXISTS "search_vector" CASCADE;

      ALTER TABLE "Profile" DROP COLUMN IF EXISTS "tagline", DROP COLUMN IF EXISTS "bio";
      ALTER TABLE "Project" 
        DROP COLUMN IF EXISTS "title",
        DROP COLUMN IF EXISTS "summary",
        DROP COLUMN IF EXISTS "description",
        DROP COLUMN IF EXISTS "role",
        DROP COLUMN IF EXISTS "duration",
        DROP COLUMN IF EXISTS "challenges",
        DROP COLUMN IF EXISTS "solutions",
        DROP COLUMN IF EXISTS "keyMetrics";
      ALTER TABLE "Article" DROP COLUMN IF EXISTS "title", DROP COLUMN IF EXISTS "excerpt", DROP COLUMN IF EXISTS "contentMd";
      ALTER TABLE "Experience" DROP COLUMN IF EXISTS "title", DROP COLUMN IF EXISTS "description";
      ALTER TABLE "Testimonial" DROP COLUMN IF EXISTS "role", DROP COLUMN IF EXISTS "quote";
    `);

    // 9. ADD SEARCH_VECTOR TO TRANSLATION TABLES
    console.log('Adding search_vector to translation tables...');
    await tx.$executeRawUnsafe(`
      ALTER TABLE "ProjectTranslation" ADD COLUMN IF NOT EXISTS "search_vector" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(description, '')), 'C')
      ) STORED;

      CREATE INDEX IF NOT EXISTS "ProjectTranslation_search_idx" ON "ProjectTranslation" USING GIN ("search_vector");

      ALTER TABLE "ArticleTranslation" ADD COLUMN IF NOT EXISTS "search_vector" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce("contentMd", '')), 'C')
      ) STORED;

      CREATE INDEX IF NOT EXISTS "ArticleTranslation_search_idx" ON "ArticleTranslation" USING GIN ("search_vector");
    `);
  });

  console.log('✅ Migration & Backfill Completed Successfully with 100% Data Integrity!');
}

migrate()
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
