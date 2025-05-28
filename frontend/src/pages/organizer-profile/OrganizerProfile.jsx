import React, { useEffect, useState } from 'react';
import styles from '../css/OProfile.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';

const OrganizerProfile = () => {
  const { logOut, authUser } = useAuthStore();
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch organizer profile from backend when component mounts
    const fetchOrganizerProfile = async () => {
      try {
        const res = await axiosInstance.get('/organizer/organizer-profile');
        if (res.data && res.data.data) {
          setOrganizer(res.data.data);
        } else {
          setOrganizer(null);
        }
      } catch (err) {
        console.error('Failed to fetch organizer profile:', err);
        setOrganizer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizerProfile();
  }, []);

  const handleLogout = () => {
    logOut();
    navigate('/login');
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!organizer) return (
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
            <li><Link to="/profile" className={styles.active}>Profile</Link></li>
            <li><Link to="/organizer-futsals">My Futsal</Link></li>
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
          <div className={styles.error} style={{color: 'red', fontSize: '1.3rem', margin: '2rem auto', textAlign: 'center'}}>Demo organizer profile not found.</div>
        </main>
      </div>
    </div>
  );

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
      </header>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarMenu}>
            <li><Link to="/organizer-dashboard">Dashboard</Link></li>
            <li><Link to="/profile" className={styles.active}>Profile</Link></li>
            <li><Link to="/organizer-futsals">My Futsal</Link></li>
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
          <div className={styles.profileCard + ' ' + styles.profileCardLarge} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2.5rem', background: '#f7f8fa', boxShadow: '0 2px 12px #23294611', borderRadius: 18, padding: '2.5rem 2rem', marginBottom: 32}}>
            <div className={styles.profileImage} style={{width: '160px', height: '160px', margin: 0, flexShrink: 0, border: '4px solid #eebbc3', boxShadow: '0 2px 8px #eebbc355'}}>
              <img
                src={organizer?.avatar || '/default-owner.png'}
                alt="profile"
                style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}}
              />
            </div>
            <div style={{flex: 1, textAlign: 'left'}}>
              <h1 style={{fontSize: '2.3rem', marginBottom: '0.5rem', color: '#232946'}}>{organizer?.name || 'Organizer Name'}</h1>
              <div style={{marginBottom: '1.2rem', color: '#888', fontWeight: 500}}>
                <span style={{marginRight: 16}}><strong>Email:</strong> {organizer?.email || 'Not set'}</span>
                <span><strong>Phone:</strong> {organizer?.phone || 'Not set'}</span>
              </div>
              <div style={{marginBottom: '1.2rem'}}>
                <span style={{background: '#eebbc3', color: '#232946', borderRadius: 8, padding: '0.2rem 0.7rem', fontWeight: 600, fontSize: '1rem'}}>
                  {organizer?.organizerProfile?.isVerified ? 'Verified Organizer' : 'Not Verified'}
                </span>
              </div>
              <p className={styles.bio} style={{fontSize: '1.15rem', marginBottom: '1.5rem', color: '#444'}}>{organizer?.organizerProfile?.bio || 'No bio available.'}</p>
              <div style={{fontSize: '1.1rem', color: '#555', marginBottom: 12}}>
                <strong>Awards:</strong> {organizer?.organizerProfile?.awards || 'None'}
              </div>
              <div style={{fontSize: '1.1rem', color: '#555', marginBottom: 12}}>
                <strong>Additional Info:</strong> {organizer?.organizerProfile?.additionalInfo || 'None'}
              </div>
            </div>
          </div>
          <div className={styles.personalInfoCard + ' ' + styles.personalInfoCardLarge} style={{background: '#fff', boxShadow: '0 2px 12px #23294611', borderRadius: 16, padding: '2rem 1.5rem', maxWidth: 700, margin: '0 auto'}}>
            <div className={styles.cardHeader}><h3 style={{fontSize: '1.3rem', color: '#232946'}}>Organizer Details</h3></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Futsals Managed:</div><div className={styles.infoValue}>{Array.isArray(organizer?.organizerProfile?.futsals) ? organizer.organizerProfile.futsals.length : 0}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Tournaments Hosted:</div><div className={styles.infoValue}>{Array.isArray(organizer?.organizerProfile?.tournaments) ? organizer.organizerProfile.tournaments.length : 0}</div></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizerProfile;
