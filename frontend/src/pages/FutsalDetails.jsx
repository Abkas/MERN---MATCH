import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import styles from './css/FutsalDetails.module.css'
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
            phone: futsalData.organizer?.phone || 'Contact not available'
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
    <div>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/firstpage/logo.png" alt="match-logo" />
          </Link>
        </div>
        <ul className={styles.navLinks}>
          <li><Link to="/futsalhome">Home</Link></li>
          <li><Link to="/bookfutsal" className={styles.active}>Book Futsal</Link></li>
          <li><Link to="/tournaments">Tournaments</Link></li>
          <li><Link to="/quickmatch">Quick Match</Link></li>
        </ul>
        <div className={styles.navIcons}>
          <div className={styles.notification}>
            <img src="/FUTSALHOME/notification-icon.png" alt="Notifications" />
          </div>
          <div className={styles.profile}>
            <Link to="/player-profile"><img src="/FUTSALHOME/profile-icon.png" alt="Profile" /></Link>
          </div>
        </div>
      </nav>

      <main>
        <section 
          className={styles.venueHero} 
          style={{ 
            backgroundImage: futsalData.image ? `url(${futsalData.image})` : 'none',
            backgroundColor: !futsalData.image ? '#f0f0f0' : 'transparent'
          }}
        >
          <div className={styles.venueHeader}>
            <h1>
              {futsalData.name}
              {futsalData.verified && <i className="fas fa-check-circle verified"></i>}
            </h1>
            <div className={styles.venueInfo}>
              <div className={styles.location}>
                <i className="fas fa-map-marker-alt"></i>
                <span>{futsalData.location}</span>
              </div>
              <div className={styles.hours}>
                <i className="far fa-clock"></i>
                <span>{futsalData.openingHours}</span>
              </div>
            </div>
            <div className={styles.venueStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {futsalData.totalMatches}+ Matches
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {futsalData.totalTournaments}+ Tournaments
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.bookingSection}>
          <div className={styles.container}>
            <div className={styles.bookingHeader}>
              <button className={styles.registerBtn}>
                <i className="fas fa-user-plus"></i> Join / Register Futsal
              </button>
              <div className={styles.dateNavigation}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className={styles.venueDetails}>
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
          </div>
        </section>

        <section className={styles.aboutSection}>
          <div className={styles.container}>
            <div className={styles.aboutContent}>
              <h2>About Us:</h2>
              <p>{futsalData.description}</p>
            </div>
            <div className={styles.features}>
              {futsalData.features && futsalData.features.length > 0 ? (
                futsalData.features.map((feature, index) => (
                  <div key={index} className={styles.feature}>
                    <i className="fas fa-check-circle"></i>
                    <span>{feature}</span>
                  </div>
                ))
              ) : (
                <p className={styles.noFeatures}>No features listed</p>
              )}
            </div>
          </div>
        </section>

        <section className={styles.ownerSection}>
          <div className={styles.container}>
            <h2>Meet the Owner:</h2>
            <div className={styles.ownerProfile}>
              <div className={styles.ownerImage}>
                <img 
                  src={futsalData.owner.image} 
                  alt={futsalData.owner.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-owner.png';
                  }}
                />
              </div>
              <h3>
                {futsalData.owner.name}, 
                Founder - {futsalData.name}
              </h3>
              <p className={styles.ownerBio}>
                {futsalData.owner.bio}
              </p>
              <div className={styles.ownerContact}>
                <div className={styles.contactItem}>
                  <i className="fas fa-phone"></i>
                  <span>{futsalData.owner.phone}</span>
                </div>
              </div>
              <div className={styles.ownerActions}>
                <button className={styles.addFriendBtn}>Add Friend</button>
                <button className={styles.messageBtn}>Message</button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.locationSection}>
          <div className={styles.container}>
            <h2>Find Us:</h2>
            <div className={styles.locationMap}>
              <img 
                src={futsalData.mapImage} 
                alt="Venue Map"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-map.png';
                }}
              />
              <div className={styles.mapMarker}>
                <i className="fas fa-map-marker-alt"></i>
                <span>{futsalData.location}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerLinks}>
            <a href="#">About</a>
            <a href="#">Contact Us</a>
            <a href="#">Pricing</a>
            <a href="#">FAQs</a>
            <a href="#">Team</a>
          </div>
          <div className={styles.footerSocial}>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
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