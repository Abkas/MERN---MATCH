import React, { useState, useEffect } from 'react'
import styles from './css/BookFutsal.module.css'
import { Link, useNavigate } from 'react-router-dom'
import FutsalCard from '../components/FutsalCard'
import QuickJoinSection from '../components/QuickJoinSection'
import futsalService from '../services/futsalService'
import { Search, MapPin, Clock, Star, Award, Plus } from 'lucide-react'

const BookFutsal = () => {
  const navigate = useNavigate();
  const [futsals, setFutsals] = useState([]);
  const [displayedFutsals, setDisplayedFutsals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const futsalsPerPage = 3;

  useEffect(() => {
    fetchFutsals();
  }, []);

  useEffect(() => {
    // Update displayed futsals based on expanded state
    if (isExpanded) {
      setDisplayedFutsals(futsals);
    } else {
      setDisplayedFutsals(futsals.slice(0, futsalsPerPage));
    }
  }, [futsals, isExpanded]);

  const fetchFutsals = async () => {
    try {
      setLoading(true);
      const response = await futsalService.getAllFutsals();
      console.log('Fetched futsals:', response);
      
      if (response && Array.isArray(response.message)) {
        setFutsals(response.message);
      } else {
        setFutsals([]); 
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching futsals:', err);
      setError('Failed to fetch futsals. Please try again later.');
      setFutsals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchLocation.trim()) {
      fetchFutsals();
      return;
    }

    try {
      setLoading(true);
      const response = await futsalService.getFutsalsByLocation(searchLocation);
      if (response && response.data) {
        setFutsals(response.data);
        setIsExpanded(false); // Reset expanded state when searching
      } else {
        setFutsals([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error searching futsals:', err);
      setError('Failed to search futsals. Please try again later.');
      setFutsals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFutsals = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
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
              <Link to="/profile"><img src="/FUTSALHOME/profile-icon.png" alt="Profile" /></Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Find Players & Book</h1>
              <h1 className={styles.heroTitle}>Your Futsal Game!</h1>
              <p className={styles.subtitle}>Join an existing match or create your own—easy & hassle-free</p>
              
              <div className={styles.searchBarWrapper}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <div className={styles.searchInput}>
                    <MapPin className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search by location..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.searchButton}>
                    <Search className={styles.searchIcon} />
                    Search
                  </button>
                </form>
              </div>
              
              <div className={styles.actionButtons}>
                <button className={styles.btnFindTournament}>Find a Tournament</button>
                <button className={styles.btnHostTournament}>Host a Tournament</button>
              </div>
            </div>
          </section>

          <section className={styles.futsalNearYou}>
            <div className={styles.container}>
              <h2 className={styles.sectionTitle}># Futsal Near You</h2>
              
              {loading ? (
                <div className={styles.loading}>Loading futsals...</div>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : futsals.length === 0 ? (
                <div className={styles.noFutsals}>No futsals found</div>
              ) : (
                <>
                  <div className={styles.futsalGrid}>
                    {displayedFutsals.map((futsal) => (
                      <FutsalCard 
                        key={futsal._id} 
                        futsal={futsal}
                      />
                    ))}
                  </div>
                  
                  {futsals.length > futsalsPerPage && (
                    <div className={styles.seeMore}>
                      <button 
                        className={styles.btnSeeMore}
                        onClick={handleToggleFutsals}
                      >
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className={styles.quickJoin}>
            <div className={styles.container}>
              <h2 className={styles.sectionTitle}># Quick Join Available Slots</h2>
              
              {loading ? (
                <div className={styles.loading}>Loading futsals...</div>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : futsals.length === 0 ? (
                <div className={styles.noFutsals}>No futsals found</div>
              ) : (
                <div className={styles.venueList}>
                  {futsals.map((futsal) => (
                    <QuickJoinSection 
                      key={futsal._id} 
                      futsal={futsal}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={styles.offers}>
            <div className={styles.container}>
              <h2 className={styles.sectionTitle}># Offers Going On</h2>
              
              <div className={styles.futsalCards}>
                <div className={styles.futsalCard}>
                  <div className={styles.cardImage}>
                    <img src="4th.png" alt="Dhankag Futsal"/>
                    <div className={styles.offerBadge}>
                      <i className="fas fa-percentage"></i> 20% off
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3>Dhankag Futsal</h3>
                      <div className={styles.rating}>
                        <i className="fas fa-star"></i>
                        <span>4.5/5</span>
                      </div>
                    </div>
                    <div className={styles.tags}>
                      <span className={styles.tag}>7v7</span>
                      <span className={styles.tag}>700+ Matches</span>
                      <span className={styles.tag}>Verified</span>
                    </div>
                    <div className={styles.location}>
                      <i className="fas fa-map-marker-alt"></i>
                      <span>Kathmandu, Naxal</span>
                    </div>
                    <div className={styles.time}>
                      <i className="far fa-clock"></i>
                      <span>6:00 to 10:00 (Mon-Fri)</span>
                    </div>
                    <div className={styles.price}>
                      <i className="fas fa-users"></i>
                      <span>NPR 2000 (Per court)</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button className={styles.btnBook}>Book Now (4 slots available)</button>
                      <button className={styles.btnQuickJoin}>Quick Join</button>
                    </div>
                  </div>
                </div>
                
                <div className={styles.futsalCard}>
                  <div className={styles.cardImage}>
                    <img src="5th.png" alt="XYZ Futsal"/>
                    <div className={styles.bonusBadge}>Bonus Season</div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3>XYZ Futsal</h3>
                      <div className={styles.rating}>
                        <i className="fas fa-star"></i>
                        <span>4.5/5</span>
                      </div>
                    </div>
                    <div className={styles.tags}>
                      <span className={styles.tag}>7v7</span>
                      <span className={styles.tag}>Free First Game</span>
                      <span className={styles.tag}>Verified</span>
                    </div>
                    <div className={styles.location}>
                      <i className="fas fa-map-marker-alt"></i>
                      <span>Kathmandu, New Baneshwor</span>
                    </div>
                    <div className={styles.time}>
                      <i className="far fa-clock"></i>
                      <span>6:00 to 10:00 (Mon-Fri)</span>
                    </div>
                    <div className={styles.price}>
                      <i className="fas fa-users"></i>
                      <span>NPR 2000 (Per person)</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button className={styles.btnBook}>Book Now (10 slots available)</button>
                      <button className={styles.btnQuickJoin}>Quick Join</button>
                    </div>
                  </div>
                </div>
                
                <div className={styles.futsalCard}>
                  <div className={styles.cardImage}>
                    <img src="6th.png" alt="First Koteswar"/>
                    <div className={styles.offerBadge}>2 on one Free</div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3>First Koteswar</h3>
                      <div className={styles.rating}>
                        <i className="fas fa-star"></i>
                        <span>4.5/5</span>
                      </div>
                    </div>
                    <div className={styles.tags}>
                      <span className={styles.tag}>7v7</span>
                      <span className={styles.tag}>700+ Matches</span>
                      <span className={styles.tag}>Verified</span>
                    </div>
                    <div className={styles.location}>
                      <i className="fas fa-map-marker-alt"></i>
                      <span>Kathmandu, Koteswar</span>
                    </div>
                    <div className={styles.time}>
                      <i className="far fa-clock"></i>
                      <span>6:00 to 10:00 (Mon-Fri)</span>
                    </div>
                    <div className={styles.price}>
                      <i className="fas fa-users"></i>
                      <span>NPR 3000 (Per court)</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button className={styles.btnBook}>Book Now (2 slots available)</button>
                      <button className={styles.btnQuickJoin}>Quick Join</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.seeMore}>
                <button className={styles.btnSeeMore}>See More</button>
              </div>
            </div>
          </section>

          <section className={styles.howToJoinSection}>
            <div className={styles.container}>
              <h2 className={styles.sectionTitle}># How to Join</h2>
              <div className={styles.howToJoinContent}>
                <div className={styles.joinStep}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h3>Select Your Time</h3>
                    <p>Choose your preferred date and time slot from available options</p>
                  </div>
                </div>
                <div className={styles.joinStep}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h3>Book Your Seats</h3>
                    <p>Select the number of seats you want to book for the game</p>
                  </div>
                </div>
                <div className={styles.joinStep}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h3>Complete Payment</h3>
                    <p>Make the payment securely and get ready to play!</p>
                  </div>
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
      </div>
    </div>
  )
}

export default BookFutsal