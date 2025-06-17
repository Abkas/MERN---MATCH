import React, { useState, useEffect } from 'react'
import styles from '../css/PAddFriend.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Search, UserCheck, UserPlus, Users } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { axiosInstance } from '../../lib/axios'
import FutsalNavbar from '../../components/FutsalNavbar'
import PlayerProfileCard from '../../components/PlayerProfileCard'
import { toast } from 'react-hot-toast'

const PAddFriend = () => {
    const { logOut, authUser, checkAuth } = useAuthStore(); // Get auth data from store
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('search');
    const [allPlayers, setAllPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [allFriendships, setAllFriendships] = useState([]);
    const currentUserId = authUser?._id;  // Access _id directly from authUser

    console.log('=== Auth Data Debug ===');
    console.log('Full authUser:', authUser);
    console.log('User ID:', authUser?._id);
    console.log('Username:', authUser?.username);
    console.log('Current User ID (from state):', currentUserId); // Get current user ID from authUser  // Initialize with user ID from auth store

    useEffect(() => {
        // Check auth when component mounts
        console.log('=== Running Auth Check ===');
        checkAuth();
    }, []);

    // Debug effect for auth changes
    useEffect(() => {
        console.log('=== Auth State Changed ===');
        console.log('New authUser:', authUser);
    }, [authUser]);

    useEffect(() => {
        // Load all data in parallel for better performance
        const loadInitialData = async () => {
            try {
                if (!currentUserId || !authUser) {
                    console.log('No authenticated user, redirecting to login');
                    navigate('/login');
                    return;
                }

                setIsLoading(true);
                console.log('=== Fetching Initial Data ===');
                console.log('Current User:', { 
                    id: currentUserId, 
                    username: authUser.username,
                    authenticated: !!authUser
                });

                try {
                    // Check auth first
                    await axiosInstance.get('/users/check');
                    
                    // Then fetch all data in parallel
                    console.log('=== Fetching Data ===');
                    const [usersResponse, friendshipsResponse] = await Promise.all([
                        axiosInstance.get('/users/all'),
                        axiosInstance.get('/friends/all-friendships'),
                    ]);

                    console.log('=== API Responses ===');
                    console.log('Users Response:', usersResponse?.data);
                    console.log('Friendships Response:', friendshipsResponse?.data);

                    // Process users data
                    const users = Array.isArray(usersResponse?.data?.message) ? usersResponse.data.message : [];
                    console.log('Raw users data:', usersResponse?.data);
                    console.log('Users found:', users);

                    // Process friendships data
                    console.log('Raw friendships response:', friendshipsResponse?.data);
                    const rawFriendships = friendshipsResponse?.data?.message || [];
                    console.log('Raw friendships array:', rawFriendships);
                    
                    if (!Array.isArray(rawFriendships)) {
                        console.error('Friendships data is not an array:', rawFriendships);
                        toast.error('Error loading friendships data');
                        return;
                    }

                    const friendships = rawFriendships.map(f => ({
                        ...f,
                        user: typeof f.user === 'string' ? f.user : f.user?._id,
                        friend: typeof f.friend === 'string' ? f.friend : f.friend?._id
                    }));
                    
                    setAllFriendships(friendships);
                    
                    console.log('=== Friendships Debug ===');
                    console.log('Processed friendships:', friendships);

                    // Filter and set players
                    const filteredPlayers = users.filter(user => 
                        user.role === 'player' && 
                        user._id !== currentUserId
                    );
                    
                    setAllPlayers(filteredPlayers);
                    console.log('Filtered players:', filteredPlayers);

                    // Process friend requests
                    const friendRequests = friendships.filter(f => 
                        (f.user === currentUserId || f.friend === currentUserId) && 
                        f.status === 'pending'
                    );

                    const incomingRequests = friendRequests.filter(f => f.friend === currentUserId);
                    const outgoingRequests = friendRequests.filter(f => f.user === currentUserId);

                    console.log('=== Requests Debug ===');
                    console.log('Friend Requests:', friendRequests);
                    console.log('Incoming:', incomingRequests);
                    console.log('Outgoing:', outgoingRequests);

                    setPendingRequests(incomingRequests);
                    setSentRequests(outgoingRequests);

                    // Set accepted friends
                    const acceptedFriendships = friendships.filter(f => 
                        (f.user === currentUserId || f.friend === currentUserId) && 
                        f.status === 'accepted'
                    );
                    
                    const friendIds = acceptedFriendships.map(f => 
                        f.user === currentUserId ? f.friend : f.user
                    );
                    
                    const friendUsers = users.filter(user => friendIds.includes(user._id));
                    setFriends(friendUsers);

                    console.log('=== Friends Debug ===');
                    console.log('Accepted Friendships:', acceptedFriendships);
                    console.log('Friend IDs:', friendIds);
                    console.log('Friend Users:', friendUsers);

                } catch (error) {
                    console.error('API error:', error);
                    toast.error('Error loading data: ' + error.message);
                }

            } catch (error) {
                console.error('Error loading initial data:', error);
                toast.error('Error loading data: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
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

    const fetchSentRequests = async () => {
        try {
            const response = await axiosInstance.get('/friends/sent');
            console.log('Sent requests response:', response?.data);
            const requests = Array.isArray(response?.data?.data) ? response.data.data : [];
            setSentRequests(requests);
            
            // Log for debugging
            console.log('Updated sent requests:', requests);
            return requests; // Return for chaining if needed
        } catch (error) {
            console.error('Error fetching sent requests:', error);
            setSentRequests([]);
            return [];
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

    const [sendingRequest, setSendingRequest] = useState(null);
    const [cancellingRequest, setCancellingRequest] = useState(null);

    const handleSendFriendRequest = async (recipientId) => {
        try {
            console.log('=== Sending Friend Request ===');
            console.log('From:', currentUserId);
            console.log('To:', recipientId);
            setSendingRequest(recipientId);

            const response = await axiosInstance.post('/friends/send', {
                recipientId
            });

            console.log('Friend request response:', response.data);

            if (response.data.statusCode === 201 || response.status === 201) {
                // Add the new friendship to allFriendships
                const newFriendship = {
                    _id: response.data.data._id,
                    user: currentUserId,
                    friend: recipientId,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                console.log('Adding new friendship:', newFriendship);
                setAllFriendships(prev => [...prev, newFriendship]);
                
                // Add recipient to sentRequests
                const recipientUser = allPlayers.find(p => p._id === recipientId);
                if (recipientUser) {
                    const sentRequest = {
                        ...recipientUser,
                        requestId: newFriendship._id,
                        requestDate: newFriendship.createdAt
                    };
                    console.log('Adding sent request:', sentRequest);
                    setSentRequests(prev => [...prev, sentRequest]);
                } else {
                    console.warn('Could not find recipient user:', recipientId);
                }

                toast.success('Friend request sent successfully!');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            toast.error(error.response?.data?.message || 'Failed to send friend request');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setSendingRequest(null);
        }
    };

    const handleCancelRequest = async (recipientId) => {
        try {
            console.log('=== Cancelling Friend Request ===');
            console.log('Request to:', recipientId);
            setCancellingRequest(recipientId);

            const response = await axiosInstance.delete(`/friends/cancel/${recipientId}`);

            if (response.data.statusCode === 200 || response.status === 200) {
                // Remove the friendship from allFriendships
                setAllFriendships(prev => 
                    prev.filter(f => !(
                        (typeof f.user === 'object' ? f.user._id : f.user) === currentUserId && 
                        (typeof f.friend === 'object' ? f.friend._id : f.friend) === recipientId
                    ))
                );
                
                // Remove from sent requests
                setSentRequests(prev => prev.filter(user => user._id !== recipientId));
                
                // Add back to available players if needed
                const cancelledUser = allPlayers.find(p => p._id === recipientId);
                if (!cancelledUser) {
                    const user = [...sentRequests, ...friends].find(u => u._id === recipientId);
                    if (user) {
                        setAllPlayers(prev => [...prev, user]);
                    }
                }

                toast.success('Friend request cancelled');
                console.log('Friend request cancelled successfully');
            }
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel friend request');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setCancellingRequest(null);
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

    // Function to filter sent requests from all friendships
    const getSentRequests = () => {
        console.log('=== Getting Sent Requests ===');
        console.log('Current user ID:', currentUserId);
        console.log('All friendships:', allFriendships);
        
        const sentRequests = allFriendships.filter(friendship => {
            const userId = typeof friendship.user === 'object' 
                ? friendship.user._id?.toString()
                : friendship.user?.toString();
            
            const isUserSender = userId === currentUserId?.toString();
            const isPending = friendship.status === 'pending';
            
            console.log('Checking friendship:', {
                id: friendship._id,
                user: userId,
                currentUserId: currentUserId?.toString(),
                friend: typeof friendship.friend === 'object' 
                    ? friendship.friend._id?.toString() 
                    : friendship.friend?.toString(),
                status: friendship.status,
                isUserSender,
                isPending,
                matches: isUserSender && isPending
            });
            
            return isUserSender && isPending;
        });

        console.log('Found sent requests:', sentRequests.length);
        sentRequests.forEach(request => {
            console.log('Sent request details:', {
                to: request.friend?.username || request.friend,
                status: request.status,
                date: request.createdAt
            });
        });
        return sentRequests;
    };

    // Update useEffect to set sent requests correctly
    useEffect(() => {
        if (allFriendships.length > 0) {
            const sentRequestsList = getSentRequests().map(friendship => {
                // Get the friend's user object from either the populated data or allPlayers
                const friendId = typeof friendship.friend === 'object' 
                    ? friendship.friend._id 
                    : friendship.friend;
                    
                const friendUser = allPlayers.find(p => p._id === friendId);
                return friendUser;
            }).filter(Boolean);

            console.log('Setting sent requests:', sentRequestsList);
            setSentRequests(sentRequestsList);
        }
    }, [allFriendships, currentUserId, allPlayers]);

    // Helper function to determine friend request status for a player
    const getRequestStatus = (playerId) => {
        console.log('Getting request status for player:', playerId);

        const friendship = allFriendships.find(f => {
            const isUserInvolved = f.user === playerId || f.friend === playerId;
            if (isUserInvolved) {
                console.log('Found relevant friendship:', {
                    id: f._id,
                    user: f.user,
                    friend: f.friend,
                    status: f.status,
                    currentUser: currentUserId
                });
            }
            return isUserInvolved;
        });

        if (!friendship) {
            console.log('No friendship found for player:', playerId);
            return 'none';
        }

        if (friendship.status === 'accepted') {
            console.log('Found accepted friendship');
            return 'accepted';
        }

        if (friendship.status === 'pending') {
            if (friendship.user === currentUserId) {
                console.log('Found pending request sent by current user');
                return 'sent';
            }
            if (friendship.friend === currentUserId) {
                console.log('Found pending request received from player');
                return 'pending';
            }
        }

        console.log('No relevant status found, returning none');
        return 'none';
    };

    const categorizePlayers = () => {
        console.log('\n=== Starting User Categorization ===');
        if (!currentUserId) {
            console.log('Waiting for user ID before categorization');
            return { available: [], withSentRequests: [] };
        }

        // Get the base set of players to process
        const playersToProcess = searchQuery.trim() ? searchResults : allPlayers;
        console.log('Total players to process:', playersToProcess.length);
        
        // Create Sets for efficient lookup
        const sentRequestsMap = new Map();
        const friendsSet = new Set();

        // Process all friendships
        console.log('\nAnalyzing friendships...');
        allFriendships.forEach(friendship => {
            if (friendship.user === currentUserId) {
                if (friendship.status === 'pending') {
                    // Store the full friendship object for sent requests
                    sentRequestsMap.set(friendship.friend, friendship);
                    console.log(`Found sent request to: ${friendship.friend}`);
                } else if (friendship.status === 'accepted') {
                    friendsSet.add(friendship.friend);
                    console.log(`Found friend: ${friendship.friend}`);
                }
            } else if (friendship.friend === currentUserId && friendship.status === 'accepted') {
                friendsSet.add(friendship.user);
                console.log(`Found friend: ${friendship.user}`);
            }
        });

        // Categorize players
        console.log('\nCategorizing players...');
        const available = [];
        const withSentRequests = [];

        playersToProcess.forEach(player => {
            // Skip current user
            if (player._id === currentUserId) {
                console.log(`Skipping current user: ${player.username}`);
                return;
            }

            if (sentRequestsMap.has(player._id)) {
                // This is someone we've sent a request to
                const friendship = sentRequestsMap.get(player._id);
                console.log(`${player.username} - Has pending request sent`);
                withSentRequests.push({
                    ...player,
                    requestId: friendship._id,
                    requestDate: friendship.createdAt
                });
            } else if (!friendsSet.has(player._id)) {
                // This is someone available to send a request to
                console.log(`${player.username} - Available for friend request`);
                available.push(player);
            } else {
                console.log(`${player.username} - Already a friend`);
            }
        });

        console.log('\n=== Final Categorization Results ===');
        console.log('Available for Friend Requests:', available.length);
        console.log('With Sent Requests:', withSentRequests.length);
        console.log('Current Friends:', friendsSet.size);

        return {
            available,
            withSentRequests
        };
    };

    // Get filtered players for the Add Friends section
    const getFilteredPlayers = () => {
        let filtered = allPlayers;

        // Don't show current user
        filtered = filtered.filter(player => player._id !== currentUserId);

        // Apply search filter if there's a query
        if (searchQuery.trim()) {
            filtered = filtered.filter(player =>
                player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (player.fullName && player.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Add requestStatus to each player
        filtered = filtered.map(player => ({
            ...player,
            requestStatus: getRequestStatus(player._id)
        }));

        console.log('Filtered players:', filtered.map(p => ({
            username: p.username,
            requestStatus: p.requestStatus
        })));

        return filtered;
    };

    // Helper function to render sent requests tab content
    const renderSentRequestsTab = () => {
        console.log('=== Rendering Sent Requests Tab ===');
        console.log('Current sent requests:', {
            count: sentRequests.length,
            requests: sentRequests.map(r => ({
                id: r._id,
                username: r.username
            }))
        });
        
        if (sentRequests.length === 0) {
            return <p className={styles.emptyMessage}>You haven't sent any friend requests yet</p>;
        }
        
        return (
            <>
                <p className={styles.requestsInfo}>
                    Waiting for response from {sentRequests.length} player{sentRequests.length !== 1 ? 's' : ''}
                </p>
                <div className={styles.profileCardContainer}>
                    {sentRequests.map((player) => (
                        <div key={player._id} className={styles.requestCard}>
                            <PlayerProfileCard
                                player={player}
                                showFullProfile={true}
                                requestStatus="sent"
                                onCancelRequest={() => handleCancelRequest(player._id)}
                                cancellingRequest={cancellingRequest === player._id}
                            />
                            {player.requestDate && (
                                <div className={styles.requestInfo}>
                                    <span className={styles.requestDate}>
                                        Sent {new Date(player.requestDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
    };

    // Main render
    return (
        <div className={styles.pageContainer}>
            <FutsalNavbar />
            <div className={styles.gridContainer}>
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
                            <button 
                                className={`${styles.tab} ${activeTab === 'sent' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('sent')}
                            >
                                <UserPlus size={18} /> Sent Requests
                                {sentRequests.length > 0 && (
                                    <span className={styles.badge}>{sentRequests.length}</span>
                                )}
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
                                                {getFilteredPlayers().map((player) => (                                                <PlayerProfileCard
                                                    key={player._id}
                                                    player={player}
                                                    showFullProfile={true}
                                                    requestStatus={player.requestStatus}
                                                    onCancelRequest={() => handleCancelRequest(player._id)}
                                                    onSendRequest={() => handleSendFriendRequest(player._id)}
                                                    sendingRequest={sendingRequest === player._id}
                                                    cancellingRequest={cancellingRequest === player._id}
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

                            {activeTab === 'sent' && (
                                <div className={styles.sentRequestsSection}>
                                    <h3 className={styles.sectionTitle}>Friend Requests You've Sent</h3>
                                    {renderSentRequestsTab()}
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