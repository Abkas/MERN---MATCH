import React from 'react'
import styles from '../css/PProfile.module.css'
import { Link,useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'


const PProfilePage = () => {

  const { logOut, authUser, isUpdatingProfile, updateProfile } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  return (
  <div className={styles.body}>
    <header>
      <div className={styles.logo}>
        <Link to="/">
          <img
            src="/firstpage/logo.png"
            alt="match-logo"
          />
        </Link>
      </div>
      <nav>
        <ul>
          <li><Link to="/futsalhome">Home</Link></li>
          <li><Link to="bookfutsal">Book Futsal</Link></li>
          <li><Link to="/tournaments">Tournaments</Link></li>
          <li><Link to="/quickmatch">Quick Match</Link></li>
        </ul>
      </nav>
      <div className={styles.userActions}>
        <Link to="#" className={styles.notification}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </Link>
        <Link to="#" className={styles.profileIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
      </div>
    </header>

    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <ul className={styles.sidebarMenu}>
          {authUser?.role === 'player' ? (
            <>
              <li><Link to="/player-dashboard">Dashboard</Link></li>
              <li><Link to="#" className={styles.active}>Profile</Link></li>
              <li><Link to="/player-addfriend">Add Friends</Link></li>
              <li><Link to="/player-history">History</Link></li>
              <li><Link to="/player-upcomingmatches">Upcoming Matches</Link></li>
            </>
          ) : authUser?.role === 'organizer' ? (
            <>
              <li><Link to="/organizer-dashboard">Dashboard</Link></li>
              <li><Link to="#" className={styles.active}>Profile</Link></li>
              <li><Link to="/organizer-futsals">My Futsal</Link></li>
              <li><Link to="/organizer-history">History</Link></li>
              <li><Link to="/organizer-slots">Manage Slots</Link></li>
            </>
          ) : (
            <li>Unauthorized</li>
          )}
          <li>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </div>

      <main>
        <div className={styles.profileHeaderRow}>
          <h1>Profile Details</h1>
          <Link to="/update-profile">
            <button className={styles.updateAccountBtn}>
              Update Account
            </button>
          </Link>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileImage}>
            <div className={styles.circlePlaceholder}>
              <img src={authUser.avatar || '/avatar.jpg'} alt="profile" />
            </div>
          </div>

          <h2>{authUser?.username}</h2>

          <div className={styles.activeStatus}>
            <span className={styles.dot}></span>
            <span>Active since: {authUser?.createdAt}</span>
          </div>

          <div className={styles.reviewsSection}>
            <h3>Reviews</h3>
            <div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewPlayer}>Player1</span>:
                <span className={styles.reviewComment}>Lorem ipsum dolor sit amet.</span>
                <span className={styles.reviewRating}>5★</span>
              </div>
            </div>
          </div>

          <p className={styles.bio}>
            {authUser?.bio}
          </p>
        </div>

        <div className={styles.personalInfoCard}>
          <div className={styles.cardHeader}>
            <h3>Player Profile Info:</h3>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Skill Level:</div>
            <div className={styles.infoValue}>{authUser?.playerProfile?.skillLevel || "Not set"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Preferences:</div>
            <div className={styles.infoValue}>{authUser?.playerProfile?.preferences || "Not set"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Availability:</div>
            <div className={styles.infoValue}>{authUser?.playerProfile?.availability || "Not set"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Location:</div>
            <div className={styles.infoValue}>{authUser?.playerProfile?.location || "Not set"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Date of Birth:</div>
            <div className={styles.infoValue}>{authUser?.playerProfile?.dateOfBirth || "Not set"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Phone no:</div>
            <div className={styles.infoValue}>{authUser?.playerProfile?.phoneNumber || "Not set"}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Email:</div>
            <div className={styles.infoValue}>{authUser?.email}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Followed Futsals:</div>
            <div className={styles.infoValue}>
              {Array.isArray(authUser?.playerProfile?.followedFutsals) && authUser?.playerProfile?.followedFutsals.length > 0
                ? authUser?.playerProfile?.followedFutsals.join(", ")
                : "None"}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PProfilePage