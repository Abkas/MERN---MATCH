import React, { useEffect, useState } from 'react';
import styles from '../css/OProfile.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';
import { toast } from 'react-hot-toast';
import FutsalNavbar from '../../components/FutsalNavbar'
import OrganizerSidebar from '../../components/OrganizerSidebar';

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
            <div style={{
              background: '#fff',
              border: '1px solid #111',
              borderRadius: 18,
              padding: '2.5rem 2.5rem 2rem 2.5rem',
            marginBottom: 48,
            width: '100%',
            maxWidth: 540,
            minHeight: 340,
            boxShadow: '0 2px 12px #0002',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: '#fff',
              border: '2px solid #111',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src={profile.avatar || '/default-owner.png'}
                alt="profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 2 }}>Name</div>
                  <div style={{ fontSize: 22, color: '#111', fontWeight: 700 }}>{profile.username || profile.fullName || 'demo.organizer'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 2 }}>Email</div>
                  <div style={{ color: '#111', fontSize: 16 }}>{profile.email || 'demo.organizer@example.com'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 2 }}>Phone</div>
                  <div style={{ color: '#111', fontSize: 16 }}>{profile.phoneNumber || '+1234567890'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 2 }}>Role</div>
                  <div style={{ color: '#111', fontSize: 16 }}>{profile.role || 'organizer'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 2 }}>Verified</div>
                  <div style={{ color: orgProfile.isVerified ? '#10b981' : '#e74c3c', fontWeight: 700, fontSize: 15 }}>
                    {orgProfile.isVerified ? 'Verified Organizer' : 'Not Verified'}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 2 }}>Bio</div>
                <div style={{ fontSize: 15, color: '#111', background: '#fff', border: '1px solid #111', borderRadius: 8, padding: '1rem 1.2rem', marginTop: 2, minHeight: 48 }}>{orgProfile.bio || 'This is a demo bio for the organizer. Showcase your experience and achievements here.'}</div>
              </div>
            </div>
          </div>
          <button
            className={styles.updateProfileBtn}
            style={{
              marginTop: 24,
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.9rem 2.2rem',
              fontWeight: 700,
              fontSize: '1.08rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0001',
              letterSpacing: 0.5,
              transition: 'background 0.2s',
            }}
            onClick={() => navigate('/organizer-update-profile', { state: { user, organizerProfile } })}
          >            Update Profile
          </button>
        </main>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
