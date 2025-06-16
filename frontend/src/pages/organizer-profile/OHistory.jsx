import React from 'react'
import styles from '../css/OHistory.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import FutsalNavbar from '../../components/FutsalNavbar'

const OHistory = () => {
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
        <aside className={styles.sidebar}>          <ul className={styles.sidebarMenu}>            <li><Link to="/organizer-dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/organizer-addfriend" style={{ color: '#9ca3af' }}>Add Friends</Link></li>
            <li><Link to="/organizer-futsals" >My Futsal</Link></li>
            <li><Link to="/organizer-history" className={styles.active} style={{ color: '#9ca3af' }}>History</Link></li>
            <li><Link to="/organizer-slots" >Manage Slots</Link></li>
            <li>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </aside>        <main>
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
              You will be able to view futsal history soon.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default OHistory