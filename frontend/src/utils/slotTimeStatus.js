// src/utils/slotTimeStatus.js
import axios from 'axios';

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

// Backend slot statuses allowed for sync
const BACKEND_SLOT_STATUSES = [
  'available', 'booked', 'full', 'reserved', 'ended', 'nofull'
];

/**
 * Updates the status of a slot in the backend to match the frontend's computed status.
 * @param {Object} slot - The slot object (must include _id, futsal, date, time, status).
 * @param {string} [selectedDate] - The date to use for status calculation (optional).
 * @returns {Promise<void>}
 */
async function syncSlotStatusWithBackend(slot, selectedDate) {
  const computedStatus = getSlotTimeStatus(slot, selectedDate);
  if (!computedStatus || computedStatus === slot.status) {
    console.log('[SlotSync] No sync needed:', { slotId: slot._id, futsal: slot.futsal, current: slot.status, computed: computedStatus });
    return;
  }
  // Only sync if computedStatus is a valid backend status
  if (!BACKEND_SLOT_STATUSES.includes(computedStatus)) {
    console.log('[SlotSync] Computed status not a backend status, skipping sync:', computedStatus);
    return;
  }
  try {
    console.log('[SlotSync] Syncing slot status to backend:', { slotId: slot._id, futsal: slot.futsal, from: slot.status, to: computedStatus });
    await axios.patch(`/api/v1/slots/${slot.futsal}/slots/${slot._id}/status`, { status: computedStatus });
  } catch (err) {
    console.error('Failed to sync slot status with backend:', err);
  }
}

/**
 * Checks slot time status and also updates backend status if needed.
 * @param {Object} slot - Slot object (must include _id, futsal, date, time, status)
 * @param {string} [selectedDate] - Optional date override
 * @returns {string|null} - The computed status
 */
export function getSlotTimeStatusAndSync(slot, selectedDate) {
  const status = getSlotTimeStatus(slot, selectedDate);
  if (slot && slot._id && (slot.futsal || slot.futsal?._id)) {
    const futsalId = typeof slot.futsal === 'object' ? slot.futsal._id : slot.futsal;
    console.log('[SlotSync] getSlotTimeStatusAndSync called', { slotId: slot._id, futsal: futsalId, status, slot });
    syncSlotStatusWithBackend({ ...slot, futsal: futsalId }, selectedDate);
  } else {
    console.warn('[SlotSync] Missing futsal or _id for slot, cannot sync', slot);
  }
  return status;
}
