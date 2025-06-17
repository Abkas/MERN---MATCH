import React from 'react';
import { MapPin, Calendar, Star, UserPlus, MessageSquare, Award, Building2 } from 'lucide-react';
import styles from '../pages/css/PlayerProfileCard.module.css';

const getSkillLevelColor = (level) => {
    const colors = {
        'Beginner': '#4CAF50',
        'Intermediate': '#2196F3',
        'Advanced': '#FFC107',
        'Professional': '#F44336'
    };
    return colors[level] || '#757575';
};

const PlayerProfileCard = ({ 
    player, 
    actionButton, 
    showFullProfile = false, 
    className = '' 
}) => {
    const {
        username,
        fullName,
        avatar,
        role,
        playerProfile,
        organizerProfile,
        futsalCount
    } = player;

    const isOrganizer = role === 'organizer';

    return (
        <div className={`${styles.playerCard} ${isOrganizer ? styles.organizerCard : ''} ${className}`}>
            {isOrganizer && <div className={styles.premiumBadge}><Award size={16} /> Organizer</div>}
            <div className={styles.cardHeader}>
                <img 
                    src={avatar || '/avatar.jpg'} 
                    alt={username} 
                    className={`${styles.playerAvatar} ${isOrganizer ? styles.organizerAvatar : ''}`}
                />
                <div className={styles.headerInfo}>
                    <h3>{fullName || username}</h3>
                    <span className={styles.username}>@{username}</span>
                </div>
            </div>
            
            <div className={styles.playerDetails}>
                {isOrganizer ? (
                    // Organizer Details
                    <>
                        {organizerProfile?.bio && (
                            <div className={`${styles.bio} ${styles.organizerBio}`}>
                                {organizerProfile.bio}
                            </div>
                        )}
                        <div className={styles.detailItem}>
                            <Building2 size={16} />
                            <span>{futsalCount || 0} Futsal{(futsalCount !== 1) ? 's' : ''} Managed</span>
                        </div>
                        {organizerProfile?.location && (
                            <div className={styles.detailItem}>
                                <MapPin size={16} />
                                <span>{organizerProfile.location}</span>
                            </div>
                        )}
                    </>
                ) : (
                    // Player Details
                    playerProfile && (
                        <>
                            {playerProfile.location && (
                                <div className={styles.detailItem}>
                                    <MapPin size={16} />
                                    <span>{playerProfile.location}</span>
                                </div>
                            )}
                            {playerProfile.skillLevel && (
                                <div className={styles.detailItem}>
                                    <Star 
                                        size={16} 
                                        style={{ color: getSkillLevelColor(playerProfile.skillLevel) }} 
                                    />
                                    <span style={{ color: getSkillLevelColor(playerProfile.skillLevel) }}>
                                        {playerProfile.skillLevel}
                                    </span>
                                </div>
                            )}
                            {playerProfile.preferences && (
                                <div className={styles.preferences}>
                                    <strong>Preferences:</strong> {playerProfile.preferences}
                                </div>
                            )}
                            {playerProfile.availability && (
                                <div className={styles.detailItem}>
                                    <Calendar size={16} />
                                    <span>{playerProfile.availability}</span>
                                </div>
                            )}
                            {showFullProfile && playerProfile.bio && (
                                <div className={styles.bio}>
                                    {playerProfile.bio}
                                </div>
                            )}
                        </>
                    )
                )}
            </div>
            
            {actionButton && (
                <div className={styles.cardActions}>
                    {actionButton}
                </div>
            )}
        </div>
    );
};

export default PlayerProfileCard;
