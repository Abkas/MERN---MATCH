import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Users, Star } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../pages/css/HowItWorks.module.css'

const HowItWorksPage = () => {
  const { logOut } = useAuthStore()
  const navigate = useNavigate()
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [showAllProcesses, setShowAllProcesses] = useState(false)
  const [activeFaqIndex, setActiveFaqIndex] = useState(null)

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  const handleLogin = (type) => {
    if (type === 'player') {
      navigate('/player-login')
    } else if (type === 'organizer') {
      navigate('/organizer-login')
    }
  }

  const processes = [
    {
      icon: '/icons/profile-circle.png',
      title: 'CREATE YOUR PROFILE',
      description: 'SET YOUR PREFERRED SPORT, SKILL LEVEL, LOCATION, AND AVAILABILITY.'
    },
    {
      icon: '/icons/search.png',
      title: 'FIND TEAMS',
      description: 'SEARCH LOCAL GAMES OR GET MATCHED WITH NEARBY PLAYERS.'
    },
    {
      icon: '/icons/calender.png',
      title: 'JOIN OR HOST MATCHES',
      description: 'JOIN GAMES OR CREATE YOUR OWN WITH TIME AND PLAYER SETTINGS.'
    },
    {
      icon: '/icons/star.png',
      title: 'PLAY & BUILD CREDIBILITY',
      description: 'PLAY, GET RATED, AND GROW YOUR REPUTATION.'
    },
    {
      icon: '/icons/trophy.png',
      title: 'COMPETE IN TOURNAMENTS',
      description: 'PARTICIPATE IN LOCAL TOURNAMENTS AND WIN EXCITING PRIZES.'
    },
    {
      icon: '/icons/bolt.png',
      title: 'QUICK MATCHMAKING',
      description: 'GET INSTANTLY MATCHED WITH PLAYERS OF SIMILAR SKILL LEVELS.'
    }
  ]

  const features = [
    {
      icon: 'icons/trophy.png',
      title: 'TOURNAMENTS',
      description: 'JOIN LOCAL AND ONLINE TOURNAMENTS, TEAM UP, AND COMPETE TO WIN.'
    },
    {
      icon: 'icons/bolt.png',
      title: 'QUICK JOIN',
      description: 'JUMP INTO GAMES THAT NEED PLAYERS. NO WAITING — JUST PICK A SLOT AND PLAY.'
    },
    {
      icon: 'icons/verifies.png',
      title: 'VERIFIED',
      description: 'PLAY WORRY-FREE WITH VERIFIED USERS, SECURE PAYMENTS, AND GUARANTEED REFUNDS.'
    },
    {
      icon: 'icons/groud.png',
      title: 'BOOK COURTS',
      description: 'FIND AND BOOK NEARBY FUTSAL COURTS EASILY — PICK A TIME, CONFIRM, AND YOU\'RE SET.'
    },
    {
      icon: 'icons/star.png',
      title: 'PREMIUM',
      description: 'ACCESS EXCLUSIVE FEATURES AND PRIORITY MATCHMAKING FOR AN ENHANCED EXPERIENCE.'
    },
    {
      icon: 'icons/profile-circle.png',
      title: 'PROFILES',
      description: 'CREATE AND CUSTOMIZE YOUR PLAYER PROFILE WITH STATS AND ACHIEVEMENTS.'
    }
  ]

  const faqs = [
    {
      question: "What is MatchPoint?",
      answer: "MatchPoint is a sports matchmaking platform that connects players for local games. It helps you find teammates, join matches, and organize sports events in your area."
    },
    {
      question: "Is MatchPoint free to use?",
      answer: "Yes, MatchPoint offers free access to browse and join games. However, certain premium features like priority match recommendations or tournament hosting may require a small fee."
    },
    {
      question: "Can I use MatchPoint for all sports?",
      answer: "Yes, MatchPoint supports a wide range of sports including futsal, basketball, cricket, and more. You can find matches and teammates for any sport available in your area."
    },
    {
      question: "Do I need to pay if no matches are played?",
      answer: "No, you only pay for matches you participate in. There are no hidden fees or charges for unused services."
    },
    {
      question: "Is there a verification process for players?",
      answer: "Yes, we verify all players for safety and security. This includes profile verification, player ratings, and a community-driven review system to ensure a trustworthy environment."
    }
  ]

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index)
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
            <Link to="/profile" title="Profile" className={styles.profileLink}>
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
            {processes.slice(0, showAllProcesses ? processes.length : 3).map((process, index) => (
              <div 
                key={index} 
                className={`${styles.processCard} ${index >= 3 ? styles.fadeInProcess : ''}`}
              >
                <div className={styles.icon}>
                  <img src={process.icon} alt={process.title} />
                </div>
                <h3>{process.title}</h3>
                <p>{process.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.seeMoreContainer}>
            <button 
              className={styles.seeMoreButton}
              onClick={() => setShowAllProcesses(!showAllProcesses)}
            >
              {showAllProcesses ? 'Show Less' : 'See More Steps'}
            </button>
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
              <button
                className={styles.loginButton}
                onClick={() => handleLogin('player')}
              >
                <Users size={20} />
                Login as Player
              </button>
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
              <button
                className={styles.loginButton}
                onClick={() => handleLogin('organizer')}
              >
                <Star size={20} />
                Login as Organizer
              </button>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className={styles.keyFeatures}>
          <h2>Key Features</h2>
          <div className={styles.featureCards}>
            {features.slice(0, showAllFeatures ? features.length : 3).map((feature, index) => (
              <div 
                key={index} 
                className={`${styles.featureCard} ${index >= 3 ? styles.fadeInFeature : ''}`}
              >
                <div className={styles.icon}>
                  <img src={feature.icon} alt={feature.title} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.seeMoreContainer}>
            <button 
              className={styles.seeMoreButton}
              onClick={() => setShowAllFeatures(!showAllFeatures)}
            >
              {showAllFeatures ? 'Show Less' : 'See More Features'}
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`${styles.faqItem} ${activeFaqIndex === index ? styles.active : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className={styles.faqQuestion}>
                  <div className={styles.indicator}>
                    <div className={styles.circle}></div>
                  </div>
                  <p>{faq.question}</p>
                  <i className={`fas fa-chevron-right ${styles.arrow} ${activeFaqIndex === index ? styles.rotated : ''}`}></i>
                </div>
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
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