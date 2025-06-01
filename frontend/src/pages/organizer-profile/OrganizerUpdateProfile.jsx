import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/UploadPage.module.css';
import { useAuthStore } from '../../store/useAuthStore';

const OrganizerUpdateProfile = () => {
  const { authUser, updateOrganizerProfile, isUpdatingProfile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill form with current data if available (from navigation state or authUser)
  const user = location.state?.user || authUser || {};
  const organizerProfile = location.state?.organizerProfile || {};

  const [formData, setFormData] = useState({
    name: user.username || user.fullName || '',
    phone: user.phoneNumber || '',
    email: user.email || '',
    bio: organizerProfile.bio || '',
    additionalInfo: organizerProfile.additionalInfo || '',
    awards: organizerProfile.awards || '',
    avatar: null,
  });

  useEffect(() => {
    if (isUpdatingProfile) {
      navigate('/profile');
    }
  }, [isUpdatingProfile, navigate]);

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
    await updateOrganizerProfile(data);
  };

  return (
    <div className={styles.body_upload}>
      <div className={styles.container_upload}>
        <div className={styles.profileCard}>
          <h1>Update Organizer Profile</h1>
          {/* Avatar preview with overlay */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer} onClick={() => document.getElementById('avatarInput').click()}>
              <img
                id="avatarPreview"
                src={formData.avatar ? URL.createObjectURL(formData.avatar) : user.avatar || '/default-owner.png'}
                alt="avatar-preview"
              />
              <div className={styles.avatarOverlay}>
                <span className={styles.uploadIcon}>📷</span>
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
            <div className={styles.avatarHint}>Click avatar to change</div>
          </div>
          <form id="organizer-profile-form" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="awards">Awards</label>
                <input type="text" id="awards" name="awards" value={formData.awards} onChange={handleChange} placeholder="Awards, e.g. Best Organizer 2024" />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself, your experience, and achievements..." />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="additionalInfo">Additional Info</label>
              <textarea id="additionalInfo" name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} placeholder="Any extra information you'd like to share..." />
            </div>
            <div className={styles.formActions}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizerUpdateProfile;
