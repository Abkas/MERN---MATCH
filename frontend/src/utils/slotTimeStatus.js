// src/utils/slotTimeStatus.js
// Returns one of: 'ended', 'playing', 'soon', 'upcoming'
export function getSlotTimeStatus(slot, selectedDate) {
  if (!slot || !slot.time) return null;
  const [start, end] = slot.time.split('-');
  const slotDate = selectedDate || slot.date;
  const now = new Date();
  const startDate = new Date(`${slotDate}T${start}`);
  const endDate = new Date(`${slotDate}T${end}`);
  if (now > endDate) return 'ended';
  if (now >= startDate && now <= endDate) return 'playing';
  if (startDate - now <= 10 * 60 * 1000 && startDate > now) return 'soon';
  return 'upcoming';
}
