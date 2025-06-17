import mongoose from 'mongoose';
import { Friendship } from '../models/friends.model.js';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';
import { DB_NAME } from '../constants.js';

// Load environment variables
dotenv.config();

const createTestFriendship = async () => {
    try {
        // Connect to MongoDB directly since we're in a script
        console.log('Connecting to database...');
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log('Connected successfully!');

        // Get two random users
        const users = await User.find().limit(2);
        if (users.length < 2) {
            console.log('Not enough users found!');
            return;
        }

        console.log('Found users:', users.map(u => ({ id: u._id, username: u.username })));

        // Create a test friendship
        const friendship = await Friendship.create({
            user: users[0]._id,
            friend: users[1]._id,
            status: 'pending'
        });

        console.log('Created test friendship:', {
            id: friendship._id,
            user: users[0].username,
            friend: users[1].username,
            status: friendship.status
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
};

createTestFriendship();
