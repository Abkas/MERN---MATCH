import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
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
    
    // Allow increasing players up to available slots
    if (increment > 0 && newPlayers <= availableSlots) {
      setPlayers(newPlayers);
    }
    // Allow decreasing players down to 1
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
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal; 