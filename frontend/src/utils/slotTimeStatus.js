// src/utils/slotTimeStatus.js
// Returns one of: 'ended', 'playing', 'soon', 'upcoming'
export function getSlotTimeStatus(slot, selectedDate) {
  if (!slot || !slot.time) return null;
  
  const [start, end] = slot.time.split('-').map(time => time.trim());
  const slotDate = selectedDate || slot.date;
  
  const now = new Date();
  const startDate = new Date(`${slotDate}T${start}`);
  const endDate = new Date(`${slotDate}T${end}`);
  
  // Check if the slot has ended
  if (now > endDate) {
    return 'ended';
  }
  
  // Check if the slot is currently playing
  if (now >= startDate && now <= endDate) {
    return 'playing';
  }
  
  // Check if the slot is starting soon (within 30 minutes)
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
  if (now < startDate && thirtyMinutesFromNow >= startDate) {
    return 'soon';
  }
  
  // If none of the above, the slot is upcoming
  return 'upcoming';
}
