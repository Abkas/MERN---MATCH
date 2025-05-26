import React, { useEffect, useState } from 'react';
import styles from '../css/OProfile.module.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';

const OrganizerProfile = () => {
  const { logOut, authUser, updateOrganizerProfile } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const url = id ? `/organizer/profile/${id}` : '/organizer/profile';
        const res = await axiosInstance.get(url);
        if (res.data.success && res.data.data) {
          setOrganizer(res.data.data);
          if (!id) updateOrganizerProfile(res.data.data);
        }
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizer();
  }, [navigate, updateOrganizerProfile, id]);

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
          <div className={styles.blueprintCard + ' ' + styles.blueprintLarge}>
            <h2 style={{fontSize: '2.2rem', marginBottom: '1.5rem'}}>Organizer Profile Preview</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '2rem'}}>This is how your profile will look after setup. All sections are shown as they will appear when filled in.</p>
            <div className={styles.profileCard + ' ' + styles.profileCardLarge}>
              <div className={styles.profileImage} style={{width: '160px', height: '160px', margin: '0 auto 2rem auto'}}>
                <img
                  src={authUser?.avatar || '/default-owner.png'}
                  alt="profile preview"
                  style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}}
                />
              </div>
              <h2 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{authUser?.name || 'Name not set'}</h2>
              <div className={styles.activeStatus} style={{marginBottom: '1.2rem'}}>
                <span className={styles.dot}></span>
                <span>Active since: {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <p className={styles.bio} style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>{'No bio available'}</p>
              <div className={styles.contactInfo} style={{fontSize: '1.1rem', marginBottom: '2rem'}}>
                <div><strong>Phone:</strong> {authUser?.phone || 'Not set'}</div>
                <div><strong>Email:</strong> {authUser?.email || 'Not set'}</div>
                <div><strong>Additional Info:</strong> {'None'}</div>
              </div>
            </div>
            <div className={styles.personalInfoCard + ' ' + styles.personalInfoCardLarge}>
              <div className={styles.cardHeader}><h3 style={{fontSize: '1.3rem'}}>Organizer Details:</h3></div>
              <div className={styles.infoRow}><div className={styles.infoLabel}>Futsals Managed:</div><div className={styles.infoValue}>0</div></div>
              <div className={styles.infoRow}><div className={styles.infoLabel}>Tournaments Hosted:</div><div className={styles.infoValue}>0</div></div>
              <div className={styles.infoRow}><div className={styles.infoLabel}>Awards:</div><div className={styles.infoValue}>{authUser?.organizerProfile?.awards || 'None'}</div></div>
              <div className={styles.infoRow}><div className={styles.infoLabel}>Verification Status:</div><div className={styles.infoValue}>Not Verified</div></div>
            </div>
            <div style={{marginTop: '2.5rem'}}>
              <p style={{fontSize: '1.1rem'}}>Click below to update your profile:</p>
              <Link to="/organizer-update-profile">
                <button className={styles.updateAccountBtn} style={{fontSize: '1.1rem', padding: '1rem 2.5rem'}}>Update Profile</button>
              </Link>
            </div>
          </div>
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
        <div className={styles.userActions}>
          {authUser?.role === 'organizer' && !id && (
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          )}
        </div>
      </header>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarMenu}>
            {authUser?.role === 'organizer' && !id && (
              <>
                <li><Link to="/organizer-dashboard">Dashboard</Link></li>
                <li><Link to="#" className={styles.active}>Profile</Link></li>
                <li><Link to="/organizer-futsals">My Futsal</Link></li>
                <li><Link to="/organizer-history">History</Link></li>
                <li><Link to="/organizer-slots">Manage Slots</Link></li>
              </>
            )}
          </ul>
        </aside>
        <main>
          <div className={styles.profileHeaderRow}>
            <h1>Organizer Profile</h1>
            {authUser?.role === 'organizer' && !id && (
              <Link to="/organizer-update-profile">
                <button className={styles.updateAccountBtn}>Update Account</button>
              </Link>
            )}
          </div>
          <div className={styles.profileCard}>
            <div className={styles.profileImage}>
              <img src={organizer?.user?.avatar || '/default-owner.png'} alt="profile" />
            </div>
            <h2>{organizer?.name || 'Name not set'}</h2>
            <div className={styles.activeStatus}>
              <span className={styles.dot}></span>
              <span>Active since: {organizer?.createdAt ? new Date(organizer.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <p className={styles.bio}>{organizer?.bio || 'No bio available'}</p>
            <div className={styles.contactInfo}>
              <div><strong>Phone:</strong> {organizer?.phone || 'Not set'}</div>
              <div><strong>Email:</strong> {organizer?.email || 'Not set'}</div>
              <div><strong>Additional Info:</strong> {organizer?.additionalInfo || 'None'}</div>
            </div>
          </div>
          <div className={styles.personalInfoCard}>
            <div className={styles.cardHeader}><h3>Organizer Details:</h3></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Futsals Managed:</div><div className={styles.infoValue}>{organizer?.futsals?.length || 0}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Tournaments Hosted:</div><div className={styles.infoValue}>{organizer?.tournaments?.length || 0}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Awards:</div><div className={styles.infoValue}>{organizer?.awards || 'None'}</div></div>
            <div className={styles.infoRow}><div className={styles.infoLabel}>Verification Status:</div><div className={styles.infoValue}>{organizer?.isVerified ? 'Verified' : 'Not Verified'}</div></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizerProfile;
