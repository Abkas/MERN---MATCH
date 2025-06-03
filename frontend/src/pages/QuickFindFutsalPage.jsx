import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './css/QuickFind.module.css'
import FutsalCard from '../components/FutsalCard'
import futsalService from '../services/futsalService'
import QuickJoinSection from '../components/QuickJoinSection'

const QuickFindFutsalPage = () => {
  // State for filter values
  const [distance, setDistance] = useState(25);
  const [price, setPrice] = useState(50);
  const [seats, setSeats] = useState(40);

  // Futsal data state
  const [futsals, setFutsals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Helper for label values
  const distanceLabels = ['1km', '3km', '5km', '10+km'];
  const priceLabels = ['Rs100', 'Rs150', 'Rs200', 'Rs250+'];
  const seatsLabels = ['2', '4', '6', '8'];

  // Get current label for each filter
  const getCurrentLabel = (labels, value) => {
    const idx = Math.round((value / 100) * (labels.length - 1));
    return labels[idx];
  };

  useEffect(() => {
    fetchFutsals();
  }, []);

  const fetchFutsals = async () => {
    try {
      setLoading(true);
      const response = await futsalService.getAllFutsals();
      if (response && Array.isArray(response.message)) {
        setFutsals(response.message);
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

  return (
    <div className={styles.body}>
        <nav>
          <div className={styles.logo}>
            <Link to="/">
              <img src="/firstpage/logo.png" alt="match-logo" />
            </Link>
          </div>
          <ul className={styles.navLinks}>
            <li><Link to="/futsalhome" >Home</Link></li>
            <li><Link to="/bookfutsal">Book Futsal</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/quickmatch" className={styles.active}>Quick Match</Link></li>
          </ul>
          <div className={styles.navIcons}>
            <div className={styles.notification}>
              <img src="/FUTSALHOME/notification-icon.png" alt="Notifications" />
            </div>
            <div className={styles.profile}>
              <Link to="/profile"><img src="/FUTSALHOME/profile-icon.png" alt="Profile" /></Link>
            </div>
          </div>
        </nav>

      <main>
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
              <div className={styles.filterGroup}>
                <label>Distance: <span className={styles.filterValue}>{getCurrentLabel(distanceLabels, distance)}</span></label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: `${distance}%` }}></div>
                    <input type="range" min="0" max="100" value={distance} onChange={e => setDistance(Number(e.target.value))} className={styles.slider} />
                  </div>
                  <div className={styles.sliderLabels}>
                    {distanceLabels.map(label => <span key={label}>{label}</span>)}
                  </div>
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label>Price: <span className={styles.filterValue}>{getCurrentLabel(priceLabels, price)}</span></label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: `${price}%` }}></div>
                    <input type="range" min="0" max="100" value={price} onChange={e => setPrice(Number(e.target.value))} className={styles.slider} />
                  </div>
                  <div className={styles.sliderLabels}>
                    {priceLabels.map(label => <span key={label}>{label}</span>)}
                  </div>
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label>Seats Needed: <span className={styles.filterValue}>{getCurrentLabel(seatsLabels, seats)}</span></label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: `${seats}%` }}></div>
                    <input type="range" min="0" max="100" value={seats} onChange={e => setSeats(Number(e.target.value))} className={styles.slider} />
                  </div>
                  <div className={styles.sliderLabels}>
                    {seatsLabels.map(label => <span key={label}>{label}</span>)}
                  </div>
                </div>
              </div>
            </div>
            <button className={styles.findNowBtn}>Find Now</button>
          </div>
        </section>

        <section className={styles.availableFutsal}>
          <h2>Available Futsal</h2>
          <div className={styles.filterOptions} style={{ marginBottom: '16px' }}>
            <div className={styles.filterDropdown}>
              <button className={styles.dropdownBtn}>Date & Time</button>
            </div>
            <div className={styles.filterDropdown}>
              <button className={styles.dropdownBtn}>Entry Fee</button>
            </div>
            <div className={styles.filterDropdown}>
              <button className={styles.dropdownBtn}>Location</button>
            </div>
            <div className={styles.filterDropdown}>
              <button className={styles.dropdownBtn}>Players Needed</button>
            </div>
          </div>
          {/* Render the QuickJoinSection for each futsal, just like BookFutsal */}
          <div className={styles.venueList}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading futsals...</div>
            ) : error ? (
              <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>{error}</div>
            ) : futsals.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>No futsals found</div>
            ) : (
              futsals.map(futsal => (
                <QuickJoinSection key={futsal._id} futsal={futsal} />
              ))
            )}
          </div>
        </section>

        <section className={styles.registerMatch + ' ' + styles.disabledSection}>
          <h2 style={{ color: '#aaa' }}>Register for a Match <span className={styles.comingSoonBadge}>Coming Soon</span></h2>
          <div className={styles.registerForm} style={{ opacity: 0.5, pointerEvents: 'none' }}>
            <div className={styles.formGroup}>
              <label>Suitable Futsal's:</label>
              <div className={styles.selectedVenues}>
                <div className={styles.venueChip}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Golden Futsal, Lalitpur
                </div>
                <div className={styles.venueChip}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Golden Futsal, Lalitpur
                </div>
                <div className={styles.venueChip}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Golden Futsal, Lalitpur
                </div>
                <button className={styles.addVenueBtn}>Add Futsal's</button>
                <button className={styles.editBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Available Date:</label>
              <div className={styles.selectedDates}>
                <div className={styles.dateChip}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  25th April, 12:00 - 13:00
                </div>
                <div className={styles.dateChip}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  25th April, 14:00 - 15:00
                </div>
                <button className={styles.addDateBtn}>Add Available Time:</button>
                <button className={styles.editBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <button className={styles.registerBtn}>Register</button>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link to="#">About</Link>
          <Link to="#">Contact Us</Link>
          <Link to="#">Pricing</Link>
          <Link to="#">FAQs</Link>
          <Link to="#">Team</Link>
        </div>
        <div className={styles.footerSocial}>
          <Link to="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </Link>
          <Link to="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </Link>
          <Link to="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default QuickFindFutsalPage
