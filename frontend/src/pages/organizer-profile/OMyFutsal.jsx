"use client"
import styles from "../css/OMyFutsal.module.css"
import { Link, useNavigate } from "react-router-dom"
import { MapPin, Clock, Edit, CheckCircle, Users, Star, Calendar, Phone, Map, Plus } from "lucide-react"
import { useAuthStore } from '../../store/useAuthStore'
import { useEffect, useState } from "react"

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
        let futsalArr = res?.message || []
        setFutsals(Array.isArray(futsalArr) ? futsalArr : [])
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

  const handleCreateFutsal = () => {
    navigate('/update-futsal', { state: { isCreating: true } })
  }

  const handleUpdateFutsal = (futsalId) => {
    navigate('/update-futsal', { state: { isCreating: false, futsalId } })
  }

  const renderFutsalBlueprint = (futsal = {}) => (
    <div className={styles.futsalProfile}>
      <div className={styles.futsalInfo}>
        {/* Image Placeholder */}
        <div className={styles.imagePlaceholder}>
          <div className={styles.placeholderText}>Futsal Image</div>
        </div>

        <h1 className={styles.futsalName}>
          {futsal.name || "Futsal Name"} <CheckCircle className={styles.verifiedBadge} size={20} />
        </h1>
        
        {/* Basic Information */}
        <div className={styles.futsalMeta}>
          <div className={styles.location}>
            <MapPin size={16} />
            <span>{futsal.location || "Location"}</span>
          </div>
          <div className={styles.hours}>
            <Clock size={16} />
            <span>{futsal.openingHours || "Opening Hours"}</span>
          </div>
          <div className={styles.phone}>
            <Phone size={16} />
            <span>{futsal.phoneNumber || "Phone Number"}</span>
          </div>
        </div>

        {/* About Section */}
        <div className={styles.aboutSection}>
          <h2>About Us:</h2>
          <p>{futsal.description || "Description about your futsal"}</p>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <div className={styles.statItem}>
            <Users size={20} />
            <span>Followers: {futsal.followers?.length || 0}</span>
          </div>
          <div className={styles.statItem}>
            <Star size={20} />
            <span>Reviews: {futsal.reviews?.length || 0}</span>
          </div>
          <div className={styles.statItem}>
            <Calendar size={20} />
            <span>Games: {futsal.gamesOrganized || 0}</span>
          </div>
        </div>

        {/* Facilities Section */}
        <div className={styles.facilitiesSection}>
          <h2>Facilities:</h2>
          <div className={styles.facilitiesList}>
            {futsal.plusPoints?.length > 0 ? (
              futsal.plusPoints.map((facility, index) => (
                <span key={`facility-${futsal._id}-${index}`} className={styles.facilityTag}>{facility}</span>
              ))
            ) : (
              <>
                <span key="default-facility-1" className={styles.facilityTag}>Parking</span>
                <span key="default-facility-2" className={styles.facilityTag}>Changing Rooms</span>
                <span key="default-facility-3" className={styles.facilityTag}>Refreshments</span>
              </>
            )}
          </div>
        </div>

        {/* Owner Information */}
        <div className={styles.ownerSection}>
          <h2>Owner Information:</h2>
          <div className={styles.ownerInfo}>
            <h3>{futsal.ownerName || "Owner Name"}</h3>
            <p>{futsal.ownerDescription || "Owner description"}</p>
          </div>
        </div>

        {/* Map Section */}
        <div className={styles.mapSection}>
          <h2>Location:</h2>
          <div className={styles.mapContainer}>
            {futsal.mapLink ? (
              <iframe 
                src={futsal.mapLink}
                width="100%" 
                height="300" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                title="Futsal Location"
              />
            ) : (
              <div className={styles.mapPlaceholder}>
                <Map size={48} />
                <p>Map location will be displayed here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.body}>
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
      </header>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarMenu}>
            <li><Link to="/organizer-dashboard">Dashboard</Link></li>
            <li><Link to="/player-profile">Profile</Link></li>
            <li><Link to="/organizer-futsals" className={styles.active}>My Futsal</Link></li>
            <li><Link to="/organizer-history">History</Link></li>
            <li><Link to="/organizer-slots">Manage Slots</Link></li>
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
            {futsals.length > 0 && (
              <button 
                className={styles.updateProfileBtn}
                onClick={() => handleUpdateFutsal(futsals[0]._id)}
              >
                <Edit size={16} /> Update Futsal
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loading}>Loading futsal data...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : futsals.length === 0 ? (
            <div className={styles.empty}>
              <h3>No futsal found for your organizer profile.</h3>
              <button 
                className={styles.createFutsalBtn}
                onClick={handleCreateFutsal}
              >
                <Plus size={16} /> Create New Futsal
              </button>
              <div className={styles.blueprintNote}>
                <p>This is how your futsal profile will look:</p>
              </div>
              {renderFutsalBlueprint({})}
            </div>
          ) : (
            futsals.map(renderFutsalBlueprint)
          )}
        </main>
      </div>
    </div>
  )
}

export default OMyFutsal
