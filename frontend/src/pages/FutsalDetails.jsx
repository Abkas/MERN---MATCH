import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import styles from './css/FutsalDetails.module.css'
import bookFutsalStyles from './css/BookFutsal.module.css'
import homeStyles from './css/HomePage.module.css'
import { axiosInstance } from '../lib/axios'
import { Calendar, ChevronDown, ChevronUp, Clock, Users, DollarSign } from 'lucide-react'
import SeatSelectionModal from '../components/SeatSelectionModal'
import { getSlotTimeStatus } from '../utils/slotTimeStatus'

const FutsalDetails = () => {
  const { id } = useParams();
  const [futsalData, setFutsalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlotsVisible, setIsSlotsVisible] = useState(true);

  useEffect(() => {
    const fetchFutsalData = async () => {
      console.log('Fetching futsal data for ID:', id);
      try {
        setLoading(true);
        const loadingToast = toast.loading('Fetching futsal details...');

        // Log the full URL being requested
        const requestUrl = `/api/v1/futsals/${id}`;
        console.log('Making request to:', requestUrl);

        const response = await axiosInstance.get(`/futsals/${id}`);
        console.log('Full API Response:', {
          data: response.data,
          status: response.status,
          headers: response.headers,
          config: response.config
        });
        
        if (!response.data) {
          console.error('No data in response:', response);
          throw new Error('No data received from server');
        }

        // The futsal data is in response.data.message
        const futsalData = response.data.message;
        console.log('Raw futsal data structure:', {
          type: typeof futsalData,
          isString: typeof futsalData === 'string',
          keys: Object.keys(futsalData),
          value: futsalData
        });

        if (!futsalData || typeof futsalData === 'string') {
          throw new Error('Invalid futsal data received');
        }

        console.log('Raw futsalData.organizer received by frontend:', futsalData.organizer);

        // Map backend data to frontend structure
        const mappedData = {
          name: futsalData.name || 'Unnamed Futsal',
          location: futsalData.location || 'Location not specified',
          openingHours: futsalData.openingHours || 'Hours not specified',
          description: futsalData.description || 'No description available',
          image: futsalData.futsalPhoto || '/default-futsal.jpg',
          totalMatches: futsalData.gamesOrganized || 0,
          totalTournaments: futsalData.tournaments?.length || 0,
          features: futsalData.plusPoints || [],
          owner: {
            name: futsalData.organizer?.fullName || futsalData.ownerName || 'Unknown Owner',
            image: futsalData.organizer?.avatar || '/default-owner.png',
            bio: futsalData.organizer?.organizerProfile?.bio || futsalData.ownerDescription || 'No bio available',
            phone: futsalData.organizer?.phoneNumber || 'Contact not available',
            email: futsalData.organizer?.email || 'Email not available',
            additionalInfo: futsalData.organizer?.additionalInfo || 'No additional info',
          },
          mapImage: futsalData.mapLink || '/default-map.png',
          verified: futsalData.isAwarded || false,
          price: futsalData.price || 0,
          rating: futsalData.rating || 0,
          slots: futsalData.slots || [],
          reviews: futsalData.reviews || []
        };

        console.log('Processed futsal data:', mappedData);
        setFutsalData(mappedData);
        toast.dismiss(loadingToast);
        toast.success('Futsal details loaded successfully!');
      } catch (err) {
        console.error('Error fetching futsal data:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
          headers: err.config?.headers,
          stack: err.stack
        });
        setError(err.response?.data?.message || err.message);
        toast.dismiss();
        toast.error(`Error: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFutsalData();
    } else {
      console.error('No futsal ID provided');
      setError('No futsal ID provided');
      toast.error('No futsal ID provided');
    }
  }, [id]);

  const fetchSlots = async () => {
    if (!id) return;
    
    try {
      console.log('Fetching slots for futsal:', id, 'date:', selectedDate);
      const response = await axiosInstance.get(`/slots/${id}/slots`, {
        params: { date: selectedDate }
      });

      console.log('Slots API Response:', response.data);

      if (response.data.success) {
        // Sort slots by time
        const sortedSlots = response.data.message.sort((a, b) => {
          const timeA = a.time.split('-')[0];
          const timeB = b.time.split('-')[0];
          return timeA.localeCompare(timeB);
        });

        // Map the slots to include all necessary data
        const mappedSlots = sortedSlots.map(slot => ({
          _id: slot._id,
          time: slot.time,
          maxPlayers: slot.maxPlayers,
          currentPlayers: slot.players?.length || 0,
          price: slot.price,
          status: slot.status,
          players: slot.players || []
        }));

        console.log('Processed slots:', mappedSlots);
        setSlots(mappedSlots);
      } else {
        console.log('No slots found or error in response');
        setSlots([]);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      toast.error('Failed to fetch slots');
      setSlots([]);
    }
  };

  useEffect(() => {
    if (id && selectedDate) {
      fetchSlots();
    }
  }, [id, selectedDate]);

  // Debug render
  useEffect(() => {
    console.log('Current state:', {
      loading,
      error,
      futsalData
    });
  }, [loading, error, futsalData]);

  const handleJoinNow = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (seats) => {
    try {
      const response = await axiosInstance.post(`/slots/${id}/slots/${selectedSlot._id}/join`, {
        seats: seats
      });
      if (response.data.success) {
        toast.success('Successfully joined the slot!');
        fetchSlots(); // Refresh slots after joining
      } else {
        toast.error(response.data.message || 'Failed to join slot');
      }
    } catch (err) {
      console.error('Error joining slot:', err);
      toast.error(err.response?.data?.message || 'Failed to join slot');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading futsal details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Futsal Details</h2>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!futsalData) {
    return (
      <div className={styles.errorContainer}>
        <h2>No Futsal Data Found</h2>
        <p>The requested futsal could not be found.</p>
        <Link to="/futsalhome" className={styles.backButton}>
          Back to Futsals
        </Link>
      </div>
    );
  }

  // Debug render of futsal data
  console.log('Rendering futsal data:', futsalData);

  return (
    <div className={bookFutsalStyles.body}>
      {/* Navbar (same as BookFutsal) */}
      <nav className={bookFutsalStyles.nav}>
        <div className={bookFutsalStyles.logo}>
          <Link to="/">
            <img src="/firstpage/logo.png" alt="match-logo" />
          </Link>
        </div>
        <ul className={bookFutsalStyles.navLinks}>
          <li><Link to="/futsalhome">Home</Link></li>
          <li><Link to="/bookfutsal" className={bookFutsalStyles.active}>Book Futsal</Link></li>
          <li><Link to="/tournaments">Tournaments</Link></li>
          <li><Link to="/quickmatch">Quick Match</Link></li>
        </ul>
        <div className={bookFutsalStyles.navIcons}>
          <div className={bookFutsalStyles.notification}>
            <img src="/FUTSALHOME/notification-icon.png" alt="Notifications" />
          </div>
          <div className={bookFutsalStyles.profile}>
            <Link to="/profile"><img src="/FUTSALHOME/profile-icon.png" alt="Profile" /></Link>
          </div>
        </div>
      </nav>

      {/* Main Content - full width */}
      <main style={{ width: '100%' }}>
        {/* HERO SECTION */}
        <section className={styles.venueHero} style={{
          position: 'relative',
          minHeight: 500,
          borderRadius: 0,
          boxShadow: 'none',
          marginBottom: 32,
          overflow: 'hidden',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            position: 'relative',
            height: '100%'
          }}>
            <img
              src={futsalData.image}
              alt={futsalData.name}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
              onError={e => { e.target.onerror = null; e.target.src = '/default-futsal.jpg'; }}
            />
            <div style={{
              position: 'absolute',
              zIndex: 3,
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '2.5rem 3rem 2.5rem 3rem',
              background: 'linear-gradient(0deg, rgba(30,41,59,0.85) 0%, rgba(30,41,59,0.0) 100%)',
              color: '#fff',
              borderRadius: 0,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <h1 style={{ 
                fontSize: 42, 
                fontWeight: 900, 
                marginBottom: 10, 
                letterSpacing: 1, 
                textShadow: '0 2px 12px #1118',
                transition: 'all 0.3s ease',
                cursor: 'default',
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)',
                transform: 'translateY(0)',
                color: '#ffffff'
              }} className={styles.futsalName}>
                {futsalData.name}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', marginBottom: 10, justifyContent: 'center' }}>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  fontSize: 20, 
                  textShadow: '0 2px 8px #1118',
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backdropFilter: 'blur(5px)'
                }}>
                  <i className="fas fa-map-marker-alt" style={{ color: '#fff' }}></i> 
                  <span style={{ color: '#fff', fontWeight: 600 }}>{futsalData.location || 'Location not specified'}</span>
                </span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  fontSize: 20, 
                  textShadow: '0 2px 8px #1118',
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backdropFilter: 'blur(5px)'
                }}>
                  <i className="far fa-clock" style={{ color: '#fff' }}></i> 
                  <span style={{ color: '#fff', fontWeight: 600 }}>{futsalData.openingHours || 'Hours not specified'}</span>
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', textShadow: '0 2px 8px #1118' }}>{futsalData.totalMatches}+ Matches</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', textShadow: '0 2px 8px #1118' }}>{futsalData.totalTournaments}+ Tournaments</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', textShadow: '0 2px 8px #1118' }}>Rating: {futsalData.rating}/5</span>
              </div>
            </div>
          </div>
        </section>

        {/* BOOKING SECTION */}
        <section className={styles.bookingSection}>
          <div className={styles.container} style={{ 
            maxWidth: 900, 
            margin: '0 auto', 
            background: '#fff', 
            borderRadius: 18, 
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)', 
            padding: '2.5rem 2rem', 
            marginBottom: 36, 
            border: '1.5px solid #e2e8f0' 
          }}>
            <div className={styles.bookingHeader} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 24,
              padding: '0 1rem'
            }}>
              <button 
                className={styles.toggleSlotsBtn}
                onClick={() => setIsSlotsVisible(!isSlotsVisible)}
                style={{ 
                  background: '#000', 
                  color: '#fff', 
                  borderRadius: 8, 
                  padding: '12px 24px', 
                  fontWeight: 700, 
                  fontSize: 16, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <i className={`fas ${isSlotsVisible ? 'fa-times' : 'fa-calendar-alt'}`}></i>
                {isSlotsVisible ? 'Close Slots' : 'View Slots'}
              </button>
              <div className={styles.dateNavigation}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  style={{ 
                    padding: '12px 20px', 
                    borderRadius: 8, 
                    border: '1.5px solid #e2e8f0', 
                    fontSize: 16,
                    background: '#f8fafc',
                    color: '#1e293b',
                    fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                />
              </div>
            </div>

            {isSlotsVisible && (
              <div className={styles.venueDetails}>
                {loading ? (
                  <div className={styles.loading} style={{ 
                    color: '#000', 
                    fontSize: 18, 
                    textAlign: 'center', 
                    padding: '2rem 0',
                    fontWeight: 600
                  }}>Loading slots...</div>
                ) : slots.length === 0 ? (
                  <div className={styles.noSlots} style={{ 
                    color: '#64748b', 
                    fontSize: 18, 
                    textAlign: 'center', 
                    padding: '2rem 0',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px dashed #e2e8f0'
                  }}>No slots available for this date</div>
                ) : (
                  <div className={styles.timeSlots} style={{ marginTop: 24 }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'separate',
                      borderSpacing: '0 8px',
                      background: 'transparent'
                    }}>
                      <thead>
                        <tr>
                          <th style={{ 
                            padding: '16px', 
                            fontWeight: 700, 
                            fontSize: 16, 
                            color: '#000',
                            background: '#f8fafc',
                            borderRadius: '8px 0 0 8px',
                            textAlign: 'left',
                            borderBottom: '2px solid #000'
                          }}><Clock size={18} style={{ marginRight: 8 }} /> Time</th>
                          <th style={{ 
                            padding: '16px', 
                            fontWeight: 700, 
                            fontSize: 16, 
                            color: '#000',
                            background: '#f8fafc',
                            textAlign: 'left',
                            borderBottom: '2px solid #000'
                          }}><Users size={18} style={{ marginRight: 8 }} /> Players</th>
                          <th style={{ 
                            padding: '16px', 
                            fontWeight: 700, 
                            fontSize: 16, 
                            color: '#000',
                            background: '#f8fafc',
                            textAlign: 'left',
                            borderBottom: '2px solid #000'
                          }}><DollarSign size={18} style={{ marginRight: 8 }} /> Price</th>
                          <th style={{ 
                            padding: '16px', 
                            fontWeight: 700, 
                            fontSize: 16, 
                            color: '#000',
                            background: '#f8fafc',
                            textAlign: 'left',
                            borderBottom: '2px solid #000'
                          }}>Status</th>
                          <th style={{ 
                            padding: '16px', 
                            fontWeight: 700, 
                            fontSize: 16, 
                            color: '#000',
                            background: '#f8fafc',
                            borderRadius: '0 8px 8px 0',
                            textAlign: 'left',
                            borderBottom: '2px solid #000'
                          }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slots.map((slot) => {
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
                            <tr key={slot._id} style={{ 
                              background: '#fff', 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              borderRadius: 8,
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              ':hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }
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
                              }}>NPR {slot.price}</td>
                              <td style={{ 
                                padding: '16px',
                                borderBottom: '1px solid #e2e8f0'
                              }}>
                                <span className={`${styles.status} ${statusClass}`} style={{ 
                                  fontWeight: 700, 
                                  fontSize: 14, 
                                  padding: '6px 16px', 
                                  borderRadius: 6,
                                  display: 'inline-block',
                                  background: statusLabel === 'Available' ? '#000' : '#e2e8f0',
                                  color: statusLabel === 'Available' ? '#fff' : '#000'
                                }}>{statusLabel}</span>
                              </td>
                              <td style={{ 
                                padding: '16px',
                                borderRadius: '0 8px 8px 0',
                                borderBottom: '1px solid #e2e8f0'
                              }}>
                                <button
                                  className={`${styles.btnJoinNow} ${!canJoin ? styles.btnJoinNowDisabled : ''}`}
                                  style={{ 
                                    background: canJoin ? '#000' : '#e2e8f0', 
                                    color: canJoin ? '#fff' : '#64748b', 
                                    borderRadius: 8, 
                                    padding: '10px 24px', 
                                    fontWeight: 700, 
                                    border: 'none', 
                                    boxShadow: canJoin ? '0 2px 8px rgba(0,0,0,0.2)' : 'none', 
                                    cursor: canJoin ? 'pointer' : 'not-allowed', 
                                    transition: 'all 0.3s ease',
                                    ':hover': canJoin ? {
                                      background: '#333',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    } : {}
                                  }}
                                  onClick={() => canJoin && handleJoinNow(slot)}
                                  disabled={!canJoin}
                                >
                                  {canJoin ? 'Join Now' : 'Not Available'}
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
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className={styles.aboutSection}>
          <div className={styles.container} style={{ 
            maxWidth: 900, 
            margin: '0 auto', 
            background: '#fff', 
            borderRadius: 18, 
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)', 
            padding: '2.5rem 2rem', 
            marginBottom: 36, 
            border: '1.5px solid #e2e8f0' 
          }}>
            <h2 style={{ 
              fontWeight: 800, 
              color: '#000', 
              marginBottom: 24,
              fontSize: '1.8rem',
              textAlign: 'left'
            }}>About Us:</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
              <div className={styles.aboutContent} style={{ flex: '1 1 55%', minWidth: '300px' }}>
                <p style={{ 
                  fontSize: 17, 
                  color: '#000',
                  lineHeight: '1.7',
                  textAlign: 'left',
                  margin: 0
                }}>{futsalData.description}</p>
              </div>
              <div className={styles.features} style={{ 
                flex: '1 1 40%', 
                minWidth: '250px',
                background: '#E0FFE0',
                borderRadius: 12,
                border: '1px solid #7CFC00',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                {futsalData.features && futsalData.features.length > 0 ? (
                  futsalData.features.map((feature, index) => (
                    <div key={index} className={styles.feature} style={{ 
                      background: 'transparent',
                      color: '#000',
                      borderRadius: 0, 
                      padding: '0', 
                      fontWeight: 600, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 10,
                      transition: 'none',
                      border: 'none',
                      boxShadow: 'none',
                      ':hover': {
                        transform: 'none',
                        boxShadow: 'none'
                      }
                    }}>
                      <i className="fas fa-check-square" style={{ color: '#00C000', fontSize: 20 }}></i>
                      <span>{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noFeatures} style={{ 
                    color: '#64748b',
                    fontSize: 16,
                    textAlign: 'center',
                    width: '100%'
                  }}>No features listed</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* OWNER SECTION */}
        <section className={styles.ownerSection}>
          <div className={styles.container} style={{ 
            maxWidth: 900, 
            margin: '0 auto', 
            background: 'transparent', 
            borderRadius: 0, 
            boxShadow: 'none', 
            padding: '0', 
            marginBottom: 36, 
            border: 'none',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}>
            <h2 style={{ 
              fontWeight: 800, 
              color: '#fff', 
              marginBottom: 24,
              fontSize: '1.8rem',
              textAlign: 'center'
            }}>Meet the Owner:</h2>
            <div className={styles.ownerProfile} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              gap: 16,
              background: '#1A1A1A', // Dark background for the main owner profile box
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              width: '100%',
              textAlign: 'center'
            }}>
              <div className={styles.ownerImage} style={{
                position: 'relative',
                transition: 'transform 0.3s ease'
              }}>
                <img
                  src={futsalData.owner.image}
                  alt={futsalData.owner.name}
                  style={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: 'none',
                    background: '#f8fafc',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    ':hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-owner.png';
                  }}
                />
              </div>
              <h3 style={{ 
                fontWeight: 700, 
                fontSize: 24, 
                marginBottom: 0,
                color: '#fff'
              }}>
                {futsalData.owner.name}
                <span style={{ 
                  fontWeight: 500, 
                  fontSize: 18,
                  color: '#ccc',
                  display: 'block',
                  marginTop: '4px'
                }}>
                  Founder - {futsalData.name}
                </span>
              </h3>
              <p className={styles.ownerBio} style={{ 
                color: '#e2e8f0', 
                fontSize: 16, 
                marginBottom: 12,
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {futsalData.owner.bio}
              </p>
              <div className={styles.ownerContact} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 16, 
                marginBottom: 12,
                flexWrap: 'wrap'
              }}>
                <div className={styles.contactItem} style={{ 
                  color: '#fff', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  background: 'rgba(255,255,255,0.1)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <i className="fas fa-phone"></i>
                  <span>{futsalData.owner.phone}</span>
                </div>
                {futsalData.owner.email && (
                  <div className={styles.contactItem} style={{ 
                    color: '#fff', 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    background: 'rgba(255,255,255,0.1)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <i className="fas fa-envelope"></i>
                    <span>{futsalData.owner.email}</span>
                  </div>
                )}
              </div>
              <div className={styles.ownerActions} style={{ 
                display: 'flex', 
                gap: 10,
                marginTop: '12px'
              }}>
                <button className={styles.addFriendBtn} style={{ 
                  background: '#e2e8f0', 
                  color: '#000', 
                  borderRadius: 8, 
                  padding: '8px 18px', 
                  fontWeight: 600, 
                  border: 'none', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    background: '#cbd5e1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }
                }}>
                  Add Friend
                </button>
                <button className={styles.messageBtn} style={{ 
                  background: '#e2e8f0', 
                  color: '#000', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '8px 18px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    background: '#cbd5e1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }
                }}>
                  Message
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION SECTION */}
        <section className={styles.locationSection}>
          <div className={styles.container} style={{ 
            maxWidth: 900, 
            margin: '0 auto', 
            background: '#fff', 
            borderRadius: 18, 
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)', 
            padding: '2.5rem 2rem', 
            marginBottom: 36, 
            border: '1.5px solid #e2e8f0', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}>
            <h2 style={{ 
              fontWeight: 800, 
              color: '#000', 
              marginBottom: 24,
              fontSize: '1.8rem',
              textAlign: 'center' 
            }}>Find Us</h2>

            <div className={styles.locationMap} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 24, 
              width: '100%' 
            }}>
              {(() => {
                let mapLinkRaw = (futsalData.mapImage || '').trim();
                let mapLink = mapLinkRaw;
                const iframeMatch = mapLinkRaw.match(/<iframe[^>]*src=["']([^"']+)["']/i);
                if (iframeMatch) {
                  mapLink = iframeMatch[1];
                }

                // Extract coordinates
                let lat = null, lng = null;
                const pbCoordMatch = mapLink.match(/!3d([\d.\-]+)!4d([\d.\-]+)/);
                if (pbCoordMatch) {
                  lat = pbCoordMatch[1];
                  lng = pbCoordMatch[2];
                } else {
                  const qMatch = mapLink.match(/[?&]q=([\d.\-]+),([\d.\-]+)/);
                  if (qMatch) {
                    lat = qMatch[1];
                    lng = qMatch[2];
                  } else {
                    const atMatch = mapLink.match(/@([\d.\-]+),([\d.\-]+)/);
                    if (atMatch) {
                      lat = atMatch[1];
                      lng = atMatch[2];
                    }
                  }
                }

                // If we have coordinates, create an embedded map
                if (lat && lng) {
                  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}`;
                  return (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <div style={{
                        width: '100%',
                        height: 400,
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '2px solid #e2e8f0',
                        background: '#f8fafc',
                        position: 'relative'
                      }}>
                        <iframe
                          src={embedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Futsal Location"
                        ></iframe>
                      </div>
                    </div>
                  );
                }

                // If we have a direct map link
                if (mapLink && mapLink !== '/default-map.png') {
                  // Check if it's already an embed URL
                  if (mapLink.includes('/maps/embed/')) {
                    return (
                      <div style={{ width: '100%', textAlign: 'center' }}>
                        <div style={{
                          width: '100%',
                          height: 400,
                          borderRadius: 16,
                          overflow: 'hidden',
                          border: '2px solid #e2e8f0',
                          background: '#f8fafc',
                          position: 'relative'
                        }}>
                          <iframe
                            src={mapLink}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Futsal Location"
                          ></iframe>
                        </div>
                      </div>
                    );
                  }

                  // If it's a regular Google Maps URL, convert it to embed
                  const embedUrl = mapLink.replace('https://www.google.com/maps', 'https://www.google.com/maps/embed/v1/place') + '&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';
                  return (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <div style={{
                        width: '100%',
                        height: 400,
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '2px solid #e2e8f0',
                        background: '#f8fafc',
                        position: 'relative'
                      }}>
                        <iframe
                          src={embedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Futsal Location"
                        ></iframe>
                      </div>
                    </div>
                  );
                }

                // Fallback for no map data
                return (
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <div style={{
                      width: '100%',
                      height: 400,
                      borderRadius: 16,
                      border: '2px dashed #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 16,
                      padding: '20px'
                    }}>
                      <i className="fas fa-map" style={{ 
                        fontSize: 48, 
                        color: '#64748b',
                        marginBottom: 16
                      }}></i>
                      <h3 style={{ 
                        fontSize: 20, 
                        fontWeight: 700, 
                        color: '#64748b',
                        marginBottom: 8
                      }}>Location Not Available</h3>
                      <p style={{ 
                        color: '#64748b',
                        maxWidth: '400px'
                      }}>
                        The location details for this futsal are not available at the moment.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      </main>

      {/* Footer (same as BookFutsal/HomePage) */}
      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerContainer}>
          {/* Company Info Column */}
          <div className={homeStyles.footerColumn}>
            <div className={homeStyles.footerLogo}>
              <Link to="/"><img src="/firstpage/logo.png" alt="match-logo" /></Link>
            </div>
            <p className={homeStyles.footerAbout}>
              Match Point is your ultimate platform for finding teammates, joining tournaments, and elevating your gaming experience.
            </p>
            <div className={homeStyles.footerContact}>
              <p><i className="fas fa-map-marker-alt"></i> Kathmandu, Nepal</p>
              <p><i className="fas fa-phone"></i> 123456789</p>
              <p><i className="fas fa-envelope"></i> info@matchpoint.com</p>
            </div>
          </div>
          {/* Quick Links Column */}
          <div className={homeStyles.footerColumn}>
            <h3 className={homeStyles.footerHeading}>Quick Links</h3>
            <ul className={homeStyles.footerLinks}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about-us">About Us</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/futsalhome">Futsal</Link></li>
              <li><Link to="/tournaments">Tournaments</Link></li>
            </ul>
          </div>
          {/* Support Column */}
          <div className={homeStyles.footerColumn}>
            <h3 className={homeStyles.footerHeading}>Support</h3>
            <ul className={homeStyles.footerLinks}>
              <li><Link to="/how-it-works">FAQs</Link></li>
              <li><Link to="/about-us">Contact Us</Link></li>
            </ul>
          </div>
          {/* Legal Column */}
          <div className={homeStyles.footerColumn}>
            <h3 className={homeStyles.footerHeading}>Legal</h3>
            <ul className={homeStyles.footerLinks}>
              <li><Link to="#">Terms of Service</Link></li>
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Cookie Policy</Link></li>
              <li><Link to="#">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className={homeStyles.footerBottom}>
          <div className={homeStyles.copyright}>
            <p>&copy; {new Date().getFullYear()} Match Point. All rights reserved.</p>
          </div>
          <div className={homeStyles.footerBottomLinks}>
            <Link to="#">Sitemap</Link>
            <Link to="#">Accessibility</Link>
            <Link to="#">Cookies</Link>
          </div>
        </div>
      </footer>

      <SeatSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slot={selectedSlot}
        onConfirm={handleConfirmBooking}
      />
    </div>
  )
}

export default FutsalDetails