import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../pages/css/AboutUsPage.module.css'
import WorkModal from '../components/WorkModal'
import { FaTwitter, FaLinkedinIn, FaDribbble, FaInstagram, FaFacebookF } from 'react-icons/fa';

const AboutUsPage = () => {
  const { logOut } = useAuthStore()
  const navigate = useNavigate()
  const [selectedWork, setSelectedWork] = useState(null)

  const works = [
    {
      title: 'Startup Framework',
      description: 'A comprehensive framework designed specifically for startups, offering a suite of tools and components to create professional websites quickly and efficiently. Our framework includes responsive layouts, modern UI components, and optimized performance features.',
      image: '/works/startup.jpg',
      features: [
        'Responsive design system',
        'Pre-built UI components',
        'Performance optimization',
        'SEO-friendly structure',
        'Easy customization options'
      ],
      link: '#'
    },
    {
      title: 'Mobile X',
      description: 'A cutting-edge mobile app development platform that helps businesses create stunning mobile applications. Our platform provides tools for both iOS and Android development, with features focused on user experience and performance.',
      image: '/works/mobile.jpg',
      features: [
        'Cross-platform development',
        'Native UI components',
        'Real-time testing',
        'Performance analytics',
        'Easy deployment process'
      ],
      link: '#'
    },
    {
      title: 'Photoshop Services',
      description: 'Professional photo editing and graphic design services tailored for businesses and individuals. Our team of expert designers can help transform your visual content with advanced editing techniques and creative solutions.',
      image: '/works/photoshop.jpg',
      features: [
        'Professional retouching',
        'Background removal',
        'Color correction',
        'Digital art creation',
        'Batch processing'
      ],
      link: '#'
    }
  ];

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  // Scroll-triggered pop-in animation for elements with class 'pop-in'
useEffect(() => {
  const popIns = document.querySelectorAll('.pop-in');
  const observer = new window.IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    },
    { threshold: 0.15 }
  );
  popIns.forEach(el => observer.observe(el));
  return () => observer.disconnect();
}, []);

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
                  <Link to="/profile" title="Profile" className={styles.profileLink}>
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

      {/* Hero Section - Minimal, Modern, Centered, No Images */}
<section className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-b from-green-50 to-white text-center px-4 py-20">
  <h1 className="text-5xl sm:text-6xl font-extrabold text-green-700 mb-6 tracking-tight">
    We are a team
  </h1>
  <p className="text-lg sm:text-xl text-gray-700 font-medium mb-4 max-w-2xl">
    It started with a simple question: <span className="italic text-green-600">How can we make it easier for <span className="font-bold text-green-800">players</span> and <span className="font-bold text-green-800">organizers</span> to connect?</span>
  </p>
  <p className="text-lg sm:text-xl text-gray-700 mb-4 max-w-2xl">
    Driven by curiosity and a passion for sports, we transformed that question into a real platform for <span className="font-semibold text-green-700">sports matchmaking</span> and <span className="font-semibold text-green-700">event management</span>.
  </p>
  <p className="text-lg sm:text-xl text-gray-700 max-w-2xl">
    Our journey is all about <span className="font-bold text-green-800">learning by doing</span>, building together, and making a difference—one match at a time.
  </p>
</section>
{/* End Hero Section */}

 
{/* End Team Introduction Section */}

      <section className={styles.team + ' pop-in'}>
        <div className={styles.container + ' pop-in'}>
          <h2 className={'pop-in'}>Meet Our Members</h2>
          <div className={styles.teamGrid + ' pop-in'}>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/Snapchat-790029509.jpg" alt="Team member"/>
              </div>
              <h3>Shreya Tiwari</h3>
              <p>Frontend Developer</p>
              <div className={styles.socialLinks}>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaLinkedinIn /></a>
                <a href="#"><FaDribbble /></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/sc.jpeg" alt="Team member"/>
              </div>
              <h3>Samir Chand</h3>
              <p>Researcher</p>
              <div className={styles.socialLinks}>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaLinkedinIn /></a>
                <a href="#"><FaDribbble /></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/k.k.jpeg" alt="Team member"/>
              </div>
              <h3>Kashmita Koirala</h3>
              <p>Frontend Developer</p>
              <div className={styles.socialLinks}>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaLinkedinIn /></a>
                <a href="#"><FaDribbble /></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/am.jpeg" alt="Team member"/>
              </div>
              <h3>Abhishek Magar</h3>
              <p>Backend Developer</p>
              <div className={styles.socialLinks}>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaLinkedinIn /></a>
                <a href="#"><FaDribbble /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta + ' pop-in'}>
        <div className={styles.container + ' pop-in'}>
          <div className={styles.ctaContent + ' pop-in'}>
            <h2 className={'pop-in'}>We're Always Looking For Talented People For Our Agency</h2>
          </div>
          <div className={styles.ctaDecoration + ' pop-in'}>
            <div className={`${styles.dot} ${styles.dot1} pop-in`}></div>
            <div className={`${styles.dot} ${styles.dot2} pop-in`}></div>
            <div className={`${styles.dot} ${styles.dot3} pop-in`}></div>
            <div className={styles.rocket + ' pop-in'}>🚀</div>
          </div>
        </div>
      </section>

      <section className={styles.works + ' pop-in'}>
        <div className={styles.container + ' pop-in'}>
          <h2 className={'pop-in'}>Other works</h2>
          <div className={styles.worksGrid + ' pop-in'}>
            {works.map((work, index) => (
              <div 
                key={index} 
                className={`${styles.workCard} ${index === 1 ? styles.purple : ''} ${index === 2 ? styles.imageCard : ''}`}
              >
                {index === 2 ? (
                  <div className={styles.cardOverlay}>
                    <h3>{work.title}</h3>
                    <p>{work.description.substring(0, 100)}...</p>
                    <button 
                      className={`${styles.btn} ${styles.btnOutline}`}
                      onClick={() => setSelectedWork(work)}
                    >
                      Explore
                    </button>
                  </div>
                ) : (
                  <>
                    <h3>{work.title}</h3>
                    <p>{work.description.substring(0, 100)}...</p>
                    <button 
                      className={`${styles.btn} ${styles.btnOutline}`}
                      onClick={() => setSelectedWork(work)}
                    >
                      Explore
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="pop-in">
        <div className={styles.footerLinks + ' pop-in'}>
          <Link to="#" className="pop-in">About</Link>
          <Link to="#" className="pop-in">Contact Us</Link>
          <Link to="#" className="pop-in">Privacy</Link>
          <Link to="#" className="pop-in">FAQs</Link>
          <Link to="#" className="pop-in">Terms</Link>
        </div>
        <div className={styles.socialLinks + ' pop-in'}>
          <a href="#" className="pop-in"><FaInstagram /></a>
          <a href="#" className="pop-in"><FaFacebookF /></a>
          <a href="#" className="pop-in"><FaTwitter /></a>
        </div>
      </footer>

      <WorkModal 
        isOpen={!!selectedWork}
        onClose={() => setSelectedWork(null)}
        work={selectedWork}
      />
    </div>
  )
}

export default AboutUsPage