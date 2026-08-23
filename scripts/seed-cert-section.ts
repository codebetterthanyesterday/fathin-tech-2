import { prisma } from '../lib/prisma';

async function main() {
  const existing = await prisma.section.findFirst({ where: { type: 'CERTIFICATIONS' } });
  if (!existing) {
    const maxOrder = await prisma.section.aggregate({ _max: { order: true } });
    const newOrder = (maxOrder._max.order ?? -1) + 1;
    await prisma.section.create({
      data: {
        type: 'CERTIFICATIONS',
        content: { type: 'CERTIFICATIONS', filter: 'featured', limit: 4 },
        isVisible: false,
        order: newOrder
      }
    });
    console.log('Created CERTIFICATIONS section row (isVisible: false)');
  } else {
    console.log('CERTIFICATIONS section row already exists, id:', existing.id);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
