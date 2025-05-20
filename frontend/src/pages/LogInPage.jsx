import React from 'react'
import { useState } from 'react'
import { useAuthStore} from '../store/useAuthStore'  
import styles from '../pages/css/SignUp.module.css'
import { Link, useNavigate  } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast'

import { useEffect } from 'react'


const LogInPage = () => {

  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      navigate('/');
    }
  }, [authUser, navigate]);
  


const [showPassword, setShowPassword] = React.useState(false)
const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  })

  const { logIn, isLoggingIn } = useAuthStore()
  const handleSubmit = (e) => {
    e.preventDefault()
      console.log(formData)
    logIn(formData)
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
          <h1>Log In Now</h1>

          <form id="signupForm" onSubmit={handleSubmit}>
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
                <EyeOff className='size-5 text-base-content/40'/>
              ) : (
                <Eye className='size-5 text-base-content/40'/>
              )}
            </button>
          </div>
            <button type="submit" className={styles.signupBtn} id="createAccount" disabled={isLoggingIn}>
              { isLoggingIn ? (
                <>
                <Loader2 className ='size-5 animate-spin' />
                Loading...
                </>
              ):(<>
                Log In
              </>)}
            </button>
            <div className={styles.socialLogin}>
              <p>OR</p>
              <div className={styles.socialIcons}>
                <a href="#" className={styles.socialIcon}>
                  <img src="/signup/OR-icon.png" alt="OR" />
                </a>
                <a href="#" className={styles.socialIcon}>
                  <img src="/signup/facebook-icon.png" alt="Facebook" />
                </a>
                <a href="#" className={styles.socialIcon}>
                  <img src="/signup/twitter-icon.png" alt="Twitter" />
                </a>
                <a href="#" className={styles.socialIcon}>
                  <img src="/signup/google-icon.png" alt="Google" />
                </a>
              </div>
            </div>
            <div className={styles.loginLink}>
              <p>Don't have an account?
                <Link to= '/signup'>Sign Up 
                </Link>
                </p>
            </div>
          </form>
        </div>
      </div>

      <footer>
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

export default LogInPage