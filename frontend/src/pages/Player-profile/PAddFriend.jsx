import React, { useState, useEffect } from 'react'
import styles from '../css/PAddFriend.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Search, UserCheck, UserPlus, Users } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { axiosInstance } from '../../lib/axios'
import FutsalNavbar from '../../components/FutsalNavbar'
import PlayerProfileCard from '../../components/PlayerProfileCard'

const PAddFriend = () => {
    const { logOut } = useAuthStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('search');
    const [allPlayers, setAllPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            console.log('Fetching users...');
            const response = await axiosInstance.get('/users/all');
            console.log('Raw API Response:', response);
            
            const users = Array.isArray(response?.data?.data) ? response.data.data :
                         Array.isArray(response?.data?.message) ? response.data.message : [];
            
            console.log('\n=== Frontend: Received Users Data ===');
            console.log('Total Users:', users.length);
            console.log('Players:', users.filter(u => u.role === 'player').length);
            console.log('Organizers:', users.filter(u => u.role === 'organizer').length);
            
            setAllPlayers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            setAllPlayers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFriends = async () => {
        try {
            const response = await axiosInstance.get('/friends/list');
            setFriends(Array.isArray(response?.data?.data) ? response.data.data : []);
        } catch (error) {
            console.error('Error fetching friends:', error);
            setFriends([]);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await axiosInstance.get('/friends/pending');
            setPendingRequests(Array.isArray(response?.data?.data) ? response.data.data : []);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            setPendingRequests([]);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (!query.trim()) {
            setSearchResults([]);
        } else {
            const filtered = allPlayers.filter(player => 
                player.username.toLowerCase().includes(query.toLowerCase()) ||
                (player.fullName && player.fullName.toLowerCase().includes(query.toLowerCase()))
            );
            setSearchResults(filtered);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
    };

    const sendFriendRequest = async (recipientId) => {
        try {
            await axiosInstance.post('/friends/send', { recipientId });
            setSearchResults(searchResults.filter(user => user._id !== recipientId));
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const handleRequest = async (requestId, action) => {
        try {
            if (action === 'accept') {
                await axiosInstance.put(`/friends/accept/${requestId}`);
            } else {
                await axiosInstance.delete(`/friends/reject/${requestId}`);
            }
            fetchPendingRequests();
            fetchFriends();
        } catch (error) {
            console.error('Error handling friend request:', error);
        }
    };

    const handleLogout = () => {
        logOut();
        navigate('/login');
    };

    const getFilteredPlayers = () => {
        const friendsArray = Array.isArray(friends) ? friends : [];
        const pendingArray = Array.isArray(pendingRequests) ? pendingRequests : [];

        const friendIds = new Set(friendsArray.map(f => f.friendId));
        const pendingIds = new Set(pendingArray.map(r => r?.sender?._id).filter(Boolean));
        
        const playersToFilter = searchQuery.trim() ? searchResults : allPlayers;
        
        return Array.isArray(playersToFilter) 
            ? playersToFilter.filter(player => !friendIds.has(player._id) && !pendingIds.has(player._id))
            : [];
    };

    return (
        <div className={styles.body}>
            <FutsalNavbar />
            <div className={styles.container}>
                <aside className={styles.sidebar}>
                    <ul className={styles.sidebarMenu}>
                        <li><Link to="/player-dashboard">Dashboard</Link></li>
                        <li><Link to="/player-profile">Profile</Link></li>
                        <li><Link to="/player-addfriend" className={styles.active}>Add Friends</Link></li>
                        <li><Link to="/player-history">History</Link></li>
                        <li><Link to="/player-upcomingmatches">Upcoming Matches</Link></li>
                        <li>
                            <button className={styles.logoutBtn} onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    </ul>
                </aside>

                <main className={styles.mainContent}>
                    <div className={styles.friendsContainer}>
                        <div className={styles.tabs}>
                            <button 
                                className={`${styles.tab} ${activeTab === 'search' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('search')}
                            >
                                <Search size={18} /> Search Players
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('requests')}
                            >
                                <UserPlus size={18} /> Friend Requests
                                {pendingRequests.length > 0 && (
                                    <span className={styles.badge}>{pendingRequests.length}</span>
                                )}
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'friends' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('friends')}
                            >
                                <Users size={18} /> My Friends
                            </button>
                        </div>

                        <div className={styles.content}>
                            {activeTab === 'search' && (
                                <div className={styles.searchContainer}>
                                    <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                                        <input
                                            type="text"
                                            className={styles.searchInput}
                                            placeholder="Search players by username or full name..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                        />
                                    </form>
                                    <div className={styles.searchResults}>
                                        {isLoading ? (
                                            <p className={styles.loadingMessage}>Loading players...</p>
                                        ) : (
                                            <div className={styles.profileCardContainer}>
                                                {getFilteredPlayers().map((player) => (
                                                    <PlayerProfileCard
                                                        key={player._id}
                                                        player={player}
                                                        showFullProfile={true}
                                                        actionButton={
                                                            <button
                                                                className={styles.addFriendBtn}
                                                                onClick={() => sendFriendRequest(player._id)}
                                                            >
                                                                <UserPlus size={16} /> Add Friend
                                                            </button>
                                                        }
                                                    />
                                                ))}
                                                {getFilteredPlayers().length === 0 && (
                                                    <p className={styles.noResults}>
                                                        {searchQuery.trim() 
                                                            ? `No players found matching "${searchQuery}"`
                                                            : "No available players to add as friends"}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'requests' && (
                                <div className={styles.requestsSection}>
                                    {pendingRequests.length === 0 ? (
                                        <p className={styles.emptyMessage}>No pending friend requests</p>
                                    ) : (
                                        <div className={styles.profileCardContainer}>
                                            {pendingRequests.map((request) => (
                                                <PlayerProfileCard
                                                    key={request._id}
                                                    player={request.sender}
                                                    actionButton={
                                                        <div className={styles.actions}>
                                                            <button
                                                                className={styles.acceptBtn}
                                                                onClick={() => handleRequest(request._id, 'accept')}
                                                            >
                                                                <UserCheck size={16} /> Accept
                                                            </button>
                                                            <button
                                                                className={styles.rejectBtn}
                                                                onClick={() => handleRequest(request._id, 'reject')}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'friends' && (
                                <div className={styles.friendsSection}>
                                    {friends.length === 0 ? (
                                        <p className={styles.emptyMessage}>You haven't added any friends yet</p>
                                    ) : (
                                        <div className={styles.profileCardContainer}>
                                            {friends.map((friend) => (
                                                <PlayerProfileCard
                                                    key={friend.friendId}
                                                    player={friend}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PAddFriend;