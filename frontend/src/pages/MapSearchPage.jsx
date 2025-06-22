import React, { useEffect, useRef, useState } from 'react';
import FutsalNavbar from '../components/FutsalNavbar';
import futsalService from '../services/futsalService';
import FutsalCard from '../components/FutsalCard';
import styles from '../pages/css/QuickFind.module.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getSlotTimeStatus, isSlotWithinOpeningHours } from '../utils/slotTimeStatus';
import { useNavigate } from 'react-router-dom';
import SeatSelectionModal from '../components/SeatSelectionModal';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const defaultFilters = {
  distance: 1, // km (initial value)
  price: [0, 1000], // min price 0 (changed from 100)
  slot: 1, // min slot 1
};

export default function MapSearchPage() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [futsals, setFutsals] = useState([]);
  const [filteredFutsals, setFilteredFutsals] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [selectedFutsal, setSelectedFutsal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState({}); // {futsalId: [slots]}
  const [allSlots, setAllSlots] = useState({}); // {futsalId: [slots]}
  const [showFilteredSlots, setShowFilteredSlots] = useState(false);
  const [selectedFutsalForSlots, setSelectedFutsalForSlots] = useState(null);
  const [joinSlotLoading, setJoinSlotLoading] = useState(false);
  const [joinSlotError, setJoinSlotError] = useState(null);
  const [expandedFutsalIds, setExpandedFutsalIds] = useState([]);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [seatModalSlot, setSeatModalSlot] = useState(null);
  const [seatModalFutsal, setSeatModalFutsal] = useState(null);
  const navigate = useNavigate();

  // Load Google Maps script
  useEffect(() => {
    if (!window.google && !document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 27.7172, lng: 85.3240 }); // Default: Kathmandu
        }
      );
    } else {
      setUserLocation({ lat: 27.7172, lng: 85.3240 });
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapLoaded && userLocation && !map) {
      const m = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 14,
        disableDefaultUI: true,
      });
      setMap(m);
    }
  }, [mapLoaded, userLocation]);

  // Fetch futsals using futsalService (same as QuickFindFutsalPage)
  useEffect(() => {
    futsalService.getAllFutsals()
      .then((res) => {
        // Support both .message and direct array
        if (Array.isArray(res)) setFutsals(res);
        else if (Array.isArray(res.message)) setFutsals(res.message);
        else setFutsals([]);
        // Removed futsals with coordinates console
      })
      .catch(() => setFutsals([]));
  }, []);

  // Filter futsals (only by location/distance)
  useEffect(() => {
    if (!userLocation) return;
    // Log all futsals with their coordinates and distance from user
    const futsalDistances = futsals.map(f => {
      let lat = f.latitude ?? f.lat;
      let lng = f.longitude ?? f.lng;
      let extracted = false;
      if ((typeof lat !== 'number' || typeof lng !== 'number') && f.mapLink) {
        [lat, lng] = extractLatLngFromMapLink(f.mapLink);
        extracted = true;
      }
      const dist = (typeof lat === 'number' && typeof lng === 'number')
        ? haversineDistance(userLocation.lat, userLocation.lng, lat, lng)
        : null;
      return {
        name: f.name,
        lat, lng,
        dist,
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        extracted,
        mapLink: f.mapLink
      };
    });
    console.log('DEBUG: All futsals with coordinates and distance from user:', futsalDistances);
    // Only filter by distance/location, with detailed debug
    const filtered = futsals.filter((f) => {
      let lat = f.latitude ?? f.lat;
      let lng = f.longitude ?? f.lng;
      let extracted = false;
      if ((typeof lat !== 'number' || typeof lng !== 'number') && f.mapLink) {
        [lat, lng] = extractLatLngFromMapLink(f.mapLink);
        extracted = true;
      }
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        console.log(`[FILTER] Exclude '${f.name}': Invalid coordinates (lat:`, lat, ', lng:', lng, ', extracted:', extracted, ', mapLink:', f.mapLink, ')');
        return false;
      }
      const dist = haversineDistance(userLocation.lat, userLocation.lng, lat, lng);
      if (dist > filters.distance) {
        console.log(`[FILTER] Exclude '${f.name}': Distance ${dist.toFixed(2)}km > filter ${filters.distance}km`);
        return false;
      }
      console.log(`[FILTER] Include '${f.name}': Distance ${dist.toFixed(2)}km <= filter ${filters.distance}km`);
      return true;
    });
    setFilteredFutsals(filtered);
  }, [futsals, filters.distance, userLocation]);

  // Always update user marker and center on user location change
  useEffect(() => {
    if (!map || !userLocation) return;
    map.setCenter(userLocation);
    map.setZoom(14);
    if (map._userMarker) map._userMarker.setMap(null);
    map._userMarker = new window.google.maps.Marker({
      position: userLocation,
      map,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#fff',
      },
      zIndex: 9999,
    });
    if (map._userCircle) map._userCircle.setMap(null);
    map._userCircle = new window.google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: '#4285F4',
      fillOpacity: 0.15,
      map,
      center: userLocation,
      radius: filters.distance * 1000,
    });
  }, [map, userLocation, filters.distance]);

  // Helper to extract lat/lng from Google Maps link
  function extractLatLngFromMapLink(mapLink) {
    if (!mapLink) return [null, null];
    try {
      // Try to match @lat,lng in the URL
      const match = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        return [parseFloat(match[1]), parseFloat(match[2])];
      }
      // Try to match !3dLAT!4dLNG
      const match2 = mapLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (match2) {
        return [parseFloat(match2[1]), parseFloat(match2[2])];
      }
    } catch (e) {}
    return [null, null];
  }

  // Render futsal markers (with custom icon)
  useEffect(() => {
    if (!map) return;
    if (map._futsalMarkers) map._futsalMarkers.forEach((m) => m.setMap(null));
    const futsalIcon = {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10z", // Simpler pin with ball
      fillColor: "#e53935",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#fff",
      scale: 2.2,
      anchor: new window.google.maps.Point(12, 24),
    };
    map._futsalMarkers = futsals.map((futsal) => {
      let lat = futsal.latitude ?? futsal.lat;
      let lng = futsal.longitude ?? futsal.lng;
      if ((typeof lat !== 'number' || typeof lng !== 'number') && futsal.mapLink) {
        [lat, lng] = extractLatLngFromMapLink(futsal.mapLink);
      }
      if (typeof lat !== 'number' || typeof lng !== 'number') return null;
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: futsal.name,
        icon: futsalIcon,
      });
      marker.addListener('click', () => {
        setSelectedFutsal(futsal);
      });
      return marker;
    }).filter(Boolean);
  }, [map, futsals]);

  // Fetch available slots for filtered futsals and selected date
  useEffect(() => {
    async function fetchSlots() {
      const slotsByFutsal = {};
      await Promise.all(filteredFutsals.map(async (futsal) => {
        try {
          const res = await axios.get(`/api/v1/slots/${futsal._id}/slots/date?date=${selectedDate}`);
          // Use res.data.message as the slots array
          if (Array.isArray(res.data?.message)) {
            slotsByFutsal[futsal._id] = res.data.message.filter(slot => {
              // Only show slots that are available, upcoming, and within opening hours
              const timeStatus = getSlotTimeStatus(slot, selectedDate);
              const withinHours = isSlotWithinOpeningHours(slot, futsal);
              return slot.status === 'available' && timeStatus === 'upcoming' && withinHours;
            });
          } else {
            slotsByFutsal[futsal._id] = [];
          }
        } catch {
          slotsByFutsal[futsal._id] = [];
        }
      }));
      setAvailableSlots(slotsByFutsal);
    }
    if (filteredFutsals.length && selectedDate) fetchSlots();
    else setAvailableSlots({});
  }, [filteredFutsals, selectedDate]);

  // Fetch all slots for all futsals for the selected date on page load or date change
  useEffect(() => {
    async function fetchAllSlots() {
      const slotsByFutsal = {};
      await Promise.all(futsals.map(async (futsal) => {
        try {
          const res = await axios.get(`/api/v1/slots/${futsal._id}/slots/date?date=${selectedDate}`);
          if (Array.isArray(res.data?.message)) {
            slotsByFutsal[futsal._id] = res.data.message;
          } else {
            slotsByFutsal[futsal._id] = [];
          }
        } catch (err) {
          slotsByFutsal[futsal._id] = [];
        }
      }));
      setAllSlots(slotsByFutsal);
      // Console: all futsals' slots for the day (no filters)
      const allSlotsFlat = Object.entries(slotsByFutsal).map(([futsalId, slots]) => ({ futsalId, slots })).filter(f => f.slots.length > 0);
      console.log('All futsals and their slots for selected date', selectedDate, ':', allSlotsFlat);
      // Console: only futsals with available slots to join (filtered)
      const availableFutsals = allSlotsFlat.map(f => ({
        futsalId: f.futsalId,
        slots: f.slots.filter(slot => {
          const timeStatus = getSlotTimeStatus(slot, selectedDate);
          const withinHours = isSlotWithinOpeningHours(slot, futsals.find(ft => ft._id === f.futsalId));
          return slot.status === 'available' && timeStatus === 'upcoming' && withinHours;
        })
      })).filter(f => f.slots.length > 0);
      console.log('Futsals with available slots to join for selected date', selectedDate, ':', availableFutsals);
    }
    if (futsals.length && selectedDate) fetchAllSlots();
    else setAllSlots({});
  }, [futsals, selectedDate]);

  useEffect(() => {
    console.log('Filtered futsals after location filter:', filteredFutsals);
  }, [filteredFutsals]);

  useEffect(() => {
    if (showFilteredSlots) {
      const rendered = filteredFutsals.map(futsal => ({
        futsal: futsal.name,
        slots: allSlots[futsal._id] || []
      }));
      console.log('Slots rendered at end:', rendered);
    }
  }, [showFilteredSlots, filteredFutsals, allSlots]);

  const handleDistance = (e) => {
    const distance = parseInt(e.target.value, 10);
    setFilters((prev) => ({ ...prev, distance }));
  };

  const handlePrice = (e) => {
    const price = parseInt(e.target.value, 10);
    setFilters((prev) => ({ ...prev, price: [0, price] }));
  };

  const handleSlot = (e) => {
    const slot = parseInt(e.target.value, 10);
    setFilters((prev) => ({ ...prev, slot }));
  };

  // Handler for date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    toast.success(`Date changed to ${new Date(date).toLocaleDateString()}`);
  };

  // Helper to refresh all slots for all futsals
  async function refreshAllSlots() {
    const slotsByFutsal = {};
    await Promise.all(futsals.map(async (futsal) => {
      try {
        const res = await axios.get(`/api/v1/slots/${futsal._id}/slots/date?date=${selectedDate}`);
        if (Array.isArray(res.data?.message)) {
          slotsByFutsal[futsal._id] = res.data.message;
        } else {
          slotsByFutsal[futsal._id] = [];
        }
      } catch (err) {
        slotsByFutsal[futsal._id] = [];
      }
    }));
    setAllSlots(slotsByFutsal);
  }

  // Handler to join a slot (with seats/team)
  async function handleJoinSlot(futsalId, slotId, seats = 1, teamChoice = 'A') {
    setJoinSlotLoading(true);
    setJoinSlotError(null);
    try {
      const res = await axios.post(`/api/v1/slots/${futsalId}/slots/${slotId}/join`, { seats, teamChoice });
      if (res.data.success) {
        toast.success('Successfully joined the slot!');
        await refreshAllSlots();
      } else {
        setJoinSlotError(res.data.message || 'Failed to join slot');
      }
    } catch (err) {
      setJoinSlotError(err.response?.data?.message || 'Failed to join slot');
    } finally {
      setJoinSlotLoading(false);
    }
  }

  // Slot, distance, and price labels for sliders
  const slotLabels = ['1', '2', '3', '4', '5', '6', '7', '8+'];
  const distanceLabels = ['1', '2', '3', '4', '5', '6', '7', '8+'];
  const priceLabels = ['100', '150', '200', '250', '300', '350', '400+'];

  // Helper to get label for slider value
  const getSliderLabel = (labels, value, max) => {
    if (value === 1) return '100'; // Always show 100 for the first/default value
    const idx = Math.min(Math.floor(((value - 1) / (max - 1)) * (labels.length - 1)), labels.length - 1);
    return labels[idx];
  };

  // Helper to get next 7 days as array of {label, value}
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        value: d.toISOString().split('T')[0],
      });
    }
    return days;
  };

  // Helper to get distance for a futsal
  function getFutsalDistance(futsal) {
    let lat = futsal.latitude ?? futsal.lat;
    let lng = futsal.longitude ?? futsal.lng;
    if ((typeof lat !== 'number' || typeof lng !== 'number') && futsal.mapLink) {
      [lat, lng] = extractLatLngFromMapLink(futsal.mapLink);
    }
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return haversineDistance(userLocation.lat, userLocation.lng, lat, lng);
  }

  useEffect(() => {
    console.log('Current filter:', filters, 'Selected date:', selectedDate);
  }, [filters, selectedDate]);

  return (
    <div className="map-search-page">
      <FutsalNavbar />
      <div
        ref={mapRef}
        className="map-container"
        style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />
      <div className="filter-sliders">
        {/* Date Selector */}
        <div className="slider-group">
          <label style={{marginBottom: 0, fontWeight: 700, fontSize: 16}}>Select Date:</label>
          {/* Month label */}
          <div style={{fontWeight: 700, fontSize: 18, color: '#e53935', margin: '6px 0 8px 2px'}}>
            {(() => {
              const today = new Date(selectedDate);
              return today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
            })()}
          </div>
          {/* 7 day boxes */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            {getNext7Days().map(day => {
              const d = new Date(day.value);
              return (
                <button
                  key={day.value}
                  onClick={() => handleDateChange(day.value)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: 'none',
                    background: selectedDate === day.value ? '#2563eb' : '#e3eefe', // bluish theme
                    color: selectedDate === day.value ? '#fff' : '#2563eb',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: selectedDate === day.value ? '0 2px 8px #2563eb33' : 'none',
                    transition: 'background 0.18s, color 0.18s',
                    outline: selectedDate === day.value ? '2px solid #2563eb' : 'none',
                    borderBottom: selectedDate === day.value ? '3px solid #2563eb' : '2px solid #b6d0fa',
                    marginBottom: 0,
                    marginTop: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    letterSpacing: 0.5,
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        {/* Distance Slider */}
        <div className="slider-group">
          <label>Distance: <span style={{color:'#e53935'}}>{getSliderLabel(distanceLabels, filters.distance, 8)} km</span></label>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="8"
              value={filters.distance}
              onChange={handleDistance}
              className="modern-slider"
            />
            <div className="slider-labels">
              {distanceLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Slot Slider */}
        <div className="slider-group">
          <label>Slots Needed: <span style={{color:'#e53935'}}>{getSliderLabel(slotLabels, filters.slot, 8)}</span></label>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="8"
              value={filters.slot}
              onChange={handleSlot}
              className="modern-slider"
            />
            <div className="slider-labels">
              {slotLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Price Slider */}
        <div className="slider-group">
          <label>Price: <span style={{color:'#e53935'}}>Rs {getSliderLabel(priceLabels, filters.price[1], 7)}</span></label>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="7"
              value={filters.price[1]}
              onChange={handlePrice}
              className="modern-slider"
            />
            <div className="slider-labels">
              {priceLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedFutsal && (
        <div className="futsal-card-modal" onClick={() => setSelectedFutsal(null)}>
          <div className="futsal-card-modal-content" onClick={e => e.stopPropagation()}>
            <FutsalCard futsal={selectedFutsal} />
          </div>
        </div>
      )}
      {showFilteredSlots && filteredFutsals.length > 0 && (
        <div style={{position:'absolute',left:32,bottom:32,zIndex:20,maxWidth:400,width:'90vw',background:'#fff',borderRadius:16,boxShadow:'0 4px 24px rgba(0,0,0,0.10)',padding:24,overflowY:'auto',maxHeight:'60vh'}}>
          <h3 style={{marginBottom:12,fontWeight:700,fontSize:20,color:'#e53935'}}>Available Slots</h3>
          {filteredFutsals.map(futsal => (
            <div key={futsal._id} style={{marginBottom:18}}>
              <div style={{fontWeight:600,fontSize:17,marginBottom:4}}>{futsal.name}</div>
              <div style={{fontSize:14,color:'#888',marginBottom:6}}>{futsal.location}</div>
              {allSlots[futsal._id]?.length ? (
                <ul style={{margin:0,padding:0,listStyle:'none'}}>
                  {allSlots[futsal._id].map(slot => (
                    <li key={slot._id} style={{marginBottom:6,padding:'7px 12px',background:'#f5f5f5',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span>{slot.time} | Rs {slot.price} | {slot.maxPlayers} players</span>
                      <span style={{color:'#43a047',fontWeight:600}}>{slot.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{color:'#e53935',fontSize:14}}>No slots</div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Floating box for futsals in location range */}
      <div style={{
        position: 'fixed',
        left: 24,
        bottom: 24,
        zIndex: 1000,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        padding: 20,
        minWidth: 260,
        maxWidth: 350,
        maxHeight: 420,
        overflowY: 'auto',
        transition: 'box-shadow 0.2s',
        display: filteredFutsals.length > 0 ? 'block' : 'none'
      }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, color: '#1976d2', letterSpacing: 0.5 }}>Futsals Available</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredFutsals.map(futsal => {
            const distance = getFutsalDistance(futsal);
            const availableSlots = (allSlots[futsal._id] || []).filter(slot => {
              const timeStatus = getSlotTimeStatus(slot, selectedDate);
              const withinHours = isSlotWithinOpeningHours(slot, futsal);
              return slot.status === 'available' && timeStatus === 'upcoming' && withinHours;
            });
            const isExpanded = expandedFutsalIds.includes(futsal._id);
            return (
              <li key={futsal._id} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 12 }}
                  onClick={() => {
                    setExpandedFutsalIds(ids =>
                      ids.includes(futsal._id)
                        ? ids.filter(id => id !== futsal._id)
                        : [...ids, futsal._id]
                    );
                  }}
                >
                  <img
                    src={futsal.futsalPhoto || '/default-futsal.jpg'}
                    alt={futsal.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/futsal/${futsal._id}`);
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, color: '#222' }}>{futsal.name}</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{futsal.location || 'Location not specified'}</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 70 }}>
                    <div style={{ fontSize: 13, color: '#1976d2', fontWeight: 500 }}>{distance !== null ? `${distance.toFixed(2)} km` : 'N/A'}</div>
                    <div style={{ fontSize: 13, color: '#333', fontWeight: 600, marginTop: 2 }}>{availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{margin: '12px 0 0 0'}}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/futsal/${futsal._id}`);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginBottom: 8,
                        padding: '8px 0',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        letterSpacing: 0.5
                      }}
                    >
                      Open Futsal
                    </button>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: '#f8fafc', borderRadius: 8, boxShadow: '0 2px 8px #0001', border: '1px solid #e3e3e3' }}>
                      {availableSlots.length === 0 && (
                        <li style={{ padding: 12, color: '#888', textAlign: 'center' }}>No joinable slots</li>
                      )}
                      {availableSlots.map(slot => (
                        <li key={slot._id} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 16px', borderBottom: '1px solid #eee' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500 }}>{slot.time}</span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSeatModalSlot(slot);
                                setSeatModalFutsal(futsal);
                                setSeatModalOpen(true);
                              }}
                              disabled={joinSlotLoading}
                              style={{ padding: '5px 14px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                            >
                              Join
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#444', marginTop: 2 }}>
                            <span>
                              Players: {Array.isArray(slot.players) ? slot.players.length : (slot.currentPlayers || 0)} / {slot.maxPlayers}
                            </span>
                            <span style={{ color: '#1976d2', fontWeight: 500 }}>
                              Price: {slot.price ? `Rs. ${slot.price}` : 'N/A'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div style={{ margin: '32px 0' }}>
        <h2>Futsals in Location Range</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredFutsals.map(futsal => (
            <li key={futsal._id} style={{ marginBottom: 12 }}>
              <button
                style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 18, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setSelectedFutsalForSlots(futsal._id)}
              >
                {futsal.name}
              </button>
            </li>
          ))}
        </ul>
        {selectedFutsalForSlots && (
          <div style={{ marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 8, background: '#fafbfc' }}>
            <h3>Available Slots for {filteredFutsals.find(f => f._id === selectedFutsalForSlots)?.name}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {(allSlots[selectedFutsalForSlots] || [])
                .filter(slot => {
                  const timeStatus = getSlotTimeStatus(slot, selectedDate);
                  const withinHours = isSlotWithinOpeningHours(slot, filteredFutsals.find(f => f._id === selectedFutsalForSlots));
                  return slot.status === 'available' && timeStatus === 'upcoming' && withinHours;
                })
                .map(slot => (
                  <li key={slot._id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontWeight: 500 }}>{slot.time}</span>
                    <button
                      onClick={() => handleJoinSlot(selectedFutsalForSlots, slot._id)}
                      disabled={joinSlotLoading}
                      style={{ padding: '6px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Join
                    </button>
                  </li>
                ))}
            </ul>
            {joinSlotError && <div style={{ color: 'red', marginTop: 8 }}>{joinSlotError}</div>}
          </div>
        )}
      </div>
      <SeatSelectionModal
        isOpen={seatModalOpen}
        onClose={() => setSeatModalOpen(false)}
        slot={seatModalSlot}
        onConfirm={(seats, teamChoice) => {
          if (seatModalSlot && seatModalFutsal) {
            handleJoinSlot(seatModalFutsal._id, seatModalSlot._id, seats, teamChoice);
          }
        }}
      />
    </div>
  );
}
