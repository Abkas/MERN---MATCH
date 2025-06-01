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
          <div className={styles.profileCard + ' ' + styles.profileCardLarge} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #eebbc3 0%, #f7f8fa 100%)',
            boxShadow: '0 8px 32px rgba(35,41,70,0.13)',
            borderRadius: 32,
            padding: '3.5rem 3rem',
            marginBottom: 48,
            maxWidth: 700,
            minHeight: 420,
            marginLeft: 'auto',
            marginRight: 'auto',
            fontSize: '1.25rem',
          }}>
            <div className={styles.profileImage} style={{
              width: '180px',
              height: '180px',
              marginBottom: '2.5rem',
              flexShrink: 0,
              border: '6px solid #232946',
              boxShadow: '0 4px 24px #eebbc355',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src={profile.avatar || '/default-owner.png'}
                alt="profile"
                style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}}
              />
            </div>
            <div style={{width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
              <div style={{display: 'flex', gap: '2.5rem', flexWrap: 'wrap'}}>
                <div style={{flex: 1}}>
                  <label style={{fontWeight: 700, color: '#232946', fontSize: '1.2rem'}}>Name</label>
                  <div style={{fontSize: '1.5rem', color: '#232946', fontWeight: 700}}>{profile.username || profile.fullName || 'demo.organizer'}</div>
                </div>
                <div style={{flex: 1}}>
                  <label style={{fontWeight: 700, color: '#232946', fontSize: '1.2rem'}}>Email</label>
                  <div style={{color: '#444', fontSize: '1.15rem'}}>{profile.email || 'demo.organizer@example.com'}</div>
                </div>
                <div style={{flex: 1}}>
                  <label style={{fontWeight: 700, color: '#232946', fontSize: '1.2rem'}}>Phone</label>
                  <div style={{color: '#444', fontSize: '1.15rem'}}>{profile.phoneNumber || '+1234567890'}</div>
                </div>
              </div>
              <div style={{display: 'flex', gap: '2.5rem', flexWrap: 'wrap'}}>
                <div style={{flex: 1}}>
                  <label style={{fontWeight: 700, color: '#232946', fontSize: '1.2rem'}}>Verified</label>
                  <div>
                    <span style={{background: orgProfile.isVerified ? '#10b981' : '#eebbc3', color: '#232946', borderRadius: 12, padding: '0.3rem 1.1rem', fontWeight: 700, fontSize: '1.1rem'}}>
                      {orgProfile.isVerified ? 'Verified Organizer' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                <div style={{flex: 1}}>
                  <label style={{fontWeight: 700, color: '#232946', fontSize: '1.2rem'}}>Role</label>
                  <div style={{color: '#444', fontSize: '1.15rem'}}>{profile.role || 'organizer'}</div>
                </div>
              </div>
              <div>
                <label style={{fontWeight: 700, color: '#232946', fontSize: '1.2rem'}}>Bio</label>
                <div className={styles.bio} style={{fontSize: '1.18rem', color: '#444', background: '#fff', borderRadius: 12, padding: '1.2rem 1.5rem', marginTop: 8, boxShadow: '0 1px 4px #23294611'}}>{orgProfile.bio || 'This is a demo bio for the organizer. Showcase your experience and achievements here.'}</div>
              </div>
            </div>
          </div>
          {/* Update Profile Button */}
          <button
            className={styles.updateProfileBtn}
            style={{
              marginTop: 32,
              background: '#232946',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '1.1rem 2.8rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px #23294622',
              transition: 'background 0.2s',
              letterSpacing: 1,
            }}
            onClick={() => navigate('/organizer-update-profile', { state: { user, organizerProfile } })}
          >
            Update Profile
          </button>
        </main>
      </div>
    </div>
  );
};

export default OrganizerProfile;
