import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './css/QuickFind.module.css'
import FutsalCard from '../components/FutsalCard'
import futsalService from '../services/futsalService'
import QuickJoinSection from '../components/QuickJoinSection'
import { axiosInstance } from '../lib/axios';
import { getCurrentLocation, calculateDistance, formatDistance } from '../utils/locationUtils';
import toast from 'react-hot-toast';
import FutsalNavbar from '../components/FutsalNavbar'

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Helper to generate 24-hour time options in 30-min increments
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

const QuickFindFutsalPage = () => {
  // State for filter values
  const [distance, setDistance] = useState(25);
  const [price, setPrice] = useState(50);
  const [seats, setSeats] = useState(40);
  const [maxSlotPrice, setMaxSlotPrice] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Futsal data state
  const [futsals, setFutsals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Futsal slot mapping state
  const [futsalSlotMap, setFutsalSlotMap] = useState({});

  // State to track which futsals have eligible slots after filtering
  const [filteredFutsals, setFilteredFutsals] = useState([]);
  const [filtering, setFiltering] = useState(false);

  // State to track if filter is active
  const [filterActive, setFilterActive] = useState(false);

  // Cache for slots data
  const [slotCache, setSlotCache] = useState({}); // { [futsalId]: Slot[] }

  // State to toggle availability filter
  const [availableOnly, setAvailableOnly] = useState(true);

  // Independent toggles for each filter
  const [distanceFilterActive, setDistanceFilterActive] = useState(false);
  const [priceFilterActive, setPriceFilterActive] = useState(true);
  const [seatsFilterActive, setSeatsFilterActive] = useState(true);

  // State to toggle each filter independently
  const [distanceActive, setDistanceActive] = useState(false);
  const [priceActive, setPriceActive] = useState(false);
  const [seatsActive, setSeatsActive] = useState(false);

  // Helper for label values
  const distanceLabels = ['1km', '3km', '5km', '10+km'];
  const priceLabels = ['Rs100', 'Rs150', 'Rs200', 'Rs250+'];
  const seatsLabels = ['2', '4', '6', '8'];

  // Get current label for each filter
  const getCurrentLabel = (labels, value) => {
    const idx = Math.round((value / 100) * (labels.length - 1));
    return labels[idx];
  };

  const getMaxPrice = (value) => {
    if (value < 25) return 100;
    if (value < 50) return 150;
    if (value < 75) return 200;
    return 1000000; // 250+ means no upper limit
  };

  const getMaxDistance = (value) => {
    if (value < 25) return 1;
    if (value < 50) return 3;
    if (value < 75) return 5;
    return 100; // 10+km means no upper limit
  };

  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState(5); // in km

  // Get user's location when component mounts
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          console.error('Geolocation is not supported by your browser');
          toast.error('Location services are not supported by your browser');
          return;
        }

        // Check if we have permission
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Location permission status:', permissionStatus.state);

        if (permissionStatus.state === 'denied') {
          console.error('Location permission denied');
          toast.error('Please enable location services in your browser settings');
          return;
        }

        // Get location
        const location = await getCurrentLocation();
        console.log('1. User Location Retrieved:', {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date().toLocaleString()
        });
        
        setUserLocation(location);
        
        // Update user's location in the database
        console.log('2. Sending location to backend:', {
          latitude: location.latitude,
          longitude: location.longitude
        });
        
        const response = await axiosInstance.post('/users/update-location', {
          latitude: location.latitude,
          longitude: location.longitude
        });
        
        console.log('3. Backend Response:', response.data);
        console.log('4. Location update status:', response.data.success ? 'Success' : 'Failed');

        // Show success toast with location
        toast.success(`Location saved: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`, {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#333',
            color: '#fff',
            fontSize: '14px'
          }
        });

        // Store in sessionStorage for this session
        sessionStorage.setItem('userLocation', JSON.stringify(location));
        console.log('5. Location stored in sessionStorage');

        // Listen for permission changes
        permissionStatus.addEventListener('change', () => {
          console.log('Location permission changed:', permissionStatus.state);
          if (permissionStatus.state === 'granted') {
            fetchUserLocation(); // Retry getting location
          }
        });

      } catch (error) {
        console.error('Error in location update process:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.code === 1) {
          toast.error('Please enable location services in your browser settings');
        } else if (error.code === 2) {
          toast.error('Location information is unavailable');
        } else if (error.code === 3) {
          toast.error('Location request timed out');
        } else {
          toast.error('Could not get your location. Please try again.');
        }
      }
    };

    fetchUserLocation();
  }, []);

  useEffect(() => {
    fetchFutsals();
  }, []);

  const fetchFutsals = async () => {
    try {
      setLoading(true);
      const response = await futsalService.getAllFutsals();
      if (response && Array.isArray(response.message)) {
        setFutsals(response.message);
        
        // Log distances for all futsals if user location is available
        if (userLocation) {
          console.log('\n=== Initial Distance Check ===');
          console.log('User Location:', {
            lat: userLocation.latitude,
            lng: userLocation.longitude
          });
          
          response.message.forEach(futsal => {
            if (futsal.mapLink) {
              try {
                const decodedUrl = decodeURIComponent(futsal.mapLink);
                const coordMatch = decodedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (coordMatch) {
                  const [futsalLat, futsalLng] = [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
                  const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    futsalLat,
                    futsalLng
                  );
                  console.log(`${futsal.name}: ${distance.toFixed(2)}km`);
                } else {
                  console.log(`${futsal.name}: Could not extract coordinates`);
                }
              } catch (error) {
                console.log(`${futsal.name}: Error calculating distance - ${error.message}`);
              }
            } else {
              console.log(`${futsal.name}: No map link available`);
            }
          });
        }
      } else {
        setFutsals([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch futsals. Please try again later.');
      setFutsals([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch slots for a futsal (returns promise)
  const fetchSlotsForFutsal = async (futsalId, date) => {
    try {
      console.log('Fetching slots for futsalId:', futsalId, 'date:', date);
      const response = await axiosInstance.get(`/slots/${futsalId}/slots`, { params: { date } });
      console.log('API response for slots:', response);
      if (response.data.success) {
        return response.data.message;
      }
      return [];
    } catch (err) {
      console.error('Error fetching slots:', err);
      return [];
    }
  };

  // Search handler (filter futsals by name/location)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === "") {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = futsals.filter(futsal =>
      (futsal.name && futsal.name.toLowerCase().includes(value.toLowerCase())) ||
      (futsal.location && futsal.location.toLowerCase().includes(value.toLowerCase()))
    );
    setSearchResults(filtered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (futsalId) => {
    window.location.href = `/futsal/${futsalId}`;
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);
  };

  // Update handleFindNow to use the current location for distance calculations
  const handleFindNow = async () => {
    setFiltering(true);
    setFilterActive(false);

    // Check if any filters are active
    const hasActiveFilters = distanceFilterActive || priceActive || seatsActive;
    
    if (!hasActiveFilters) {
        console.log('No filters active - showing all futsals');
        setFilteredFutsals(futsals);
        setFiltering(false);
        return;
    }

    console.log('=== Location Filter Status ===');
    console.log('Filter Active:', distanceFilterActive);
    console.log('Max Distance:', maxDistance >= 10 ? '10+km' : `${maxDistance}km`);
    console.log('User Location:', userLocation ? {
        lat: userLocation.latitude,
        lng: userLocation.longitude
    } : 'Not available');

    setTimeout(async () => {
        setFilterActive(true);
        
        console.log('\n=== Processing Futsals ===');
        const futsalWithSlots = await Promise.all(
            futsals.map(async (futsal) => {
                // Only calculate distance if distance filter is active
                let distance = null;
                if (distanceFilterActive && userLocation && futsal.mapLink) {
                    console.log(`\nProcessing Futsal: ${futsal.name}`);
                    
                    // Extract coordinates from Google Maps URL
                    let futsalLat, futsalLng;
                    try {
                        // Decode the URL first
                        const decodedUrl = decodeURIComponent(futsal.mapLink);
                        console.log('Decoded URL:', decodedUrl);
                        
                        // Try to extract coordinates directly from URL first
                        const coordMatch = decodedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                        if (coordMatch) {
                            [futsalLat, futsalLng] = [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
                            console.log('Coordinates from URL:', { lat: futsalLat, lng: futsalLng });
                        } else {
                            // If no coordinates in URL, try to get place ID
                            const placeIdMatch = decodedUrl.match(/place\/([^/]+)/);
                            if (placeIdMatch) {
                                const placeId = placeIdMatch[1];
                                console.log('Place ID:', placeId);
                                
                                // Use Google Maps Geocoding API
                                const response = await fetch(
                                    `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
                                );
                                
                                if (!response.ok) {
                                    throw new Error(`API request failed with status ${response.status}`);
                                }
                                
                                const data = await response.json();
                                
                                if (data.status === 'OK' && data.results && data.results[0]) {
                                    const location = data.results[0].geometry.location;
                                    futsalLat = location.lat;
                                    futsalLng = location.lng;
                                    console.log('Coordinates from API:', { lat: futsalLat, lng: futsalLng });
                                } else {
                                    console.log('API Response:', data);
                                    throw new Error(`API returned status: ${data.status}`);
                                }
                            }
                        }
                    } catch (error) {
                        console.log(`⚠️ Error getting coordinates for futsal: ${futsal.name}`, {
                            mapLink: futsal.mapLink,
                            error: error.message
                        });
                    }

                    if (!futsalLat || !futsalLng) {
                        console.log(`⚠️ Could not get coordinates for futsal: ${futsal.name}`, {
                            mapLink: futsal.mapLink,
                            parsedLat: futsalLat,
                            parsedLng: futsalLng
                        });
                        return null;
                    }

                    console.log('Futsal Location:', {
                        lat: futsalLat,
                        lng: futsalLng,
                        mapLink: futsal.mapLink
                    });

                    distance = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        futsalLat,
                        futsalLng
                    );
                    
                    console.log('Distance Calculation:', {
                        distance: distance.toFixed(2) + ' km',
                        maxDistance: maxDistance >= 10 ? '10+km' : `${maxDistance}km`,
                        isWithinRange: maxDistance >= 10 || distance <= maxDistance,
                        willBeFiltered: maxDistance < 10 && distance > maxDistance
                    });
                    
                    // Skip futsals that are too far (only if not 10+km)
                    if (maxDistance < 10 && distance > maxDistance) {
                        console.log(`❌ Filtered out: ${futsal.name} - Distance (${distance.toFixed(2)}km) > Max (${maxDistance}km)`);
                        return null;
                    }
                } else if (distanceFilterActive && (!userLocation || !futsal.mapLink)) {
                    console.log(`⚠️ Missing location data for futsal: ${futsal.name}`, {
                        hasUserLocation: !!userLocation,
                        hasMapLink: !!futsal.mapLink,
                        mapLinkType: futsal.mapLink ? typeof futsal.mapLink : 'undefined'
                    });
                    return null; // Skip futsals without location data when distance filter is active
                }

                // Only check slots if price or seats filter is active
                if (priceActive || seatsActive) {
                    const slots = await fetchSlotsForFutsal(futsal._id, selectedDate);
                    const hasSlots = slots.some(slot => slot.status === 'available');
                    
                    if (!hasSlots) {
                        console.log(`❌ Filtered out: ${futsal.name} - No available slots`);
                        return null;
                    }
                }

                console.log(`✅ Included: ${futsal.name} - Distance: ${distance ? distance.toFixed(2) + 'km' : 'N/A'}`);
                return {
                    ...futsal,
                    distance: distance ? formatDistance(distance) : null,
                    hasSlots: true
                };
            })
        );

        const filtered = futsalWithSlots.filter(Boolean);
        console.log('\n=== Final Results ===');
        console.log('Total Futsals:', futsals.length);
        console.log('Filtered Count:', filtered.length);
        console.log('Filtered Futsals:', filtered.map(f => ({
            name: f.name,
            distance: f.distance,
            location: f.location ? {
                lat: f.location.latitude,
                lng: f.location.longitude
            } : 'No location'
        })));

        setFilteredFutsals(filtered);
        setFiltering(false);
    }, 0);
  };

  // Callback to receive slot info from QuickJoinSection
  const handleHasSlots = (futsalId, hasSlots) => {
    setFutsalSlotMap(prev => ({ ...prev, [futsalId]: hasSlots }));
  };

  // Only apply futsalSlotMap filtering if a filter is active (maxSlotPrice is not null)
  const shouldShowFutsal = (futsal) => {
    if (maxSlotPrice == null) return true;
    return futsalSlotMap[futsal._id] !== false;
  };

  // Re-run filtering whenever toggles or slider values change
  useEffect(() => {
    if (filterActive) {
      handleFindNow();
    }
  }, [priceActive, seatsActive, price, seats, filterActive]);

  // Reset filters when toggles are turned off
  useEffect(() => {
    if (!priceActive && !seatsActive) {
      setFilterActive(false);
      setFilteredFutsals(futsals);
    }
  }, [priceActive, seatsActive, futsals]);

  // --- FIND PLAYERS SECTION LOGIC ---
  const [findPlayers, setFindPlayers] = useState([]);
  const [findPlayersShowCount, setFindPlayersShowCount] = useState(4);
  const [addingFriendId, setAddingFriendId] = useState(null);
  const [findPlayersExpanded, setFindPlayersExpanded] = useState(false);
  useEffect(() => {
    // Fetch all users and friends, then filter to only non-friends
    Promise.all([
      axiosInstance.get('/users/all'),
      axiosInstance.get('/friendships/list'),
      axiosInstance.get('/friendships/pending')
    ]).then(([usersRes, friendsRes, pendingRes]) => {
      const allUsers = usersRes.data.message || [];
      const friends = friendsRes.data.message || [];
      const pending = pendingRes.data.message || { sent: [], received: [] };
      const friendIds = new Set(friends.map(f => f._id));
      const sentIds = new Set((pending.sent || []).map(r => r.recipient));
      const receivedIds = new Set((pending.received || []).map(r => r.requester));
      // Only show users who are not friends, not pending, and not self
      setFindPlayers(allUsers.filter(u =>
        !friendIds.has(u._id) &&
        !sentIds.has(u._id) &&
        !receivedIds.has(u._id) &&
        u._id !== (window.localStorage.getItem('userId') || '')
      ));
    });
  }, []);
  const handleShowMoreFindPlayers = () => setFindPlayersExpanded(v => !v);
  const handleAddFriend = (userId) => {
    setAddingFriendId(userId);
    axiosInstance.post('/friendships/send-request', { recipientId: userId })
      .then(() => {
        setFindPlayers(prev => prev.filter(u => u._id !== userId));
        toast.success('Friend request sent');
      })
      .catch(() => toast.error('Failed to send friend request'))
      .finally(() => setAddingFriendId(null));
  };

  // --- JOIN TEAMS SECTION LOGIC ---
  const [teams, setTeams] = useState([]);
  const [joiningTeamId, setJoiningTeamId] = useState(null);
  const [teamsShowCount, setTeamsShowCount] = useState(4);
  const [teamsExpanded, setTeamsExpanded] = useState(false);
  useEffect(() => {
    axiosInstance.get('/myteam/all')
      .then(res => setTeams(res.data.teams || []))
      .catch(() => setTeams([]));
  }, []);
  const handleShowMoreTeams = () => setTeamsExpanded(v => !v);
  const handleJoinTeam = (teamId) => {
    setJoiningTeamId(teamId);
    axiosInstance.post('/myteam/request-join', { teamId })
      .then(() => {
        toast.success('Join request sent to team owner');
        setTeams(prev => prev.filter(t => t._id !== teamId));
      })
      .catch(() => toast.error('Failed to send join request'))
      .finally(() => setJoiningTeamId(null));
  };

  const [preferredTimes, setPreferredTimes] = useState([]);
  const [loadingPreferred, setLoadingPreferred] = useState(true);

  // Fetch preferred times on mount
  const fetchPreferredTimes = () => {
    setLoadingPreferred(true);
    console.log('Fetching preferred times from backend...');
    axiosInstance.get('/users/preferred-time')
      .then(res => {
        console.log('Backend response for preferred times:', res);
        const data = res.data.data;
        console.log('Extracted preferredTimes:', data);
        // Ensure we always get an array, even if data is null/undefined
        const safeData = Array.isArray(data) ? data : [];
        console.log('Safe preferredTimes to set:', safeData);
        setPreferredTimes(safeData);
      })
      .catch((err) => {
        console.error('Error fetching preferred times:', err);
        toast.error('Failed to load your preferred times');
        setPreferredTimes([]);
      })
      .finally(() => {
        setLoadingPreferred(false);
        console.log('Finished fetching preferred times.');
      });
  };

  useEffect(() => {
    fetchPreferredTimes();
  }, []);

  const handleAddPreferredTime = () => {
    if (!newDay || !newStart || !newEnd) return;
    const updated = [
      ...preferredTimes,
      { dayOfWeek: newDay, startTime: newStart, endTime: newEnd }
    ];
    setPreferredTimes(updated);
    axiosInstance.put('/users/preferred-time', { preferredTime: updated })
      .then(() => {
        // Optionally show a success toast
        // toast.success('Preferred time updated');
      })
      .catch((err) => {
        toast.error('Failed to update preferred time');
        console.error('Preferred time update error:', err);
      });
  };
  const handleDeletePreferredTime = idx => {
    const updated = preferredTimes.filter((_, i) => i !== idx);
    setPreferredTimes(updated);
    axiosInstance.put('/users/preferred-time', { preferredTime: updated })
      .then(() => {
        // Optionally show a success toast
        // toast.success('Preferred time updated');
      })
      .catch((err) => {
        toast.error('Failed to update preferred time');
        console.error('Preferred time update error:', err);
      });
  };

  const [newDay, setNewDay] = useState('Monday');
  const [newStart, setNewStart] = useState('18:00');
  const [newEnd, setNewEnd] = useState('20:00');

  return (
    <div className={styles.body} style={{ background: '#fff', color: '#111' }}>
      <FutsalNavbar />
      <main style={{ width: '100%' }}>
        {/* Section 1: Join Quick Matches */}
        <section style={{ background: '#fff', color: '#111', borderBottom: '1px solid #eee', padding: '32px 0' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 24, letterSpacing: 0.5 }}>Join Quick Matches</h2>
          <div style={{ minHeight: 80, border: '1px dashed #bbb', borderRadius: 10, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>
            {/* Placeholder for quick match join UI */}
            Coming soon: Join a quick match instantly!
          </div>
        </section>
        {/* Section 2: People with Similar Interest */}
        <section style={{ background: '#fff', color: '#111', borderBottom: '1px solid #eee', padding: '32px 0' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 24, letterSpacing: 0.5 }}>People with Similar Interest</h2>
          <div style={{ minHeight: 80, background: '#fafafa', borderRadius: 10, padding: 24 }}>
            {findPlayers.length === 0 ? (
              <div style={{ color: '#888', fontSize: 18, textAlign: 'center' }}>No new players to add.</div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 24,
                  marginBottom: 24
                }}>
                  { (findPlayersExpanded ? findPlayers : findPlayers.slice(0, 4)).map(player => {
                    const isOrganizer = player.role === 'organizer';
                    return (
                      <div key={player._id} style={{
                        background: isOrganizer ? '#e0f2fe' : '#fff',
                        border: isOrganizer ? '2px solid #38bdf8' : '1px solid #eee',
                        borderRadius: 12,
                        padding: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: isOrganizer ? '0 2px 12px #38bdf822' : '0 2px 8px #0001',
                        minHeight: 220,
                        transition: 'box-shadow 0.2s',
                        position: 'relative',
                      }}>
                        {isOrganizer && (
                          <div style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            background: '#38bdf8',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 12,
                            borderRadius: 6,
                            padding: '2px 10px',
                            letterSpacing: 0.5
                          }}>Organizer</div>
                        )}
                        <img src={player.avatar || '/avatar.jpg'} alt={player.username} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
                        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{player.username}</div>
                        <div style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>{player.fullName}</div>
                        {player.playerProfile?.bio && (
                          <div style={{ color: '#444', fontSize: 13, marginBottom: 4, textAlign: 'center', minHeight: 32, maxHeight: 48, overflow: 'hidden' }}>{player.playerProfile.bio}</div>
                        )}
                        {player.playerProfile?.preferredGame && (
                          <div style={{ color: '#2563eb', fontSize: 13, marginBottom: 4 }}>Preferred: {player.playerProfile.preferredGame}</div>
                        )}
                        {player.playerProfile?.location && (
                          <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>Location: {player.playerProfile.location}</div>
                        )}
                        <button onClick={() => handleAddFriend(player._id)} disabled={addingFriendId === player._id} style={{
                          marginTop: 10,
                          background: addingFriendId === player._id ? '#bbb' : '#10b981', // greenish
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 18px',
                          fontWeight: 600,
                          fontSize: 15,
                          cursor: addingFriendId === player._id ? 'not-allowed' : 'pointer',
                          boxShadow: '0 1px 4px #0001'
                        }}>{addingFriendId === player._id ? 'Sending...' : 'Add Friend'}</button>
                      </div>
                    );
                  })}
                </div>
                {findPlayers.length > 4 && (
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={handleShowMoreFindPlayers} style={{
                      background: findPlayersExpanded ? '#2563eb' : '#3b82f6', // blueish
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 24px',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px #0001'
                    }}>{findPlayersExpanded ? 'Show Less' : 'Show More'}</button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        {/* Section 3: Matches are Fun as a Team */}
        <section style={{ background: '#fff', color: '#111', borderBottom: '1px solid #eee', padding: '32px 0' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 24, letterSpacing: 0.5 }}>Matches are Fun as a Team</h2>
          <div style={{ minHeight: 80, background: '#fafafa', borderRadius: 10, padding: 24 }}>
            {teams.length === 0 ? (
              <div style={{ color: '#888', fontSize: 18, textAlign: 'center' }}>No teams available to join.</div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  marginBottom: 24
                }}>
                  {(teamsExpanded ? teams : teams.slice(0, 4)).map(team => (
                    <div key={team._id} style={{
                      background: '#fff',
                      border: '1px solid #eee',
                      borderRadius: 12,
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px #0001',
                      minHeight: 120,
                      transition: 'box-shadow 0.2s',
                      position: 'relative',
                      gap: 24
                    }}>
                      <img src={team.avatar || '/avatar.jpg'} alt={team.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginRight: 24 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{team.name}</div>
                        <div style={{ color: '#888', fontSize: 15, marginBottom: 4 }}>{team.location || 'No location'}</div>
                        {team.description && (
                          <div style={{ color: '#444', fontSize: 14, marginBottom: 4, textAlign: 'left', minHeight: 24, maxHeight: 40, overflow: 'hidden' }}>{team.description}</div>
                        )}
                        <div style={{ color: '#2563eb', fontSize: 14, marginBottom: 4 }}>Owner: {team.owner?.username || 'N/A'}</div>
                      </div>
                      <button onClick={() => handleJoinTeam(team._id)} disabled={joiningTeamId === team._id} style={{
                        background: joiningTeamId === team._id ? '#bbb' : '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 28px',
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: joiningTeamId === team._id ? 'not-allowed' : 'pointer',
                        boxShadow: '0 1px 4px #0001',
                        minWidth: 120
                      }}>{joiningTeamId === team._id ? 'Requesting...' : 'Join Now'}</button>
                    </div>
                  ))}
                </div>
                {teams.length > 4 && (
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={handleShowMoreTeams} style={{
                      background: teamsExpanded ? '#2563eb' : '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 24px',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px #0001'
                    }}>{teamsExpanded ? 'Show Less' : 'Show More'}</button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        {/* Original content below */}
        <section className={styles.searchSection}>
          <div className={styles.searchBar} style={{ position: 'relative' }}>
            <div className={styles.searchInput}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search Futsal"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                autoComplete="off"
              />
              {searchQuery && searchResults.length === 0 && showSuggestions && (
                <span
                  style={{ color: '#e74c3c', fontWeight: 700, marginLeft: 8, cursor: 'pointer', fontSize: 18 }}
                  onClick={handleClearSearch}
                  title="Clear"
                >&#10005;</span>
              )}
            </div>
            {/* Suggestions dropdown */}
            {showSuggestions && searchQuery && (
              <div style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                boxShadow: '0 4px 16px #0001',
                zIndex: 20,
                maxHeight: 220,
                overflowY: 'auto',
                padding: '0.5rem 0',
              }}>
                {searchResults.length > 0 ? (
                  searchResults.map(futsal => (
                    <div
                      key={futsal._id}
                      style={{ padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      onClick={() => handleSuggestionClick(futsal._id)}
                    >
                      <img src={futsal.futsalPhoto || '/default-futsal.jpg'} alt={futsal.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', marginRight: 8 }} />
                      <span style={{ fontWeight: 600 }}>{futsal.name}</span>
                      {futsal.location && (
                        <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{futsal.location}</span>
                      )}
                    </div>
                  ))
                ) : (
                  searchQuery && (
                    <div style={{ padding: '10px 18px', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>No match for "{searchQuery}"</span>
                      <span
                        style={{ fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
                        onClick={handleClearSearch}
                        title="Clear"
                      >&#10005;</span>
                    </div>
                  )
                )}
              </div>
            )}
            <button className={styles.searchBtn}>Search</button>
          </div>

          <div className={styles.filters}>
            <h2>Quick Filters</h2>
            <div className={styles.filterSliders}>
              {/* Distance Filter */}
              <div className={styles.filterGroup} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  onClick={() => setDistanceFilterActive((prev) => !prev)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: distanceFilterActive ? '#2ecc40' : '#bbb',
                    marginRight: 8,
                    cursor: 'pointer',
                    border: '1px solid #888',
                    transition: 'background 0.2s',
                  }}
                  title="Toggle distance filter"
                ></div>
                <label>Distance: <span className={styles.filterValue}>{maxDistance >= 10 ? '10+km' : `${maxDistance}km`}</span></label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div 
                      className={styles.sliderFill} 
                      style={{ 
                        width: maxDistance >= 10 ? '100%' : `${(maxDistance / 10) * 100}%`, 
                        opacity: distanceFilterActive ? 1 : 0.3 
                      }}
                    ></div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={maxDistance >= 10 ? 10 : maxDistance}
                      onChange={e => {
                        if (distanceFilterActive) {
                          const value = Number(e.target.value);
                          setMaxDistance(value >= 10 ? 100 : value); // Set to 100 for 10+km
                        }
                      }}
                      className={styles.slider}
                      style={{
                        accentColor: distanceFilterActive ? '#007bff' : '#bbb',
                        background: distanceFilterActive ? undefined : '#eee',
                        pointerEvents: distanceFilterActive ? 'auto' : 'none',
                        opacity: distanceFilterActive ? 1 : 0.5,
                      }}
                      disabled={!distanceFilterActive}
                    />
                  </div>
                  <div className={styles.sliderLabels} style={{ opacity: distanceFilterActive ? 1 : 0.5 }}>
                    <span>1km</span>
                    <span>5km</span>
                    <span>10+km</span>
                  </div>
                </div>
              </div>
              {/* Price Filter Group */}
              <div className={styles.filterGroup} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  onClick={() => setPriceActive((prev) => !prev)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: priceActive ? '#2ecc40' : '#bbb',
                    marginRight: 8,
                    cursor: 'pointer',
                    border: '1px solid #888',
                    transition: 'background 0.2s',
                  }}
                  title="Toggle price filter"
                ></div>
                <label>Price: <span className={styles.filterValue}>{getCurrentLabel(priceLabels, price)}</span></label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: `${price}%`, opacity: priceActive ? 1 : 0.3 }}></div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={price}
                      onChange={e => priceActive && setPrice(Number(e.target.value))}
                      className={styles.slider}
                      style={{
                        accentColor: priceActive ? '#007bff' : '#bbb',
                        background: priceActive ? undefined : '#eee',
                        pointerEvents: priceActive ? 'auto' : 'none',
                        opacity: priceActive ? 1 : 0.5,
                      }}
                      disabled={!priceActive}
                    />
                  </div>
                  <div className={styles.sliderLabels} style={{ opacity: priceActive ? 1 : 0.5 }}>
                    {priceLabels.map(label => <span key={label}>{label}</span>)}
                  </div>
                </div>
              </div>
              {/* Seats Filter Group */}
              <div className={styles.filterGroup} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  onClick={() => setSeatsActive((prev) => !prev)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: seatsActive ? '#2ecc40' : '#bbb',
                    marginRight: 8,
                    cursor: 'pointer',
                    border: '1px solid #888',
                    transition: 'background 0.2s',
                  }}
                  title="Toggle seats filter"
                ></div>
                <label>Seats Needed: <span className={styles.filterValue}>{getCurrentLabel(seatsLabels, seats)}</span></label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: `${seats}%`, opacity: seatsActive ? 1 : 0.3 }}></div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={seats}
                      onChange={e => seatsActive && setSeats(Number(e.target.value))}
                      className={styles.slider}
                      style={{
                        accentColor: seatsActive ? '#007bff' : '#bbb',
                        background: seatsActive ? undefined : '#eee',
                        pointerEvents: seatsActive ? 'auto' : 'none',
                        opacity: seatsActive ? 1 : 0.5,
                      }}
                      disabled={!seatsActive}
                    />
                  </div>
                  <div className={styles.sliderLabels} style={{ opacity: seatsActive ? 1 : 0.5 }}>
                    {seatsLabels.map(label => <span key={label}>{label}</span>)}
                  </div>
                </div>
              </div>
            </div>
            <button className={styles.findNowBtn} onClick={handleFindNow}>Find Now</button>
          </div>
        </section>

        <section className={styles.availableFutsal}>
          <h2>Available Futsal</h2>
          <div className={styles.filterOptions} style={{ marginBottom: '16px' }}>
            <div className={styles.filterDropdown}>
              <button 
                className={`${styles.dropdownBtn} ${priceActive ? styles.active : ''}`}
                onClick={() => setPriceActive(prev => !prev)}
              >
                Entry Fee
              </button>
            </div>
            <div className={styles.filterDropdown}>
              <button 
                className={`${styles.dropdownBtn} ${seatsActive ? styles.active : ''}`}
                onClick={() => setSeatsActive(prev => !prev)}
              >
                Players Needed
              </button>
            </div>
            <div className={styles.filterDropdown}>
              <button 
                className={`${styles.dropdownBtn} ${distanceFilterActive ? styles.active : ''}`}
                onClick={() => setDistanceFilterActive(prev => !prev)}
              >
                Location
              </button>
            </div>
          </div>
          {/* Render the QuickJoinSection for each futsal, just like BookFutsal */}
          <div className={styles.venueList}>
            {filtering ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Filtering...</div>
            ) : filterActive ? (
              filteredFutsals.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>No futsals found</div>
              ) : (
                filteredFutsals.map(futsal => {
                  console.log('Rendering futsal:', futsal.name, 'with slots:', futsal.slots);
                  const seatsValue = (() => {
                    const idx = Math.round((seats / 100) * (seatsLabels.length - 1));
                    return parseInt(seatsLabels[idx], 10);
                  })();
                  return (
                    <QuickJoinSection
                      key={futsal._id}
                      futsal={futsal}
                      slots={futsal.slots}
                      minPrice={0}
                      maxPrice={priceActive ? getMaxPrice(price) : undefined}
                      availableOnly={true}
                      requiredSeats={seatsActive ? seatsValue : undefined}
                    />
                  );
                })
              )
            ) : (
              futsals.map(futsal => {
                console.log('Rendering futsal (no filter):', futsal.name);
                return (
                  <QuickJoinSection
                    key={futsal._id}
                    futsal={futsal}
                    // Don't pass slots, let QuickJoinSection fetch on expand
                  />
                );
              })
            )}
          </div>
        </section>

        <section className={styles.registerMatch}>
          <div className={styles.lightBoxContent}>
            <div className={styles.registerHeader}>
              <h2>Let Us Know When You're Free</h2>
            </div>
            <div className={styles.registerForm}>
              <div className={styles.formGroup}>
                <label>Preferred Availability</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <select value={newDay} onChange={e => setNewDay(e.target.value)}>
                    {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                  <select value={newStart} onChange={e => setNewStart(e.target.value)}>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span>to</span>
                  <select value={newEnd} onChange={e => setNewEnd(e.target.value)}>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="button" style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={handleAddPreferredTime}>
                    Add
                  </button>
                </div>
                
                {/* Display current preferred times */}
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Your Current Availability:</h3>
                  {loadingPreferred ? (
                    <div style={{ color: '#888', padding: '8px 0' }}>Loading your available times...</div>
                  ) : preferredTimes.length === 0 ? (
                    <div style={{ color: '#888', padding: '8px 0' }}>You haven't added any available times yet.</div>
                  ) : (
                    <div style={{ 
                      background: '#f0f9ff', 
                      border: '1px solid #93c5fd', 
                      borderRadius: 8, 
                      padding: 16,
                      marginBottom: 16
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #bfdbfe' }}>
                            <th style={{ textAlign: 'left', padding: '8px 16px', color: '#1e40af' }}>Day</th>
                            <th style={{ textAlign: 'left', padding: '8px 16px', color: '#1e40af' }}>Time</th>
                            <th style={{ textAlign: 'right', padding: '8px 16px', color: '#1e40af' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preferredTimes.map((pt, idx) => (
                            <tr key={idx} style={{ borderBottom: idx < preferredTimes.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                              <td style={{ padding: '8px 16px', fontWeight: 500 }}>{pt.dayOfWeek}</td>
                              <td style={{ padding: '8px 16px' }}>{pt.startTime} - {pt.endTime}</td>
                              <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                <button 
                                  onClick={() => handleDeletePreferredTime(idx)} 
                                  style={{ 
                                    background: '#ef4444',
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 6, 
                                    padding: '4px 12px', 
                                    fontWeight: 600, 
                                    cursor: 'pointer' 
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {loadingPreferred ? <span style={{ color: '#888' }}>Loading...</span> : null}
                  {!loadingPreferred && preferredTimes.length === 0 && <span style={{ color: '#888' }}>No preferred times added.</span>}
                  {preferredTimes.map((pt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f3f4f6', borderRadius: 6, padding: '6px 12px' }}>
                      <span style={{ fontWeight: 500 }}>{pt.dayOfWeek}</span>
                      <span>{pt.startTime} - {pt.endTime}</span>
                      <button type="button" style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 600, cursor: 'pointer', marginLeft: 8 }} onClick={() => handleDeletePreferredTime(idx)}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default QuickFindFutsalPage
