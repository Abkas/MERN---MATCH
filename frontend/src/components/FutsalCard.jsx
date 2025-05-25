import React from 'react';
import { MapPin, Clock, Users, Star, Award, Plus } from 'lucide-react';
import styles from '../pages/css/BookFutsal.module.css';
import { useNavigate } from 'react-router-dom';

const FutsalCard = ({ futsal }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/futsal/${futsal._id}`);
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/book-futsal/${futsal._id}`);
  };

  const handleQuickJoin = (e) => {
    e.stopPropagation(); 
    navigate(`/quick-join/${futsal._id}`);
  };

  return (
    <div className={styles.futsalCard} onClick={handleCardClick}>
      <div className={styles.cardImage}>
        <img 
          src={futsal.futsalPhoto || '/default-futsal.jpg'} 
          alt={futsal.name}
        />
        {futsal.plusPoints && futsal.plusPoints.length > 0 && (
          <div className={styles.offerBadge}>
            <i className="fas fa-percentage"></i> {futsal.plusPoints[0]}
          </div>
        )}
        {futsal.gamesOrganized < 10 && (
          <div className={styles.newBadge}>New</div>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3>{futsal.name}</h3>
          <div className={styles.rating}>
            <Star size={16} className={styles.starIcon} />
            <span>{futsal.rating || '4.5'}/5</span>
          </div>
        </div>

        <div className={styles.tags}>
          {futsal.plusPoints && futsal.plusPoints.map((facility, index) => (
            <span key={index} className={styles.tag}>{facility}</span>
          ))}
          <span className={styles.tag}>7v7</span>
          <span className={styles.tag}>{futsal.totalMatches || 0}+ Matches</span>
          <span className={styles.tag}>Verified</span>
        </div>

        <div className={styles.location}>
          <MapPin size={16} />
          <span>{futsal.location}</span>
        </div>

        <div className={styles.time}>
          <Clock size={16} />
          <span>{futsal.openingHours || '6:00 AM - 10:00 PM'}</span>
        </div>

        <div className={styles.price}>
          <Award size={16} />
          <span>NPR {futsal.price || '2000'} (Per court)</span>
        </div>

        <div className={styles.cardActions}>
          <button 
            className={styles.btnBook}
            onClick={handleBookNow}
          >
            Book Now
          </button>
          <button 
            className={styles.btnQuickJoin}
            onClick={handleQuickJoin}
          >
            Quick Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default FutsalCard; 