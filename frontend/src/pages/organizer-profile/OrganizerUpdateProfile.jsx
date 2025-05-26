import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/UploadPage.module.css';
import { useAuthStore } from '../../store/useAuthStore';

const OrganizerUpdateProfile = () => {
  const { authUser, updateOrganizerProfile, isUpdatingProfile } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: authUser?.name || '',
    phone: authUser?.phone || '',
    email: authUser?.email || '',
    bio: '',
    additionalInfo: '',
    awards: '',
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
          <h1>Update Profile</h1>
          <form id="organizer-profile-form" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone</label>
              <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="additionalInfo">Additional Info</label>
              <textarea id="additionalInfo" name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="awards">Awards</label>
              <input type="text" id="awards" name="awards" value={formData.awards} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="avatar">Avatar</label>
              <input type="file" id="avatar" name="avatar" accept="image/*" onChange={e => setFormData(prev => ({ ...prev, avatar: e.target.files[0] }))} />
            </div>
            <button className={styles.updateBtn} type="submit">
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizerUpdateProfile;
