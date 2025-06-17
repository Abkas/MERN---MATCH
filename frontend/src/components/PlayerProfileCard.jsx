import React from 'react';
import { MapPin, Calendar, Star, UserPlus, MessageSquare, Award, Building2, UserX, UserCheck, Clock } from 'lucide-react';
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
    className = '',
    requestStatus = null, // 'none', 'pending', 'sent', 'accepted'
    onCancelRequest = () => {},
    onSendRequest = () => {},
    sendingRequest = false,
    cancellingRequest = false
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

    // Render friend request button/status based on requestStatus
    const renderFriendRequestButton = () => {
        switch(requestStatus) {
            case 'sent':
                return (
                    <button 
                        onClick={onCancelRequest} 
                        className={`${styles.actionButton} ${styles.cancelRequest}`}
                        disabled={cancellingRequest}
                    >
                        {cancellingRequest ? (
                            <>
                                <Clock size={16} className={styles.spinIcon} />
                                <span>Cancelling</span>
                            </>
                        ) : (
                            <>
                                <UserX size={16} />
                                <span>Cancel Request</span>
                            </>
                        )}
                    </button>
                );
            case 'pending':
                return (
                    <div className={`${styles.actionButton} ${styles.pendingRequest}`}>
                        <Clock size={16} />
                        <span>Pending</span>
                    </div>
                );
            case 'accepted':
                return (
                    <div className={`${styles.actionButton} ${styles.friendStatus}`}>
                        <UserCheck size={16} />
                        <span>Friends</span>
                    </div>
                );
            default: // 'none'
                return (
                    <button 
                        onClick={onSendRequest} 
                        className={`${styles.actionButton} ${styles.sendRequest}`}
                        disabled={sendingRequest}
                    >
                        {sendingRequest ? (
                            <>
                                <Clock size={16} className={styles.spinIcon} />
                                <span>Sending</span>
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} />
                                <span>Add Friend</span>
                            </>
                        )}
                    </button>
                );
        }
    };

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
                <div className={styles.actions}>
                    {actionButton || renderFriendRequestButton()}
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
            
            <div className={styles.actions}>
                {requestStatus === 'sent' ? (
                    <button 
                        className={styles.cancelRequestBtn}
                        onClick={() => onCancelRequest?.(player._id)}
                    >
                        Cancel Request
                    </button>
                ) : actionButton}
            </div>
        </div>
    );
};

export default PlayerProfileCard;
