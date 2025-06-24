import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/UploadPage.module.css';
import sidebarStyles from '../css/OSidebar.module.css';
import { useAuthStore } from '../../store/useAuthStore';
import FutsalNavbar from '../../components/FutsalNavbar';
import PlayerSidebar from '../../components/PlayerSidebar';

const PlayerUpdateProfile = () => {
  const { authUser, updatePlayerProfile, isUpdatingProfile } = useAuthStore();
  const navigate = useNavigate();

  // Pre-fill form with current data if available
  const user = authUser || {};
  const playerProfile = user.playerProfile || {};

  const [formData, setFormData] = useState({
    username: user.username || '',
    fullName: user.fullName || '',
    phoneNumber: user.phoneNumber || '',
    bio: playerProfile.bio || '',
    skillLevel: playerProfile.skillLevel || '',
    location: playerProfile.location || '',
    preferences: playerProfile.preferences || '',
    availability: playerProfile.availability || '',
    dateOfBirth: playerProfile.dateOfBirth ? playerProfile.dateOfBirth.substring(0, 10) : '',
    avatar: null,
  });

  // Sync formData with latest user/playerProfile if they change
  useEffect(() => {
    setFormData({
      username: user.username || '',
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      bio: playerProfile.bio || '',
      skillLevel: playerProfile.skillLevel || '',
      location: playerProfile.location || '',
      preferences: playerProfile.preferences || '',
      availability: playerProfile.availability || '',
      dateOfBirth: playerProfile.dateOfBirth ? playerProfile.dateOfBirth.substring(0, 10) : '',
      avatar: null,
    });
  }, [user, playerProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    setFormData((prev) => ({ ...prev, avatar: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        data[key] = value;
      }
    });
    await updatePlayerProfile(data);
    navigate('/profile'); // Redirect to profile page after update
  };

  return (
    <div className={styles.body} style={{ width: '100vw', margin: 0, padding: 0 }}>
      <FutsalNavbar />
      <div className={styles.container} style={{ width: '100vw', margin: 0, padding: 0, display: 'flex', alignItems: 'stretch', minHeight: '100vh' }}>
        <div style={{ height: '100vh', minHeight: '100%', position: 'sticky', top: 0, left: 0, zIndex: 100 }}>
          <PlayerSidebar style={{ marginTop: 0, height: '100%', minHeight: '100vh' }} />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <main className={styles.main} style={{ width: '100%', maxWidth: '1200px', padding: '0 20px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 65px)', marginTop: '88px' }}>
            <h1 className={styles.pageTitle}>Update Your Profile</h1>
            
            <div className={styles.updateProfileContainer}>
              <form id="player-profile-form" onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div className={styles.formGroup} style={{ alignItems: 'center', marginBottom: 18, display: 'flex', flexDirection: 'column' }}>
                  <label htmlFor="avatar" style={{ fontWeight: 600, color: '#232946', marginBottom: 10, fontSize: '1.15rem' }}>Avatar</label>
                  <div className={styles.avatarContainer} style={{ width: 144, height: 144, border: '3px solid #a5b4fc', boxShadow: '0 2px 12px #6366f122', cursor: 'pointer', marginBottom: 10, background: '#f1f5f9' }} onClick={() => document.getElementById('avatarInput').click()}>
                    <img
                      id="avatarPreview"
                      src={formData.avatar ? URL.createObjectURL(formData.avatar) : user.avatar || '/avatar.jpg'}
                      alt="avatar-preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                    <div className={styles.avatarOverlay} style={{ borderRadius: '50%' }}>
                      <span className={styles.uploadIcon} style={{ fontSize: 26, color: '#6366f1' }}>📷</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="avatarInput"
                    name="avatar"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <span className={styles.avatarHint} style={{ fontSize: 13, color: '#64748b' }}>Click avatar to change</span>
                </div>
                <div style={{ marginBottom: 14, fontWeight: 700, color: '#6366f1', fontSize: '1.15rem', letterSpacing: 0.5 }}>Basic Info</div>
                <div className={styles.formRow} style={{ gap: 32 }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your username" style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }} />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label htmlFor="fullName">Full Name</label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }} />
                  </div>
                </div>
                <div className={styles.formRow} style={{ gap: 32 }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} pattern="[0-9]{10}" placeholder="10 digits" style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }} />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }} />
                  </div>
                </div>
                <div style={{ marginBottom: 14, fontWeight: 700, color: '#6366f1', fontSize: '1.15rem', letterSpacing: 0.5 }}>Player Details</div>
                <div className={styles.formGroup}>
                  <label htmlFor="bio">Bio</label>
                  <textarea id="bio" name="bio" rows="3" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." style={{ minHeight: 90, fontSize: 16, padding: '12px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }}></textarea>
                </div>
                <div className={styles.formRow} style={{ gap: 32 }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label htmlFor="skillLevel">Skill Level</label>
                    <select id="skillLevel" name="skillLevel" value={formData.skillLevel} onChange={handleChange} style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }}>
                      <option value="" disabled>Select your skill level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label htmlFor="location">Location</label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Enter your location" style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }} />
                  </div>
                </div>
                <div className={styles.formRow} style={{ gap: 32 }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label htmlFor="preferences">Preferences</label>
                    <select id="preferences" name="preferences" value={formData.preferences} onChange={handleChange} style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }}>
                      <option value="" disabled>Select your preferences</option>
                      <option value="casual">Casual</option>
                      <option value="competitive">Competitive</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label htmlFor="availability">Availability</label>
                    <select id="availability" name="availability" value={formData.availability} onChange={handleChange} style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc' }}>
                      <option value="" disabled>Select your availability</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="Weekdays and Weekends">Weekdays and Weekends</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formActions} style={{ justifyContent: 'center', gap: 32, marginTop: 40 }}>
                  <button className={styles.btn + ' ' + styles.btnSecondary} type="button" onClick={() => navigate(-1)} style={{ minWidth: 130, fontSize: 16, borderRadius: 8, padding: '10px 0' }}>
                    Cancel
                  </button>
                  <button className={styles.btn + ' ' + styles.btnPrimary} type="submit" disabled={isUpdatingProfile} style={{ minWidth: 180, fontWeight: 700, fontSize: 16, borderRadius: 8, padding: '10px 0' }}>
                    {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PlayerUpdateProfile;
