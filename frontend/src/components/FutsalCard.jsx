import React from 'react';
import { MapPin, Clock, Users, Star, Award, CheckCircle } from 'lucide-react';
import styles from '../pages/css/BookFutsal.module.css';
import { useNavigate } from 'react-router-dom';

const FutsalCard = ({ futsal }) => {
  const navigate = useNavigate();

  // Always go to futsal details on any action
  const goToDetails = () => navigate(`/futsal/${futsal._id}`);

  return (
    <div
      className={styles.futsalCardModern + ' ' + styles.futsalCard}
      onClick={goToDetails}
      tabIndex={0}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 4px 32px #2563eb22', borderRadius: 24, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', margin: '0 0 32px 0', minWidth: 320, maxWidth: 400 }}
    >
      <div className={styles.cardImageModern} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 180, background: '#e3e8f0' }}>
        <img
          src={futsal.futsalPhoto || '/default-futsal.jpg'}
          alt={futsal.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20, transition: 'transform 0.2s' }}
          onError={e => { e.target.onerror = null; e.target.src = '/default-futsal.jpg'; }}
        />
        {futsal.isAwarded && (
          <div style={{ position: 'absolute', top: 16, right: 16, background: '#43a047', color: '#fff', borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={16} /> Verified
          </div>
        )}
        {futsal.plusPoints && futsal.plusPoints.length > 0 && (
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: '#2563eb', color: '#fff', borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 14 }}>
            {futsal.plusPoints[0]}
          </div>
        )}
      </div>
      <div className={styles.cardContentModern} style={{ padding: '1.5rem 1.5rem 1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#222', margin: 0 }}>{futsal.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbc02d', fontWeight: 700, fontSize: 16 }}>
            <Star size={18} style={{ color: '#fbc02d' }} />
            <span>{futsal.rating || '4.5'}/5</span>
          </div>
        </div>
        {futsal.organizer?.fullName || futsal.ownerName ? (
          <div style={{ fontSize: 15, color: '#2563eb', fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ opacity: 0.7 }} />
            <span>{futsal.organizer?.fullName || futsal.ownerName || 'Owner'}</span>
          </div>
        ) : null}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '6px 0 2px 0' }}>
          {futsal.plusPoints && futsal.plusPoints.slice(0, 3).map((facility, index) => (
            <span key={index} style={{ background: '#f1f5fb', color: '#2563eb', borderRadius: 8, padding: '4px 12px', fontWeight: 600, fontSize: 13 }}>{facility}</span>
          ))}
          <span style={{ background: '#e3e8f0', color: '#2563eb', borderRadius: 8, padding: '4px 12px', fontWeight: 600, fontSize: 13 }}>7v7</span>
          <span style={{ background: '#e3e8f0', color: '#2563eb', borderRadius: 8, padding: '4px 12px', fontWeight: 600, fontSize: 13 }}>{futsal.totalMatches || 0}+ Matches</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
          <MapPin size={16} style={{ color: '#43a047' }} />
          <span style={{ color: '#444', fontWeight: 600, fontSize: 15 }}>{futsal.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
          <Clock size={16} style={{ color: '#2563eb' }} />
          <span style={{ color: '#444', fontWeight: 600, fontSize: 15 }}>{futsal.openingHours || '6:00 AM - 10:00 PM'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
          <Award size={16} style={{ color: '#fbc02d' }} />
          <span style={{ color: '#222', fontWeight: 700, fontSize: 16 }}>NPR {futsal.price || '2000'} <span style={{ fontWeight: 400, fontSize: 14 }}>(Per court)</span></span>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <button
            className={styles.btnBookModern}
            style={{ background: 'linear-gradient(90deg, #2563eb 0%, #43a047 100%)', color: '#fff', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, border: 'none', boxShadow: '0 2px 8px #2563eb22', cursor: 'pointer', flex: 1 }}
            onClick={e => { e.stopPropagation(); goToDetails(); }}
          >
            Book Now
          </button>
          <button
            className={styles.btnQuickJoinModern}
            style={{ background: '#fff', color: '#2563eb', border: '2px solid #2563eb', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 1, transition: 'background 0.2s' }}
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