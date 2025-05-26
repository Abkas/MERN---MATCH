"use client"
import styles from "../css/OMyFutsal.module.css"
import { Link, useNavigate } from "react-router-dom"
import { MapPin, Clock, Edit, CheckCircle, Users, Star, Calendar, Phone, Map, Plus } from "lucide-react"
import { useAuthStore } from '../../store/useAuthStore'
import { useEffect, useState } from "react"

const OMyFutsal = () => {
  const { logOut, fetchFutsals, deleteFutsal } = useAuthStore()
  const navigate = useNavigate()
  const [futsals, setFutsals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentFutsalIdx, setCurrentFutsalIdx] = useState(0);

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

  const handlePrevFutsal = () => {
    setCurrentFutsalIdx((prev) => (prev === 0 ? futsals.length - 1 : prev - 1));
  };
  const handleNextFutsal = () => {
    setCurrentFutsalIdx((prev) => (prev === futsals.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (currentFutsalIdx >= futsals.length) setCurrentFutsalIdx(0);
  }, [futsals, currentFutsalIdx]);

  // Add delete handler
  const handleDeleteFutsal = async (futsalId) => {
    if (!window.confirm('Are you sure you want to delete this futsal? This action cannot be undone.')) return;
    try {
      await deleteFutsal(futsalId);
      setFutsals(futsals.filter(f => f._id !== futsalId));
    } catch (err) {
      // error toast handled in store
    }
  }

    const renderFutsalCard = (futsal = {}) => (
    <div className={styles.futsalCard} key={futsal._id || Math.random()}>
      <div className={styles.cardImageSection}>
        <img
          src={futsal.futsalPhoto || '/default-futsal.jpg'}
          alt={futsal.name || 'Futsal'}
          className={styles.futsalImage}
        />
      </div>
      <div className={styles.cardContentSection}>
        <div className={styles.cardHeaderRow}>
          <h2 className={styles.futsalName}>{futsal.name || 'Futsal Name'} {futsal.isAwarded && <CheckCircle className={styles.verifiedBadge} size={18} />}</h2>
          <div className={styles.cardActions}>
            {futsal._id && (
              <>
                <button className={styles.editBtn} onClick={() => handleUpdateFutsal(futsal._id)} title="Edit Futsal">
                  <Edit size={16} />
                </button>
                <button className={styles.deleteFutsalBtn} onClick={() => handleDeleteFutsal(futsal._id)} title="Delete Futsal">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
        <div className={styles.metaRow}>
          <span><MapPin size={14}/> {futsal.location || 'Location'}</span>
          <span><Clock size={14}/> {futsal.openingHours || 'Opening Hours'}</span>
          <span><Phone size={14}/> {futsal.phoneNumber || 'Phone'}</span>
        </div>
        <div className={styles.statsRow}>
          <span><Users size={14}/> {futsal.followers?.length || 0} Followers</span>
          <span><Star size={14}/> {futsal.reviews?.length || 0} Reviews</span>
          <span><Calendar size={14}/> {futsal.gamesOrganized || 0} Games</span>
        </div>
        <div className={styles.facilitiesRow}>
          {futsal.plusPoints?.length > 0 ? futsal.plusPoints.map((facility, idx) => (
            <span key={facility + idx} className={styles.facilityTag}>{facility}</span>
          )) : <span className={styles.facilityTag}>No facilities listed</span>}
        </div>
        <div className={styles.aboutRow}>
          <strong>About:</strong> {futsal.description || 'No description provided.'}
        </div>
        <div className={styles.ownerRow}>
          <strong>Owner:</strong> {futsal.ownerName || 'Owner Name'}<br/>
          <span className={styles.ownerDesc}>{futsal.ownerDescription || 'No owner description.'}</span>
        </div>
        {futsal.mapLink && (
          <div className={styles.mapPreview}><iframe src={futsal.mapLink} width="100%" height="120" style={{border:0}} allowFullScreen loading="lazy" title="Futsal Map"/></div>
        )}
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
            <li><Link to="/profile">Profile</Link></li>
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
            <button className={styles.createFutsalBtn} onClick={handleCreateFutsal}>
              <Plus size={16} /> Create New Futsal
            </button>
          </div>
          {loading ? (
            <div className={styles.loading}>Loading futsal data...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : futsals.length === 0 ? (
            <div className={styles.empty}>
              <h3>No futsal found for your organizer profile.</h3>
              <div className={styles.blueprintNote}>
                <p>This is how your futsal profile will look:</p>
              </div>
              {renderFutsalCard({})}
            </div>
          ) : (
            <div className={styles.futsalSliderWrapper}>
              {futsals.length > 1 && (
                <button className={styles.arrowBtn} onClick={handlePrevFutsal} title="Previous Futsal">&#8592;</button>
              )}
              {renderFutsalCard(futsals[currentFutsalIdx])}
              {futsals.length > 1 && (
                <button className={styles.arrowBtn} onClick={handleNextFutsal} title="Next Futsal">&#8594;</button>
              )}
              <div className={styles.futsalSliderIndicator}>
                {futsals.map((_, idx) => (
                  <span key={idx} className={idx === currentFutsalIdx ? styles.activeDot : styles.dot}></span>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default OMyFutsal
