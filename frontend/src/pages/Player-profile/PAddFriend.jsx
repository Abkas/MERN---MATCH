import React, { useState, useEffect } from 'react';
import styles from '../css/PAddFriend.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Search, UserCheck, UserPlus, Users } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';
import FutsalNavbar from '../../components/FutsalNavbar';
import PlayerProfileCard from '../../components/PlayerProfileCard';
import PlayerSidebar from '../../components/PlayerSidebar';
import OrganizerSidebar from '../../components/OrganizerSidebar';
import { toast } from 'react-hot-toast';

const PAddFriend = () => {
    const { logOut, authUser, checkAuth } = useAuthStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('search');
    const [allPlayers, setAllPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({
        sendRequest: false,
        acceptRequest: false,
        rejectRequest: false
    });
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchActive, setSearchActive] = useState(false);

    const currentUserId = authUser?._id;
    const isOrganizer = authUser?.role === 'organizer';

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!currentUserId || !authUser) {
            navigate('/login');
            return;
        }
        setIsLoading(true);
        axiosInstance.get('/users/check')
            .then(() => Promise.all([
                axiosInstance.get('/users/all'),
                axiosInstance.get('/friendships/pending'),
                axiosInstance.get('/friendships/list')
            ]))
            .then(([usersResponse, pendingResponse, friendsResponse]) => {
                const users = usersResponse.data?.message || [];
                const { sent = [], received = [] } = pendingResponse.data?.message || {};
                setSentRequests(sent);
                setPendingRequests(received);
                // Filter available users: only users with NO relation (not friend, not sent, not received)
                const friendIds = new Set((friendsResponse.data?.message || []).map(f => f._id));
                const sentIds = new Set(sent.map(r => r.recipient));
                const receivedIds = new Set(received.map(r => r.requester));
                const availableUsers = users.filter(user =>
                    user._id !== currentUserId &&
                    !friendIds.has(user._id) &&
                    !sentIds.has(user._id) &&
                    !receivedIds.has(user._id)
                );
                setAllPlayers(availableUsers);
                // Set friends from /friendships/list
                setFriends(friendsResponse.data?.message || []);
            })
            .catch(error => {
                toast.error('Failed to load data');
            })
            .finally(() => setIsLoading(false));
    }, [currentUserId, authUser, navigate]);

    // Send friend request
    const handleSendRequest = (recipientId) => {
        setActionLoading(prev => ({ ...prev, sendRequest: true }));
        axiosInstance.post('/friendships/send-request', { recipientId })
            .then(response => {
                const recipient = allPlayers.find(p => p._id === recipientId);
                setSentRequests(prev => [...prev, {
                    requester: authUser,
                    recipient,
                    _id: response.data.message._id
                }]);
                setAllPlayers(prev => prev.filter(p => p._id !== recipientId));
                toast.success('Friend request sent');
            })
            .catch(() => toast.error('Failed to send friend request'))
            .finally(() => setActionLoading(prev => ({ ...prev, sendRequest: false })));
    };

    // Accept friend request
    const handleAcceptRequest = (friendshipId) => {
        setActionLoading(prev => ({ ...prev, acceptRequest: true }));
        axiosInstance.post('/friendships/accept-request', { friendshipId })
            .then(() => {
                const request = pendingRequests.find(r => r._id === friendshipId);
                if (request) {
                    setFriends(prev => [...prev, request.requester]);
                    setPendingRequests(prev => prev.filter(r => r._id !== friendshipId));
                }
                toast.success('Friend request accepted');
            })
            .catch(() => toast.error('Failed to accept friend request'))
            .finally(() => setActionLoading(prev => ({ ...prev, acceptRequest: false })));
    };

    // Reject/Cancel friend request
    const handleRejectRequest = (friendshipId, isSentRequest = false) => {
        setActionLoading(prev => ({ ...prev, rejectRequest: true }));
        axiosInstance.post('/friendships/reject-request', { friendshipId })
            .then(() => {
                if (isSentRequest) {
                    const request = sentRequests.find(r => r._id === friendshipId);
                    if (request) {
                        setSentRequests(prev => prev.filter(r => r._id !== friendshipId));
                        setAllPlayers(prev => [...prev, request.recipient]);
                    }
                } else {
                    setPendingRequests(prev => prev.filter(r => r._id !== friendshipId));
                }
                toast.success(isSentRequest ? 'Request cancelled' : 'Request rejected');
            })
            .catch(() => toast.error('Failed to process friend request'))
            .finally(() => setActionLoading(prev => ({ ...prev, rejectRequest: false })));
    };

    // Filtered players based on search
    const filteredPlayers = allPlayers.filter(player => {
        if (!searchActive || !searchInput.trim()) return true;
        const search = searchInput.trim().toLowerCase();
        return (
            (player.username && player.username.toLowerCase().includes(search)) ||
            (player.fullName && player.fullName.toLowerCase().includes(search))
        );
    });
    // Live suggestions for dropdown (recommendations)
    const liveSuggestions = searchInput.trim()
      ? allPlayers.filter(player => {
          const search = searchInput.trim().toLowerCase();
          return (
            (player.username && player.username.toLowerCase().includes(search)) ||
            (player.fullName && player.fullName.toLowerCase().includes(search))
          );
        }).slice(0, 8)
      : [];

    return (
        <div className={styles.body} style={{ background: '#f4f6fb', minHeight: '100vh' }}>
            <FutsalNavbar />
            <div className={styles.container} style={{marginTop: '88px'}}>
                {isOrganizer ? <OrganizerSidebar /> : <PlayerSidebar />}
                <main className={styles.mainContent} style={{marginLeft: '250px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', marginTop: '24px'}}>
                    <div style={{width: '100%', maxWidth: '800px'}}>
                        <div className={styles.searchBarWrapper}>
                            <input
                                className={styles.searchBar}
                                type="text"
                                placeholder="Search by username or real name..."
                                value={searchInput}
                                onChange={e => {
                                    setSearchInput(e.target.value);
                                    setSearchActive(false);
                                }}
                                onFocus={() => setSearchActive(false)}
                            />
                            <button className={styles.searchBtn} onClick={() => setSearchActive(true)}>Search</button>
                            {searchInput && !searchActive && liveSuggestions.length > 0 && (
                                <div className={styles.suggestionDropdown}>
                                    {liveSuggestions.map(player => (
                                        <div
                                            key={player._id}
                                            className={styles.suggestionItem}
                                            onClick={() => {
                                                setSearchInput(player.username || player.fullName || '');
                                                setSearchActive(true);
                                            }}
                                        >
                                            <img src={player.avatar || '/avatar.jpg'} alt="avatar" className={styles.suggestionAvatar} />
                                            <span className={styles.suggestionName}>{player.username}</span>
                                            {player.fullName && <span className={styles.suggestionFullName}>({player.fullName})</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles.tabs}>
                            <button 
                                className={`${styles.tab} ${activeTab === 'search' ? styles.active : ''}`}
                                onClick={() => setActiveTab('search')}
                            >
                                <Search size={16} />
                                Find Players
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
                                onClick={() => setActiveTab('requests')}
                            >
                                <UserPlus size={16} />
                                Friend Requests
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'sent' ? styles.active : ''}`}
                                onClick={() => setActiveTab('sent')}
                            >
                                <UserCheck size={16} />
                                Sent Requests
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'friends' ? styles.active : ''}`}
                                onClick={() => setActiveTab('friends')}
                            >
                                <Users size={16} />
                                Friends
                            </button>
                        </div>
                        {activeTab === 'search' && (
                            <>
                                <h2 className={styles.sectionTitle}>Find New Players</h2>
                                <div className={styles.playerGrid}>
                                    {filteredPlayers.length === 0 ? (
                                        <div className={styles.emptyMsg}>No new players to add.</div>
                                    ) : (
                                        filteredPlayers.map(player => (
                                            <PlayerProfileCard
                                                key={player._id}
                                                player={player}
                                                onSendRequest={() => handleSendRequest(player._id)}
                                                sendingRequest={actionLoading.sendRequest}
                                            />
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                        {activeTab === 'requests' && (
                            <>
                                <h2 className={styles.sectionTitle}>Friend Requests</h2>
                                <div className={styles.playerGrid}>
                                    {pendingRequests.length === 0 ? (
                                        <div className={styles.emptyMsg}>No incoming friend requests.</div>
                                    ) : (
                                        pendingRequests.map(request => (
                                            <PlayerProfileCard
                                                key={request._id}
                                                player={request.requester}
                                                onAcceptRequest={() => handleAcceptRequest(request._id)}
                                                onRejectRequest={() => handleRejectRequest(request._id)}
                                                requestStatus="pending"
                                                acceptingRequest={actionLoading.acceptRequest}
                                                rejectingRequest={actionLoading.rejectRequest}
                                            />
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                        {activeTab === 'sent' && (
                            <>
                                <h2 className={styles.sectionTitle}>Sent Requests</h2>
                                <div className={styles.playerGrid}>
                                    {sentRequests.length === 0 ? (
                                        <div className={styles.emptyMsg}>No sent friend requests.</div>
                                    ) : (
                                        sentRequests.map(request => (
                                            <PlayerProfileCard
                                                key={request._id}
                                                player={request.recipient}
                                                onCancelRequest={() => handleRejectRequest(request._id, true)}
                                                requestStatus="sent"
                                                cancellingRequest={actionLoading.rejectRequest}
                                            />
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                        {activeTab === 'friends' && (
                            <>
                                <h2 className={styles.sectionTitle}>Your Friends</h2>
                                <div className={styles.playerGrid}>
                                    {friends.length === 0 ? (
                                        <div className={styles.emptyMsg}>No friends yet.</div>
                                    ) : (
                                        friends.map(friend => (
                                            <PlayerProfileCard
                                                key={friend._id}
                                                player={friend}
                                                showFullProfile
                                                requestStatus="accepted"
                                            />
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PAddFriend;