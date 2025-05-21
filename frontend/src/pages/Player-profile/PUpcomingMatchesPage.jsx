import React, { useState, useEffect } from 'react'
import styles from '../css/PUpcomingMatch.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Clock, Users, DollarSign, MapPin } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { axiosInstance } from '../../lib/axios'
import toast from 'react-hot-toast'

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
                        <li><Link to="/player-profile">Profile</Link></li>
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
                <main className={styles.mainContent}>
                    <h1>UPCOMING MATCHES</h1>
                    
                    {loading ? (
                        <div className={styles.loading}>Loading your matches...</div>
                    ) : joinedSlots.length === 0 ? (
                        <div className={styles.noMatches}>
                            <p>You haven't joined any matches yet.</p>
                            <Link to="/bookfutsal" className={styles.findMatchesBtn}>
                                Find Matches
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.matchesGrid}>
                            {joinedSlots.map((slot) => (
                                <div key={slot._id} className={styles.matchCard}>
                                    <div className={styles.matchHeader}>
                                        <h3>{slot.futsal.name}</h3>
                                        <span className={`${styles.status} ${styles[`status${slot.status}`]}`}>
                                            {slot.status}
                                        </span>
                                    </div>
                                    <div className={styles.matchDetails}>
                                        <div className={styles.detailItem}>
                                            <Clock size={16} />
                                            <span>{slot.time}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Users size={16} />
                                            <span>{slot.currentPlayers}/{slot.maxPlayers} Players</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <DollarSign size={16} />
                                            <span>₹{slot.price} per player</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <MapPin size={16} />
                                            <span>{slot.futsal.location}</span>
                                        </div>
                                    </div>
                                    <div className={styles.matchActions}>
                                        <button 
                                            className={styles.viewDetailsBtn}
                                            onClick={() => navigate(`/futsal/${slot.futsal._id}`)}
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            className={styles.cancelBtn}
                                            onClick={() => handleCancelBooking(slot._id)}
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default PUpcomingMatchesPage