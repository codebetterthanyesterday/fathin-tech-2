import { Pool } from 'pg';

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('--- Starting ContactMessage Status Migration ---');
    const beforeCountRes = await pool.query('SELECT count(*) FROM "ContactMessage"');
    const beforeCount = parseInt(beforeCountRes.rows[0].count, 10);
    console.log(`Total rows before migration: ${beforeCount}`);

    // 1. Create Enum type if not exists
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('Enum ContactMessageStatus ensured.');

    // 2. Add status column with default 'NEW'
    await pool.query(`
      ALTER TABLE "ContactMessage" 
      ADD COLUMN IF NOT EXISTS "status" "ContactMessageStatus" DEFAULT 'NEW';
    `);
    console.log('Column status added.');

    // 3. Backfill data
    // Check if isRead column still exists
    const colCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'ContactMessage' AND column_name = 'isRead'
    `);

    if (colCheck.rows.length > 0) {
      const readUpdate = await pool.query(`
        UPDATE "ContactMessage" 
        SET "status" = 'READ' 
        WHERE "isRead" = true
      `);
      console.log(`Backfilled status 'READ' for ${readUpdate.rowCount} rows.`);

      const newUpdate = await pool.query(`
        UPDATE "ContactMessage" 
        SET "status" = 'NEW' 
        WHERE "isRead" = false
      `);
      console.log(`Backfilled status 'NEW' for ${newUpdate.rowCount} rows.`);

      // 4. Drop old isRead column
      await pool.query(`ALTER TABLE "ContactMessage" DROP COLUMN "isRead"`);
      console.log('Dropped legacy isRead column.');
    } else {
      console.log('Legacy isRead column already dropped.');
    }

    // 5. Index on status
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "ContactMessage_status_idx" ON "ContactMessage"("status")
    `);
    console.log('Index ContactMessage_status_idx ensured.');

    // 6. Verify row counts and distribution
    const afterCountRes = await pool.query('SELECT count(*) FROM "ContactMessage"');
    const afterCount = parseInt(afterCountRes.rows[0].count, 10);
    console.log(`Total rows after migration: ${afterCount}`);

    if (beforeCount !== afterCount) {
      throw new Error(`Row count mismatch: before=${beforeCount}, after=${afterCount}`);
    }

    const distRes = await pool.query('SELECT "status", count(*) FROM "ContactMessage" GROUP BY "status"');
    console.log('Status distribution:', distRes.rows);

    const sampleRes = await pool.query('SELECT * FROM "ContactMessage" LIMIT 5');
    console.log('Sample rows:', sampleRes.rows);

    console.log('--- Migration Completed Successfully with ZERO data loss ---');
  } finally {
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
