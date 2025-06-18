import MyTeam from '../models/myteam.model.js';
import { User } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const createTeam = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const owner = req.user._id;
    const slots = Array.from({ length: 8 }, (_, i) => i === 0 ? { user: owner, status: 'filled' } : { status: 'empty' });
    console.log('Creating team with slots:', slots);
    const team = await MyTeam.create({ name, avatar, owner, slots });
    await User.findByIdAndUpdate(owner, { myTeam: team._id });
    res.status(201).json({ success: true, team });
  } catch (err) {
    console.error('Error in createTeam:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const inviteToSlot = async (req, res) => {
  try {
    const { teamId, friendId, slotIndex } = req.body;
    console.log('InviteToSlot called:', { teamId, friendId, slotIndex });
    const team = await MyTeam.findById(teamId);
    console.log('Fetched team:', team);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can invite' });
    if (!team.slots || !Array.isArray(team.slots) || typeof slotIndex !== 'number' || slotIndex < 0 || slotIndex >= team.slots.length) {
      console.error('Invalid slotIndex or slots array:', { slotIndex, slots: team.slots });
      return res.status(400).json({ success: false, message: 'Invalid slot index' });
    }
    if (team.slots[slotIndex].status !== 'empty') return res.status(400).json({ success: false, message: 'Slot not empty' });
    // Check if friend is already in team or already invited
    if (team.slots.some(s => s.user && s.user.equals(friendId))) {
      return res.status(400).json({ success: false, message: 'User already in team' });
    }
    if (team.pendingInvites.some(i => i.user.equals(friendId) && i.status === 'pending')) {
      return res.status(400).json({ success: false, message: 'User already invited' });
    }
    team.pendingInvites.push({ user: friendId, slotIndex });
    team.slots[slotIndex] = { status: 'pending' };
    await team.save();
    // Send notification to invited user
    await Notification.create({
      user: friendId,
      recipient: friendId,
      type: 'TEAM_INVITE',
      title: 'Team Invitation',
      message: `You have been invited to join the team "${team.name}"!`,
      link: `/team/${team._id}`
    });
    res.json({ success: true, team });
  } catch (err) {
    console.error('Error in inviteToSlot:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user._id;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const invite = team.pendingInvites.find(i => i.user.equals(userId) && i.status === 'pending');
    if (!invite) return res.status(400).json({ success: false, message: 'No pending invite' });
    team.slots[invite.slotIndex] = { user: userId, status: 'filled' };
    invite.status = 'accepted';
    await team.save();
    await User.findByIdAndUpdate(userId, { myTeam: team._id });
    // Send notification to team owner
    await Notification.create({
      user: team.owner,
      recipient: team.owner,
      type: 'TEAM_JOINED',
      title: 'A player joined your team',
      message: `${req.user.username || 'A player'} has joined your team "${team.name}"!`,
      link: `/team/${team._id}`
    });
    // Send notification to user who joined
    await Notification.create({
      user: userId,
      recipient: userId,
      type: 'TEAM_JOINED',
      title: 'You joined a team',
      message: `You have joined the team "${team.name}"!`,
      link: `/team/${team._id}`
    });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const declineInvite = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user._id;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const invite = team.pendingInvites.find(i => i.user.equals(userId) && i.status === 'pending');
    if (!invite) return res.status(400).json({ success: false, message: 'No pending invite' });
    team.slots[invite.slotIndex] = { status: 'empty' };
    invite.status = 'declined';
    await team.save();
    // Notify owner that invite was declined
    await Notification.create({
      user: team.owner,
      recipient: team.owner,
      type: 'TEAM_INVITE_DECLINED',
      title: 'Team Invite Declined',
      message: `${req.user.username || 'A player'} declined your invitation to join "${team.name}".`,
      link: `/team/${team._id}`
    });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId, name, avatar, location, description } = req.body;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can update' });
    if (name) team.name = name;
    if (typeof avatar !== 'undefined') {
      if (avatar === '' || avatar === null) {
        team.avatar = '';
      } else if (typeof avatar === 'string' && avatar.trim() !== '') {
        team.avatar = avatar;
      }
    }
    if (typeof location !== 'undefined') {
      if (location === '' || location === null) {
        team.location = '';
      } else if (typeof location === 'string' && location.trim() !== '') {
        team.location = location;
      }
    }
    if (typeof description !== 'undefined') {
      if (description === '' || description === null) {
        team.description = '';
      } else if (typeof description === 'string' && description.trim() !== '') {
        team.description = description;
      }
    }
    await team.save();
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTeamAvatar = async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can update avatar' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult || !uploadResult.secure_url) return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
    team.avatar = uploadResult.secure_url;
    await team.save();
    res.json({ success: true, avatar: team.avatar, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTeamByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const team = await MyTeam.findOne({
      $or: [
        { owner: userId },
        { 'slots.user': userId }
      ]
    }).populate('owner slots.user pendingInvites.user');
    if (!team) return res.json({ success: true, team: null });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { teamId, slotIndex } = req.body;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can remove members' });
    if (slotIndex === 0) return res.status(400).json({ success: false, message: 'Owner cannot be removed' });
    const removedUser = team.slots[slotIndex].user;
    team.slots[slotIndex] = { status: 'empty' };
    await team.save();
    // Notify removed user
    if (removedUser) {
      await Notification.create({
        user: removedUser,
        recipient: removedUser,
        type: 'TEAM_REMOVED',
        title: 'Removed from Team',
        message: `You have been removed from the team "${team.name}" by the owner.`,
        link: `/team/${team._id}`
      });
    }
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const cancelInvite = async (req, res) => {
  try {
    const { teamId, slotIndex } = req.body;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can cancel invites' });
    // Remove invite for this slot
    const removedInvite = team.pendingInvites.find(i => i.slotIndex === slotIndex && i.status === 'pending');
    team.pendingInvites = team.pendingInvites.filter(i => i.slotIndex !== slotIndex || i.status !== 'pending');
    team.slots[slotIndex] = { status: 'empty' };
    await team.save();
    // Notify user if invite was canceled
    if (removedInvite) {
      await Notification.create({
        user: removedInvite.user,
        recipient: removedInvite.user,
        type: 'TEAM_INVITE_CANCELED',
        title: 'Team Invite Canceled',
        message: `Your invitation to join the team "${team.name}" was canceled by the owner.`,
        link: `/team/${team._id}`
      });
    }
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPendingInvites = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching pending invites for user:', userId);
    // Find all teams where this user has a pending invite
    const teams = await MyTeam.find({ 'pendingInvites.user': userId, 'pendingInvites.status': 'pending' })
      .populate('owner');
    console.log('Teams with pending invites:', teams.map(t => t._id));
    const invites = [];
    for (const team of teams) {
      const invite = team.pendingInvites.find(i => i.user.equals(userId) && i.status === 'pending');
      if (invite) {
        invites.push({
          teamId: team._id,
          teamName: team.name,
          ownerName: team.owner.username || team.owner.email || 'Owner',
          slotIndex: invite.slotIndex
        });
      }
    }
    console.log('Invites to return:', invites);
    res.json({ invites });
  } catch (err) {
    console.error('Error fetching pending invites:', err);
    res.status(500).json({ invites: [], message: err.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can delete the team' });
    // Remove team reference from all users in slots
    for (const slot of team.slots) {
      if (slot.user) {
        await User.findByIdAndUpdate(slot.user, { $unset: { myTeam: '' } });
      }
    }
    await team.deleteOne();
    res.json({ success: true, message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all teams for public listing
const getAllTeams = async (req, res) => {
  try {
    const teams = await MyTeam.find({}, 'name avatar owner slots').populate('owner', 'username avatar');
    res.json({ success: true, teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Player requests to join a team
const requestToJoinTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user._id;
    // Check if user is already in a team
    const user = await User.findById(userId);
    if (user.myTeam) return res.status(400).json({ success: false, message: 'Already in a team' });
    // Remove all pending join requests from other teams
    await MyTeam.updateMany(
      { 'joinRequests.user': userId, 'joinRequests.status': 'pending' },
      { $pull: { joinRequests: { user: userId, status: 'pending' } } }
    );
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.slots.some(s => s.user && s.user.equals(userId))) return res.status(400).json({ success: false, message: 'Already in team' });
    if (team.joinRequests && team.joinRequests.some(j => j.user.equals(userId) && j.status === 'pending')) return res.status(400).json({ success: false, message: 'Already requested' });
    team.joinRequests = team.joinRequests || [];
    team.joinRequests.push({ user: userId, status: 'pending' });
    await team.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Owner accepts a join request
const acceptJoinRequest = async (req, res) => {
  try {
    const { teamId, userId } = req.body;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can accept' });
    const reqIdx = team.joinRequests.findIndex(j => j.user.equals(userId) && j.status === 'pending');
    if (reqIdx === -1) return res.status(404).json({ success: false, message: 'Request not found' });
    // Check if user is already in another team
    const user = await User.findById(userId);
    if (user.myTeam && user.myTeam.toString() !== teamId) {
      // Remove this join request
      team.joinRequests = team.joinRequests.filter(j => !(j.user.equals(userId) && j.status === 'pending'));
      await team.save();
      return res.status(400).json({ success: false, message: 'Player already in another team. Request removed.' });
    }
    // Find first empty slot
    const slotIdx = team.slots.findIndex(s => s.status === 'empty');
    if (slotIdx === -1) return res.status(400).json({ success: false, message: 'No empty slot' });
    team.slots[slotIdx] = { user: userId, status: 'filled' };
    team.joinRequests[reqIdx].status = 'accepted';
    await team.save();
    await User.findByIdAndUpdate(userId, { myTeam: team._id });
    // Remove all pending join requests from other teams
    await MyTeam.updateMany(
      { 'joinRequests.user': userId, 'joinRequests.status': 'pending', _id: { $ne: teamId } },
      { $pull: { joinRequests: { user: userId, status: 'pending' } } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Owner declines a join request
const declineJoinRequest = async (req, res) => {
  try {
    const { teamId, userId } = req.body;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can decline' });
    const reqIdx = team.joinRequests.findIndex(j => j.user.equals(userId) && j.status === 'pending');
    if (reqIdx === -1) return res.status(404).json({ success: false, message: 'Request not found' });
    team.joinRequests[reqIdx].status = 'declined';
    await team.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all team IDs where the current user has a pending join request
const getMyJoinRequests = async (req, res) => {
  try {
    const teams = await MyTeam.find({
      'joinRequests.user': req.user._id,
      'joinRequests.status': 'pending'
    }, '_id');
    const teamIds = teams.map(t => t._id);
    res.json({ success: true, teamIds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel a join request (by the user)
const cancelJoinRequest = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user._id;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    // Remove the pending join request for this user
    const before = team.joinRequests.length;
    team.joinRequests = team.joinRequests.filter(j => !(j.user.equals(userId) && j.status === 'pending'));
    if (team.joinRequests.length === before) return res.status(400).json({ success: false, message: 'No pending join request found' });
    await team.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  createTeam,
  inviteToSlot,
  acceptInvite,
  declineInvite,
  updateTeam,
  updateTeamAvatar,
  getTeamByUser,
  removeMember,
  cancelInvite,
  getPendingInvites,
  deleteTeam,
  getAllTeams,
  requestToJoinTeam,
  acceptJoinRequest,
  declineJoinRequest,
  getMyJoinRequests,
  cancelJoinRequest,
};
