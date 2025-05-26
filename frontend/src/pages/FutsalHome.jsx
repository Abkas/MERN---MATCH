import React from 'react'
import { Link } from 'react-router-dom'
import styles from './css/FutsalHome.module.css'

const FutsalHome = () => {
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
              <img src="/FUTSALHOME/notification-icon.png" alt="Notifications" />
            </div>
            <div className={styles.profile}>
              <Link to="/profile"><img src="/FUTSALHOME/profile-icon.png" alt="Profile" /></Link>
            </div>
          </div>
        </nav>

        {/* Social Media Sidebar */}
        <div className={styles.socialSidebar}>
          <a href="#" className={`${styles.socialIcon} ${styles.linkedin}`}>
            <img src="/FUTSALHOME/linkedin-icon.png" alt="LinkedIn" />
          </a>
          <a href="#" className={`${styles.socialIcon} ${styles.tiktok}`}>
            <img src="/FUTSALHOME/tiktok-icon.png" alt="TikTok" />
          </a>
          <a href="#" className={`${styles.socialIcon} ${styles.instagram}`}>
            <img src="/FUTSALHOME/instagram-icon.png" alt="Instagram" />
          </a>
          <a href="#" className={`${styles.socialIcon} ${styles.facebook}`}>
            <img src="/FUTSALHOME/facebook-icon.png" alt="Facebook" />
          </a>
        </div>

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