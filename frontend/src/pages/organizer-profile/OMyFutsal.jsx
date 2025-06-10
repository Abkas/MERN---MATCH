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

  // Render all futsals in grid
  const renderFutsalGrid = () => (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
      width: '100%'
    }}>
      {futsals.map(futsal => (
        <div key={futsal._id} style={{
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
          transition: 'transform 0.2s, box-shadow 0.2s',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
        }}
        >
          {/* Futsal Image */}
          <div style={{ 
            height: '160px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img
              src={futsal.futsalPhoto || '/default-futsal.jpg'}
              alt={futsal.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {futsal.isAwarded && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle size={14} />
                <span>Verified</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: '1'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827'
              }}>{futsal.name}</h3>

              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#374151',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={() => handleUpdateFutsal(futsal._id)}
                title="Edit Futsal"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>

            {/* Details */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <MapPin size={14} />
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>{futsal.location || 'Location not specified'}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Clock size={14} />
                <span>{futsal.openingHours || 'Hours not specified'}</span>
              </div>
            </div>

            {/* Description */}
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: '1'
            }}>
              {futsal.description || 'No description provided.'}
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '12px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Users size={14} />
                <span>{futsal.followers?.length || 0}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Star size={14} />
                <span>{futsal.rating?.toFixed(1) || 'New'}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Calendar size={14} />
                <span>{futsal.gamesOrganized || 0}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button style={{
                flex: '1',
                padding: '8px 12px',
                background: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onClick={() => handleUpdateFutsal(futsal._id)}
              >
                Manage
              </button>
              <button style={{
                flex: '1',
                padding: '8px 12px',
                background: 'white',
                color: '#111827',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s'
              }}
              onClick={() => handleDeleteFutsal(futsal._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
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
        <aside className={styles.sidebar}>          <ul className={styles.sidebarMenu}>            <li><Link to="/organizer-dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/organizer-addfriend" style={{ color: '#9ca3af' }}>Add Friends</Link></li>
            <li><Link to="/organizer-futsals" className={styles.active}>My Futsal</Link></li>
            <li><Link to="/organizer-history" style={{ color: '#9ca3af' }}>History</Link></li>
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
            <div className={styles.loading}>Loading futsal data...</div>          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : futsals.length === 0 ? (
            <div className={styles.empty}>
              <h3>No futsal found for your organizer profile.</h3>
              <div className={styles.blueprintNote}>
                <p>This is how your futsal profile will look:</p>
              </div>
              {renderFutsalCard({})}
            </div>
          ) : (            <div style={{ width: '100%', padding: '16px 0' }}>
              {renderFutsalGrid()}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default OMyFutsal
