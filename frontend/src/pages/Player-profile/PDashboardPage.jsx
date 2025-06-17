import React from 'react';
import styles from '../css/PDashboardPage.module.css';
import { Link,useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import FutsalNavbar from '../../components/FutsalNavbar'
import PlayerSidebar from '../../components/PlayerSidebar'

const PDashboardPage = () => {
    const { logOut,authUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }
  return (
    <div className={styles.container}>
      <FutsalNavbar />
      <PlayerSidebar />
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