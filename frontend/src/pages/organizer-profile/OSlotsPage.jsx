import React, { useState, useEffect } from 'react'
import styles from '../css/OSlots.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Plus, Clock, Users, DollarSign, Calendar, Activity, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import { axiosInstance } from '../../lib/axios'

const OSlotsPage = () => {
  const navigate = useNavigate();
  const { logOut, authUser } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [futsalData, setFutsalData] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    maxPlayers: 10,
    price: 500,
    status: 'available'
  });


  const fetchFutsalData = async () => {
    try {
      console.log('Fetching futsal data for user:', authUser._id);
      const response = await axiosInstance.get(`/organizer/organizer-futsals`);
      console.log('Futsal data response:', response.data);
      
      if (response.data.success && response.data.message && response.data.message.length > 0) {
        const futsal = response.data.message[0]; 
        console.log('Found futsal:', futsal);
        setFutsalData(futsal);
        return futsal._id;
      } else {
        console.log('No futsal found');
        return null;
      }
    } catch (err) {
      console.error('Error fetching futsal data:', err);
      toast.error('Failed to fetch futsal data');
      return null;
    }
  };

  // Check if user data is loaded and fetch futsal data
  useEffect(() => {
    const initializeData = async () => {
      console.log('User data:', authUser);
      if (!authUser) {
        console.log('No user data found');
        toast.error('Please login first');
        navigate('/login');
        return;
      }
      
      const futsalId = await fetchFutsalData();
      if (!futsalId) {
        console.log('No futsal found');
        toast.error('Please create a futsal first');
        navigate('/organizer-futsals');
        return;
      }
      
      setLoading(false);
    };

    initializeData();
  }, [authUser, navigate]);

  // Generate default slots for a day
  const generateDefaultSlots = () => {
    const defaultSlots = [];
    for (let hour = 5; hour < 23; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = (hour + 1).toString().padStart(2, '0');
      defaultSlots.push({
        date: selectedDate,
        time: `${startHour}:00-${endHour}:00`,
        maxPlayers: 10,
        price: 500,
        status: "available"
      });
    }
    return defaultSlots;
  };

  // Generate array of next 7 days
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

  // Validate if selected date is within next 7 days
  const isValidDate = (date) => {
    const nextSevenDays = getNextSevenDays();
    return nextSevenDays.includes(date);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (isValidDate(newDate)) {
      setSelectedDate(newDate);
    } else {
      toast.error('Please select a date within the next 7 days');
    }
  };

  const handleLogout = () => {
    logOut()
    navigate("/login")
  }

  // Fetch slots when date changes
  const fetchSlots = async () => {
    if (!futsalData) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching slots for futsal:', futsalData._id);
      console.log('Selected date:', selectedDate);
      
      const response = await axiosInstance.get(`/slots/${futsalData._id}/slots`, {
        params: { date: selectedDate }
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        // If no slots exist for this date, create default slots
        if (!response.data.message || response.data.message.length === 0) {
          console.log('No slots found, creating default slots');
          toast.loading('Creating default slots...');
          
          const defaultSlots = generateDefaultSlots();
          console.log('Generated default slots:', defaultSlots);
          
          // Create slots one by one
          const createdSlots = [];
          for (const slot of defaultSlots) {
            try {
              const createResponse = await axiosInstance.post(`/slots/${futsalData._id}/slots`, slot);
              if (createResponse.data.success) {
                createdSlots.push(createResponse.data.data.slot);
              }
            } catch (err) {
              console.error('Error creating slot:', err);
              toast.error(`Failed to create slot ${slot.time}: ${err.response?.data?.message || err.message}`);
            }
          }
          
          if (createdSlots.length > 0) {
            // Sort slots by time
            const sortedSlots = createdSlots.sort((a, b) => {
              const timeA = a.time.split('-')[0];
              const timeB = b.time.split('-')[0];
              return timeA.localeCompare(timeB);
            });
            setSlots(sortedSlots);
            toast.dismiss();
            toast.success(`Created ${sortedSlots.length} slots successfully`);
          } else {
            toast.dismiss();
            toast.error('Failed to create any slots');
          }
        } else {
          console.log('Found existing slots:', response.data.message);
          // Sort existing slots by time
          const sortedSlots = response.data.message.sort((a, b) => {
            const timeA = a.time.split('-')[0];
            const timeB = b.time.split('-')[0];
            return timeA.localeCompare(timeB);
          });
          setSlots(sortedSlots);
          toast.success(`Found ${sortedSlots.length} slots`);
        }
      } else {
        console.error('API returned success: false');
        toast.error('Failed to fetch slots: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        params: err.config?.params
      });
      const errorMessage = err.response?.data?.message || err.message;
      setError('Failed to fetch slots: ' + errorMessage);
      toast.error('Failed to fetch slots: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect for fetching slots
  useEffect(() => {
    if (!futsalData) {
      console.log('Cannot fetch slots: No futsal data');
      return;
    }

    console.log('Fetching slots for futsal:', futsalData._id);
    fetchSlots();
  }, [selectedDate, futsalData]);

  // Add a function to format time
  const formatTime = (time) => {
    return time.padStart(5, '0');
  };

  // Add a function to sort slots by time
  const sortSlotsByTime = (slotsToSort) => {
    return [...slotsToSort].sort((a, b) => {
      const timeA = a.time.split('-')[0];
      const timeB = b.time.split('-')[0];
      return timeA.localeCompare(timeB);
    });
  };

  // Update handleAddSlot
  const handleAddSlot = async () => {
    if (!futsalData) return;
    
    try {
      setLoading(true);
      
      // Validate time inputs
      if (!newSlot.startTime || !newSlot.endTime) {
        toast.error('Please select both start and end times');
        return;
      }

      // Format the time string
      const formattedTime = `${formatTime(newSlot.startTime)}-${formatTime(newSlot.endTime)}`;

      // Check if the time slot already exists
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

      console.log('Sending slot data:', slotData);

      const response = await axiosInstance.post(`/slots/${futsalData._id}/slots`, slotData);
      
      console.log('API Response:', response.data);

      if (response.data.success) {
        // Add the new slot to the local state and sort
        const addedSlot = response.data.message;
        console.log('Added slot:', addedSlot);
        
        setSlots(prevSlots => sortSlotsByTime([...prevSlots, addedSlot]));
        
        // Reset the form
        setNewSlot({
          startTime: '',
          endTime: '',
          maxPlayers: 10,
          price: 500,
          status: 'available'
        });
        setIsAddingSlot(false);
        
        toast.success('New slot added successfully');
      } else {
        toast.error('Failed to add slot: ' + (response.data.message || 'Unknown error'));
      }
      setError(null);
    } catch (err) {
      console.error('Error adding slot:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || err.message;
      setError('Failed to add slot: ' + errorMessage);
      toast.error('Failed to add slot: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update slot
  const handleUpdateSlot = async (slotId, updates) => {
    try {
      setLoading(true);
      
      // Validate updates
      if (updates.maxPlayers && (updates.maxPlayers < 1 || updates.maxPlayers > 20)) {
        toast.error('Max players must be between 1 and 20');
        return;
      }
      
      if (updates.price && updates.price < 0) {
        toast.error('Price cannot be negative');
        return;
      }

      const response = await axiosInstance.patch(`/slots/${futsalData._id}/slots/${slotId}`, updates);
      
      if (response.data.success) {
        // Update local state with the response data
        setSlots(prevSlots => 
          prevSlots.map(slot => 
            slot._id === slotId 
              ? { ...slot, ...response.data.data }
              : slot
          )
        );
        toast.success('Slot updated successfully');
      } else {
        toast.error('Failed to update slot: ' + (response.data.message || 'Unknown error'));
      }
      setError(null);
    } catch (err) {
      console.error('Error updating slot:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError('Failed to update slot: ' + errorMessage);
      toast.error('Failed to update slot: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update handleDeleteSlot
  const handleDeleteSlot = async (slotId) => {
    try {
      const response = await axiosInstance.delete(`/slots/${futsalData._id}/slots/${slotId}`);
      
      if (response.data.success) {
        // Remove the deleted slot from the local state
        setSlots(prevSlots => prevSlots.filter(slot => slot._id !== slotId));
        toast.success('Slot deleted successfully');
      } else {
        toast.error('Failed to delete slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error(error.response?.data?.message || 'Error deleting slot');
    }
  };

  const handleEditStart = (slot) => {
    setEditingSlot({
      _id: slot._id,
      time: slot.time,
      maxPlayers: slot.maxPlayers,
      price: slot.price,
      status: slot.status
    });
  };

  const handleEditCancel = () => {
    setEditingSlot(null);
  };

  const handleEditSave = async () => {
    if (!editingSlot || !editingSlot._id) {
      toast.error('Invalid slot data');
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate the edited values
      if (editingSlot.maxPlayers < 1 || editingSlot.maxPlayers > 20) {
        toast.error('Max players must be between 1 and 20');
        return;
      }
      
      if (editingSlot.price < 0) {
        toast.error('Price cannot be negative');
        return;
      }

      const updates = {
        maxPlayers: editingSlot.maxPlayers,
        price: editingSlot.price,
        status: editingSlot.status
      };

      console.log('Updating slot:', editingSlot._id, 'with updates:', updates);

      const response = await axiosInstance.patch(
        `/slots/${futsalData._id}/slots/${editingSlot._id}`, 
        updates
      );
      
      if (response.data.success) {
        // Update the local state with the new data
        setSlots(prevSlots => 
          prevSlots.map(slot => 
            slot._id === editingSlot._id 
              ? { ...slot, ...updates }
              : slot
          )
        );
        toast.success('Slot updated successfully');
        setEditingSlot(null);
      } else {
        toast.error('Failed to update slot: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating slot:', err);
      toast.error('Failed to update slot: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    // Validate input before updating state
    if (field === 'maxPlayers') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1 || numValue > 20) {
        toast.error('Max players must be between 1 and 20');
        return;
      }
      value = numValue;
    } else if (field === 'price') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) {
        toast.error('Price cannot be negative');
        return;
      }
      value = numValue;
    } else if (field === 'time') {
      // Validate time format (HH:mm-HH:mm)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) {
        toast.error('Invalid time format. Use HH:mm-HH:mm format');
        return;
      }

      // Check if the time slot already exists
      const isTimeSlotExists = slots.some(slot => 
        slot.time === value && slot._id !== editingSlot._id
      );
      if (isTimeSlotExists) {
        toast.error('This time slot already exists');
        return;
      }
    } else if (field === 'status') {
      // Ensure the status value is one of the allowed values
      const allowedStatuses = ['available', 'booked', 'full', 'reserved', 'ended', 'nofull'];
      if (!allowedStatuses.includes(value)) {
        toast.error('Invalid status value');
        return;
      }
    }

    setEditingSlot(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get min and max dates for the date input
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 6);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleResetSlots = async () => {
    if (!futsalData) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/slots/${futsalData._id}/slots/reset`, {
        date: selectedDate
      });
      
      if (response.data.success) {
        toast.success('Slots reset successfully');
        fetchSlots(); // Refresh slots after reset
      } else {
        toast.error(response.data.message || 'Failed to reset slots');
      }
    } catch (err) {
      console.error('Error resetting slots:', err);
      toast.error(err.response?.data?.message || 'Failed to reset slots');
    } finally {
      setLoading(false);
    }
  };

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
        </nav>
        <div className={styles.userActions}>
          <Link to="#" className={styles.notification}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </Link>
          <Link to="#" className={styles.profileIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
      </header>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarMenu}>
            <li><Link to="/organizer-dashboard">Dashboard</Link></li>
            <li><Link to="/player-profile">Profile</Link></li>
            <li><Link to="/organizer-futsals">My Futsal</Link></li>
            <li><Link to="/organizer-history">History</Link></li>
            <li><Link to="/organizer-slots" className={styles.active}>Manage Slots</Link></li>
            <li>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </aside>

        <main className={styles.mainContent}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : !authUser ? (
            <div className={styles.error}>Please login first</div>
          ) : !futsalData ? (
            <div className={styles.error}>
              Please create a futsal first
              <button 
                className={styles.addFutsalBtn}
                onClick={() => navigate('/organizer-futsals')}
              >
                Create Futsal
              </button>
            </div>
          ) : (
            <>
              <div className={styles.slotsHeader}>
                <h1>Manage Slots</h1>
                <div className={styles.dateSelector}>
                  <Calendar size={20} />
                  <div className={styles.dateNavigation}>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      max={maxDateStr}
                    />
                    <button 
                      className={styles.resetButton}
                      onClick={handleResetSlots}
                      disabled={loading}
                    >
                      Reset Slots
                    </button>
                  </div>
                </div>
                <button className={styles.addSlotBtn} onClick={() => setIsAddingSlot(true)}>
                  <Plus size={20} />
                  Add New Slot
                </button>
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {loading && <div className={styles.loading}>Loading slots...</div>}
              
              <div className={styles.slotsTable}>
                <table>
                  <thead>
                    <tr>
                      <th>
                        <Clock size={18} />
                        Time
                      </th>
                      <th>
                        <Users size={18} />
                        Max Players
                      </th>
                      <th>
                        <DollarSign size={18} />
                        Price
                      </th>
                      <th>
                        <Activity size={18} />
                        Status
                      </th>
                      <th>
                        <Settings size={18} />
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot, index) => (
                      <tr key={slot._id || `${selectedDate}-${slot.time}-${index}`}>
                        <td>{slot.time}</td>
                        <td>
                          {editingSlot?._id === slot._id ? (
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={editingSlot.maxPlayers}
                              onChange={(e) => handleEditChange('maxPlayers', parseInt(e.target.value))}
                              className={styles.editInput}
                            />
                          ) : (
                            slot.maxPlayers
                          )}
                        </td>
                        <td>
                          {editingSlot?._id === slot._id ? (
                            <input
                              type="number"
                              min="0"
                              value={editingSlot.price}
                              onChange={(e) => handleEditChange('price', parseInt(e.target.value))}
                              className={styles.editInput}
                            />
                          ) : (
                            `₹${slot.price}`
                          )}
                        </td>
                        <td>
                          {editingSlot?._id === slot._id ? (
                            <select
                              value={editingSlot.status}
                              onChange={(e) => handleEditChange('status', e.target.value)}
                              className={styles.editSelect}
                            >
                              <option value="available">Available</option>
                              <option value="booked">Booked</option>
                              <option value="full">Full</option>
                              <option value="reserved">Reserved</option>
                              <option value="ended">Ended</option>
                              <option value="nofull">No Full</option>
                            </select>
                          ) : (
                            <span className={`${styles.status} ${styles[`status${slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}`]}`}>
                              {slot.status}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingSlot?._id === slot._id ? (
                            <div className={styles.editActions}>
                              <button 
                                className={styles.saveBtn}
                                onClick={handleEditSave}
                              >
                                Save
                              </button>
                              <button 
                                className={styles.cancelBtn}
                                onClick={handleEditCancel}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className={styles.actions}>
                              <button 
                                className={styles.editBtn}
                                onClick={() => handleEditStart(slot)}
                              >
                                Edit
                              </button>
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteSlot(slot._id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Update the Add New Slot form */}
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
                    <button 
                      className={styles.cancelButton}
                      onClick={() => setIsAddingSlot(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className={styles.saveButton}
                      onClick={handleAddSlot}
                    >
                      Add Slot
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default OSlotsPage