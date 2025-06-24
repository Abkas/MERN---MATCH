import React from 'react'
import styles from '../css/OHistory.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import FutsalNavbar from '../../components/FutsalNavbar'
import OrganizerSidebar from '../../components/OrganizerSidebar'

const OHistory = () => {
  const { logOut } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }
  return (
    <div className={styles.body} style={{ width: '100vw', margin: 0, padding: 0 }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <FutsalNavbar />
      <div className={styles.container} style={{ width: '100vw', margin: 0, padding: 0, display: 'flex', alignItems: 'stretch', minHeight: '100vh' }}>
        <div style={{ height: '100vh', minHeight: '100%', position: 'sticky', top: 0, left: 0, zIndex: 100 }}>
          <OrganizerSidebar style={{ marginTop: 0, height: '100%', minHeight: '100vh' }} />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <main className={styles.mainContent} style={{ width: '100%', maxWidth: '1200px', padding: '0 20px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 65px)', marginTop: '88px' }}>
          <div style={{            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h1 style={{
              fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              color: '#2563eb'
            }}>Coming Soon!</h1>
            
            <p style={{              fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
              maxWidth: '600px',
              lineHeight: '1.6',
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              You will be able to view futsal history soon.
            </p>          </div>
        </main>
        </div>
      </div>
    </div>
  )
}

export default OHistory