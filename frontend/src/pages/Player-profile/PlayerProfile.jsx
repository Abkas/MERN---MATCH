import React, { useEffect, useState } from 'react';
import styles from '../css/PProfile.module.css';
import sidebarStyles from '../css/OSidebar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';
import FutsalNavbar from '../../components/FutsalNavbar'
import PlayerSidebar from '../../components/PlayerSidebar'

const PlayerProfile = () => {
  const { logOut, fetchPlayerProfile } = useAuthStore();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const data = await fetchPlayerProfile();
        console.log('Fetched player profile data from backend:', data);
        if (data && data.user && data.playerProfile) {
          setUser(data.user);
          setPlayerProfile(data.playerProfile);
        } else {
          setUser(null);
          setPlayerProfile(null);
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          navigate('/login');
        }
        try { require('react-hot-toast').toast.error('Error fetching player profile'); } catch {}
        setUser(null);
        setPlayerProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    logOut();
    navigate('/login');
  };

  // Debug: log what is being rendered
  console.log('Rendering PlayerProfile:', { user, playerProfile });

  return (
    <div className={styles.body} style={{ width: '100vw', margin: 0, padding: 0 }}>
      <FutsalNavbar />
      <div className={styles.container} style={{ width: '100vw', margin: 0, padding: 0, display: 'flex', alignItems: 'stretch', minHeight: '100vh' }}>
        <div style={{ height: '100vh', minHeight: '100%', position: 'sticky', top: 0, left: 0, zIndex: 100 }}>
          <PlayerSidebar style={{ marginTop: 0, height: '100%', minHeight: '100vh' }} />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <main className={styles.main} style={{ width: '100%', maxWidth: '1200px', padding: '0 20px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 65px)', marginTop: '88px' }}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            {loading ? (
              <div className={styles.loadingSpinner}>Loading...</div>
            ) : !user || !playerProfile ? (
              <div className={styles.errorMessage}>
                <p>Could not load profile. Please try again later.</p>
                <button onClick={() => window.location.reload()} className={styles.reloadButton}>
                  Reload
                </button>
              </div>
            ) : (
              <div className={styles.profileContent}>
                <div className={styles.profileHeaderRow} style={{ marginBottom: 40 }}>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#232946', letterSpacing: 1 }}>Player Profile</h1>
                  <Link to="/player-update-profile">
                    <button className={styles.updateAccountBtn} style={{ fontSize: 18, padding: '0.8rem 2.2rem', borderRadius: 12, fontWeight: 700, boxShadow: '0 2px 8px #6366f122' }}>Update Account</button>
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div className={styles.profileCard} style={{ flex: 1, minWidth: 340, maxWidth: 420, background: '#fff', borderRadius: 28, boxShadow: '0 8px 32px rgba(35,41,70,0.10)', padding: '2.5rem 2rem', border: '1.5px solid #e5e7eb', textAlign: 'center' }}>
                    <div className={styles.profileImage}>
                      <div className={styles.circlePlaceholder} style={{ width: 160, height: 160, margin: '0 auto 2rem auto', border: '5px solid #6366f1', boxShadow: '0 2px 16px #6366f122' }}>
                        <img src={user?.avatar || '/avatar.jpg'} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      </div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: '#232946' }}>{user?.username}</h2>
                    <div className={styles.activeStatus} style={{ fontSize: 15, marginBottom: 18 }}>
                      <span className={styles.dot}></span>
                      <span>Active since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <p className={styles.bio} style={{ color: '#64748b', fontSize: 17, marginBottom: 18 }}>{playerProfile?.bio || 'No bio available'}</p>
                    <div className={styles.contactInfo} style={{ fontSize: 16, color: '#232946', marginBottom: 10 }}>
                      <div><strong>Phone:</strong> {user?.phoneNumber || 'Not set'}</div>
                      <div><strong>Email:</strong> {user?.email || 'Not set'}</div>
                    </div>
                  </div>
                  <div className={styles.personalInfoCard} style={{ flex: 2, minWidth: 320, background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px rgba(35,41,70,0.08)', padding: '2.5rem 2rem', border: '1.5px solid #e5e7eb' }}>
                    <div className={styles.cardHeader} style={{ borderBottom: '2px solid #e5e7eb', marginBottom: 24, paddingBottom: 12 }}><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#232946' }}>Player Details</h3></div>
                    <div className={styles.infoRow} style={{ fontSize: 17 }}><div className={styles.infoLabel}>Skill Level:</div><div className={styles.infoValue}>{playerProfile?.skillLevel || 'Not set'}</div></div>
                    <div className={styles.infoRow} style={{ fontSize: 17 }}><div className={styles.infoLabel}>Preferences:</div><div className={styles.infoValue}>{Array.isArray(playerProfile?.preferences) ? playerProfile.preferences.join(', ') : playerProfile?.preferences || 'Not set'}</div></div>
                    <div className={styles.infoRow} style={{ fontSize: 17 }}><div className={styles.infoLabel}>Availability:</div><div className={styles.infoValue}>{Array.isArray(playerProfile?.availability) ? playerProfile.availability.join(', ') : playerProfile?.availability || 'Not set'}</div></div>
                    <div className={styles.infoRow} style={{ fontSize: 17 }}><div className={styles.infoLabel}>Location:</div><div className={styles.infoValue}>{playerProfile?.location || 'Not set'}</div></div>
                    <div className={styles.infoRow} style={{ fontSize: 17 }}><div className={styles.infoLabel}>Date of Birth:</div><div className={styles.infoValue}>{playerProfile?.dateOfBirth ? new Date(playerProfile.dateOfBirth).toLocaleDateString() : 'Not set'}</div></div>
                    <div className={styles.infoRow} style={{ fontSize: 17 }}><div className={styles.infoLabel}>Followed Futsals:</div><div className={styles.infoValue}>{Array.isArray(playerProfile?.followedFutsals) && playerProfile.followedFutsals.length > 0 ? playerProfile.followedFutsals.join(', ') : 'None'}</div></div>
                    <div className={styles.infoRow} style={{ fontSize: 17, borderBottom: 'none' }}><div className={styles.infoLabel}>Match History:</div><div className={styles.infoValue}>{Array.isArray(playerProfile?.matchHistory) && playerProfile.matchHistory.length > 0 ? `${playerProfile.matchHistory.length} matches played` : 'No matches played yet'}</div></div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
