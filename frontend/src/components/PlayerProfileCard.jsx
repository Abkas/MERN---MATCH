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
    onAcceptRequest = () => {},
    onRejectRequest = () => {},
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
                    <div className={styles.pendingActionsWrap}>
                        <button 
                            onClick={onAcceptRequest} 
                            className={`${styles.actionButton} ${styles.acceptRequest}`}
                            disabled={sendingRequest}
                        >
                            <UserCheck size={16} /> Accept
                        </button>
                        <button 
                            onClick={onRejectRequest} 
                            className={`${styles.actionButton} ${styles.rejectRequest}`}
                            disabled={cancellingRequest}
                        >
                            <UserX size={16} /> Reject
                        </button>
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
            </div>
            <div className={styles.playerDetails}>
                {isOrganizer ? (
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
                            {playerProfile.bio && (
                                <div className={styles.bio}>
                                    {playerProfile.bio}
                                </div>
                            )}
                        </>
                    )
                )}
            </div>
            <div className={styles.actions}>
                {actionButton || renderFriendRequestButton()}
            </div>
        </div>
    );
};

export default PlayerProfileCard;
