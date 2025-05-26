import React from 'react';
import styles from '../css/PProfile.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const PlayerProfile = () => {
  const { logOut, authUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();
    navigate('/login');
  };

  if (!authUser) return <div className={styles.loading}>Loading...</div>;

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
        <div className={styles.userActions}>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarMenu}>
            <li><Link to="/player-dashboard">Dashboard</Link></li>
            <li><Link to="#" className={styles.active}>Profile</Link></li>
            <li><Link to="/player-addfriend">Add Friends</Link></li>
            <li><Link to="/player-history">History</Link></li>
            <li><Link to="/player-upcomingmatches">Upcoming Matches</Link></li>
            <li>
              <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </aside>
        <main>
          <div className={styles.profileHeaderRow}>
            <h1>Player Profile</h1>
            <Link to="/update-profile">
              <button className={styles.updateAccountBtn}>Update Account</button>
            </Link>
          </div>
          <div className={styles.profileCard}>
            <div className={styles.profileImage}>
              <div className={styles.circlePlaceholder}>
                <img src={authUser?.avatar || '/avatar.jpg'} alt="profile" />
              </div>
            </div>
            <h2>{authUser?.username}</h2>
            <div className={styles.activeStatus}>
              <span className={styles.dot}></span>
              <span>Active since: {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <p className={styles.bio}>{authUser?.playerProfile?.bio || 'No bio available'}</p>
            <div className={styles.contactInfo}>
              <div><strong>Phone:</strong> {authUser?.phoneNumber || 'Not set'}</div>
              <div><strong>Email:</strong> {authUser?.email || 'Not set'}</div>
            </div>
          </div>
          <div className={styles.personalInfoCard}>
            <div className={styles.cardHeader}><h3>Player Details:</h3></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Skill Level:</div><div className={styles.infoValue}>{authUser?.playerProfile?.skillLevel || 'Not set'}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Preferences:</div><div className={styles.infoValue}>{Array.isArray(authUser?.playerProfile?.preferences) ? authUser.playerProfile.preferences.join(', ') : authUser?.playerProfile?.preferences || 'Not set'}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Availability:</div><div className={styles.infoValue}>{Array.isArray(authUser?.playerProfile?.availability) ? authUser.playerProfile.availability.join(', ') : authUser?.playerProfile?.availability || 'Not set'}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Location:</div><div className={styles.infoValue}>{authUser?.playerProfile?.location || 'Not set'}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Date of Birth:</div><div className={styles.infoValue}>{authUser?.playerProfile?.dateOfBirth ? new Date(authUser.playerProfile.dateOfBirth).toLocaleDateString() : 'Not set'}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Followed Futsals:</div><div className={styles.infoValue}>{Array.isArray(authUser?.playerProfile?.followedFutsals) && authUser.playerProfile.followedFutsals.length > 0 ? authUser.playerProfile.followedFutsals.join(', ') : 'None'}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Match History:</div><div className={styles.infoValue}>{Array.isArray(authUser?.playerProfile?.matchHistory) && authUser.playerProfile.matchHistory.length > 0 ? `${authUser.playerProfile.matchHistory.length} matches played` : 'No matches played yet'}</div></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlayerProfile;
