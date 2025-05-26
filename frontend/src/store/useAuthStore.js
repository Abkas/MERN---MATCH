import {create} from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'react-hot-toast'

export const useAuthStore =create((set)  => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCreatingFutsal: false,
    isUpdatingFutsal: false,

    isCheckingAuth: true,

    checkAuth: async() =>{
        try {
            const res = await axiosInstance.get('/users/check')
            set({authUser: res.data})
        } catch (error) {
            set({authUser: null})
            console.log('Error checking auth:', error)
        }finally{
            set({isCheckingAuth: false})
        }
    },

    signUp : async(data) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post('/users/signup', data)
            set({authUser: res.data})
            toast.success('Account created successfully')
        } catch (error) {
            set({authUser: null})
            toast.error(error.response.data.message || 'Error signing up')
        } finally {
            set({isSigningUp: false})
        }
    },

    logOut : async() =>{
        try {
            await axiosInstance.post('/users/logout')
            set({authUser: null})
            toast.success('Logged out successfully')
        } catch (error) {
            toast.error(error.response.data.message || 'Error logging out')
        }
    },

    logIn: async(data) => {
        set({isLoggingIn: true})
        try {
            const res = await axiosInstance.post('/users/login', data)
            set({authUser: res.data})
            toast.success('Logged in successfully')
        } catch (error) {
            set({authUser: null})
            toast.error(error.response.data.message || 'Error logging in')
        } finally {
            set({isLoggingIn: false})
        }
    },

    updatePlayerProfile: async(data) => {
        set({isUpdatingProfile: true})
        try {
            if (typeof data === 'string') {
                return
            }
            const response = await axiosInstance.patch('/users/update-account', data)
            if (response.data.success) {
                set((state) => ({
                    authUser: {
                        ...state.authUser,
                        ...response.data.data
                    }
                }))
                toast.success('Profile updated successfully')
            } else {
                throw new Error(response.data.message || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Profile update error:', error)
            toast.error(error.response?.data?.message || 'Error updating profile')
        } finally {
            set({isUpdatingProfile: false})
        }
    },

    createFutsal: async(data) =>{
        set({isCreatingFutsal: true})
        try {
            const res = await axiosInstance.post('/organizer/create-futsal', data)
            toast.success('Futsal created successfully')
            return res.data
        } catch (error) {
            set({isCreatingFutsal: false})
            toast.error(error.response?.data?.message || 'Error creating futsal')
        } finally {
            set({isCreatingFutsal: false})
        }
    },

    fetchFutsals: async() =>{
        set({isFetchingFutsals: true})
        try {
            const res = await axiosInstance.get('/organizer/organizer-futsals')
            toast.success('Futsals fetched successfully')
            return res.data
        } catch (error) {
            set({isFetchingFutsals: false})
            toast.error(error.response?.data?.message || 'Error fetching futsals')
        } finally {
            set({isFetchingFutsals: false})
        }
    },

    updateFutsalPage: async (futsalId, data) => {
        set({isUpdatingFutsal: true})
        try {
            const res = await axiosInstance.patch(`/organizer/update-futsal/${futsalId}`, data)
            toast.success('Futsal updated successfully')
            return res.data
        } catch (error) {
            set({isUpdatingFutsal: false})
            toast.error(error.response?.data?.message || 'Error updating futsal')
            throw error
        } finally {
            set({isUpdatingFutsal: false})
        }
    },

    deleteFutsal: async (futsalId) => {
        try {
            const res = await axiosInstance.delete(`/organizer/delete-futsal/${futsalId}`);
            toast.success('Futsal deleted successfully');
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting futsal');
            throw error;
        }
    },

    updateOrganizerProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            let response;
            // If data contains a File (avatar), use FormData
            if (data && (data.avatar instanceof File)) {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== '' && value !== undefined && value !== null) {
                        formData.append(key, value);
                    }
                });
                response = await axiosInstance.patch('/organizer/profile', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                response = await axiosInstance.patch('/organizer/profile', data);
            }
            if (response.data && (response.data.success || response.data.message === 'Organizer profile updated successfully')) {
                set((state) => ({
                    authUser: {
                        ...state.authUser,
                        organizerProfile: response.data.data
                    }
                }));
                toast.success('Organizer profile updated successfully');
            } else {
                throw new Error(response.data.message || 'Failed to update organizer profile');
            }
        } catch (error) {
            console.error('Organizer profile update error:', error);
            toast.error(error.response?.data?.message || 'Error updating organizer profile');
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    
}) )