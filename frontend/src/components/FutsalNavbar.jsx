import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../pages/css/FutsalHome.module.css';
import { useAuthStore } from '../store/useAuthStore';

const FutsalNavbar = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to check if the current path matches
  const isActive = (path) => location.pathname === path;

  // Handler for burger menu
  const handleBurgerClick = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  // Handler for profile icon click
  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/profile');
  };

  return (
    <nav>
      <div className={styles['navbar-container']}>
        <div className={styles.burger} onClick={handleBurgerClick}>
          <span className={menuOpen ? styles.burgerOpen : ''}></span>
          <span className={menuOpen ? styles.burgerOpen : ''}></span>
          <span className={menuOpen ? styles.burgerOpen : ''}></span>
        </div>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/firstpage/logo.png" alt="match-logo" />
          </Link>
        </div>
        <div className={styles.matchPoint}>MatchPoint</div>
        <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ''}`}>
          <li><Link to="/futsalhome" className={isActive('/futsalhome') ? styles.active : ''} onClick={closeMenu}>Home</Link></li>
          <li><Link to="/bookfutsal" className={isActive('/bookfutsal') ? styles.active : ''} onClick={closeMenu}>Book Futsal</Link></li>
          <li><Link to="/tournaments" className={isActive('/tournaments') ? styles.active : ''} onClick={closeMenu}>Tournaments</Link></li>
          <li><Link to="/quickmatch" className={isActive('/quickmatch') ? styles.active : ''} onClick={closeMenu}>Quick Match</Link></li>
        </ul>
        <div className={styles.navIcons}>
          <div className={styles.notification}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div className={styles.profile} onClick={handleProfileClick}>
            <Link t   o="/profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FutsalNavbar;