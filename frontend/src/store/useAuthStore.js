import {create} from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'react-hot-toast'

export const useAuthStore =create((set)  => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCreatingFutsal: false,

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

    updatePlayerProfile: async(data) =>{
        set({isUpdatingProfile: true})
        try {
            await axiosInstance.patch('/users/update-account', data) 
            toast.success('Profile updated successfully')
        } catch (error) {
            set({isUpdatingProfile: false})
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
            return res.data
        } catch (error) {
            set({isFetchingFutsals: false})
            toast.error(error.response?.data?.message || 'Error fetching futsals')
        } finally {
            set({isFetchingFutsals: false})
        }
    },
    
}) )