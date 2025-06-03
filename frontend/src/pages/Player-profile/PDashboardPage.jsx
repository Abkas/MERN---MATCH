import React from 'react';
import styles from '../css/PDashboardPage.module.css';
import { Link,useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

const PDashboardPage = () => {
    const { logOut,authUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/firstpage/logo.png" alt="match-logo" />
          </Link>
        </div>
        <nav>
          <ul>
            <li><Link to="/futsalhome">Home</Link></li>
            <li><Link to="/bookfutsal">Book Futsal</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/quickmatch">Quick Match</Link></li>
          </ul>
        </nav>
        <div className={styles.userActions}>
          <Link to="#" className={styles.notification}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </Link>
          <Link to="/profile" className={styles.profileIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
      </header>
      <aside className={styles.sidebar}>
        <ul className={styles.sidebarMenu}>
          <li className={styles.active}><Link to="/player-dashboard">Dashboard</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/player-addfriend">Add Friends</Link></li>
          <li><Link to="/player-history">History</Link></li>
          <li><Link to="/player-upcomingmatches">Upcoming Matches</Link></li>
          <li>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </aside>
      <main className={styles.content}>
        <h1 className={styles.greeting}>Hello ,{authUser.username}</h1>
        <div className={styles.profileCard}>
          <div className={styles.profileImage}>
            <img src={authUser.avatar || '/avatar.jpg'} alt="Rajesh Hamal" />
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{authUser.fullName || "Not set"}</h2>
            <p className={styles.profileBio}>
              {authUser.playerProfile.bio || "Passionate about sports and always ready for a match. Looking to connect with players nearby and enjoy great games together!" }
            </p>
            <div className={styles.profileTags}>
              <span className={styles.tag}>FUTSAL LOVER</span>
              <span className={styles.tag}>CASUAL</span>
              <span className={styles.tag}>FRIENDLY</span>
            </div>
          </div>
        </div>
        <div className={styles.grayUnavailableSection}>
          <div className={styles.statsCard}>
            <div className={styles.statItem}>
              <h3>Matches Played</h3>
              <p>24</p>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <h3>Friends</h3>
              <p>200</p>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <h3>Player Rating</h3>
              <p>8/10</p>
            </div>
          </div>
          <div className={styles.badgesSection}>
            <h2>Badges earned:</h2>
            <div className={styles.badgesContainer}>
              <div className={`${styles.badge} ${styles.blackBadge}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className={`${styles.badge} ${styles.redBadge}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className={`${styles.badge} ${styles.outlineBadge}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className={`${styles.badge} ${styles.outlineBadge}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className={`${styles.badge} ${styles.blueBadge}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <button className={styles.showMoreBtn}>Show more</button>
            </div>
          </div>
          <div className={styles.recentMatches}>
            <h2>Recent Matches:</h2>
            <div className={styles.tableContainer}>
              <table className={styles.matchesTable}>
                <thead>
                  <tr>
                    <th>Date:</th>
                    <th>Time:</th>
                    <th>Place:</th>
                    <th>Futsal:</th>
                    <th>Paid:</th>
                    <th>Review:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>25th April,2025</td>
                    <td>12:00-01:00</td>
                    <td>Kathmandu, Nepal</td>
                    <td>Kathmandu Futsal Co</td>
                    <td>Rs 200</td>
                    <td>8.5/10</td>
                  </tr>
                  <tr>
                    <td>25th April,2025</td>
                    <td>12:00-01:00</td>
                    <td>Kathmandu, Nepal</td>
                    <td>Kathmandu Futsal Co</td>
                    <td>Rs 200</td>
                    <td>8.5/10</td>
                  </tr>
                  <tr>
                    <td>25th April,2025</td>
                    <td>12:00-01:00</td>
                    <td>Kathmandu, Nepal</td>
                    <td>Kathmandu Futsal Co</td>
                    <td>Rs 200</td>
                    <td>Not Rated</td>
                  </tr>
                  <tr>
                    <td>25th April,2025</td>
                    <td>12:00-01:00</td>
                    <td>Kathmandu, Nepal</td>
                    <td>Kathmandu Futsal Co</td>
                    <td>Rs 200</td>
                    <td>Not Rated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PDashboardPage;