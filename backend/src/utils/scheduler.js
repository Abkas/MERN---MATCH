import { sendSlotReminders } from './reminderUtils.js';

/**
 * Sets up scheduled tasks to run at specific intervals
 */
export const setupScheduler = () => {
  // Run slot reminders every 20 minutes
  const TWENTY_MINUTES = 20 * 60 * 1000;
  
  console.log('Setting up scheduled tasks...');
  
  // Start the reminder check immediately
  setTimeout(async () => {
    console.log('Running initial reminder check...');
    try {
      const count = await sendSlotReminders();
      console.log(`Sent ${count} reminders`);
    } catch (err) {
      console.error('Error in reminder task:', err);
    }
  }, 5000); // Wait 5 seconds before first run
  
  // Then run every 20 minutes
  setInterval(async () => {
    console.log('Running scheduled reminder check...');
    try {
      const count = await sendSlotReminders();
      console.log(`Sent ${count} reminders`);
    } catch (err) {
      console.error('Error in reminder task:', err);
    }
  }, TWENTY_MINUTES);
  
  console.log('Scheduler initialized');
};
