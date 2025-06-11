import React from 'react';
import styles from '../pages/css/AboutUsPage.module.css';

const WorkModal = ({ isOpen, onClose, work }) => {
  if (!isOpen || !work) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <h2>{work.title}</h2>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalImage}>
            <img src={work.image} alt={work.title} />
          </div>
          
          <div className={styles.modalInfo}>
            <p className={styles.modalDescription}>{work.description}</p>
            
            <div className={styles.modalFeatures}>
              <h3>Key Features</h3>
              <ul>
                {work.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkModal;
