import React from 'react'
import { Link } from 'react-router-dom'
import styles from './css/QuickFind.module.css'

const QuickFindFutsalPage = () => {
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
          <div className={styles.searchBar}>
            <div className={styles.searchInput}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" placeholder="Search Futsal" />
            </div>
            <button className={styles.searchBtn}>Search</button>
          </div>

          <div className={styles.filters}>
            <h2>Quick Filters</h2>
            <div className={styles.filterSliders}>
              <div className={styles.filterGroup}>
                <label>Distance:</label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: '25%' }}></div>
                    <input type="range" min="0" max="100" defaultValue="25" className={styles.slider} />
                  </div>
                  <div className={styles.sliderLabels}>
                    <span>1km</span>
                    <span>3km</span>
                    <span>5km</span>
                    <span>10+km</span>
                  </div>
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label>Price:</label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: '50%' }}></div>
                    <input type="range" min="0" max="100" defaultValue="50" className={styles.slider} />
                  </div>
                  <div className={styles.sliderLabels}>
                    <span>Rs100</span>
                    <span>Rs150</span>
                    <span>Rs200</span>
                    <span>Rs250+</span>
                  </div>
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label>Seats Needed:</label>
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: '40%' }}></div>
                    <input type="range" min="0" max="100" defaultValue="40" className={styles.slider} />
                  </div>
                  <div className={styles.sliderLabels}>
                    <span>2</span>
                    <span>4</span>
                    <span>6</span>
                    <span>8</span>
                  </div>
                </div>
              </div>
            </div>
            <button className={styles.findNowBtn}>Find Now</button>
          </div>
        </section>

        <section className={styles.availableFutsal}>
          <h2>Available Futsal</h2>
          <div className={styles.filterOptions}>
            <div className={styles.filterDropdown}>
              <button className={styles.dropdownBtn}>
                Date & Time
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div className={styles.filterDropdown}>
              <button className={styles.dropdownBtn}>
                Entry Fee
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div className={`${styles.filterDropdown} ${styles.active}`}>
              <button className={styles.dropdownBtn}>
                Location
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div className={`${styles.filterDropdown} ${styles.active}`}>
              <button className={styles.dropdownBtn}>
                Players Needed
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <div className={styles.futsalVenue}>
            <div className={styles.venueHeader}>
              <button className={styles.venueName}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Dhanakw Futsal , Chabill
              </button>
              <div className={styles.venueInfo}>
                <span className={styles.gamesPending}>3 Games Pending</span>
                <span className={styles.priceInfo}>Nrs: 300 (Per Person)</span>
                <span className={styles.nextGame}>Next Game: 30 Mins</span>
              </div>
            </div>
            <div className={styles.dateNavigation}>
              <button className={styles.prevDate}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <span>Date: 27th March</span>
              <button className={styles.nextDate}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
            <div className={styles.timeSlots}>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Players</th>
                    <th>Price(Per person)</th>
                    <th>Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>12:00 - 13:00</td>
                    <td className={styles.playersCircles}>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={styles.playerCircle}></span>
                      <span className={styles.playerCircle}></span>
                    </td>
                    <td className={styles.price}>Rs 200</td>
                    <td className={styles.team}>
                      <button className={styles.joinNowBtn}>Join Now</button>
                      <div className={styles.teamInfo}>
                        <span className={styles.teamCaptain}>S</span>
                        <span className={styles.teamName}>Smith Ray</span>
                        <span className={styles.teamMembers}>+5 others</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>13:00 - 14:00</td>
                    <td className={styles.playersCircles}>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={styles.playerCircle}></span>
                    </td>
                    <td className={styles.price}>Rs 150</td>
                    <td className={styles.team}>
                      <button className={styles.joinNowBtn}>Join Now</button>
                      <div className={styles.teamInfo}>
                        <span className={`${styles.teamCaptain} ${styles.pink}`}>H</span>
                        <span className={styles.teamName}>Hade Ray</span>
                        <span className={styles.teamMembers}>+6 others</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>15:00 - 16:00</td>
                    <td className={styles.playersCircles}>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={styles.playerCircle}></span>
                      <span className={styles.playerCircle}></span>
                      <span className={styles.playerCircle}></span>
                      <span className={styles.playerCircle}></span>
                      <span className={styles.playerCircle}></span>
                      <span className={styles.playerCircle}></span>
                    </td>
                    <td className={styles.price}>Rs 200</td>
                    <td className={styles.team}>
                      <button className={styles.joinNowBtn}>Join Now</button>
                      <div className={styles.teamInfo}>
                        <span className={`${styles.teamCaptain} ${styles.blue}`}>A</span>
                        <span className={styles.teamName}>Hade Ray</span>
                        <span className={styles.teamMembers}>+1 others</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td className={styles.playersCircles}>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={`${styles.playerCircle} ${styles.filled}`}></span>
                      <span className={styles.playerCircle}></span>
                      <span className={styles.playerCircle}></span>
                      <span className={styles.playerCircle}></span>
                    </td>
                    <td className={styles.price}>Rs 200</td>
                    <td className={styles.team}>
                      <button className={styles.joinNowBtn}>Join Now</button>
                      <div className={styles.teamInfo}>
                        <span className={`${styles.teamCaptain} ${styles.pink}`}>B</span>
                        <span className={styles.teamName}>Hade Ray</span>
                        <span className={styles.teamMembers}>+4 others</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.futsalVenueList}>
            <div className={styles.venueItem}>
              <button className={styles.venueName}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                SamaKhosi Futsal, Nagarkot
              </button>
              <div className={styles.venueInfo}>
                <span className={styles.gamesPending}>5 Games Pending</span>
                <span className={styles.priceInfo}>Nrs: 300 (Per Person)</span>
                <span className={styles.nextGame}>Next Game: 10 Min</span>
              </div>
            </div>
            <div className={styles.venueItem}>
              <button className={styles.venueName}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Harei Futsal, Thimi
              </button>
              <div className={styles.venueInfo}>
                <span className={styles.gamesPending}>5 Games Pending</span>
                <span className={styles.priceInfo}>Nrs: 300 (Per Person)</span>
                <span className={styles.nextGame}>Next Game: 1 Hr</span>
              </div>
            </div>
            <div className={styles.venueItem}>
              <button className={styles.venueName}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Golden Futsal, Lalitpur
              </button>
              <div className={styles.venueInfo}>
                <span className={styles.gamesPending}>5 Games Pending</span>
                <span className={styles.priceInfo}>Nrs: 300 (Per Person)</span>
                <span className={styles.nextGame}>Next Game:2 Hr</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.registerMatch}>
          <h2>Register for a Match</h2>
          <div className={styles.registerForm}>
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
