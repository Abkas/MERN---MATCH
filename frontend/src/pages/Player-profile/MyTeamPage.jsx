import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';
import PlayerSidebar from '../../components/PlayerSidebar';
import FutsalNavbar from '../../components/FutsalNavbar';
import styles from '../css/MyTeamPage.module.css';

const SLOT_COUNT = 8;

const MyTeamPage = () => {
  const { authUser } = useAuthStore();
  const [team, setTeam] = useState(null);
  const [friends, setFriends] = useState([]);
  const [inviteModal, setInviteModal] = useState({ open: false, slotIndex: null });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [updateAvatar, setUpdateAvatar] = useState('');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Find all pending invites for this user (even if they are in another team)
  const [pendingTeamInvites, setPendingTeamInvites] = useState([]);
  const [showTeamInvitesModal, setShowTeamInvitesModal] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [showMatchRequestsModal, setShowMatchRequestsModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [showAvailableTeams, setShowAvailableTeams] = useState(false);
  const [removeModal, setRemoveModal] = useState({ open: false, slotIndex: null, user: null });

  useEffect(() => {
    fetchTeam();
    fetchFriends();
  }, []);

  useEffect(() => {
    const fetchPendingTeamInvites = async () => {
      try {
        const res = await axiosInstance.get('/myteam/pending-invites');
        setPendingTeamInvites(res.data.invites || []);
      } catch (e) {}
    };
    fetchPendingTeamInvites();
  }, [authUser]);

  const myInvite = team && team.pendingInvites && team.pendingInvites.find(i => i.user._id === authUser._id && i.status === 'pending');
  // Show team invite actions if user has a pending invite and is not already in a team
  const showInviteActions = team && myInvite && (!team.slots || !team.slots.some(s => s.user && s.user._id === authUser._id));

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/myteam/get-by-user');
      setTeam(res.data.team);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    const res = await axiosInstance.get('/friendships/list');
    setFriends(res.data.message || []);
  };

  const handleInvite = async (friendId, slotIndex) => {
    await axiosInstance.post('/myteam/invite', { teamId: team._id, friendId, slotIndex });
    setInviteModal({ open: false, slotIndex: null });
    fetchTeam();
  };

  const handleAccept = async () => {
    await axiosInstance.post('/myteam/accept-invite', { teamId: team._id });
    fetchTeam();
  };

  const handleDecline = async () => {
    await axiosInstance.post('/myteam/decline-invite', { teamId: team._id });
    fetchTeam();
  };

  const handleRemove = async (slotIndex) => {
    if (!window.confirm('Remove this member from the team?')) return;
    await axiosInstance.post('/myteam/remove-member', { teamId: team._id, slotIndex });
    fetchTeam();
  };

  const handleUpdateTeam = async e => {
    e.preventDefault();
    await axiosInstance.post('/myteam/update', {
      teamId: team._id,
      name: updateName,
      location: updateLocation,
      description: updateDescription
    });
    setShowUpdateModal(false);
    fetchTeam();
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('teamId', team._id);
    const res = await axiosInstance.patch('/myteam/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUpdateAvatar(res.data.avatar);
    fetchTeam();
  };

  const handleCancelInvite = async (slotIndex) => {
    if (!window.confirm('Cancel this invite?')) return;
    await axiosInstance.post('/myteam/cancel-invite', { teamId: team._id, slotIndex });
    fetchTeam();
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete your team? This action cannot be undone.')) return;
    await axiosInstance.post('/myteam/delete', { teamId: team._id });
    setTeam(null);
  };

  const fetchJoinRequests = async () => {
    if (!team) return;
    // This assumes pendingInvites are join requests
    setJoinRequests(team.pendingInvites?.filter(i => i.status === 'pending') || []);
  };

  const isOwner = team && team.owner && authUser && team.owner._id === authUser._id;

  return (
    <div className={styles.body}>
      <FutsalNavbar />
      <div className={styles.container}>
        <PlayerSidebar />
        <main className={styles.mainContent}>
          {loading ? <div>Loading...</div> : (
            <>
              {team ? (
                <>
                  <div className={styles.teamDescCard}>
                    <div className={styles.teamDescLeft}>
                      <img src={team.avatar || '/avatar.jpg'} alt="team" className={styles.teamDescAvatar} />
                    </div>
                    <div className={styles.teamDescRight}>
                      <div className={styles.teamDescName}>{team.name}</div>
                      {team.tag && <span className={styles.teamDescTag}>{team.tag}</span>}
                      <div className={styles.teamDescDesc}>{team.description || 'No description set.'}</div>
                      <div className={styles.teamDescLoc}>{team.location || 'No location set.'}</div>
                    </div>
                    {isOwner && (
                      <button className={styles.updateBtn} style={{position:'absolute',top:24,right:24}} onClick={() => {
                        setUpdateName(team.name);
                        setUpdateAvatar(team.avatar || '');
                        setUpdateLocation(team.location || '');
                        setUpdateDescription(team.description || '');
                        setShowUpdateModal(true);
                      }}>Update</button>
                    )}
                  </div>
                  {/* Join Requests Button above slots (only for owner) */}
                  {isOwner && (
                    <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
                      <button
                        className={styles.joinReqBtn}
                        style={{padding:'6px 16px',fontSize:13,borderRadius:8,background:'#f3f4f6',color:'#2563eb',border:'1.5px solid #2563eb',fontWeight:600,cursor:'pointer',boxShadow:'0 1px 4px #2563eb11'}}
                        onClick={() => {
                          fetchJoinRequests();
                          setShowJoinRequestsModal(true);
                        }}
                      >
                        View Join Requests
                      </button>
                    </div>
                  )}
                  <div className={styles.slotsGrid}>
                    {Array.from({ length: 8 }).map((_, idx) => {
                      const slot = team.slots && team.slots[idx] ? team.slots[idx] : { status: 'empty' };
                      const width = 196, height = 245;
                      return (
                        <div
                          key={idx}
                          className={styles.slotCard + ' ' + slot.status}
                          onClick={() => {
                            if (slot.status === 'empty' && isOwner) setInviteModal({ open: true, slotIndex: idx });
                            if (slot.status === 'filled' && isOwner && slot.user && slot.user._id !== authUser._id) setRemoveModal({ open: true, slotIndex: idx, user: slot.user });
                          }}
                          style={{
                            ...(slot.status === 'empty' && isOwner ? { cursor: 'pointer', opacity: 0.85 } : {}),
                            ...(slot.status === 'filled' && isOwner && slot.user && slot.user._id !== authUser._id ? { cursor: 'pointer' } : {}),
                            width, minWidth: width, maxWidth: width, height, minHeight: height, maxHeight: height,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {slot.status === 'filled' && slot.user ? (
                            <>
                              <img src={slot.user.avatar || '/avatar.jpg'} alt="user" className={styles.memberAvatar} style={{width:84,height:84}} />
                              <div className={styles.memberName}>{slot.user.username}</div>
                              {team.owner._id === slot.user._id && <span className={styles.ownerTag}>Owner</span>}
                            </>
                          ) : slot.status === 'pending' ? (
                            <div className={styles.slotPending} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}>
                              <span>Pending...</span>
                            </div>
                          ) : (
                            <div className={styles.slotEmpty} style={{fontSize:34, color:'#bbb', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                              <span style={{fontSize:50, lineHeight:1, fontWeight:300}}>+</span>
                              <span style={{fontSize:14, marginTop:6, color:'#aaa'}}>Invite Player</span>
                            </div>
                          )}
                          {slot.status === 'filled' && slot.user && slot.user._id === authUser._id && !isOwner && (
                            <button
                              className={styles.rejectBtn}
                              style={{fontSize:12,padding:'2px 10px',borderRadius:6,background:'#eee',color:'#b71c1c',border:'none',cursor:'pointer',marginTop:8}}
                              onClick={async e => {
                                e.stopPropagation();
                                await axiosInstance.post('/myteam/remove-member', { teamId: team._id, slotIndex: idx });
                                fetchTeam();
                              }}
                            >Leave Team</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:32}}>
                    {isOwner ? (
                      <button className={styles.actionBtn}>Book Match</button>
                    ) : (
                      <button className={styles.actionBtn}>Upcoming Matches</button>
                    )}
                    <button className={styles.actionBtn}>Team Challenge</button>
                  </div>
                </>
              ) : (
                <div className={styles.createTeamBox} style={{
                  maxWidth: 400,
                  margin: '48px auto',
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 2px 16px 0 #0001',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 24
                }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <h2 style={{fontWeight:700,marginBottom:8,fontSize:'1.6rem',color:'#222'}}>Find Your Futsal Team</h2>
                    <div style={{color:'#888',fontSize:'1rem',fontWeight:400}}>Join a team to play, connect, and have fun!</div>
                  </div>
                  <button className={styles.actionBtn} style={{width:'100%',maxWidth:320,justifyContent:'flex-start',gap:12,fontWeight:500,fontSize:'1.08rem',padding:'12px 20px',borderRadius:12,background:'#f5f7fa',color:'#222',boxShadow:'0 1px 4px #0001'}} onClick={() => setShowAvailableTeams(true)}>
                    <span role="img" aria-label="join" style={{fontSize:'1.3em'}}>🔍</span> Join Available Teams
                  </button>
                  <button className={styles.actionBtn} style={{width:'100%',maxWidth:320,justifyContent:'flex-start',gap:12,fontWeight:500,fontSize:'1.08rem',padding:'12px 20px',borderRadius:12,background:'#f5f7fa',color:'#222',boxShadow:'0 1px 4px #0001'}} onClick={() => setShowTeamInvitesModal(true)}>
                    <span role="img" aria-label="invites" style={{fontSize:'1.3em'}}>📩</span> See Invitations Received
                  </button>
                  <div style={{width:'100%',maxWidth:320,marginTop:8}}>
                    <div style={{textAlign:'center',color:'#aaa',fontSize:'0.98rem',margin:'18px 0 8px'}}>or</div>
                    <button className={styles.actionBtn} style={{width:'100%',justifyContent:'center',fontWeight:600,fontSize:'1.08rem',padding:'12px 20px',borderRadius:12,background:'#222',color:'#fff',boxShadow:'0 1px 4px #0001',marginBottom:18}} onClick={() => setShowUpdateModal(true)}>
                      <span role="img" aria-label="create" style={{fontSize:'1.3em'}}>➕</span> Create a Team
                    </button>
                    {/* Show create form only if showUpdateModal is true */}
                    {showUpdateModal && (
                      <div style={{marginTop:12}}>
                        <form onSubmit={async e => {
                          e.preventDefault();
                          setLoading(true);
                          await axiosInstance.post('/myteam/create', { name: updateName, description: updateDescription });
                          setLoading(false);
                          setShowUpdateModal(false);
                          setUpdateName('');
                          setUpdateDescription('');
                          fetchTeam();
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <input value={updateName} onChange={e => setUpdateName(e.target.value)} placeholder="Team Name" required />
                          <textarea value={updateDescription} onChange={e => setUpdateDescription(e.target.value)} placeholder="Team Description" rows={3} style={{resize:'vertical'}} />
                          <button type="submit" className={styles.acceptBtn}>Create Team</button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {inviteModal.open && (
        <InviteModal
          friends={friends}
          team={team}
          slotIndex={inviteModal.slotIndex}
          onInvite={handleInvite}
          onClose={() => setInviteModal({ open: false, slotIndex: null })}
        />
      )}
      {showUpdateModal && team && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Update Team Info</h3>
            <form onSubmit={handleUpdateTeam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input value={updateName} onChange={e => setUpdateName(e.target.value)} placeholder="Team Name" required />
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <label htmlFor="avatar-upload" style={{cursor:'pointer'}}>
                  <img
                    src={avatarFile ? URL.createObjectURL(avatarFile) : (updateAvatar || team?.avatar || '/avatar.jpg')}
                    alt="team-avatar"
                    className={styles.teamAvatar}
                    style={{width:70,height:70,objectFit:'cover',borderRadius:'50%',border:'2px solid #e0e0e0'}}
                    onClick={() => document.getElementById('avatar-upload').click()}
                  />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" style={{display:'none'}} onChange={e => {
                  setAvatarFile(e.target.files[0]);
                  handleAvatarUpload(e.target.files[0]);
                }} />
              </div>
              <input value={updateLocation} onChange={e => setUpdateLocation(e.target.value)} placeholder="Team Location (e.g. City, Area)" />
              <textarea value={updateDescription} onChange={e => setUpdateDescription(e.target.value)} placeholder="Team Description" rows={3} style={{resize:'vertical'}} />
              <div style={{display:'flex',gap:8}}>
                <button type="submit" className={styles.acceptBtn}>Update</button>
                <button type="button" className={styles.rejectBtn} onClick={()=>setShowUpdateModal(false)}>Cancel</button>
                <button type="button" className={styles.deleteBtn} style={{marginLeft:'auto',background:'#eee',color:'#b71c1c',fontSize:12,padding:'4px 10px',borderRadius:6}} onClick={handleDeleteTeam}>Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showTeamInvitesModal && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Team Invites Received</h3>
            <button className={styles.closeBtn} onClick={() => setShowTeamInvitesModal(false)}>×</button>
            {pendingTeamInvites.length === 0 ? (
              <div>No team invites received.</div>
            ) : (
              pendingTeamInvites.map(invite => (
                <div key={invite.teamId} className={styles.teamInviteBox}>
                  <div><b>Team:</b> {invite.teamName}</div>
                  <div><b>From:</b> {invite.ownerName}</div>
                  <button className={styles.acceptBtn} onClick={async () => {
                    await axiosInstance.post('/myteam/accept-invite', { teamId: invite.teamId });
                    fetchTeam();
                    setShowTeamInvitesModal(false);
                  }}>Accept</button>
                  <button className={styles.rejectBtn} onClick={async () => {
                    await axiosInstance.post('/myteam/decline-invite', { teamId: invite.teamId });
                    fetchTeam();
                    setShowTeamInvitesModal(false);
                  }}>Decline</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Only show join requests modal for owner */}
      {isOwner && showJoinRequestsModal && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Join Requests</h3>
            <button className={styles.closeBtn} onClick={() => setShowJoinRequestsModal(false)}>×</button>
            {(!team || !team.joinRequests || team.joinRequests.length === 0) ? (
              <div>No join requests.</div>
            ) : (
              team.joinRequests.filter(j => j.status === 'pending').map((req, i) => (
                <div key={i} className={styles.teamInviteBox} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                  <div>
                    <div><b>User:</b> {req.user?.username || req.user?.email || req.user}</div>
                    <div><b>Status:</b> {req.status}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className={styles.acceptBtn} style={{fontSize:13,padding:'4px 12px'}} onClick={async()=>{
                      await axiosInstance.post('/myteam/accept-join-request', { teamId: team._id, userId: req.user._id || req.user });
                      fetchTeam();
                    }}>Accept</button>
                    <button className={styles.rejectBtn} style={{fontSize:13,padding:'4px 12px'}} onClick={async()=>{
                      await axiosInstance.post('/myteam/decline-join-request', { teamId: team._id, userId: req.user._id || req.user });
                      fetchTeam();
                    }}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {showMatchRequestsModal && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Match Requests</h3>
            <button className={styles.closeBtn} onClick={() => setShowMatchRequestsModal(false)}>×</button>
            <div>No match requests yet.</div>
          </div>
        </div>
      )}
      <AvailableTeamsModal open={showAvailableTeams} onClose={() => setShowAvailableTeams(false)} />
      {removeModal.open && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Remove Player</h3>
            <div style={{display:'flex',alignItems:'center',gap:16,margin:'18px 0'}}>
              <img src={removeModal.user.avatar || '/avatar.jpg'} alt="avatar" style={{width:54,height:54,borderRadius:12}} />
              <div>
                <div style={{fontWeight:600,fontSize:'1.1rem'}}>{removeModal.user.username}</div>
              </div>
            </div>
            <button className={styles.rejectBtn} style={{fontSize:15,padding:'8px 24px'}} onClick={async()=>{
              await axiosInstance.post('/myteam/remove-member', { teamId: team._id, slotIndex: removeModal.slotIndex });
              setRemoveModal({ open: false, slotIndex: null, user: null });
              fetchTeam();
            }}>Remove from Team</button>
            <button className={styles.acceptBtn} style={{marginLeft:12}} onClick={()=>setRemoveModal({ open: false, slotIndex: null, user: null })}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

function CreateTeamForm({ onCreated }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await axiosInstance.post('/myteam/create', { name, avatar });
    setLoading(false);
    onCreated();
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Team Name" required />
      <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar URL (optional)" />
      <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Team'}</button>
    </form>
  );
}

function InviteModal({ friends, team, slotIndex, onInvite, onClose }) {
  // Only show friends not already in team or pending
  const takenIds = new Set([
    ...team.slots.filter(s => s.user).map(s => s.user._id),
    ...team.pendingInvites.filter(i => i.status === 'pending').map(i => i.user._id)
  ]);
  const availableFriends = friends.filter(f => !takenIds.has(f._id));
  return (
    <div className={styles.inviteModalOverlay}>
      <div className={styles.inviteModal}>
        <h3>Invite a Friend to Slot {slotIndex + 1}</h3>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <div className={styles.friendList}>
          {availableFriends.length === 0 ? (
            <div>No available friends to invite.</div>
          ) : (
            availableFriends.map(friend => (
              <div key={friend._id} className={styles.friendItem}>
                <img src={friend.avatar || '/avatar.jpg'} alt="avatar" />
                <span>{friend.username}</span>
                <button onClick={() => onInvite(friend._id, slotIndex)}>Invite</button>
              </div>
            ))
            )}
        </div>
      </div>
    </div>
  );
}

function AvailableTeamsModal({ open, onClose }) {
  const [teams, setTeams] = useState([]);
  const [joining, setJoining] = useState(null);
  const [requestedTeams, setRequestedTeams] = useState([]); // Track teams already requested
  const { authUser } = useAuthStore();

  // Fetch all teams and join requests
  useEffect(() => {
    if (open) {
      (async () => {
        const res = await axiosInstance.get('/myteam/all');
        setTeams(res.data.teams || []);
        // Fetch join requests for this user
        const reqRes = await axiosInstance.get('/myteam/my-join-requests');
        setRequestedTeams(reqRes.data.teamIds || []);
      })();
    }
  }, [open]);

  // Helper: has user already requested to join this team?
  const hasRequested = (teamId) => requestedTeams.includes(teamId);

  // Cancel join request
  const handleCancelJoinRequest = async (teamId) => {
    await axiosInstance.post('/myteam/cancel-join-request', { teamId });
    setRequestedTeams(prev => prev.filter(id => id !== teamId));
  };

  if (!open) return null;
  return (
    <div className={styles.inviteModalOverlay}>
      <div className={styles.inviteModal} style={{minWidth:340,maxWidth:500}}>
        <h3 style={{marginBottom:18}}>Available Teams</h3>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          {teams.length === 0 ? <div>No teams found.</div> : teams.map(team => (
            <div key={team._id} style={{display:'flex',alignItems:'center',gap:18,padding:'12px 0',borderBottom:'1px solid #eee'}}>
              <img src={team.avatar || '/avatar.jpg'} alt="avatar" style={{width:54,height:54,borderRadius:12,objectFit:'cover',background:'#f3f3f3'}} />
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:'1.1rem'}}>{team.name}</div>
                <div style={{color:'#888',fontSize:'0.98rem',fontWeight:400}}>Owner: {team.owner?.username || 'N/A'}</div>
                <div style={{color:'#aaa',fontSize:'0.95rem'}}>Players: {team.slots?.filter(s=>s.status==='filled').length || 1}/8</div>
              </div>
              {hasRequested(team._id) ? (
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <button className={styles.actionBtn} style={{fontSize:'0.98rem',padding:'8px 18px',background:'#e0e7ff',color:'#2563eb',cursor:'not-allowed'}} disabled>
                    Request Sent
                  </button>
                  <button className={styles.rejectBtn} style={{fontSize:'0.95rem',padding:'4px 10px'}} onClick={()=>handleCancelJoinRequest(team._id)}>
                    Cancel Request
                  </button>
                </div>
              ) : (
                <button className={styles.actionBtn} style={{fontSize:'0.98rem',padding:'8px 18px'}} disabled={joining===team._id} onClick={async()=>{
                  setJoining(team._id);
                  await axiosInstance.post('/myteam/request-join', { teamId: team._id });
                  setRequestedTeams(prev => [...prev, team._id]); // Update state so button changes
                  setJoining(null);
                }}>Request to Join</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyTeamPage;
