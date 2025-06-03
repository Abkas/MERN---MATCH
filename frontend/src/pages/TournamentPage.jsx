import React from 'react'
import { Link } from 'react-router-dom'
import styles from './css/Tournament.module.css'

const TournamentPage = () => {
  return (
    <div className={styles.body}>
              <nav >
                <div className={styles.logo}>
                  <Link to="/">
                    <img src="/firstpage/logo.png" alt="match-logo" />
                  </Link>
                </div>
                <ul className={styles.navLinks}>
                  <li><Link to="/futsalhome" >Home</Link></li>
                  <li><Link to="/bookfutsal">Book Futsal</Link></li>
                  <li><Link to="/tournaments" className={styles.active}>Tournaments</Link></li>
                  <li><Link to="/quickmatch" >Quick Match</Link></li>
                </ul>
                <div className={styles.navIcons}>
                  <div className={styles.notification}>
                    <img src="/FUTSALHOME/notification-icon.png" alt="Notifications" />
                  </div>
                  <div className={styles.profile}>
                    <Link to="/profile"><img src="/FUTSALHOME/profile-icon.png" alt="Profile" /></Link>
                  </div>
                </div>
              </nav>

      <section className={styles.hero} style={{ opacity: 0.6, filter: 'grayscale(0.7)', pointerEvents: 'none', background: '#f3f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', position: 'relative' }}>
        <div className={styles.heroContent} style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ color: '#888', fontWeight: 700, textAlign: 'center', margin: '0 auto' }}>Compete & Conquer: Join Exciting Tournaments!</h1>
          <div className={styles.searchContainer}>
            <input type="text" placeholder="Search exciting games" disabled style={{ background: '#eee', color: '#aaa', cursor: 'not-allowed' }} />
            <button className={styles.filterBtn} disabled style={{ background: '#ccc', color: '#888', cursor: 'not-allowed' }}>Filter</button>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.findBtn} disabled style={{ background: '#ccc', color: '#888', cursor: 'not-allowed' }}>Find a Tournament</button>
            <button className={styles.hostBtn} disabled style={{ background: '#ccc', color: '#888', cursor: 'not-allowed' }}>Host a Tournament</button>
          </div>
        </div>
        {/* Coming Soon Badge */}
        <div className={styles.comingSoonBadge}>
          🚧 Coming Soon 🚧
        </div>
        {/* <div className={styles.heroImage}><img src="/tournaments/football silhouette, soccer silhouette….jpg" alt="" /></div> */}
      </section>

      <section className={styles.tournamentsSection} style={{ opacity: 0.6, filter: 'grayscale(0.7)', pointerEvents: 'none', background: '#f3f4f8' }}>
        <h2 style={{ color: '#888', textAlign: 'center', fontWeight: 700 }}>#Near You (Coming Soon)</h2>
        <div className={styles.tournamentCards}>
          {/* Card 1 */}
          <div className={styles.tournamentCard}>
            <div className={styles.cardImage}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-15%20at%2012.17.04-UC2PIHU5LT2PSN7W3ma5eDX6UkS9Ql.png" alt="Football Tournament" />
              <div className={styles.location}>New Kathmandu Cup</div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.dateTime}>30 Jan – 2 Feb</div>
              <div className={styles.organizer}>Official Ktmz</div>
              <div className={styles.participants}>
                <div className={styles.avatars}>
                  <span className={styles.avatar} style={{backgroundColor: '#ff5733'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#33ff57'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#3357ff'}}></span>
                </div>
                <span className={styles.joined}>45+ Joined</span>
              </div>
              <div className={styles.price}>$3,500 USD</div>
            </div>
          </div>
          {/* Card 2 */}
          <div className={styles.tournamentCard}>
            <div className={styles.cardImage}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-15%20at%2012.17.04-UC2PIHU5LT2PSN7W3ma5eDX6UkS9Ql.png" alt="College Intra-Cup" />
              <div className={styles.location}>College Intra-Cup</div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.dateTime}>30 Jan – 3 April</div>
              <div className={styles.organizer}>Official Ktmz</div>
              <div className={styles.participants}>
                <div className={styles.avatars}>
                  <span className={styles.avatar} style={{backgroundColor: '#ff5733'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#33ff57'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#3357ff'}}></span>
                </div>
                <span className={styles.joined}>45+ Joined</span>
              </div>
              <div className={styles.price}>$1,500 USD</div>
            </div>
          </div>
          {/* Card 3 */}
          <div className={styles.tournamentCard}>
            <div className={styles.cardImage}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-15%20at%2012.17.04-UC2PIHU5LT2PSN7W3ma5eDX6UkS9Ql.png" alt="Butwal-Div C" />
              <div className={styles.location}>Butwal-Div C</div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.dateTime}>30 Jan – 3 Feb</div>
              <div className={styles.organizer}>Official Ktmz</div>
              <div className={styles.participants}>
                <div className={styles.avatars}>
                  <span className={styles.avatar} style={{backgroundColor: '#ff5733'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#33ff57'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#3357ff'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#ff33a8'}}></span>
                </div>
                <span className={styles.joined}>35+ Joined</span>
              </div>
              <div className={styles.price}>$4,500 USD</div>
            </div>
          </div>
          {/* Card 4 */}
          <div className={styles.tournamentCard}>
            <div className={styles.cardImage}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-15%20at%2012.17.04-UC2PIHU5LT2PSN7W3ma5eDX6UkS9Ql.png" alt="Under 16-Open" />
              <div className={styles.location}>Under 16-Open</div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.dateTime}>30 Jan – 3 Feb</div>
              <div className={styles.organizer}>Official Ktmz</div>
              <div className={styles.participants}>
                <div className={styles.avatars}>
                  <span className={styles.avatar} style={{backgroundColor: '#ff5733'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#33ff57'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#3357ff'}}></span>
                </div>
                <span className={styles.joined}>58+ Joined</span>
              </div>
              <div className={styles.price}>$1,500 USD</div>
            </div>
          </div>
        </div>
        <div className={styles.seeMoreContainer}>
          <button className={styles.seeMoreBtn} style={{ background: '#ccc', color: '#888', cursor: 'not-allowed' }}>See More</button>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection} style={{ opacity: 0.6, filter: 'grayscale(0.7)', pointerEvents: 'none', background: '#f3f4f8' }}>
        <h2 style={{ color: '#888', textAlign: 'center', fontWeight: 700 }}>Loved by the world's best teams (Coming Soon)</h2>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <h3>300+</h3>
            <p>Teams</p>
          </div>
          <div className={styles.statItem}>
            <h3>20+</h3>
            <p>Organizations</p>
          </div>
          <div className={styles.statItem}>
            <h3>5000+</h3>
            <p>Users</p>
          </div>
        </div>
      </section>

      {/* Popular Section */}
      <section className={`${styles.tournamentsSection} ${styles.popularSection}`} style={{ opacity: 0.6, filter: 'grayscale(0.7)', pointerEvents: 'none', background: '#f3f4f8' }}>
        <h2 style={{ color: '#888', textAlign: 'center', fontWeight: 700 }}>#Popular (Coming Soon)</h2>
        <div className={styles.tournamentCards}>
          {/* Card 1 */}
          <div className={styles.tournamentCard}>
            <div className={styles.cardImage}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-15%20at%2012.17.04-UC2PIHU5LT2PSN7W3ma5eDX6UkS9Ql.png" alt="Football Tournament" />
              <div className={styles.location}>New Kathmandu Cup</div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.dateTime}>30 Jan – 2 Feb</div>
              <div className={styles.organizer}>Official Ktmz</div>
              <div className={styles.participants}>
                <div className={styles.avatars}>
                  <span className={styles.avatar} style={{backgroundColor: '#ff5733'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#33ff57'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#3357ff'}}></span>
                </div>
                <span className={styles.joined}>45+ Joined</span>
              </div>
              <div className={styles.price}>$3,500 USD</div>
            </div>
          </div>
          {/* Card 2 */}
          <div className={styles.tournamentCard}>
            <div className={styles.cardImage}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-15%20at%2012.17.04-UC2PIHU5LT2PSN7W3ma5eDX6UkS9Ql.png" alt="College Intra-Cup" />
              <div className={styles.location}>College Intra-Cup</div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.dateTime}>30 Jan – 3 April</div>
              <div className={styles.organizer}>Official Ktmz</div>
              <div className={styles.participants}>
                <div className={styles.avatars}>
                  <span className={styles.avatar} style={{backgroundColor: '#ff5733'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#33ff57'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#3357ff'}}></span>
                </div>
                <span className={styles.joined}>45+ Joined</span>
              </div>
              <div className={styles.price}>$1,500 USD</div>
            </div>
          </div>
          {/* Card 3 */}
          <div className={styles.tournamentCard}>
            <div className={styles.cardImage}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-15%20at%2012.17.04-UC2PIHU5LT2PSN7W3ma5eDX6UkS9Ql.png" alt="Butwal-Div C" />
              <div className={styles.location}>Butwal-Div C</div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.dateTime}>30 Jan – 3 Feb</div>
              <div className={styles.organizer}>Official Ktmz</div>
              <div className={styles.participants}>
                <div className={styles.avatars}>
                  <span className={styles.avatar} style={{backgroundColor: '#ff5733'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#33ff57'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#3357ff'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#ff33a8'}}></span>
                </div>
                <span className={styles.joined}>35+ Joined</span>
              </div>
              <div className={styles.price}>$4,500 USD</div>
            </div>
          </div>
          {/* Card 4 */}
          <div className={styles.tournamentCard}>
            <div className={styles.cardImage}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-15%20at%2012.17.04-UC2PIHU5LT2PSN7W3ma5eDX6UkS9Ql.png" alt="Under 16-Open" />
              <div className={styles.location}>Under 16-Open</div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.dateTime}>30 Jan – 3 Feb</div>
              <div className={styles.organizer}>Official Ktmz</div>
              <div className={styles.participants}>
                <div className={styles.avatars}>
                  <span className={styles.avatar} style={{backgroundColor: '#ff5733'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#33ff57'}}></span>
                  <span className={styles.avatar} style={{backgroundColor: '#3357ff'}}></span>
                </div>
                <span className={styles.joined}>58+ Joined</span>
              </div>
              <div className={styles.price}>$1,500 USD</div>
            </div>
          </div>
        </div>
        <div className={styles.seeMoreContainer}>
          <button className={styles.seeMoreBtn} style={{ background: '#ccc', color: '#888', cursor: 'not-allowed' }}>See More</button>
        </div>
      </section>

      {/* How to Join Section */}
      <section className={styles.howToJoin} style={{ opacity: 0.6, filter: 'grayscale(0.7)', pointerEvents: 'none', background: '#f3f4f8' }}>
        <h2 style={{ color: '#888', textAlign: 'center', fontWeight: 700 }}>HOW TO JOIN AND COMPETE?</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>🔍</div>
            <h3>Find a Tournament</h3>
            <p>Browse from 100+ active tournaments. Filter by game type, skill level, and location.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>📝</div>
            <h3>Register & Join</h3>
            <p>Pay the entry fee (if required). Get a confirmation & matchmaking details.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>🏆</div>
            <h3>Compete & Win</h3>
            <p>Play your matches, submit scores. Win prizes, climb the leaderboard!</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link to="#">About</Link>
          <Link to="#">Contact Us</Link>
          <Link to="#">Pricing</Link>
          <Link to="#">FAQs</Link>
          <Link to="#">Team</Link>
        </div>
        <div className={styles.socialLinks}>
          <Link to="#">IG</Link>
          <Link to="#">FB</Link>
          <Link to="#">TW</Link>
        </div>
      </footer>
    </div>
  )
}

export default TournamentPage