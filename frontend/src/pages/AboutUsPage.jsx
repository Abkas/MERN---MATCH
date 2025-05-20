import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../pages/css/AboutUsPage.module.css'


const AboutUsPage = () => {
  const { logOut } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  return (
    <div>
      <div className= {styles.mainheader
      }>
        <nav className={styles.navbar}>
                <div className={styles.logo}>
                  <Link to="/"><img src="/firstpage/logo.png" alt="match-logo" /></Link>
                </div>
                <div className={styles.navLinks}>
                  <Link to="/" className={styles.navLink}>Home</Link>
                  <Link to="/about-us" className={`${styles.navLink} ${styles.active_page}`}>About Us</Link>
                  <Link to="/how-it-works" className={styles.navLink}>How It Works</Link>
                </div>
                <div className={styles.navProfileLogout}>
                  <Link to="/player-profile" title="Profile" className={styles.profileLink}>
                    <User size={28} style={{ verticalAlign: 'middle' }} />
                  </Link>
                  <button className={styles.btnLogout} onClick={handleLogout}>
                    <LogOut size={22} style={{ verticalAlign: 'middle' }} />
                    <span style={{ fontWeight: 500 }}>Logout</span>
                  </button>
                  </div>
              </nav>
            <section >
              <div className={styles.photocontainer}>
                <div className={styles.heroContent}>
                  <img src="/aboutus/image-group.png" alt="Team of professionals" className={styles.heroImage} />
                </div>
              </div>
            </section>
      </div>

      <section className={styles.ourStory}>
        <div className={styles.container}   >
          <h2>Our Story</h2>
          <p>
            We started MeetOffice to solve a common problem – a gap in the offering across the board in marketing and design.
            We wanted to create a company that could deliver high-quality work at a reasonable cost, without the bureaucracy
            that often comes with larger agencies. Our team has over 15 years of combined experience in design, marketing, and development.
            We're passionate about helping businesses of all sizes achieve their goals through effective design and marketing strategies.
          </p>
        </div>
      </section>

      <section className={styles.team}>
        <div className={styles.container}>
          <h2>Meet Our Members</h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/Snapchat-790029509.jpg" alt="Team member"/>
              </div>
              <h3>Shreya Tiwari</h3>
              <p>Frontend Developer</p>
              <div className={styles.socialLinks}>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                <a href="#"><i className="fab fa-dribbble"></i></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/sc.jpeg" alt="Team member"/>
              </div>
              <h3>Samir Chand</h3>
              <p>Researcher</p>
              <div className={styles.socialLinks}>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                <a href="#"><i className="fab fa-dribbble"></i></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/k.k.jpeg" alt="Team member"/>
              </div>
              <h3>Kashmita Koirala</h3>
              <p>Frontend Developer</p>
              <div className={styles.socialLinks}>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                <a href="#"><i className="fab fa-dribbble"></i></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/am.jpeg" alt="Team member"/>
              </div>
              <h3>Abhisek Magar</h3>
              <p>Backend Developer</p>
              <div className={styles.socialLinks}>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                <a href="#"><i className="fab fa-dribbble"></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>We're Always Looking For Talented People For Our Agency</h2>
            <button className={styles.btnCta}>Join Us</button>
          </div>
          <div className={styles.ctaDecoration}>
            <div className={`${styles.dot} ${styles.dot1}`}></div>
            <div className={`${styles.dot} ${styles.dot2}`}></div>
            <div className={`${styles.dot} ${styles.dot3}`}></div>
            <div className={styles.rocket}>🚀</div>
          </div>
        </div>
      </section>

      <section className={styles.works}>
        <div className={styles.container}>
          <h2>Other works</h2>
          <div className={styles.worksGrid}>
            <div className={styles.workCard}>
              <h3>Startup Framework</h3>
              <p>Looking for a designer to create a professional website for your startup? We can help you create a stunning website that will help you stand out.</p>
              <button className={`${styles.btn} ${styles.btnOutline}`}>Explore</button>
            </div>
            <div className={`${styles.workCard} ${styles.purple}`}>
              <h3>Mobile X</h3>
              <p>We can help you create a mobile app that will help you reach your customers on the go. Our team of developers will work with you to create a custom solution.</p>
              <button className={`${styles.btn} ${styles.btnOutline}`}>Explore</button>
            </div>
            <div className={`${styles.workCard} ${styles.imageCard}`}>
              <div className={styles.cardOverlay}>
                <h3>Photoshop</h3>
                <p>Need help with photo editing or graphic design? Our team of designers can help you create stunning visuals for your brand.</p>
                <button className={`${styles.btn} ${styles.btnOutline}`}>Explore</button>
              </div>
            </div>
          </div>
        </div>
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

export default AboutUsPage