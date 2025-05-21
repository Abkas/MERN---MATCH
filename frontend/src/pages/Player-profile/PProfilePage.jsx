import React, { useEffect } from 'react'
import styles from '../css/PProfile.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { axiosInstance } from '../../lib/axios'

const PProfilePage = () => {
  const { logOut, authUser, isUpdatingProfile, updatePlayerProfile } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  // Function to fetch updated user data
  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/users/current-user')
      if (response.data.success && response.data.data) {
        const userData = response.data.data
        updatePlayerProfile(userData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      if (error.response?.status === 401) {
        navigate('/login')
      }
    }
  }

  // Fetch user data when component mounts
  useEffect(() => {
    if (!authUser?._id) {
      fetchUserData()
    }
  }, [authUser?._id])

  return (
    <div className={styles.body}>
      <header>
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
                <img src={authUser?.avatar || '/avatar.jpg'} alt="profile" />
              </div>
            </div>

            <h2>{authUser?.username}</h2>

            <div className={styles.activeStatus}>
              <span className={styles.dot}></span>
              <span>Active since: {new Date(authUser?.createdAt).toLocaleDateString()}</span>
            </div>

            <div className={styles.reviewsSection}>
              <h3>Reviews</h3>
              <div>
                {authUser?.playerProfile?.reviews?.length > 0 ? (
                  authUser.playerProfile.reviews.map((review, index) => (
                    <div key={index} className={styles.reviewItem}>
                      <span className={styles.reviewPlayer}>{review.playerName}</span>:
                      <span className={styles.reviewComment}>{review.comment}</span>
                      <span className={styles.reviewRating}>{review.rating}★</span>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet</p>
                )}
              </div>
            </div>

            <p className={styles.bio}>
              {authUser?.playerProfile?.bio || "No bio available"}
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
              <div className={styles.infoValue}>
                {Array.isArray(authUser?.playerProfile?.preferences) 
                  ? authUser.playerProfile.preferences.join(", ") 
                  : authUser?.playerProfile?.preferences || "Not set"}
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Availability:</div>
              <div className={styles.infoValue}>
                {Array.isArray(authUser?.playerProfile?.availability)
                  ? authUser.playerProfile.availability.join(", ")
                  : authUser?.playerProfile?.availability || "Not set"}
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Location:</div>
              <div className={styles.infoValue}>{authUser?.playerProfile?.location || "Not set"}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Date of Birth:</div>
              <div className={styles.infoValue}>
                {authUser?.playerProfile?.dateOfBirth 
                  ? new Date(authUser.playerProfile.dateOfBirth).toLocaleDateString() 
                  : "Not set"}
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Phone no:</div>
              <div className={styles.infoValue}>{authUser?.phoneNumber || "Not set"}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Email:</div>
              <div className={styles.infoValue}>{authUser?.email}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Followed Futsals:</div>
              <div className={styles.infoValue}>
                {Array.isArray(authUser?.playerProfile?.followedFutsals) && authUser?.playerProfile?.followedFutsals.length > 0
                  ? authUser.playerProfile.followedFutsals.join(", ")
                  : "None"}
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Match History:</div>
              <div className={styles.infoValue}>
                {Array.isArray(authUser?.playerProfile?.matchHistory) && authUser?.playerProfile?.matchHistory.length > 0
                  ? `${authUser.playerProfile.matchHistory.length} matches played`
                  : "No matches played yet"}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PProfilePage