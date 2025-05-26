import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../pages/css/SignUp.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const SignUpPage = () => {
  const { authUser, signUp, isSigningUp } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (authUser) {
      navigate('/')
    }
  }, [authUser, navigate])

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    role: 'player'
  })

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill in all fields')
      return false
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      return false
    }
    if (!formData.email.includes('@')) {
      alert('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const success = validateForm()
    if (success === true) {
      signUp(formData)
    }
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.signupCard}>
          <div className={styles.logoSection}>
            <div className={styles.logoCircle}>
              <img src="/signup/signup.jpg" alt="Match Point Logo" />
            </div>
          </div>

          <div className={styles.formSection}>
            <h1>Sign Up Now</h1>

            <form id="signupForm" onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  id="email"
                  placeholder="Your email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className={styles.formGroup} style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Your password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'black'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className='size-5 text-base-content/40' />
                  ) : (
                    <Eye className='size-5 text-base-content/40' />
                  )}
                </button>
              </div>
              <div className={`${styles.formGroup} ${styles.toggleGroup}`}>
                <label className={styles.toggleLabel}>Register as:</label>
                <div className={styles.toggleSwitch}>
                  <input
                    type="radio"
                    id="player"
                    name="role"
                    value="player"
                    checked={formData.role === "player"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                  <label htmlFor="player" className={styles.toggleOption}>Player</label>
                  <input
                    type="radio"
                    id="organizer"
                    name="role"
                    value="organizer"
                    checked={formData.role === "organizer"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                  <label htmlFor="organizer" className={styles.toggleOption}>Organizer</label>
                </div>
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">I agree to the Terms of Service.</label>
              </div>
              <button type="submit" className={styles.signupBtn} id="createAccount" disabled={isSigningUp}>
                {isSigningUp ? (
                  <>
                    <Loader2 className='size-5 animate-spin' />
                    Loading...
                  </>
                ) : (
                  <>Create an Account</>
                )}
              </button>
              <div className={styles.loginLink}>
                <p>Do you have an Account? <Link to='/login'>Sign In</Link></p>
              </div>
            </form>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <a href="#">User Agreement</a>
            <span className={styles.divider}>|</span>
            <a href="#">Privacy Policy</a>
            <span className={styles.divider}>|</span>
            <span className={styles.copyright}>@ 2024 logo.com All Rights Reserved</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default SignUpPage