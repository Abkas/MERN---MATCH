import axios from 'axios';
import { axiosInstance } from '../lib/axios';

const futsalService = {
    getAllFutsals: async () => {
        try {
            const response = await axiosInstance.get(`/futsals/all`);
            console.log('API Response:', response.data); // Debug log
            return response.data;
        } catch (error) {
            console.error('Error fetching futsals:', error);
            throw error;
        }
    },

    getFutsalsByLocation: async (location) => {
        try {
            const response = await axiosInstance.get(`/futsals/location/${location}`);
            console.log('API Response:', response.data); // Debug log
            return response.data;
        } catch (error) {
            console.error('Error fetching futsals by location:', error);
            throw error;
        }
    },

    getFutsalById: async (id) => {
        try {
            const response = await axiosInstance.get(`/futsals/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching futsal:', error);
            throw error;
        }
    },

    // bookFutsal: async (futsalId, bookingData) => {
    //     try {
    //         const response = await axios.post(`${API_URL}/organizer/futsals/${futsalId}/book`, bookingData);
    //         return response.data;
    //     } catch (error) {
    //         console.error('Error booking futsal:', error);
    //         throw error;
    //     }
    // }
};

export default futsalService; 