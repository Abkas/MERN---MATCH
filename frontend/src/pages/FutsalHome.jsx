import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './css/FutsalHome.module.css'
import { useAuthStore } from '../store/useAuthStore'

const FutsalHome = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  // Handler for profile icon click
  const handleProfileClick = (e) => {
    e.preventDefault();
    if (!authUser) {
      navigate('/login');
    } else if (authUser.role === 'organizer') {
      navigate('/organizer-profile');
    } else {
      navigate('/player-profile');
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <nav>
          <div className={styles.logo}>
            <Link to="/">
              <img src="/firstpage/logo.png" alt="match-logo" />
            </Link>
          </div>
          <ul className={styles.navLinks}>
            <li><Link to="/futsalhome" className={styles.active}>Home</Link></li>
            <li><Link to="/bookfutsal">Book Futsal</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/quickmatch">Quick Match</Link></li>
          </ul>
          <div className={styles.navIcons}>
            <div className={styles.notification}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div className={styles.profile}>
              <Link to="/profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            <div className={styles.futsalText}>
              <span>F</span>
              <span>U</span>
              <span>T</span>
              <span>S</span>
              <span>A</span>
              <span>L</span>
            </div>
            <div className={styles.playersIllustration}>
              <img src="/FUTSALHOME/Screenshot 2025-05-15 231721.png" alt="Futsal Players" />
            </div>
            <div className={styles.taisaLogo}>7AISA</div>
          </div>
          <div className={styles.blueCurve}></div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.quickStartButton}>
            <Link to ='/quickmatch'>
            <button>
              Quick Start
              <img src="/FUTSALHOME/soccer-ball-icon.png" alt="Soccer Ball" />
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FutsalHome