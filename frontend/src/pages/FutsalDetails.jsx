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
            name: futsalData.ownerName || 'Unknown Owner',
            image: futsalData.organizer?.profilePicture || '/default-owner.png',
            bio: futsalData.ownerDescription || 'No bio available',
            phone: futsalData.organizer?.phone || 'Contact not available',
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
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, textShadow: '0 2px 8px #1118' }}>
                  <i className="fas fa-map-marker-alt" style={{ color: '#fff' }}></i> {futsalData.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, textShadow: '0 2px 8px #1118' }}>
                  <i className="far fa-clock" style={{ color: '#fff' }}></i> {futsalData.openingHours}
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
          <div className={styles.container} style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #2563eb11', padding: '2.5rem 2rem', marginBottom: 36, border: '1.5px solid #e3e8f0' }}>
            <div className={styles.bookingHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <button className={styles.registerBtn} style={{ background: '#43a047', color: '#fff', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px #43a04722', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fas fa-user-plus"></i> Join / Register Futsal
              </button>
              <div className={styles.dateNavigation}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1.5px solid #e3e8f0', fontSize: 16 }}
                />
              </div>
            </div>

            <div className={styles.venueDetails}>
              {loading ? (
                <div className={styles.loading}>Loading slots...</div>
              ) : slots.length === 0 ? (
                <div className={styles.noSlots} style={{ color: '#888', fontSize: 18, textAlign: 'center', padding: '2rem 0' }}>No slots available for this date</div>
              ) : (
                <div className={styles.timeSlots} style={{ marginTop: 18 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f8fafc', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px #2563eb08' }}>
                    <thead>
                      <tr style={{ background: '#f1f5fb' }}>
                        <th style={{ padding: 14, fontWeight: 700, fontSize: 16, color: '#2563eb' }}><Clock size={16} /> Time</th>
                        <th style={{ padding: 14, fontWeight: 700, fontSize: 16, color: '#2563eb' }}><Users size={16} /> Players</th>
                        <th style={{ padding: 14, fontWeight: 700, fontSize: 16, color: '#2563eb' }}><DollarSign size={16} /> Price</th>
                        <th style={{ padding: 14, fontWeight: 700, fontSize: 16, color: '#2563eb' }}>Status</th>
                        <th style={{ padding: 14, fontWeight: 700, fontSize: 16, color: '#2563eb' }}>Action</th>
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
                          <tr key={slot._id} style={{ background: '#fff', borderBottom: '1px solid #e3e8f0' }}>
                            <td style={{ padding: 14, fontWeight: 600, color: '#222' }}>{slot.time}</td>
                            <td style={{ padding: 14, fontWeight: 600, color: '#43a047' }}>{slot.currentPlayers || 0}/{slot.maxPlayers}</td>
                            <td style={{ padding: 14, fontWeight: 600, color: '#fbc02d' }}>₹{slot.price}</td>
                            <td style={{ padding: 14 }}>
                              <span className={`${styles.status} ${statusClass}`} style={{ fontWeight: 700, fontSize: 14, padding: '4px 12px', borderRadius: 6 }}>{statusLabel}</span>
                            </td>
                            <td style={{ padding: 14 }}>
                              <button
                                className={`${styles.btnJoinNow} ${!canJoin ? styles.btnJoinNowDisabled : ''}`}
                                style={{ background: canJoin ? '#2563eb' : '#e3e8f0', color: canJoin ? '#fff' : '#888', borderRadius: 8, padding: '8px 18px', fontWeight: 700, border: 'none', boxShadow: canJoin ? '0 2px 8px #2563eb22' : 'none', cursor: canJoin ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
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
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className={styles.aboutSection}>
          <div className={styles.container} style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #2563eb11', padding: '2.5rem 2rem', marginBottom: 36, border: '1.5px solid #e3e8f0' }}>
            <div className={styles.aboutContent}>
              <h2 style={{ fontWeight: 800, color: '#2563eb', marginBottom: 12 }}>About Us:</h2>
              <p style={{ fontSize: 17, color: '#444', marginBottom: 18 }}>{futsalData.description}</p>
            </div>
            <div className={styles.features} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 10 }}>
              {futsalData.features && futsalData.features.length > 0 ? (
                futsalData.features.map((feature, index) => (
                  <div key={index} className={styles.feature} style={{ background: '#f1f5fb', color: '#2563eb', borderRadius: 8, padding: '8px 18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fas fa-check-circle"></i>
                    <span>{feature}</span>
                  </div>
                ))
              ) : (
                <p className={styles.noFeatures} style={{ color: '#888' }}>No features listed</p>
              )}
            </div>
          </div>
        </section>

        {/* OWNER SECTION */}
        <section className={styles.ownerSection}>
          <div className={styles.container} style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #2563eb11', padding: '2.5rem 2rem', marginBottom: 36, border: '1.5px solid #e3e8f0' }}>
            <h2 style={{ fontWeight: 800, color: '#2563eb', marginBottom: 18 }}>Meet the Owner:</h2>
            <div className={styles.ownerProfile} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <div className={styles.ownerImage}>
                <img
                  src={futsalData.owner.image}
                  alt={futsalData.owner.name}
                  style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb', background: '#f1f5fb' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-owner.png';
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>{futsalData.owner.name}, <span style={{ fontWeight: 400, fontSize: 18 }}>Founder - {futsalData.name}</span></h3>
                <p className={styles.ownerBio} style={{ color: '#444', fontSize: 16, marginBottom: 10 }}>{futsalData.owner.bio}</p>
                <div className={styles.ownerContact} style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 10 }}>
                  <div className={styles.contactItem} style={{ color: '#43a047', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fas fa-phone"></i>
                    <span>{futsalData.owner.phone}</span>
                  </div>
                  {futsalData.owner.email && (
                    <div className={styles.contactItem} style={{ color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="fas fa-envelope"></i>
                      <span>{futsalData.owner.email}</span>
                    </div>
                  )}
                </div>
                {/* Optionally show more owner info if available */}
                {futsalData.owner && futsalData.owner.additionalInfo && (
                  <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>{futsalData.owner.additionalInfo}</div>
                )}
                <div className={styles.ownerActions} style={{ display: 'flex', gap: 12 }}>
                  <button className={styles.addFriendBtn} style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '8px 18px', fontWeight: 600, border: 'none', boxShadow: '0 2px 8px #2563eb22', cursor: 'pointer' }}>Add Friend</button>
                  <button className={styles.messageBtn} style={{ background: '#fff', color: '#2563eb', border: '1.5px solid #2563eb', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Message</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION SECTION */}
        <section className={styles.locationSection}>
          <div className={styles.container} style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #2563eb11', padding: '2.5rem 2rem', marginBottom: 36, border: '1.5px solid #e3e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 800, color: '#2563eb', marginBottom: 18, textAlign: 'center', width: '100%' }}>Find Us:</h2>
            <div className={styles.locationMap} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%' }}>
              {(() => {
                let mapLinkRaw = (futsalData.mapImage || '').trim();
                // If user pasted full <iframe ...> tag, extract src
                let mapLink = mapLinkRaw;
                const iframeMatch = mapLinkRaw.match(/<iframe[^>]*src=["']([^"']+)["']/i);
                if (iframeMatch) {
                  mapLink = iframeMatch[1];
                }
                // Try to extract coordinates from the embed or link
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
                // Map rendering logic (no locationName display)
                return (
                  <div style={{ width: '100%' }}>
                    {/* Map rendering logic below (unchanged, no locationName) */}
                    {(() => {
                      if (lat && lng) {
                        const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
                        const staticMap = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=600x300&markers=color:red%7Clabel:F%7C${lat},${lng}&key=${apiKey}`;
                        const markerEmbed = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
                        if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
                          return (
                            <img src={staticMap} alt="Futsal Location" style={{ width: 600, height: 300, borderRadius: 16, boxShadow: '0 2px 12px #2563eb22', margin: '0 auto', display: 'block' }} />
                          );
                        } else {
                          return (
                            <iframe
                              src={markerEmbed}
                              width="600"
                              height="300"
                              style={{ border: 0, borderRadius: 16, boxShadow: '0 2px 12px #2563eb22', display: 'block', margin: '0 auto' }}
                              allowFullScreen=""
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title="Futsal Map with Marker"
                            ></iframe>
                          );
                        }
                      }
                      const isEmbed = mapLink.startsWith('https://') && mapLink.includes('/maps/embed');
                      const isGoogleMaps = mapLink.startsWith('https://') && mapLink.includes('google.com/maps');
                      if (!mapLink || mapLink === '/default-map.png') {
                        return (
                          <div style={{ color: 'orange', fontWeight: 700, fontSize: 16, textAlign: 'center', width: '100%' }}>
                            No map link provided. Please update the futsal profile with a Google Maps link.
                          </div>
                        );
                      }
                      if (isEmbed) {
                        return (
                          <iframe
                            src={mapLink}
                            width="400"
                            height="260"
                            style={{ border: 0, borderRadius: 16, boxShadow: '0 2px 12px #2563eb22', display: 'block', margin: '0 auto' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Futsal Map"
                          ></iframe>
                        );
                      } else if (isGoogleMaps) {
                        return (
                          <a
                            href={mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline', fontSize: 18, display: 'block', textAlign: 'center', width: '100%' }}
                            onClick={e => { e.stopPropagation(); }}
                          >
                            View on Google Maps
                          </a>
                        );
                      } else {
                        return (
                          <div style={{
                            width: 400,
                            height: 260,
                            borderRadius: 16,
                            border: '2px dashed #2563eb',
                            background: '#f1f5fb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563eb',
                            fontWeight: 700,
                            fontSize: 20,
                            flexShrink: 0,
                            margin: '0 auto',
                            textAlign: 'center'
                          }}>
                            <span style={{ opacity: 0.5 }}>Map will appear here</span>
                          </div>
                        );
                      }
                    })()}
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