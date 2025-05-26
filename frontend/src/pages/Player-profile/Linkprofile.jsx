import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const Linkprofile = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      if (authUser.role === 'organizer') {
        navigate(`/organizer-profile/${authUser._id}`);
      } else if (authUser.role === 'player') {
        navigate('/player-profile');
      }
    } else {
      navigate('/login');
    }
  }, [authUser, navigate]);

  return null;
};

export default Linkprofile;