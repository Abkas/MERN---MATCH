import React from 'react'
import styles from '../css/PUpcomingMatch.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

const PHistoryPage = () => {
    const { logOut } = useAuthStore()
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
                        <li><Link to="/player-addfriend" style={{ color: '#9ca3af' }}>Add Friends</Link></li>
                        <li><Link to="/player-history" className={styles.active}>History</Link></li>
                        <li><Link to="/player-upcomingmatches">Upcoming Matches</Link></li>
                        <li>
                            <button className={styles.logoutBtn} onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    </ul>
                </aside>        
                <main className={styles.mainContent}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '70vh',
                            textAlign: 'center',
                            padding: '2rem'
                          }}>
                            <h1 style={{
                              fontSize: '2.5rem',
                              fontWeight: '700',
                              marginBottom: '1rem',
                              color: '#2563eb'
                            }}>Coming Soon!</h1>
                            
                            <p style={{
                              fontSize: '1.2rem',
                              maxWidth: '600px',
                              lineHeight: '1.6',
                              color: '#6b7280',
                              marginBottom: '2rem'
                            }}>
                              You will be able to view History soon.
                            </p>
                          </div>
                </main>
            </div>
        </div>
    )
}

export default PHistoryPage
