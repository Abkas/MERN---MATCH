import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Users, DollarSign } from 'lucide-react';
import styles from '../pages/css/BookFutsal.module.css';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import SeatSelectionModal from './SeatSelectionModal';
import { getSlotTimeStatus } from '../utils/slotTimeStatus';

const QuickJoinSection = ({ futsal }) => {
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

  const handleConfirmBooking = async (seats) => {
    try {
      const response = await axiosInstance.post(`/slots/${futsal._id}/slots/${selectedSlot._id}/join`, {
        seats: seats
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
          <span className={styles.infoTag}>
            {slots.filter(slot => slot.status === 'available').length} Slots Available
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
          ) : slots.length === 0 ? (
            <div className={styles.noSlots}>No slots available for this date</div>
          ) : (
            <div className={styles.timeSlots}>
              <table>
                <thead>
                  <tr>
                    <th><Clock size={16} /> Time</th>
                    <th><Users size={16} /> Players</th>
                    <th><DollarSign size={16} /> Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slots
                    .filter(slot => {
                      const timeStatus = getSlotTimeStatus(slot, selectedDate);
                      const notFull = (slot.currentPlayers || 0) < slot.maxPlayers;
                      return (
                        slot.status === 'available' &&
                        timeStatus === 'upcoming' &&
                        notFull
                        // Optionally: && slot.hasTableToJoin
                      );
                    })
                    .map((slot) => {
                      const timeStatus = getSlotTimeStatus(slot, selectedDate);
                      let statusLabel = '';
                      let statusClass = '';
                      if (timeStatus === 'ended') {
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
                      const canJoin = timeStatus === 'upcoming' && slot.status === 'available';
                      return (
                        <tr key={slot._id}>
                          <td>{slot.time}</td>
                          <td>{slot.currentPlayers || 0}/{slot.maxPlayers}</td>
                          <td>₹{slot.price}</td>
                          <td>
                            <span className={`${styles.status} ${statusClass}`}>{statusLabel}</span>
                          </td>
                          <td>
                            <button
                              className={`${styles.btnJoinNow} ${!canJoin ? styles.btnJoinNowDisabled : ''}`}
                              onClick={() => canJoin && handleJoinNow(slot)}
                              disabled={!canJoin}
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