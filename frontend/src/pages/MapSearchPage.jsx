import React, { useEffect, useRef, useState } from 'react';
import FutsalNavbar from '../components/FutsalNavbar';
import futsalService from '../services/futsalService';
import FutsalCard from '../components/FutsalCard';
import styles from '../pages/css/QuickFind.module.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
  price: [100, 1000], // min price 100
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
      if ((typeof lat !== 'number' || typeof lng !== 'number') && f.mapLink) {
        [lat, lng] = extractLatLngFromMapLink(f.mapLink);
      }
      const dist = (typeof lat === 'number' && typeof lng === 'number')
        ? haversineDistance(userLocation.lat, userLocation.lng, lat, lng)
        : null;
      return {
        name: f.name,
        lat, lng,
        dist,
        userLat: userLocation.lat,
        userLng: userLocation.lng
      };
    });
    console.log('Futsals with coordinates and distance from user:', futsalDistances);
    // Only filter by distance/location
    const filtered = futsals.filter((f) => {
      const lat = f.latitude ?? f.lat;
      const lng = f.longitude ?? f.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return false;
      const dist = haversineDistance(userLocation.lat, userLocation.lng, lat, lng);
      return dist <= filters.distance;
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
            slotsByFutsal[futsal._id] = res.data.message.filter(slot => slot.status === 'available');
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
      // Add a console at the end to show all slots of that day
      const allSlotsFlat = Object.values(slotsByFutsal).flat();
      console.log('All slots for selected date', selectedDate, ':', allSlotsFlat);
      // Filter and console only available slots for the selected date
      const availableSlots = allSlotsFlat.filter(slot => slot.status === 'available');
      console.log('Available slots for selected date', selectedDate, ':', availableSlots);
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

  // Slot, distance, and price labels for sliders
  const slotLabels = ['1', '2', '3', '4', '5', '6', '7', '8+'];
  const distanceLabels = ['1', '2', '3', '4', '5', '6', '7', '8+'];
  const priceLabels = ['100', '150', '200', '250', '300', '350', '400+'];

  // Helper to get label for slider value
  const getSliderLabel = (labels, value, max) => {
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

  // Handler for Find Game button
  const handleFindGame = () => {
    setShowFilteredSlots(true);
    // On click, filter slots for futsals in filteredFutsals for the selected date
    // (already handled by useEffect for availableSlots)
  };

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
                    background: selectedDate === day.value ? '#e53935' : '#f2f2f2',
                    color: selectedDate === day.value ? '#fff' : '#333',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: selectedDate === day.value ? '0 2px 8px rgba(229,57,53,0.12)' : 'none',
                    transition: 'background 0.18s, color 0.18s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
        <button
          style={{marginTop:18, background:'#e53935', color:'#fff', border:'none', borderRadius:8, padding:'10px 0', fontWeight:700, fontSize:17, cursor:'pointer', boxShadow:'0 2px 8px rgba(229,57,53,0.12)'}}
          onClick={handleFindGame}
        >
          Find Game
        </button>
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
    </div>
  );
}
