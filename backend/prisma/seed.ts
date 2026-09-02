import { PrismaClient, SlotType } from '@prisma/client';

const prisma = new PrismaClient();

// How many slots of each type to create on a fresh database.
const SLOT_LAYOUT: Array<{ prefix: string; type: SlotType; count: number }> = [
  { prefix: 'R', type: SlotType.REGULAR, count: 12 },
  { prefix: 'C', type: SlotType.COMPACT, count: 6 },
  { prefix: 'EV', type: SlotType.EV, count: 4 },
  { prefix: 'H', type: SlotType.HANDICAP_ACCESSIBLE, count: 4 },
];

const DEMO_OPERATOR_EMAIL = 'demo@parkflow.app';

async function main() {
  // Demo operator — lets a reviewer request a login OTP for a known address.
  await prisma.user.upsert({
    where: { email: DEMO_OPERATOR_EMAIL },
    update: {},
    create: { email: DEMO_OPERATOR_EMAIL, role: 'OPERATOR' },
  });

  // Only bootstrap slots on an empty deployment; never disturb a populated one.
  const existingSlots = await prisma.parkingSlot.count();
  if (existingSlots > 0) {
    console.log(`Seed: ${existingSlots} slots already present, skipping slot bootstrap.`);
    return;
  }

  const slots = SLOT_LAYOUT.flatMap(({ prefix, type, count }) =>
    Array.from({ length: count }, (_, i) => ({
      slotNumber: `${prefix}-${String(i + 1).padStart(2, '0')}`,
      slotType: type,
    })),
  );

  await prisma.parkingSlot.createMany({ data: slots, skipDuplicates: true });
  console.log(`Seed: created ${slots.length} parking slots.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
