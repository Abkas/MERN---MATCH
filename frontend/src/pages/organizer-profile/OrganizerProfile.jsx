import React, { useEffect, useState } from 'react';
import styles from '../css/OProfile.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';
import { toast } from 'react-hot-toast';

const OrganizerProfile = () => {
  const { logOut, authUser, fetchOrganizerProfile } = useAuthStore();
  const navigate = useNavigate();
  // Use separate state for user and organizerProfile
  const [user, setUser] = useState(null);
  const [organizerProfile, setOrganizerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      toast.loading('Fetching organizer profile...');
      try {
        const data = await fetchOrganizerProfile();
        console.log('Fetched organizer profile data (raw):', data, typeof data, data && Object.keys(data));
        toast.dismiss();
        toast.success('Organizer profile fetched!');
        if (data && data.user && data.organizerProfile) {
          setUser(data.user);
          setOrganizerProfile(data.organizerProfile);
        } else {
          setUser(null);
          setOrganizerProfile(null);
        }
      } catch (err) {
        toast.dismiss();
        toast.error('Failed to fetch organizer profile');
        setUser(null);
        setOrganizerProfile(null);
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [fetchOrganizerProfile]);

  const handleLogout = () => {
    logOut();
    navigate('/login');
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  // Use user and organizerProfile directly, fallback to demo values inline
  const profile = user || {};
  const orgProfile = organizerProfile || {};

  // Debug: log what is being rendered
  console.log('Rendering OrganizerProfile:', { profile, orgProfile });

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
          <div className={styles.profileCard + ' ' + styles.profileCardLarge} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f7f8fa', boxShadow: '0 2px 12px #23294611', borderRadius: 18, padding: '2.5rem 2rem', marginBottom: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto'}}>
            <div className={styles.profileImage} style={{width: '140px', height: '140px', marginBottom: '1.5rem', flexShrink: 0, border: '4px solid #eebbc3', boxShadow: '0 2px 8px #eebbc355'}}>
              <img
                src={profile.avatar || '/default-owner.png'}
                alt="profile"
                style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}}
              />
            </div>
            <div style={{width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.1rem'}}>
              <div>
                <label style={{fontWeight: 600, color: '#232946'}}>Name</label>
                <div style={{fontSize: '1.2rem', color: '#232946'}}>{profile.username || profile.fullName || 'demo.organizer'}</div>
              </div>
              <div>
                <label style={{fontWeight: 600, color: '#232946'}}>Email</label>
                <div style={{color: '#444'}}>{profile.email || 'demo.organizer@example.com'}</div>
              </div>
              <div>
                <label style={{fontWeight: 600, color: '#232946'}}>Phone</label>
                <div style={{color: '#444'}}>{profile.phoneNumber || '+1234567890'}</div>
              </div>
              <div>
                <label style={{fontWeight: 600, color: '#232946'}}>Verified</label>
                <div>
                  <span style={{background: '#eebbc3', color: '#232946', borderRadius: 8, padding: '0.2rem 0.7rem', fontWeight: 600, fontSize: '1rem'}}>
                    {orgProfile.isVerified ? 'Verified Organizer' : 'Not Verified'}
                  </span>
                </div>
              </div>
              <div>
                <label style={{fontWeight: 600, color: '#232946'}}>Role</label>
                <div style={{color: '#444'}}>{profile.role || 'organizer'}</div>
              </div>
              <div>
                <label style={{fontWeight: 600, color: '#232946'}}>Bio</label>
                <div className={styles.bio} style={{fontSize: '1.05rem', color: '#444'}}>{orgProfile.bio || 'This is a demo bio for the organizer. Showcase your experience and achievements here.'}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizerProfile;
