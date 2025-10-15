import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSlots() {
  const floors = ['B1', 'B2', 'B3', 'B4', 'B5'];
  const slotsPerFloor = 15;
  const slots = [];

  // Generate slots for each floor
  for (const floor of floors) {
    for (let i = 1; i <= slotsPerFloor; i++) {
      const slotNumber = `${floor}-${i.toString().padStart(2, '0')}`;
      
      // Determine slot type based on position
      let slotType: 'HANDICAP_ACCESSIBLE' | 'EV' | 'COMPACT' | 'REGULAR';
      
      if (i <= 2) {
        slotType = 'HANDICAP_ACCESSIBLE';
      } else if (i <= 4) {
        slotType = 'EV';
      } else if (i <= 8) {
        slotType = 'COMPACT';
      } else {
        slotType = 'REGULAR';
      }
      
      slots.push({
        slotNumber,
        slotType,
        status: 'AVAILABLE' as const
      });
    }
  }

  console.log(`Creating ${slots.length} parking slots...`);
  console.log('Distribution per floor:');
  console.log('- HANDICAP_ACCESSIBLE: 2 slots (01-02)');
  console.log('- EV: 2 slots (03-04)');
  console.log('- COMPACT: 4 slots (05-08)');
  console.log('- REGULAR: 7 slots (09-15)');
  console.log('');

  try {
    // Create all slots using Prisma
    const result = await prisma.parkingSlot.createMany({
      data: slots,
      skipDuplicates: true // Skip if slot already exists
    });

    console.log(`✅ Successfully created ${result.count} new slots!`);
    
    // Display summary
    console.log('\nCreated slots:');
    for (const floor of floors) {
      console.log(`\n${floor}:`);
      console.log(`  - ${floor}-01 to ${floor}-02: HANDICAP_ACCESSIBLE`);
      console.log(`  - ${floor}-03 to ${floor}-04: EV`);
      console.log(`  - ${floor}-05 to ${floor}-08: COMPACT`);
      console.log(`  - ${floor}-09 to ${floor}-15: REGULAR`);
    }

    // Show total counts by type
    const counts = await prisma.parkingSlot.groupBy({
      by: ['slotType'],
      _count: true,
      orderBy: {
        slotType: 'asc'
      }
    });

    console.log('\nTotal slots by type:');
    counts.forEach(({ slotType, _count }: any) => {
      console.log(`  - ${slotType}: ${_count}`);
    });

  } catch (error) {
    console.error('❌ Error creating slots:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed script
seedSlots();