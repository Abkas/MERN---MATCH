import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { getSlotTimeStatus } from '../utils/slotTimeStatus';
import styles from '../pages/css/BookFutsal.module.css';

// Helper to count how many times a userId appears in an array
const getUserBookingCount = (arr, userId) => arr.filter(id => (id._id || id) === userId).length;

const SeatSelectionModal = ({ isOpen, onClose, slot, onConfirm }) => {
  const [players, setPlayers] = useState(1);
  const [totalPrice, setTotalPrice] = useState(slot?.price || 0);
  const [teamChoice, setTeamChoice] = useState('A');

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
    onConfirm(players, teamChoice);
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
          <div style={{display:'flex',justifyContent:'space-between',gap:24,marginBottom:18}}>
            <div style={{flex:1,border:'1px solid #e0e0e0',borderRadius:8,padding:12}}>
              <div style={{fontWeight:700,fontSize:16,color:'#2563eb',marginBottom:4}}>Team A ({slot?.teamA?.length || 0})</div>
              {(slot?.teamA || []).length === 0 ? <div style={{color:'#aaa',fontSize:13}}>No players yet</div> :
                slot.teamA.map((user, i) => {
                  const userId = user._id || user;
                  const count = getUserBookingCount(slot.teamA, userId);
                  // Only show the first occurrence of each user, with count if >1
                  if (slot.teamA.findIndex(u => (u._id || u) === userId) === i) {
                    return <div key={i} style={{fontSize:14,color:'#222',margin:'2px 0'}}>
                      {(user.username || user)}{count > 1 ? ` x${count}` : ''}
                    </div>;
                  }
                  return null;
                })}
            </div>
            <div style={{flex:1,border:'1px solid #e0e0e0',borderRadius:8,padding:12}}>
              <div style={{fontWeight:700,fontSize:16,color:'#b91c1c',marginBottom:4,textAlign:'right'}}>Team B ({slot?.teamB?.length || 0})</div>
              {(slot?.teamB || []).length === 0 ? <div style={{color:'#aaa',fontSize:13,textAlign:'right'}}>No players yet</div> :
                slot.teamB.map((user, i) => {
                  const userId = user._id || user;
                  const count = getUserBookingCount(slot.teamB, userId);
                  if (slot.teamB.findIndex(u => (u._id || u) === userId) === i) {
                    return <div key={i} style={{fontSize:14,color:'#222',margin:'2px 0',textAlign:'right'}}>
                      {(user.username || user)}{count > 1 ? ` x${count}` : ''}
                    </div>;
                  }
                  return null;
                })}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontWeight:600,marginRight:8}}>Choose Team:</label>
            <select value={teamChoice} onChange={e => setTeamChoice(e.target.value)} style={{padding:'4px 12px',fontSize:15}}>
              <option value="A">Team A</option>
              <option value="B">Team B</option>
            </select>
          </div>
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
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <div className={styles.totalPrice}>
            <span>Total Price:</span>
            <span className={styles.price}>₹{totalPrice}</span>
          </div>
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