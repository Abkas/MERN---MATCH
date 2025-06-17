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
  const [loading, setLoading] = useState(true);
  // Find all pending invites for this user (even if they are in another team)
  const [pendingTeamInvites, setPendingTeamInvites] = useState([]);
  const [showTeamInvitesModal, setShowTeamInvitesModal] = useState(false);

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
    await axiosInstance.post('/myteam/update', { teamId: team._id, name: updateName, avatar: updateAvatar });
    setShowUpdateModal(false);
    fetchTeam();
  };

  const handleCancelInvite = async (slotIndex) => {
    if (!window.confirm('Cancel this invite?')) return;
    await axiosInstance.post('/myteam/cancel-invite', { teamId: team._id, slotIndex });
    fetchTeam();
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
              <button className={styles.requestBtn} style={{marginBottom: 16}} onClick={() => setShowTeamInvitesModal(true)}>
                See Team Invites Received
              </button>
              {team ? (
                <>
                  <div className={styles.teamHeader}>
                    <div style={{textAlign:'center'}}>
                      <div className={styles.teamName}>{team.name}</div>
                      <img src={team.avatar || '/avatar.jpg'} alt="team" className={styles.teamAvatar} />
                    </div>
                    {isOwner && (
                      <button className={styles.updateBtn} onClick={() => {
                        setUpdateName(team.name);
                        setUpdateAvatar(team.avatar || '');
                        setShowUpdateModal(true);
                      }}>Update Team Info</button>
                    )}
                  </div>
                  <div className={styles.slotsGrid}>
                    {Array.from({ length: 8 }).map((_, idx) => {
                      if (idx === 0 && team.owner) {
                        // Owner slot
                        return (
                          <div key={idx} className={styles.slotCard}>
                            <div className={styles.slotUser}>
                              <img src={team.owner.avatar || '/avatar.jpg'} alt="owner" className={styles.memberAvatar} />
                              <div className={styles.memberName}>{team.owner.username}</div>
                              <span className={styles.ownerTag}>Owner</span>
                            </div>
                          </div>
                        );
                      }
                      const slot = team.slots && team.slots[idx] ? team.slots[idx] : { status: 'empty' };
                      return (
                        <div key={idx} className={styles.slotCard}>
                          {slot.status === 'filled' && slot.user ? (
                            <div className={styles.slotUser}>
                              <img src={slot.user.avatar || '/avatar.jpg'} alt="user" className={styles.memberAvatar} />
                              <div className={styles.memberName}>{slot.user.username}</div>
                              {team.owner._id === slot.user._id && <span className={styles.ownerTag}>Owner</span>}
                              {isOwner && idx !== 0 && (
                                <button className={styles.removeBtn} onClick={() => handleRemove(idx)}>Remove</button>
                              )}
                            </div>
                          ) : slot.status === 'pending' ? (
                            (() => {
                              const invite = team.pendingInvites && team.pendingInvites.find(i => i.slotIndex === idx && i.status === 'pending');
                              const invitedUser = invite && friends.find(f => f._id === (invite.user._id || invite.user));
                              return (
                                <div className={styles.slotPending}>
                                  Pending...
                                  {invitedUser && (
                                    <div className={styles.invitedUserInfo}>
                                      <img src={invitedUser.avatar || '/avatar.jpg'} alt="invited" className={styles.memberAvatar} />
                                      <div className={styles.memberName}>{invitedUser.username}</div>
                                    </div>
                                  )}
                                  {isOwner && (
                                    <button className={styles.removeBtn} onClick={() => handleCancelInvite(idx)}>Cancel Invite</button>
                                  )}
                                </div>
                              );
                            })()
                          ) : (isOwner && idx !== 0 ? (
                            <button className={styles.addBtn} onClick={() => setInviteModal({ open: true, slotIndex: idx })}>+
                              <span className={styles.addText}>Add</span>
                            </button>
                          ) : (
                            <div className={styles.slotEmpty}>Empty</div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className={styles.createTeamBox}>
                  <h2>Create Your Team</h2>
                  <CreateTeamForm onCreated={fetchTeam} />
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
      {showUpdateModal && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Update Team Info</h3>
            <form onSubmit={handleUpdateTeam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input value={updateName} onChange={e => setUpdateName(e.target.value)} placeholder="Team Name" required />
              <input value={updateAvatar} onChange={e => setUpdateAvatar(e.target.value)} placeholder="Avatar URL (optional)" />
              <div style={{display:'flex',gap:8}}>
                <button type="submit" className={styles.acceptBtn}>Update</button>
                <button type="button" className={styles.rejectBtn} onClick={()=>setShowUpdateModal(false)}>Cancel</button>
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

export default MyTeamPage;
