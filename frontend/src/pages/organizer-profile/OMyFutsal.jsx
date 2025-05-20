"use client"
import styles from "../css/OMyFutsal.module.css"
import { Link, useNavigate } from "react-router-dom"
import { MapPin, Clock, Edit, CheckCircle, Phone, UserPlus, MessageSquare } from "lucide-react"
import { useAuthStore } from "../../store/useAuthStore"
import { create } from "zustand"
import { useEffect, useState } from "react"
import axios from "axios"

const OMyFutsal = () => {
  const { logOut, fetchFutsals } = useAuthStore()
  const navigate = useNavigate()
  const [futsals, setFutsals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getFutsals = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchFutsals()
        console.log("Fetched Futsals:", res)
        // Defensive: ensure futsals is always an array
        let futsalArr = res?.message
        if (!Array.isArray(futsalArr)) {
          futsalArr = []
        }
        setFutsals(futsalArr)
        console.log(futsals)
      } catch (err) {
        setError("Failed to fetch futsal data")
      } finally {
        setLoading(false)
      }
    }
    getFutsals()
  }, [])

  const handleLogout = () => {
    logOut()
    navigate("/login")
  }

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
            <li>
              <Link to="/futsalhome">Home</Link>
            </li>
            <li>
              <Link to="bookfutsal">Book Futsal</Link>
            </li>
            <li>
              <Link to="/tournaments">Tournaments</Link>
            </li>
            <li>
              <Link to="/quickmatch">Quick Match</Link>
            </li>
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
            <li>
              <Link to="/organizer-dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/player-profile">Profile</Link>
            </li>
            <li>
              <Link to="/organizer-futsals" className={styles.active}>
                My Futsal
              </Link>
            </li>
            <li>
              <Link to="/organizer-history">History</Link>
            </li>
            <li>
              <Link to="/organizer-slots">Manage Slots</Link>
            </li>
            <li>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </aside>
        <main>
          <div className={styles.mainHeader}>
            <h1>My Futsal</h1>
            <button className={styles.updateProfileBtn}>
              <Edit size={16} /> Update Futsal
            </button>
          </div>
          {loading ? (
            <div className={styles.loading}>Loading futsal data...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : futsals.length === 0 ? (
            <div className={styles.empty}><h3>No futsal found for your organizer profile.</h3></div>
          ) : (
            futsals.map((futsal) => (

              <div className={styles.futsalProfile} key={futsal._id}>
                <div className={styles.bannerImage}>
                  <img src="" alt="Futsal Court" />
                </div>
                <div className={styles.futsalInfo}>
                  <h1 className={styles.futsalName}>
                    {futsal.name} <CheckCircle className={styles.verifiedBadge} size={20} />
                  </h1>

                  <div className={styles.futsalMeta}>
                    <div className={styles.location}>
                      <MapPin size={16} />
                      <span>{futsal.location}</span>
                    </div>
                    <div className={styles.hours}>
                      <Clock size={16} />
                      <span>{futsal.openingHours || "N/A"}</span>
                    </div>
                  </div>
                  <div className={styles.futsalStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{futsal.gamesOrganized || 0}+</span>
                      <span className={styles.statLabel}>Matches</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{futsal.tournamentsOrganized || 0}+</span>
                      <span className={styles.statLabel}>Tournaments</span>
                    </div>
                  </div>
                  <div className={styles.joinButton}>
                    <button>
                      <span>Join / Register Futsal</span>
                    </button>
                  </div>
                </div>
                <div className={styles.futsalContent}>
                  <div className={styles.aboutSection}>
                    <h2>About Us:</h2>
                    <p>{futsal.description || "No description provided."}</p>
                  </div>
                  <div className={styles.facilitiesSection}>
                    <ul className={styles.facilitiesList}>
                      {(futsal.plusPoints && futsal.plusPoints.length > 0 ? futsal.plusPoints : [
                        "Refund Policy: Full refund if game is canceled or not full",
                        "Premium Turf Quality",
                        "Changing Rooms & Showers",
                        "Online Payment Accepted",
                        "Tournament Hosting"
                      ]).map((facility, idx) => (
                        <li key={idx}>
                          <CheckCircle size={16} className={styles.checkIcon} />
                          <span>{facility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.ownerSection}>
                    <h2>Meet the Owner:</h2>
                    <div className={styles.ownerProfile}>
                      <div className={styles.ownerImage}>
                        <img src="/futsalownerpag/futsal-owner.png" alt="Futsal Owner" />
                      </div>
                      <div className={styles.ownerInfo}>
                        <h3>{futsal.ownerName || "Owner"}</h3>
                        <p>{futsal.ownerDescription || "No owner description provided."}</p>
                        <div className={styles.ownerContact}>
                          <div className={styles.phoneNumber}>
                            <Phone size={16} />
                            <span>{futsal.ownerPhone || "N/A"}</span>
                          </div>
                          <div className={styles.ownerActions}>
                            <button className={styles.addFriendBtn}>
                              <UserPlus size={16} />
                              <span>Add Friend</span>
                            </button>
                            <button className={styles.messageBtn}>
                              <MessageSquare size={16} />
                              <span>Message</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.locationSection}>
                    <h2>Find Us:</h2>
                    <div className={styles.mapContainer}>
                      <img src="/futsalownerpag/map-example.png" alt="Futsal Location Map" className={styles.mapImage} />
                    </div>
                    <div className={styles.mapAddress}>
                      <MapPin size={16} />
                      <span>{futsal.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  )
}

export default OMyFutsal
