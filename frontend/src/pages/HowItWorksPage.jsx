import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../pages/css/HowItWorks.module.css'

const HowItWorksPage = () => {
  const { logOut } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  return (
    <div>
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <Link to="/"><img src="/firstpage/logo.png" alt="match-logo" /></Link>
          </div>
          <div className={styles.navLinks}>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/about-us" className={`${styles.navLink} `}>About Us</Link>
            <Link to="/how-it-works" className={`${styles.navLink} ${styles.active_page}`}>How It Works</Link>
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
      </div>
      <main>
        {/* How MatchPoint Works Section */}
        <section className={styles.howItWorks}>
          <h1>HOW MATCHPOINT WORKS</h1>
          <p className={styles.description}>
            MatchPoint is a sports matchmaking platform that connects players with similar interests in offline games like futsal, basketball, and more. Whether you're looking for casual matches or competitive local games, MatchPoint helps you find the right team or fill missing spots quickly.
          </p>
        </section>

        {/* Game Match Process Section */}
        <section className={styles.gameMatchProcess}>
          <h2>The Game Match Process</h2>
          <div className={styles.processCards}>
            <div className={styles.processCard}>
              <div className={styles.icon}><img src='/icons/profile-circle.png'/></div>
              <h3>CREATE YOUR PROFILE</h3>
              <p>SET YOUR PREFERRED SPORT, SKILL LEVEL, LOCATION, AND AVAILABILITY.</p>
            </div>
            <div className={styles.processCard}>
              <div className={styles.icon}><img src='/icons/search.png'/></div>
              <h3>FIND GAMES OR TEAMMATES</h3>
              <p>SEARCH LOCAL GAMES OR GET MATCHED WITH NEARBY PLAYERS.</p>
            </div>
            <div className={styles.processCard}>
              <div className={styles.icon}><img src='/icons/calender.png'/></div>
              <h3>JOIN OR HOST MATCHES</h3>
              <p>JOIN GAMES OR CREATE YOUR OWN WITH TIME AND PLAYER SETTINGS.</p>
            </div>
            <div className={styles.processCard}>
              <div className={styles.icon}><img src='/icons/star.png'/></div>
              <h3>PLAY & BUILD CREDIBILITY</h3>
              <p>PLAY, GET RATED, AND GROW YOUR REPUTATION.</p>
            </div>
          </div>
        </section>

        {/* For Players & Organizers Section */}
        <section className={styles.playersOrganizers}>
          <h2>For Players & Organizers</h2>
          <div className={styles.columnsContainer}>
            <div className={`${styles.column} ${styles.playersColumn}`}>
              <h3>For Players</h3>
              <p>Join & Play Instantly</p>
              <p className={styles.description}>
                MatchPoint connects you with like-minded players for your favorite offline sports like futsal, basketball, cricket, and more — no need to plan weeks ahead or coordinate schedules endlessly.
              </p>
              <ul className={styles.featureList}>
                <li><i className="fas fa-paper-plane"></i> Create a detailed sports profile with your preferences</li>
                <li><i className="fas fa-paper-plane"></i> Browse nearby matches actively looking for extra players</li>
                <li><i className="fas fa-paper-plane"></i> Join matches that suit your skill and schedule</li>
                <li><i className="fas fa-paper-plane"></i> Schedule gaming sessions based on your availability</li>
                <li><i className="fas fa-paper-plane"></i> Build your reputation with reviews and ratings</li>
              </ul>
              <button className={styles.ctaButton}>Sign Up as a Player</button>
            </div>
            <div className={`${styles.column} ${styles.organizersColumn}`}>
              <h3>For Organizers</h3>
              <p>Host games & tournaments</p>
              <p className={styles.description}>
                Whether you're managing a futsal arena, weekend games, or organizing community sports events, MatchPoint gives you the tools to make it seamless.
              </p>
              <ul className={styles.featureList}>
                <li><i className="fas fa-paper-plane"></i> Create and manage gaming events of any size</li>
                <li><i className="fas fa-paper-plane"></i> Set up tournaments with automatic bracket generation</li>
                <li><i className="fas fa-paper-plane"></i> Communicate with players through our messaging system</li>
                <li><i className="fas fa-paper-plane"></i> Schedule gaming sessions based on your availability</li>
                <li><i className="fas fa-paper-plane"></i> Build your reputation as a trusted organizer</li>
              </ul>
              <button className={styles.ctaButton}>Sign Up as a Organizer</button>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className={styles.keyFeatures}>
          <h2>Key Features</h2>
          <div className={styles.featureCards}>
            <div className={styles.featureCard}>
              <div className={styles.icon}><img src='icons/trophy.png'></img></div>
              <h3>TOURNAMENTS</h3>
              <p>JOIN LOCAL AND ONLINE TOURNAMENTS, TEAM UP, AND COMPETE TO WIN.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}><img src='icons/bolt.png'></img></div>
              <h3>QUICK JOIN</h3>
              <p>JUMP INTO GAMES THAT NEED PLAYERS. NO WAITING — JUST PICK A SLOT AND PLAY.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}><img src='icons/verifies.png'></img></div>
              <h3>VERIFIED & SECURE</h3>
              <p>PLAY WORRY-FREE WITH VERIFIED USERS, SECURE PAYMENTS, AND GUARANTEED REFUNDS.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}><img src='icons/groud.png'></img></div>
              <h3>BOOK COURTS</h3>
              <p>FIND AND BOOK NEARBY FUTSAL COURTS EASILY — PICK A TIME, CONFIRM, AND YOU'RE SET.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqContainer}>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <div className={styles.indicator}><div className={styles.circle}></div></div>
                <p>What is MatchPoint?</p>
                <i className="fas fa-chevron-right"></i>
              </div>
              <div className={styles.faqAnswer}>
                <p>MatchPoint is a sports matchmaking platform that connects players for local games.</p>
              </div>
            </div>
            <div className={`${styles.faqItem} ${styles.active}`}>
              <div className={styles.faqQuestion}>
                <div className={styles.indicator}><div className={styles.circle}></div></div>
                <p>Is MatchPoint free to use?</p>
                <i className="fas fa-chevron-right"></i>
              </div>
              <div className={styles.faqAnswer}>
                <p>Yes, MatchPoint offers free access to browse and join games. However, certain premium features like priority match recommendations or tournament hosting may require a small fee.</p>
              </div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <div className={styles.indicator}><div className={styles.circle}></div></div>
                <p>Is MatchPoint free to use?</p>
                <i className="fas fa-chevron-right"></i>
              </div>
              <div className={styles.faqAnswer}>
                <p>Yes, basic features are free to use.</p>
              </div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <div className={styles.indicator}><div className={styles.circle}></div></div>
                <p>Can I use MatchPoint for all sports?</p>
                <i className="fas fa-chevron-right"></i>
              </div>
              <div className={styles.faqAnswer}>
                <p>Yes, MatchPoint supports a wide range of sports.</p>
              </div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <div className={styles.indicator}><div className={styles.circle}></div></div>
                <p>Do I need to pay if no matches are played?</p>
                <i className="fas fa-chevron-right"></i>
              </div>
              <div className={styles.faqAnswer}>
                <p>No, you only pay for matches you participate in.</p>
              </div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <div className={styles.indicator}><div className={styles.circle}></div></div>
                <p>Is there a verification process for players?</p>
                <i className="fas fa-chevron-right"></i>
              </div>
              <div className={styles.faqAnswer}>
                <p>Yes, we verify all players for safety and security.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className={styles.footerLinks}>
          <a href="#">About</a>
          <a href="#">Contact Us</a>
          <a href="#">Pricing</a>
          <a href="#">FAQs</a>
          <a href="#">Team</a>
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

export default HowItWorksPage