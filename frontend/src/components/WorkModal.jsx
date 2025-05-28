import React from 'react';
import styles from '../pages/css/WorkModal.module.css';

const WorkModal = ({ isOpen, onClose, work }) => {
  if (!isOpen || !work) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <img src={work.image} alt={work.title} className={styles.workImage} />
        <h2>{work.title}</h2>
        <p>{work.description}</p>
        <h4>Features:</h4>
        <ul>
          {work.features && work.features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
        {work.link && (
          <a href={work.link} className={styles.workLink} target="_blank" rel="noopener noreferrer">
            Learn More
          </a>
        )}
      </div>
    </div>
  );
};

export default WorkModal;
