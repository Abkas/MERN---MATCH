import React, { useState, useEffect } from 'react'
import styles from '../css/PUpcomingMatch.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Clock, Users, DollarSign, MapPin } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { axiosInstance } from '../../lib/axios'
import toast from 'react-hot-toast'
import { getSlotTimeStatus } from '../../utils/slotTimeStatus'

const PUpcomingMatchesPage = () => {
    const { logOut } = useAuthStore()
    const navigate = useNavigate()
    const [joinedSlots, setJoinedSlots] = useState([])
    const [loading, setLoading] = useState(true)

    const handleLogout = () => {
        logOut()
        navigate('/login')
    }

    const fetchJoinedSlots = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/slots/player/joined')
            if (response.data.success) {
                setJoinedSlots(response.data.message)
            } else {
                toast.error('Failed to fetch joined slots')
            }
        } catch (err) {
            console.error('Error fetching joined slots:', err)
            toast.error('Failed to fetch joined slots')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJoinedSlots()
    }, [])

    const handleCancelBooking = async (slotId) => {
        try {
            const response = await axiosInstance.delete(`/slots/${slotId}/cancel`)
            if (response.data.success) {
                toast.success('Booking cancelled successfully')
                fetchJoinedSlots() // Refresh the list
            } else {
                toast.error('Failed to cancel booking')
            }
        } catch (err) {
            console.error('Error cancelling booking:', err)
            toast.error('Failed to cancel booking')
        }
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
                    <Link to="#" className={styles.profileIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Link>
                </div>
            </header>
            <div className={styles.container}>
                <aside className={styles.sidebar}>
                    <ul className={styles.sidebarMenu}>
                        <li><Link to="/player-dashboard">Dashboard</Link></li>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><Link to="/player-addfriend">Add Friends</Link></li>
                        <li><Link to="/player-history">History</Link></li>
                        <li><Link to="/player-upcomingmatches" className={styles.active}>Upcoming Matches</Link></li>
                        <li>
                            <button className={styles.logoutBtn} onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    </ul>
                </aside>
                <main className={styles.mainContent} style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 0', marginLeft: '250px', width: 'calc(100% - 250px)' }}>
                    <h1 className={styles.pageTitle} style={{ fontSize: '2.2rem', fontWeight: 800, color: '#232946', letterSpacing: 1, marginBottom: 36, display: 'flex', alignItems: 'center', gap: 18 }}>
                        <span style={{ color: '#2563eb' }}>Upcoming Matches</span>
                        <span style={{ fontSize: 18, color: '#888', fontWeight: 500, marginLeft: 12, display: 'flex', alignItems: 'center' }}>
                            <Clock size={22} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            {joinedSlots.length > 0 ? `${joinedSlots.length} match${joinedSlots.length > 1 ? 'es' : ''}` : ''}
                        </span>
                    </h1>
                    {loading ? (
                        <div className={styles.loading}>Loading your matches...</div>
                    ) : joinedSlots.length === 0 ? (
                        <div className={styles.noMatches} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #2563eb11', padding: '3rem 2rem', maxWidth: 480, margin: '0 auto', marginTop: 40 }}>
                            <img src="/firstpage/logo.png" alt="No matches" style={{ width: 80, marginBottom: 16, opacity: 0.7 }} />
                            <p style={{ fontSize: 20, color: '#888', marginBottom: 8, fontWeight: 500 }}>You haven't joined any matches yet.</p>
                            <Link to="/bookfutsal" className={styles.findMatchesBtn} style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '12px 32px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px #2563eb22', fontSize: 17 }}>
                                Find Matches
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.matchesGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(370px, 1fr))', gap: 36, marginTop: 24 }}>
                            {joinedSlots.map((slot) => {
                                const timeStatus = getSlotTimeStatus(slot, slot.date);
                                let statusLabel = '';
                                let statusClass = '';
                                if (timeStatus === 'ended') {
                                    statusLabel = 'Ended';
                                    statusClass = styles.statusEnded;
                                } else if (timeStatus === 'playing') {
                                    statusLabel = 'Playing';
                                    statusClass = styles.statusPlaying;
                                } else if (timeStatus === 'soon') {
                                    statusLabel = 'Starting Soon';
                                    statusClass = styles.statusSoon;
                                } else {
                                    statusLabel = slot.status;
                                    statusClass = styles[`status${slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}`] || '';
                                }
                                return (
                                    <div key={slot._id} className={styles.matchCard} style={{ background: '#fff', borderRadius: 22, boxShadow: '0 8px 32px #2563eb13', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid #e3e8f0', transition: 'box-shadow 0.2s', position: 'relative', minHeight: 260 }}>
                                        <div className={styles.matchHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <img src="/FUTSALHOME/logo.png" alt="futsal-logo" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', background: '#f3f6fa', border: '1px solid #e3e8f0' }} />
                                                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#222', margin: 0 }}>{slot.futsal.name}</h3>
                                            </div>
                                            <span className={`${styles.status} ${statusClass}`} style={{ fontWeight: 700, fontSize: 15, padding: '6px 16px', borderRadius: 8, letterSpacing: 0.5 }}>{statusLabel}</span>
                                        </div>
                                        <div className={styles.matchDetails} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
                                            <div className={styles.detailItem} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 600, fontSize: 16 }}>
                                                <Clock size={18} />
                                                <span>{slot.time}</span>
                                            </div>
                                            <div className={styles.detailItem} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#43a047', fontWeight: 600, fontSize: 16 }}>
                                                <Users size={18} />
                                                <span>{slot.currentPlayers}/{slot.maxPlayers} Players</span>
                                            </div>
                                            <div className={styles.detailItem} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbc02d', fontWeight: 600, fontSize: 16 }}>
                                                <DollarSign size={18} />
                                                <span>₹{slot.price} per player</span>
                                            </div>
                                            <div className={styles.detailItem} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d32f2f', fontWeight: 600, fontSize: 16 }}>
                                                <MapPin size={18} />
                                                <span>{slot.futsal.location}</span>
                                            </div>
                                        </div>
                                        <div className={styles.matchActions} style={{ display: 'flex', gap: 18, marginTop: 'auto' }}>
                                            <button
                                                className={styles.viewDetailsBtn}
                                                style={{ background: '#2563eb', color: '#fff', borderRadius: 10, padding: '10px 24px', fontWeight: 700, border: 'none', boxShadow: '0 2px 8px #2563eb22', cursor: 'pointer', fontSize: 16, transition: 'background 0.2s' }}
                                                onClick={() => navigate(`/futsal/${slot.futsal._id}`)}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                className={styles.cancelBtn}
                                                style={{ background: '#fff', color: '#d32f2f', border: '2px solid #d32f2f', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 16, transition: 'background 0.2s' }}
                                                onClick={() => handleCancelBooking(slot._id)}
                                            >
                                                Cancel Booking
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default PUpcomingMatchesPage