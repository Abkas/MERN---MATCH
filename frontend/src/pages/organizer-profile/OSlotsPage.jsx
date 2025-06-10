import React, { useState, useEffect } from 'react'
import styles from '../css/OSlots.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Plus, Clock, Users, DollarSign, Calendar, Activity, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import { axiosInstance } from '../../lib/axios'

const OSlotsPage = () => {
  const navigate = useNavigate();
  const { logOut, authUser, fetchFutsals } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [futsals, setFutsals] = useState([]); // All futsals for organizer
  const [currentFutsalIdx, setCurrentFutsalIdx] = useState(0); // Index of futsal being shown
  const [editingSlot, setEditingSlot] = useState(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    maxPlayers: 10,
    price: 500,
    status: 'available'
  });

  // Fetch all futsals for organizer
  useEffect(() => {
    const getFutsals = async () => {
      setLoading(true);
      try {
        const res = await fetchFutsals();
        let futsalArr = res?.message || [];
        setFutsals(Array.isArray(futsalArr) ? futsalArr : []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch futsal data');
        setFutsals([]);
      } finally {
        setLoading(false);
      }
    };
    getFutsals();
  }, [fetchFutsals]);

  // Fetch slots for the current futsal and date
  useEffect(() => {
    const fetchSlots = async () => {
      if (!futsals.length) return;
      const futsal = futsals[currentFutsalIdx];
      if (!futsal) return;
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/slots/${futsal._id}/slots`, {
          params: { date: selectedDate }
        });
        if (response.data.success) {
          let slotList = response.data.message || [];
          // Sort by time
          slotList = slotList.sort((a, b) => {
            const timeA = a.time.split('-')[0];
            const timeB = b.time.split('-')[0];
            return timeA.localeCompare(timeB);
          });
          setSlots(slotList);
        } else {
          setSlots([]);
          setError('Failed to fetch slots');
        }
      } catch (err) {
        setSlots([]);
        setError('Failed to fetch slots');
      } finally {
        setLoading(false);
      }
    };
    if (futsals.length > 0) fetchSlots();
  }, [futsals, currentFutsalIdx, selectedDate]);

  // Swiping logic
  const handlePrevFutsal = () => {
    setCurrentFutsalIdx((prev) => (prev === 0 ? futsals.length - 1 : prev - 1));
  };
  const handleNextFutsal = () => {
    setCurrentFutsalIdx((prev) => (prev === futsals.length - 1 ? 0 : prev + 1));
  };
  useEffect(() => {
    if (currentFutsalIdx >= futsals.length) setCurrentFutsalIdx(0);
  }, [futsals, currentFutsalIdx]);

  // Date logic
  const getNextSevenDays = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };
  const isValidDate = (date) => getNextSevenDays().includes(date);
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (isValidDate(newDate)) {
      setSelectedDate(newDate);
    } else {
      toast.error('Please select a date within the next 7 days');
    }
  };

  // Slot management handlers (all use futsals[currentFutsalIdx])
  const futsal = futsals[currentFutsalIdx];
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 6);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const sortSlotsByTime = (slotsToSort) => {
    return [...slotsToSort].sort((a, b) => {
      const timeA = a.time.split('-')[0];
      const timeB = b.time.split('-')[0];
      return timeA.localeCompare(timeB);
    });
  };

  const handleAddSlot = async () => {
    if (!futsal) return;
    try {
      setLoading(true);
      if (!newSlot.startTime || !newSlot.endTime) {
        toast.error('Please select both start and end times');
        return;
      }
      const formattedTime = `${newSlot.startTime.padStart(5, '0')}-${newSlot.endTime.padStart(5, '0')}`;
      const isTimeSlotExists = slots.some(slot => slot.time === formattedTime);
      if (isTimeSlotExists) {
        toast.error('This time slot already exists');
        return;
      }
      const slotData = {
        date: selectedDate,
        time: formattedTime,
        maxPlayers: newSlot.maxPlayers,
        price: newSlot.price,
        status: newSlot.status
      };
      const response = await axiosInstance.post(`/slots/${futsal._id}/slots`, slotData);
      if (response.data.success) {
        const addedSlot = response.data.message;
        setSlots(prevSlots => sortSlotsByTime([...prevSlots, addedSlot]));
        setNewSlot({ startTime: '', endTime: '', maxPlayers: 10, price: 500, status: 'available' });
        setIsAddingSlot(false);
        toast.success('New slot added successfully');
      } else {
        toast.error('Failed to add slot: ' + (response.data.message || 'Unknown error'));
      }
      setError(null);
    } catch (err) {
      setError('Failed to add slot');
      toast.error('Failed to add slot');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlot = async (slotId, updates) => {
    if (!futsal) return;
    try {
      setLoading(true);
      const response = await axiosInstance.patch(`/slots/${futsal._id}/slots/${slotId}`, updates);
      if (response.data.success) {
        // Refetch slots after successful update to ensure UI is in sync
        const res = await axiosInstance.get(`/slots/${futsal._id}/slots`, { params: { date: selectedDate } });
        setSlots(res.data.message || []);
        toast.success('Slot updated successfully');
      } else {
        toast.error('Failed to update slot: ' + (response.data.message || 'Unknown error'));
      }
      setError(null);
    } catch (err) {
      setError('Failed to update slot');
      toast.error('Failed to update slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!futsal) return;
    try {
      const response = await axiosInstance.delete(`/slots/${futsal._id}/slots/${slotId}`);
      if (response.data.success) {
        setSlots(prevSlots => prevSlots.filter(slot => slot._id !== slotId));
        toast.success('Slot deleted successfully');
      } else {
        toast.error('Failed to delete slot');
      }
    } catch (error) {
      toast.error('Error deleting slot');
    }
  };

  const handleResetSlots = async () => {
    if (!futsal) return;
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/slots/${futsal._id}/slots/reset`, { date: selectedDate });
      if (response.data.success) {
        toast.success('Slots reset successfully');
        // Refetch slots
        const res = await axiosInstance.get(`/slots/${futsal._id}/slots`, { params: { date: selectedDate } });
        setSlots(res.data.message || []);
      } else {
        toast.error('Failed to reset slots');
      }
    } catch (err) {
      toast.error('Failed to reset slots');
    } finally {
      setLoading(false);
    }
  };

  // Edit slot logic
  const handleEditStart = (slot) => {
    setEditingSlot({ ...slot });
  };
  const handleEditCancel = () => setEditingSlot(null);
  const handleEditSave = async () => {
    if (!editingSlot || !editingSlot._id) return toast.error('Invalid slot data');
    await handleUpdateSlot(editingSlot._id, {
      maxPlayers: editingSlot.maxPlayers,
      price: editingSlot.price,
      status: editingSlot.status
    });
    setEditingSlot(null);
  };
  const handleEditChange = (field, value) => {
    setEditingSlot(prev => ({ ...prev, [field]: value }));
  };

  // Helper to get slot status based on time
  const getSlotTimeStatus = (slot) => {
    if (!slot || !slot.time) return null;
    const [start, end] = slot.time.split('-');
    const slotDate = selectedDate;
    const now = new Date();
    const startDate = new Date(`${slotDate}T${start}`);
    const endDate = new Date(`${slotDate}T${end}`);
    // If slot ended
    if (now > endDate) return 'ended';
    // If slot is ongoing
    if (now >= startDate && now <= endDate) return 'playing';
    // If within 10 minutes before start
    if (startDate - now <= 10 * 60 * 1000 && startDate > now) return 'soon';
    return 'upcoming';
  };

  // UI rendering
  return (
    <div className={styles.body}>
      <header>
        <div className={styles.logo}>
          <img src="/firstpage/logo.png" alt="match-logo" />
        </div>
        <nav>
          <ul>
            <li><Link to="/futsalhome">Home</Link></li>
            <li><Link to="/bookfutsal">Book Futsal</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/quickmatch">Quick Match</Link></li>
          </ul>
        </nav>        <div className={styles.userActions}>
          <Link to="#" className={styles.notification}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </Link>
          <Link to="#" className={styles.profileIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
      </header>
      <div className={styles.container}>
        <aside className={styles.sidebar}>          <ul className={styles.sidebarMenu}>            <li><Link to="/organizer-dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/organizer-addfriend" style={{ color: '#9ca3af' }}>Add Friends</Link></li>
            <li><Link to="/organizer-futsals">My Futsal</Link></li>
            <li><Link to="/organizer-history" style={{ color: '#9ca3af' }}>History</Link></li>
            <li><Link to="/organizer-slots" className={styles.active}>Manage Slots</Link></li>
            <li>
              <button className={styles.logoutBtn} onClick={logOut}>Logout</button>
            </li>
          </ul>
        </aside>
        <main className={styles.mainContent}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : !authUser ? (
            <div className={styles.error}>Please login first</div>
          ) : !futsals.length ? (
            <div className={styles.error}>
              Please create a futsal first
              <button className={styles.addFutsalBtn} onClick={() => navigate('/organizer-futsals')}>Create Futsal</button>
            </div>
          ) : (
            <>
              {/* Futsal name slider in a modern, visible box */}
              <div className={styles.futsalSliderBox} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                borderRadius: '1.5rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                padding: '2rem 2.5rem',
                marginBottom: '2.5rem',
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
                border: '1.5px solid #000',
                gap: '2.5rem',
                minHeight: 120
              }}>
                {futsals.length > 1 && (
                  <button className={styles.arrowBtn} onClick={handlePrevFutsal} title="Previous Futsal" style={{
                    background: '#000',
                    color: '#fff',
                    fontSize: '28px',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}>
                    <ChevronLeft size={28} />
                  </button>
                )}
                <div className={styles.futsalInfoBox} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <img
                    src={futsal?.futsalPhoto || '/default-futsal.jpg'}
                    alt={futsal?.name || 'Futsal'}
                    className={styles.futsalPhoto}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '1rem',
                      objectFit: 'cover',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '2px solid #000',
                      background: '#f8fafc'
                    }}
                  />
                  <div className={styles.futsalTextInfo} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    <span className={styles.futsalName} style={{
                      fontWeight: 800,
                      fontSize: '1.5rem',
                      color: '#000',
                      letterSpacing: '0.5px'
                    }}>{futsal?.name || 'Futsal Name'}</span>
                    <span className={styles.futsalLocation} style={{
                      color: '#666',
                      fontSize: '1rem',
                      fontWeight: 500
                    }}>{futsal?.location || ''}</span>
                  </div>
                </div>
                {futsals.length > 1 && (
                  <button className={styles.arrowBtn} onClick={handleNextFutsal} title="Next Futsal" style={{
                    background: '#000',
                    color: '#fff',
                    fontSize: '28px',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}>
                    <ChevronRight size={28} />
                  </button>
                )}
              </div>
              {/* Slot management UI in a modern box */}
              <div style={{
                background: '#fff',
                borderRadius: '1.5rem',
                boxShadow: '0 4px 24px rgba(16,185,129,0.10)',
                padding: '2.5rem 2rem 2rem 2rem',
                maxWidth: 900,
                marginLeft: 'auto',
                marginRight: 'auto',
                border: '1.5px solid #e5e7eb',
                marginBottom: '2.5rem'
              }}>
                <div className={styles.slotsHeader}>
                  <h1 style={{fontSize: '1.6rem', fontWeight: 700, marginBottom: 0, color: '#000'}}>Manage Slots</h1>
                  <div className={styles.dateSelector}>
                    <Calendar size={20} color="#000" />
                    <div className={styles.dateNavigation}>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={today}
                        max={maxDateStr}
                        style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px' }}
                      />
                      <button className={styles.resetButton} onClick={handleResetSlots} disabled={loading} style={{ 
                        background: '#000', 
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>Reset Slots</button>
                    </div>
                  </div>
                  <button className={styles.addSlotBtn} onClick={() => setIsAddingSlot(true)} style={{
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <Plus size={20} /> Add New Slot
                  </button>
                </div>
                {error && <div className={styles.error}>{error}</div>}
                {loading && <div className={styles.loading}>Loading slots...</div>}
                <div className={styles.slotsTable}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', borderRadius: '8px 0 0 8px', textAlign: 'left', borderBottom: '2px solid #000' }}><Clock size={18} style={{ marginRight: 8 }} /> Time</th>
                        <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #000' }}><Users size={18} style={{ marginRight: 8 }} /> Max Players</th>
                        <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #000' }}>₹ Price</th>
                        <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #000' }}><Activity size={18} style={{ marginRight: 8 }} /> Status</th>
                        <th style={{ padding: '16px', fontWeight: 700, fontSize: 16, color: '#000', background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #000' }}><Settings size={18} style={{ marginRight: 8 }} /> Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot, index) => {
                        const timeStatus = getSlotTimeStatus(slot);
                        return (
                          <tr key={slot._id || `${selectedDate}-${slot.time}-${index}`} style={{ 
                            background: '#fff', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            borderRadius: 8,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                          }}>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#000', borderRadius: '8px 0 0 8px', borderBottom: '1px solid #e2e8f0' }}>{slot.time}</td>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#000', borderBottom: '1px solid #e2e8f0' }}>
                              {editingSlot?._id === slot._id ? (
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={editingSlot.maxPlayers}
                                  onChange={(e) => handleEditChange('maxPlayers', parseInt(e.target.value))}
                                  className={styles.editInput}
                                  style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px' }}
                                />
                              ) : (
                                slot.maxPlayers
                              )}
                            </td>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#000', borderBottom: '1px solid #e2e8f0' }}>
                              {editingSlot?._id === slot._id ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={editingSlot.price}
                                  onChange={(e) => handleEditChange('price', parseInt(e.target.value))}
                                  className={styles.editInput}
                                  style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px' }}
                                />
                              ) : (
                                `₹${slot.price}`
                              )}
                            </td>
                            <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                              {timeStatus === 'ended' && (
                                <span className={`${styles.status} ${styles.statusEnded}`} style={{ background: '#f8fafc', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>Ended</span>
                              )}
                              {timeStatus === 'playing' && (
                                <span className={`${styles.status} ${styles.statusPlaying}`} style={{ background: '#f8fafc', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>Playing</span>
                              )}
                              {timeStatus === 'soon' && (
                                <span className={`${styles.status} ${styles.statusSoon}`} style={{ background: '#f8fafc', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>Starting Soon</span>
                              )}
                              {timeStatus === 'upcoming' && (
                                editingSlot?._id === slot._id ? (
                                  <select
                                    value={editingSlot.status}
                                    onChange={(e) => handleEditChange('status', e.target.value)}
                                    className={styles.editSelect}
                                    style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px' }}
                                  >
                                    <option value="available">Available</option>
                                    <option value="booked">Booked</option>
                                    <option value="full">Full</option>
                                    <option value="reserved">Reserved</option>
                                    <option value="ended">Ended</option>
                                    <option value="nofull">No Full</option>
                                  </select>
                                ) : (
                                  <span className={`${styles.status} ${styles[`status${slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}`]}`} style={{ background: '#f8fafc', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>{slot.status}</span>
                                )
                              )}
                            </td>
                            <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                              {editingSlot?._id === slot._id ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={handleEditSave} style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                                  <button onClick={handleEditCancel} style={{ background: '#f8fafc', color: '#000', border: '1px solid #000', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => handleEditStart(slot)} style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Add New Slot Form */}
                {isAddingSlot && (
                  <div className={styles.addSlotForm}>
                    <div className={styles.formGroup}>
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                        className={styles.timeInput}
                        min="05:00"
                        max="22:00"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>End Time</label>
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                        className={styles.timeInput}
                        min="06:00"
                        max="23:00"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Max Players</label>
                      <input
                        type="number"
                        value={newSlot.maxPlayers}
                        onChange={(e) => setNewSlot({...newSlot, maxPlayers: parseInt(e.target.value)})}
                        min="1"
                        max="20"
                        className={styles.numberInput}
                        placeholder="Enter max players (1-20)"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        value={newSlot.price}
                        onChange={(e) => setNewSlot({...newSlot, price: parseInt(e.target.value)})}
                        min="0"
                        className={styles.numberInput}
                        placeholder="Enter price"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        value={newSlot.status}
                        onChange={(e) => setNewSlot({...newSlot, status: e.target.value})}
                        className={styles.selectInput}
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="full">Full</option>
                        <option value="reserved">Reserved</option>
                        <option value="ended">Ended</option>
                        <option value="nofull">No Full</option>
                      </select>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.cancelButton} onClick={() => setIsAddingSlot(false)}>Cancel</button>
                      <button className={styles.saveButton} onClick={handleAddSlot}>Add Slot</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default OSlotsPage