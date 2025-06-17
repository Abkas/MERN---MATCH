import React from 'react'
import styles from '../css/PUpcomingMatch.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import FutsalNavbar from '../../components/FutsalNavbar'
import PlayerSidebar from '../../components/PlayerSidebar'

const PHistoryPage = () => {
    const { logOut } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logOut()
        navigate('/login')
    }

    return (
        <div className={styles.body}>
            <FutsalNavbar />
            <div className={styles.container}>
                <PlayerSidebar />
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
