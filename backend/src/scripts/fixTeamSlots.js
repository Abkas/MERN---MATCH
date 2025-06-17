import mongoose from 'mongoose';
import MyTeam from '../models/myteam.model.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mernmatch';

async function fixTeamSlots() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected!');
  const teams = await MyTeam.find({});
  console.log(`Found ${teams.length} teams.`);
  let updated = 0;
  for (const team of teams) {
    console.log(`Checking team: ${team._id}, slots:`, team.slots);
    if (!Array.isArray(team.slots) || team.slots.length !== 8) {
      // Prepare new slots array (each slot must be a unique object)
      const slots = Array.from({ length: 8 }, () => ({ status: 'empty' }));
      // Owner always in slot 0
      slots[0] = { user: team.owner, status: 'filled' };
      // Try to preserve any existing filled slots (except slot 0)
      if (Array.isArray(team.slots)) {
        team.slots.forEach((slot, idx) => {
          if (idx > 0 && slot && slot.user && slot.status === 'filled') {
            slots[idx] = { user: slot.user, status: 'filled' };
          }
        });
      }
      team.slots = slots;
      await team.save();
      updated++;
      console.log(`Fixed team: ${team._id}`);
    }
  }
  console.log(`Done. Updated ${updated} teams.`);
  process.exit(0);
}

fixTeamSlots().catch(err => {
  console.error('Error fixing teams:', err);
  process.exit(1);
});
