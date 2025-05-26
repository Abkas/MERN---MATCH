import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { getSlotTimeStatus } from '../utils/slotTimeStatus';
import styles from '../pages/css/BookFutsal.module.css';

const SeatSelectionModal = ({ isOpen, onClose, slot, onConfirm }) => {
  const [players, setPlayers] = useState(1);
  const [totalPrice, setTotalPrice] = useState(slot?.price || 0);

  useEffect(() => {
    if (slot) {
      setTotalPrice(slot.price * players);
    }
  }, [players, slot]);

  const handlePlayerChange = (increment) => {
    const newPlayers = players + increment;
    const currentPlayers = slot?.currentPlayers || 0;
    const maxPlayers = slot?.maxPlayers || 10;
    const availableSlots = maxPlayers - currentPlayers;
    
    if (increment > 0 && newPlayers <= availableSlots) {
      setPlayers(newPlayers);
    }
    else if (increment < 0 && newPlayers >= 1) {
      setPlayers(newPlayers);
    }
  };

  const handleConfirm = () => {
    onConfirm(players);
    onClose();
  };

  if (!isOpen) return null;

  const currentPlayers = slot?.currentPlayers || 0;
  const maxPlayers = slot?.maxPlayers || 10;
  const availableSlots = maxPlayers - currentPlayers;
  const slotDate = slot?.date;
  const timeStatus = getSlotTimeStatus(slot, slotDate);
  const canBook = timeStatus === 'upcoming';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Select Number of Players</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.slotInfo}>
            <p className={styles.timeSlot}>{slot?.time}</p>
            <p className={styles.pricePerSeat}>₹{slot?.price} per player</p>
            <p className={styles.availableSlots}>
              Available slots: {availableSlots} (Current: {currentPlayers}/{maxPlayers})
            </p>
          </div>

          <div className={styles.seatSelector}>
            <button 
              className={styles.seatButton}
              onClick={() => handlePlayerChange(-1)}
              disabled={players <= 1}
            >
              <Minus size={20} />
            </button>
            <span className={styles.seatCount}>{players}</span>
            <button 
              className={styles.seatButton}
              onClick={() => handlePlayerChange(1)}
              disabled={players >= availableSlots}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className={styles.totalPrice}>
            <span>Total Price:</span>
            <span className={styles.price}>₹{totalPrice}</span>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm} disabled={!canBook}>
            Confirm Booking
          </button>
        </div>
        {!canBook && (
          <div style={{ color: '#d32f2f', marginTop: 8, textAlign: 'center', fontWeight: 500 }}>
            {timeStatus === 'ended' && 'This slot has ended.'}
            {timeStatus === 'playing' && 'This slot is currently playing.'}
            {timeStatus === 'soon' && 'This slot is starting soon. Please try another slot.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionModal;