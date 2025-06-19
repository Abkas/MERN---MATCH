import React, { useState, useEffect } from 'react'
import styles from '../css/PUpcomingMatch.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Clock, Users, DollarSign, MapPin } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { axiosInstance } from '../../lib/axios'
import toast from 'react-hot-toast'
import { getSlotTimeStatus } from '../../utils/slotTimeStatus'
import FutsalNavbar from '../../components/FutsalNavbar'
import PlayerSidebar from '../../components/PlayerSidebar'

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
            console.log('Fetching joined slots...');
            // This endpoint returns only slots where the current player is in the players array
            const response = await axiosInstance.get('/slots/player/slots')
            if (response.data.success) {
                const slots = response.data.message;
                console.log('Joined slots:', slots);
                
                // Filter out ended matches to show only active joined slots
                const activeJoinedSlots = slots.filter(slot => {
                    const timeStatus = getSlotTimeStatus(slot, slot.date);
                    return timeStatus !== 'ended';
                });
                
                console.log('Active joined slots to display:', activeJoinedSlots);
                setJoinedSlots(activeJoinedSlots);
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
            // Show confirmation dialog
            const confirmed = window.confirm('Are you sure you want to cancel this booking?');
            if (!confirmed) return;

            const response = await axiosInstance.delete(`/slots/${slotId}/cancel`);
            if (response.data.success) {
                toast.success('Booking cancelled successfully');
                fetchJoinedSlots(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to cancel booking');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            // Show more specific error message from the backend
            toast.error(err.response?.data?.message || 'Failed to cancel booking');
        }
    }

    const handleViewFutsal = (futsalId) => {
        if (!futsalId) {
            toast.error('Futsal details not available');
            return;
        }
        navigate(`/futsal/${futsalId}`);
    }

    return (
        <div className={styles.body}>
            <FutsalNavbar />
            <div className={styles.container}>
                <PlayerSidebar />
                <main className={styles.mainContent} style={{ marginTop: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <h1 className={styles.pageTitle}>
                        <span>Upcoming Matches</span>
                        <span className={styles.matchCount}>
                            <Clock size={22} />
                            {joinedSlots.length > 0 ? `${joinedSlots.length} match${joinedSlots.length > 1 ? 'es' : ''}` : ''}
                        </span>
                    </h1>
                    {loading ? (
                        <div className={styles.loading}>Loading your matches...</div>
                    ) : joinedSlots.length === 0 ? (
                        <div className={styles.noMatches}>
                            <img src="/firstpage/logo.png" alt="No matches" />
                            <p>You haven't joined any matches yet.</p>
                            <Link to="/bookfutsal" className={styles.findMatchesBtn}>
                                Find Matches
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.matchesGrid}>
                            {joinedSlots.map((slot) => {
                                const timeStatus = getSlotTimeStatus(slot, slot.date);
                                let statusLabel = '';
                                let statusClass = '';
                                // Get current user
                                const authUser = useAuthStore.getState().authUser;
                                let userTeam = null;
                                if (authUser && slot.teamA && slot.teamA.some(u => (u._id || u) === authUser._id)) userTeam = 'A';
                                if (authUser && slot.teamB && slot.teamB.some(u => (u._id || u) === authUser._id)) userTeam = 'B';

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
                                    statusLabel = slot.status || 'Upcoming';
                                    statusClass = styles[`status${(slot.status || 'Upcoming').charAt(0).toUpperCase() + (slot.status || 'Upcoming').slice(1)}`] || '';
                                }

                                return (
                                    <div key={slot._id} className={styles.matchCard}>
                                        <div className={styles.matchHeader}>
                                            <div className={styles.venueInfo}>
                                                <img src={slot.futsal?.futsalPhoto || "/FUTSALHOME/logo.png"} alt="futsal-logo" />
                                                <h3>{slot.futsal?.name || 'Unknown Futsal'}</h3>
                                            </div>
                                            <span className={`${styles.status} ${statusClass}`}>{statusLabel}</span>
                                        </div>
                                        <div className={styles.matchDetails}>
                                            <div className={styles.detailItem}>
                                                <Clock size={18} />
                                                <span>{slot.time || 'Time not set'}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <Users size={18} />
                                                <span>{slot.currentPlayers || 0}/{slot.maxPlayers || 10} Players</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <DollarSign size={18} />
                                                <span>₹{slot.price || 0} per player</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <MapPin size={18} />
                                                <span>{slot.futsal?.location || 'Location not set'}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span style={{fontWeight:600, color:userTeam==='A'?'#2563eb':userTeam==='B'?'#b91c1c':'#888'}}>
                                                    {userTeam ? `Your Team: Team ${userTeam}` : 'No Team Assigned'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.matchActions}>
                                            <button
                                                className={styles.viewDetailsBtn}
                                                onClick={() => handleViewFutsal(slot.futsal?._id)}
                                                disabled={!slot.futsal?._id}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                className={styles.cancelBtn}
                                                onClick={() => handleCancelBooking(slot._id)}
                                                disabled={timeStatus === 'playing' || timeStatus === 'ended'}
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