import React from 'react'
import styles from '../pages/css/HomePage.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'


const HomePage = () => {
  const { logOut, authUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = (type) => {
    navigate('/login')
  }

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  return (
    <div>
      <div className={styles.hero}>
        {/* Hero background should be first */}
        <div className={styles.heroBg}>
          <img src="/firstpage/rectangle-2570.png" alt="Background" />
        </div>
        {/* Navigation */}
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <Link to="/"><img src="/firstpage/logo.png" alt="match-logo" /></Link>
          </div>
          <div className={styles.navLinks}>
            <Link to="/" className={styles.active}>Home</Link>
            <Link to="/about-us">About Us</Link>
            <Link to="/how-it-works">How It Works</Link>
          </div>
          <div className={styles.navProfileLogout}>
            {authUser ? (
              <>
                <Link to="/profile" title="Profile" className={styles.profileLink}>
                  <User size={28} style={{ verticalAlign: 'middle' }} />
                </Link>
                <button className={styles.btnLogout} onClick={handleLogout}>
                  <LogOut size={22} style={{ verticalAlign: 'middle' }} />
                  <span style={{ fontWeight: 500 }}>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className={styles.btnSignup} style={{
                  padding: '10px 25px',
                  borderRadius: 30,
                  border: '2px solid #111',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  color: '#111',
                  marginRight: 8,
                  transition: 'all 0.2s',
                  boxShadow: 'none',
                  textDecoration: 'none',
                }}
                onMouseOver={e => { e.target.style.backgroundColor = '#111'; e.target.style.color = '#fff'; }}
                onMouseOut={e => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#111'; }}
                >
                  Sign Up
                </Link>
                <Link to="/login" className={styles.btnLogin} style={{
                  padding: '10px 25px',
                  borderRadius: 30,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  backgroundColor: '#111',
                  color: '#fff',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseOver={e => { e.target.style.backgroundColor = '#333'; }}
                onMouseOut={e => { e.target.style.backgroundColor = '#111'; }}
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </nav>
        {/* Hero Content */}
        <div className={styles.heroContent}>
          <h1>Where Games Begin &<br />Teams Unite</h1>
          <button
            className={styles.btnFindGames}
            onClick={() => {
              const section = document.getElementById('popularGamesSection');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Find Games
          </button>
        </div>
      </div>

      <section className={styles.features}>
        <h2>Everything You Need For Gaming Matchmaking</h2>
        <p className={styles.subtitle}>
          Our platform provides all the tools you need to find teammates, join tournaments,<br />
          and elevate your gaming experience.
        </p>
        <div className={styles.featureCards}>
          <div className={styles.featureCard}>
            <div className={styles.iconTrophy}>
              <img src="/firstpage/mdi-light-trophy0.svg" alt="Trophy" />
            </div>
            <h3>TOURNAMENTS</h3>
            <p>PARTICIPATE IN EXCITING TOURNAMENTS TEAM UP AND COMPETE TO WIN</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconSearch}>
              <img src="/firstpage/group0.svg" alt="Search" />
            </div>
            <h3>QUICK JOIN</h3>
            <p>FIND AVAILABLE GAMES AND PLAYERS, NO WAITING — JOIN PICK UP GAMES AND PLAY</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconShield}>
              <img src="/firstpage/material-symbols-light-verified-user-outline-rounded0.svg" alt="Shield" />
            </div>
            <h3>VERIFIED & SECURE</h3>
            <p>PLAY WORRY-FREE WITH VERIFIED USERS, SECURE PAYMENTS, AND TRUSTED VENUES</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconCourt}>
              <img src="/firstpage/group1.svg" alt="Court" />
            </div>
            <h3>BOOK COURTS</h3>
            <p>FIND AND BOOK NEARBY FUTSAL COURTS EASILY — PICK A TIME, RESERVE, AND PLAY</p>
          </div>
        </div>
      </section>

      <section className={styles.trustedBy}>
        <p>Trusted by 2000+ users</p>
        <div className={styles.partnerLogos}>
          <img src="/firstpage/walmart-index-only-svg1.svg" alt="Walmart" />
          <img src="/firstpage/cisco-svg1.svg" alt="Cisco" />
          <img src="/firstpage/volvo-logo.svg" alt="Volvo" />
          <img src="/firstpage/deloitte-svg1.svg" alt="Deloitte" />
          <img src="/firstpage/okta-svg1.svg" alt="Okta" />
        </div>
      </section>

      <section id="popularGamesSection" className={styles.popularGames}>
        <h2>Popular Games</h2>
        <div className={styles.gameCards}>
          <Link to="/futsalhome" className={styles.gameCard}>
            <div className={styles.gameCardInner}>
              <img src="/firstpage/rectangle-2740.png" alt="Soccer" />
            </div>
          </Link>
          <div className={`${styles.gameCard} ${styles.disabledGameCard}`}
            tabIndex={0}
          >
            <div className={styles.gameCardInner}>
              <span className={styles.comingSoonInfo} style={{opacity: 1}}>Coming Soon</span>
              <img src="/firstpage/rectangle-2750.png" alt="Basketball" />
            </div>
          </div>
          <div className={`${styles.gameCard} ${styles.disabledGameCard}`}
            tabIndex={0}
          >
            <div className={styles.gameCardInner}>
              <span className={styles.comingSoonInfo} style={{opacity: 1}}>Coming Soon</span>
              <img src="/firstpage/rectangle-2760.png" alt="Volleyball" />
            </div>
          </div>
        </div>
        <button className={styles.btnMoreGames}>More Games</button>
      </section>

      <section className={styles.moments}>
        <h2>Cherished Moments</h2>
        <div className={styles.momentsGrid}>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-060.png" alt="Soccer player kicking ball" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-050.png" alt="Futsal match" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-040.png" alt="Indoor volleyball" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-030.png" alt="Tennis balls" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-020.png" alt="Team photo" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-010.png" alt="Basketball dunk" />
          </div>
        </div>
      </section>

      <section className={styles.social}>
        <h2>Follow Us</h2>
        <div className={styles.socialIcons}>
          <a href="#"><img className="fab fa-twitter" src='/signup/twitter-icon.png'/></a>
          <a href="#"><img className="fab fa-facebook-f" src='/signup/facebook-icon.png'/></a>
          <a href="#"><img className="fab fa-pinterest-p"  src='/signup/pinterest-icon.png'/></a>
          <a href="#"><img className="fab fa-instagram" src='/signup/instagram-icon.png'/></a>
          <a href="#"><img className="fab fa-behance" src='/signup/behance-icon.png'/></a>
          <a href="#"><img className="fab fa-dribbble" src='/signup/dribbble-icon.png'/></a>
        </div>
      </section>

      <section className={styles.testimonials}>
        <h2>Testimonials</h2>
        <div className={styles.testimonialCards}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialProfile}>
              <img src="/firstpage/userpic0.svg" alt="Profile 1" />
            </div>
            <p className={styles.testimonialText}>Match Point has made it so easy to find and book futsal tournaments effortlessly. Connecting from players from near and far has been amazing.</p>
            <p className={styles.testimonialName}>SAMUEL JOHNSON</p>
            <p className={styles.testimonialTitle}>Community Tournament User</p>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialProfile}>
              <img src="/firstpage/userpic1.svg" alt="Profile 2" />
            </div>
            <p className={styles.testimonialText}>Booking fields is incredibly easy to fill our futsal team last minute. Finding matches has been a full-squad and an awesome game!</p>
            <p className={styles.testimonialName}>JASMINE ANDREWS</p>
            <p className={styles.testimonialTitle}>Regular Player</p>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialProfile}>
              <img src="/firstpage/userpic2.svg" alt="Profile 3" />
            </div>
            <p className={styles.testimonialText}>Formed a basketball court, joined a match quickly, and made lasting ties since joining. The app brings players of all skill levels together.</p>
            <p className={styles.testimonialName}>MICHAEL LAWRENCE</p>
            <p className={styles.testimonialTitle}>Casual Sportsman</p>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialProfile}>
              <img src="/firstpage/userpic3.svg" alt="Profile 4" />
            </div>
            <p className={styles.testimonialText}>The verified & reliable platform to manage our entire team's weekly games. All event coordination is streamlined and every verified player.</p>
            <p className={styles.testimonialName}>SARAH WILLIAMS</p>
            <p className={styles.testimonialTitle}>Team Captain</p>
          </div>
        </div>
        <button className={styles.btnMoreTestimonials}>More Happy Customers</button>
      </section>

      <footer>
        <div className={styles.footerLinks}>
          <Link to="#">About</Link>
          <Link to="#">Contact Us</Link>
          <Link to="#">Privacy</Link>
          <Link to="#">FAQs</Link>
          <Link to="#">Terms</Link>
        </div>
        <div className={styles.socialLinks}>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
        </div>
      </footer>
    </div>
  )
}


export default HomePage