import React, { useState , useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../pages/css/UploadPage.module.css';
import { useAuthStore } from '../store/useAuthStore'; 

const UpdateProfile = () => {
    const { authUser, updatePlayerProfile, isUpdatingProfile} = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        phoneNumber: '',
        bio: '',
        skillLevel: '',
        location: '',
        preferences: '',
        availability: '',
        dateOfBirth: ''
    });

    useEffect(() => {
        if (isUpdatingProfile) {
          // Only navigate after update is done (isUpdatingProfile goes false after update)
          navigate('/player-profile');
        }
      }, [isUpdatingProfile, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Only send fields that are not empty
        let data = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== '' && value !== undefined && value !== null) {
                data[key] = value;
            }
        });
        await updatePlayerProfile(data);
    };

  return (
    <div className={styles.body_upload}>
      <div className={styles.container_upload}>
        <div className={styles.profileCard}>
          <h1>Update Profile</h1>
          <form id="profile-form" onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="full-name">Full Name</label>
                <input type="text" id="full-name" name="fullName" value={formData.fullName || authUser.playerProfile.fullName} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phoneNumber" value={formData.phoneNumber || authUser.phoneNumber} onChange={handleChange} pattern="[0-9]{10}" placeholder="10 digits" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" rows="4" value={formData.bio || authUser.playerProfile.bio} onChange={handleChange}></textarea>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="skill-level">Skill Level</label>
              <select id="skill-level" name="skillLevel" value={formData.skillLevel || authUser.playerProfile.skillLevel} onChange={handleChange}>
                <option value="" disabled>Select your skill level</option>
                <option value="beginner">Beginner</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input type="text" id="location" name="location" value={formData.location || authUser.playerProfile.location} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="preferences">Preferences</label>
              <select id="preferences" name="preferences" value={formData.preferences || authUser.playerProfile.preferences} onChange={handleChange}>
                <option value="" disabled>Select your preferences</option>
                <option value="casual">Casual</option>
                <option value="competitive">Competitive</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="availability">Availability</label>
              <select id="availability" name="availability" value={formData.availability || authUser.playerProfile.availability} onChange={handleChange}>
                <option value="" disabled>Select your availability</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="Weekdays and Weekends">Weekdays and Weekends</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth || authUser.playerProfile.dateOfBirth} onChange={handleChange} />
            </div>

            <div className={styles.formActions}>
              <Link to="/player-profile" className={styles.btn + ' ' + styles.btnSecondary}>Cancel</Link>
              <button type="submit" className={styles.btn + ' ' + styles.btnPrimary}>Update Profile</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;