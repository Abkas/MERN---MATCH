import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Clock, Users, DollarSign, Activity } from 'lucide-react';
import styles from '../pages/css/BookFutsal.module.css';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import SeatSelectionModal from './SeatSelectionModal';
import { getSlotTimeStatusAndSync } from '../utils/slotTimeStatus';
import { useAuthStore } from '../store/useAuthStore';

// Helper function to check if a slot is within opening hours
const isSlotWithinOpeningHours = (slot, futsal) => {
  if (!futsal?.openingHours) return true; // If no opening hours set, consider all slots available

  const [openingTime, closingTime] = futsal.openingHours.split(' - ').map(time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours;
  });

  const [slotStartTime] = slot.time.split('-')[0].split(':').map(Number);
  return slotStartTime >= openingTime && slotStartTime < closingTime;
};

// Accept maxPrice as prop
const QuickJoinSection = ({ futsal, maxPrice, onHasSlots, requiredSeats }) => {
  const { authUser } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSlots = async () => {
    if (!futsal._id) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/slots/${futsal._id}/slots`, {
        params: { date: selectedDate }
      });

      if (response.data.success) {
        const sortedSlots = response.data.message.sort((a, b) => {
          const timeA = a.time.split('-')[0];
          const timeB = b.time.split('-')[0];
          return timeA.localeCompare(timeB);
        });
        setSlots(sortedSlots);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      toast.error('Failed to fetch slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchSlots();
    }
  }, [isExpanded, selectedDate, futsal._id]);

  const handleJoinNow = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (seats, teamChoice) => {
    try {
      const response = await axiosInstance.post(`/slots/${futsal._id}/slots/${selectedSlot._id}/join`, {
        seats: seats,
        teamChoice: teamChoice
      });
      if (response.data.success) {
        toast.success('Successfully joined the slot!');
        fetchSlots(); 
      } else {
        toast.error(response.data.message || 'Failed to join slot');
      }
    } catch (err) {
      console.error('Error joining slot:', err);
      toast.error(err.response?.data?.message || 'Failed to join slot');
    }
  };

  // Memoize filtered slots for performance and to use for hiding futsal if empty
  const filteredSlots = useMemo(() =>
    slots.filter(slot => {
      const timeStatus = getSlotTimeStatusAndSync(slot, selectedDate);
      const currentPlayersCount = Array.isArray(slot.players) ? slot.players.length : (slot.currentPlayers || 0);
      const availableSeats = slot.maxPlayers - currentPlayersCount;
      const hasEnoughSeats = requiredSeats ? availableSeats >= requiredSeats : availableSeats > 0;
      const priceOk = maxPrice !== undefined ? slot.price <= maxPrice : true;
      const isWithinHours = isSlotWithinOpeningHours(slot, futsal);

      return (
        slot.status === 'available' &&
        timeStatus === 'upcoming' &&
        hasEnoughSeats &&
        priceOk &&
        isWithinHours
      );
    }), [slots, selectedDate, maxPrice, requiredSeats, futsal]);

  // Notify parent if this futsal has any slots after filtering
  useEffect(() => {
    if (typeof onHasSlots === 'function') {
      onHasSlots(futsal._id, filteredSlots.length > 0);
    }
    // eslint-disable-next-line
  }, [filteredSlots.length]);

  // If expanded and no slots match, hide this futsal section
  if (isExpanded && filteredSlots.length === 0 && !loading) {
    return null;
  }

  return (
    <div className={styles.venueItem}>
      <div className={styles.venueHeader}>
        <button 
          className={styles.venueName} 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          {futsal.name}
        </button>
        <div className={styles.venueInfo}>
          {/* Only show location and price, remove slot count and distance */}
          <span className={styles.infoTag}>
            {futsal.location}
          </span>
          <span className={styles.infoTag}>
            ₹{futsal.price || '2000'} per court
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.venueDetails}>
          <div className={styles.dateNavigation}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
          </div>

          {loading ? (
            <div className={styles.loading}>Loading slots...</div>
          ) : filteredSlots.length === 0 ? (
            <div className={styles.noSlots}>No slots available for this date</div>
          ) : (
            <div className={styles.timeSlots}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: '0 8px',
                background: 'transparent'
              }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', borderRadius: '8px 0 0 8px', textAlign: 'left', borderBottom: '2px solid #000' }}><Clock size={18} style={{ marginRight: 8 }} /> Time</th>
                    <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #000' }}><Users size={18} style={{ marginRight: 8 }} /> Players</th>
                    <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #000' }}>₹ Price</th>
                    <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #000' }}><Activity size={18} style={{ marginRight: 8 }} /> Status</th>
                    <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #000' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot) => {
                    const timeStatus = getSlotTimeStatusAndSync(slot, selectedDate);
                    const isWithinHours = isSlotWithinOpeningHours(slot, futsal);
                    let statusLabel = '';
                    let statusClass = '';

                    if (!isWithinHours) {
                      statusLabel = 'Unavailable';
                      statusClass = styles.statusUnavailable;
                    } else if (timeStatus === 'ended') {
                      statusLabel = 'Ended';
                      statusClass = styles.statusEnded;
                    } else if (timeStatus === 'playing') {
                      statusLabel = 'Playing';
                      statusClass = styles.statusPlaying;
                    } else if (timeStatus === 'soon') {
                      statusLabel = 'Starting Soon';
                      statusClass = styles.statusSoon;
                    } else {
                      statusLabel = slot.status;
                      statusClass = styles[`status${slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}`] || '';
                    }
                    const canJoin = isWithinHours && timeStatus === 'upcoming' && slot.status === 'available';
                    let userTeam = null;
                    if (authUser && slot.teamA && slot.teamA.some(u => (u._id || u) === authUser._id)) userTeam = 'A';
                    if (authUser && slot.teamB && slot.teamB.some(u => (u._id || u) === authUser._id)) userTeam = 'B';
                    return (
                      <tr key={slot._id} style={{ 
                        background: '#fff', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        borderRadius: 8,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}>
                        <td style={{ 
                          padding: '16px', 
                          fontWeight: 600, 
                          color: '#000',
                          borderRadius: '8px 0 0 8px',
                          borderBottom: '1px solid #e2e8f0'
                        }}>{slot.time}</td>
                        <td style={{ 
                          padding: '16px', 
                          fontWeight: 600, 
                          color: '#000',
                          borderBottom: '1px solid #e2e8f0'
                        }}>{slot.currentPlayers || 0}/{slot.maxPlayers}</td>
                        <td style={{ 
                          padding: '16px', 
                          fontWeight: 600, 
                          color: '#000',
                          borderBottom: '1px solid #e2e8f0'
                        }}>₹{slot.price}</td>
                        <td style={{ 
                          padding: '16px',
                          borderBottom: '1px solid #e2e8f0'
                        }}>
                          <span className={`${styles.status} ${statusClass}`} style={{ 
                            background: '#f8fafc', 
                            color: '#000', 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '14px' 
                          }}>{statusLabel}</span>
                        </td>
                        <td style={{ 
                          padding: '16px',
                          borderBottom: '1px solid #e2e8f0'
                        }}>
                          {userTeam && (
                            <div style={{marginBottom:6,fontWeight:600,color:userTeam==='A'?'#2563eb':'#b91c1c'}}>
                              You are in Team {userTeam}
                            </div>
                          )}
                          <button
                            className={`${styles.btnJoinNow} ${!canJoin ? styles.btnJoinNowDisabled : ''}`}
                            onClick={() => canJoin && handleJoinNow(slot)}
                            disabled={!canJoin}
                            style={{
                              background: canJoin ? '#000' : '#f8fafc',
                              color: canJoin ? '#fff' : '#000',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              cursor: canJoin ? 'pointer' : 'not-allowed',
                              opacity: canJoin ? 1 : 0.5
                            }}
                          >
                            Join Now
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <SeatSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slot={selectedSlot}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};

export default QuickJoinSection;