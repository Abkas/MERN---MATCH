import { OrganizerProfile } from '../models/organizerprofile.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Futsal } from '../models/futsal.model.js';
import Review from '../models/review.model.js';

export const getAllFutsals = async (req, res) => {
    try {
        // Get all futsals from all organizers, and populate organizer data for each futsal
        const organizers = await OrganizerProfile.find({}, 'futsals')
            .populate({
                path: 'futsals',
                select: 'name location description futsalPhoto openingHours gamesOrganized plusPoints mapLink organizer ownerName ownerDescription price rating isAwarded',
                populate: {
                    path: 'organizer',
                    select: 'fullName username avatar email phoneNumber',
                    model: 'User'
                }
            });

        // Flatten the array of futsals
        const allFutsals = organizers.reduce((acc, organizer) => {
            if (organizer.futsals && organizer.futsals.length > 0) {
                // Attach organizer info to each futsal (for legacy fields)
                organizer.futsals.forEach(futsal => {
                    if (futsal.organizer && typeof futsal.organizer === 'object') {
                        futsal.organizerName = futsal.organizer.fullName || futsal.organizer.username;
                        futsal.organizerAvatar = futsal.organizer.avatar;
                        futsal.organizerEmail = futsal.organizer.email;
                        futsal.organizerPhone = futsal.organizer.phoneNumber;
                    }
                });
                return [...acc, ...organizer.futsals];
            }
            return acc;
        }, []);

        console.log('Fetched futsals (with organizer):', allFutsals.length); // Debug log

        // Send response with ApiResponse format
        return res.status(200).json(
            new ApiResponse(200, allFutsals, "Futsals retrieved successfully")
        );
    } catch (error) {
        console.error('Error in getAllFutsals:', error); // Debug log
        throw new ApiError(500, "Error fetching futsals");
    }
};

export const getFutsalById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json(
                new ApiResponse(400, null, "Futsal ID is required")
            );
        }

        console.log('Fetching futsal with ID:', id); // Debug log
        
        const futsal = await Futsal.findById(id)
            .select('name location description futsalPhoto openingHours gamesOrganized plusPoints mapLink price rating isAwarded ownerName ownerDescription')
            .populate('organizer', 'username fullName profilePicture email phoneNumber bio')
            .populate('slots')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'username fullName profilePicture'
                }
            });

        if (!futsal) {
            return res.status(404).json(
                new ApiResponse(404, null, "Futsal not found")
            );
        }

        console.log('Fetched futsal:', futsal); // Debug log

        return res.status(200).json(
            new ApiResponse(200, futsal, "Futsal retrieved successfully")
        );
    } catch (error) {
        console.error('Error in getFutsalById:', error);
        if (error.name === 'CastError') {
            return res.status(400).json(
                new ApiResponse(400, null, "Invalid futsal ID format")
            );
        }
        return res.status(500).json(
            new ApiResponse(500, null, "Error fetching futsal details")
        );
    }
};

export const getFutsalsByLocation = async (req, res) => {
    try {
        const { location } = req.params;

        // Get futsals by location from all organizers, and populate organizer data for each futsal
        const organizers = await OrganizerProfile.find({}, 'futsals')
            .populate({
                path: 'futsals',
                match: { location: { $regex: location, $options: 'i' } },
                select: 'name location description futsalPhoto openingHours gamesOrganized plusPoints mapLink organizer ownerName ownerDescription price rating isAwarded',
                populate: {
                    path: 'organizer',
                    select: 'fullName username avatar email phoneNumber',
                    model: 'User'
                }
            });

        // Flatten and filter out empty futsals arrays
        const filteredFutsals = organizers.reduce((acc, organizer) => {
            if (organizer.futsals && organizer.futsals.length > 0) {
                organizer.futsals.forEach(futsal => {
                    if (futsal.organizer && typeof futsal.organizer === 'object') {
                        futsal.organizerName = futsal.organizer.fullName || futsal.organizer.username;
                        futsal.organizerAvatar = futsal.organizer.avatar;
                        futsal.organizerEmail = futsal.organizer.email;
                        futsal.organizerPhone = futsal.organizer.phoneNumber;
                    }
                });
                return [...acc, ...organizer.futsals.filter(futsal => futsal !== null)];
            }
            return acc;
        }, []);

        console.log('Filtered futsals (with organizer):', filteredFutsals.length); // Debug log

        return res.status(200).json(
            new ApiResponse(200, filteredFutsals, "Futsals retrieved successfully")
        );
    } catch (error) {
        console.error('Error in getFutsalsByLocation:', error); // Debug log
        throw new ApiError(500, "Error fetching futsals by location");
    }
};