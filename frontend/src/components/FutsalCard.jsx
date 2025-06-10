import React from 'react';
import { MapPin, Clock, Users, Star, Award, CheckCircle } from 'lucide-react';
import styles from '../pages/css/BookFutsal.module.css';
import { useNavigate } from 'react-router-dom';

const FutsalCard = ({ futsal }) => {
  const navigate = useNavigate();

  // Only redirect on button click
  const goToDetails = () => navigate(`/futsal/${futsal._id}`);

  return (
    <div className={styles.futsalCard} tabIndex={0}>
      <div className={styles.cardImage}>
        <img
          src={futsal.futsalPhoto || '/default-futsal.jpg'}
          alt={futsal.name}
          onError={e => { e.target.onerror = null; e.target.src = '/default-futsal.jpg'; }}
        />
        {futsal.isAwarded && (
          <div style={{ position: 'absolute', top: 16, right: 16, background: '#43a047', color: '#fff', borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={16} /> Verified
          </div>
        )}
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3>{futsal.name}</h3>
          <div className={styles.rating}>
            <Star size={18} />
            <span>{futsal.rating || '4.5'}/5</span>
          </div>
        </div>
        {futsal.organizer?.fullName || futsal.ownerName ? (
          <div style={{ fontSize: 15, color: '#2563eb', fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ opacity: 0.7 }} />
            <span>{futsal.organizer?.fullName || futsal.ownerName || 'Owner'}</span>
          </div>
        ) : null}
        <div className={styles.tags}>
          {/* Only show plusPoints, not 7v7 or matches */}
          {futsal.plusPoints && futsal.plusPoints.slice(0, 3).map((facility, index) => (
            <span className={styles.tag} key={index}>{facility}</span>
          ))}
        </div>
        <div className={styles.location}>
          <MapPin size={16} />
          <span>{futsal.location}</span>
        </div>
        <div className={styles.price}>
          <Award size={16} />
          <span>NPR {futsal.price || '2000'} <span style={{ fontWeight: 400, fontSize: 14 }}>(Per court)</span></span>
        </div>
        <div className={styles.cardActions}>
          <button
            className={styles.btnBook}
            onClick={e => { e.stopPropagation(); goToDetails(); }}
          >
            Book Now
          </button>
          <button
            className={styles.btnQuickJoin}
            onClick={e => { e.stopPropagation(); goToDetails(); }}
          >
            Quick Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default FutsalCard;