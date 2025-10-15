const axios = require('axios');

const API_URL = 'http://localhost:8008/api';

async function seedSlots() {
  const floors = ['B1', 'B2', 'B3', 'B4', 'B5'];
  const slotsPerFloor = 15;
  const slots = [];

  // Generate slots for each floor
  floors.forEach((floor) => {
    for (let i = 1; i <= slotsPerFloor; i++) {
      const slotNumber = `${floor}-${i.toString().padStart(2, '0')}`;
      
      // Determine slot type based on position
      let slotType;
      
      if (i <= 2) {
        // First 2 slots are HANDICAP_ACCESSIBLE
        slotType = 'HANDICAP_ACCESSIBLE';
      } else if (i <= 4) {
        // Next 2 slots are EV
        slotType = 'EV';
      } else if (i <= 8) {
        // Next 4 slots are COMPACT
        slotType = 'COMPACT';
      } else {
        // Remaining slots are REGULAR
        slotType = 'REGULAR';
      }
      
      slots.push({
        slotNumber,
        slotType
      });
    }
  });

  console.log(`Creating ${slots.length} parking slots...`);
  console.log('Distribution per floor:');
  console.log('- HANDICAP_ACCESSIBLE: 2 slots (01-02)');
  console.log('- EV: 2 slots (03-04)');
  console.log('- COMPACT: 4 slots (05-08)');
  console.log('- REGULAR: 7 slots (09-15)');
  console.log('');

  try {
    // Send bulk create request
    const response = await axios.post(`${API_URL}/slots/bulk`, slots, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success) {
      console.log(`✅ Successfully created ${response.data.data.count} slots!`);
      
      // Display summary
      console.log('\nCreated slots:');
      floors.forEach(floor => {
        console.log(`\n${floor}:`);
        console.log(`  - ${floor}-01 to ${floor}-02: HANDICAP_ACCESSIBLE`);
        console.log(`  - ${floor}-03 to ${floor}-04: EV`);
        console.log(`  - ${floor}-05 to ${floor}-08: COMPACT`);
        console.log(`  - ${floor}-09 to ${floor}-15: REGULAR`);
      });
    } else {
      console.error('❌ Failed to create slots:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Error creating slots:', error.response?.data?.message || error.message);
  }
}

// Run the seed script
seedSlots();