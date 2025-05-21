import mongoose from 'mongoose';
import { Futsal } from '../models/futsal.model.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestFutsal = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testFutsal = new Futsal({
            name: 'Test Futsal',
            location: 'Test Location',
            description: 'This is a test futsal',
            openingHours: '9:00 AM - 10:00 PM',
            futsalPhoto: '/default-futsal.jpg',
            gamesOrganized: 10,
            plusPoints: ['Parking', 'Showers', 'Cafe'],
            ownerName: 'Test Owner',
            ownerDescription: 'Test owner description',
            mapLink: '/default-map.png',
            price: 500,
            rating: 4.5,
            isAwarded: true
        });

        await testFutsal.save();
        console.log('Test futsal created:', testFutsal._id);
        console.log('You can use this ID to test the frontend:', testFutsal._id);

    } catch (error) {
        console.error('Error creating test futsal:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createTestFutsal(); 