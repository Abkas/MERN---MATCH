import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import styles from '../pages/css/FriendsPanel.module.css';

const FriendsPanel = () => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchUsername, setSearchUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activeTab, setActiveTab] = useState('friends');

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await axios.get('/api/v1/friends/list');
            setFriends(response.data.data);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await axios.get('/api/v1/friends/pending');
            setPendingRequests(response.data.data);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    const searchUsers = async () => {
        if (!searchUsername.trim()) return;
        try {
            const response = await axios.get(`/api/v1/users/search?username=${searchUsername}`);
            setSearchResults(response.data.data);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const sendFriendRequest = async (recipientId) => {
        try {
            await axios.post('/api/v1/friends/send', { recipientId });
            setSearchResults(searchResults.filter(user => user._id !== recipientId));
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const handleRequest = async (requestId, action) => {
        try {
            if (action === 'accept') {
                await axios.put(`/api/v1/friends/accept/${requestId}`);
            } else {
                await axios.delete(`/api/v1/friends/reject/${requestId}`);
            }
            fetchPendingRequests();
            fetchFriends();
        } catch (error) {
            console.error('Error handling friend request:', error);
        }
    };

    return (
        <div className={styles.friendsPanel}>
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'friends' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    My Friends
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Friend Requests
                    {pendingRequests.length > 0 && (
                        <span className={styles.badge}>{pendingRequests.length}</span>
                    )}
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'add' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('add')}
                >
                    Add Friends
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'friends' && (
                    <div className={styles.friendsList}>
                        {friends.map((friend) => (
                            <div key={friend.friendId} className={styles.friendCard}>
                                <img src={friend.avatar} alt={friend.username} className={styles.avatar} />
                                <div className={styles.friendInfo}>
                                    <h3>{friend.username}</h3>
                                    <p>Friends since {new Date(friend.since).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {friends.length === 0 && (
                            <p className={styles.emptyMessage}>You haven't added any friends yet!</p>
                        )}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className={styles.requestsList}>
                        {pendingRequests.map((request) => (
                            <div key={request._id} className={styles.requestCard}>
                                <img src={request.sender.avatar} alt={request.sender.username} className={styles.avatar} />
                                <div className={styles.requestInfo}>
                                    <h3>{request.sender.username}</h3>
                                    <div className={styles.actions}>
                                        <button 
                                            className={styles.acceptBtn}
                                            onClick={() => handleRequest(request._id, 'accept')}
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            className={styles.rejectBtn}
                                            onClick={() => handleRequest(request._id, 'reject')}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {pendingRequests.length === 0 && (
                            <p className={styles.emptyMessage}>No pending friend requests!</p>
                        )}
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className={styles.searchSection}>
                        <div className={styles.searchBar}>
                            <input
                                type="text"
                                placeholder="Search by username"
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value)}
                            />
                            <button onClick={searchUsers}>Search</button>
                        </div>
                        <div className={styles.searchResults}>
                            {searchResults.map((user) => (
                                <div key={user._id} className={styles.userCard}>
                                    <img src={user.avatar} alt={user.username} className={styles.avatar} />
                                    <div className={styles.userInfo}>
                                        <h3>{user.username}</h3>
                                        <button 
                                            className={styles.addBtn}
                                            onClick={() => sendFriendRequest(user._id)}
                                        >
                                            Add Friend
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsPanel;
