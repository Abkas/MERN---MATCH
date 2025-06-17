import MyTeam from '../models/myteam.model.js';
import { User } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';

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
    const { teamId, name, avatar } = req.body;
    const team = await MyTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Only owner can update' });
    if (name) team.name = name;
    if (avatar) team.avatar = avatar;
    await team.save();
    res.json({ success: true, team });
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

export default {
  createTeam,
  inviteToSlot,
  acceptInvite,
  declineInvite,
  updateTeam,
  getTeamByUser,
  removeMember,
  cancelInvite,
  getPendingInvites,
  deleteTeam,
};
