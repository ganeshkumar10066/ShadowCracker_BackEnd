const mongoose = require('mongoose');
const InstagramCookie = require('../models/InstagramCookie');
const connectDB = require('../config/db');

const cookies = [
    {
        username: 'instagram_user_1',
        cookies: JSON.stringify({
            sessionid: '74995136842%3A2yIqmRk4DYQOXW%3A15%3AAYdxL_NfvAEGtgWIa4qjF1nDLOMph-MLbcyF08vUqw',
            csrftoken: 'lNsAoCcOMeyIxqHYolPlBvOZHC2cpFuL',
            ds_user_id: '74995136842',
            rur: 'HIL\\05474995136842\\0541780073064:01fe457310872ca18d615beff480f48e0b91c7b5978605b1dfd3d6cc66da080b38d665ed',
            ig_did: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
            ig_nrcb: '1',
            mid: 'aDtTJwALAAERlDSz2YpB5wUKNzab'
        }),
        sessionId: 'session_1',
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    {
        username: 'instagram_user_2',
        cookies: JSON.stringify({
            datr: 'J1M7aPNHUU5pkRzIVJKT7HAK',
            ig_did: '298C8DB5-530A-4FC7-8E85-3FABC4CB22D6',
            ps_l: '1',
            ps_n: '1',
            mid: 'aDtTJwALAAERlDSz2YpB5wUKNzab',
            ig_nrcb: '1',
            wd: '562x718',
            dpr: '0.8955223880597015',
            csrftoken: 'PPluNpx7aU7mXdBi5FXV74e649V68FhI',
            sessionid: '74995136842%3AMPwAYk1UiDUbML%3A20%3AAYfjNxQnb7ue-jaPJ6OfkkwNFSravwVLiyhQxF2ZlA',
            ds_user_id: '74995136842',
            rur: 'NCG\\05474995136842\\0541783843684:01fea7fa948a74493a04d332ec8d480aed1f075054bfb105bf6fea14699cebfc3a7e938f'
        }),
        sessionId: 'session_2',
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
    // Add more cookies as needed
];

async function importCookies() {
    try {
        // Connect to database
        await connectDB();

        // Clear existing cookies
        await InstagramCookie.deleteMany({});

        // Insert new cookies
        const result = await InstagramCookie.insertMany(cookies);
        console.log(`Successfully imported ${result.length} cookies`);

        // Disconnect from database
        await mongoose.disconnect();
        console.log('Database disconnected');
    } catch (error) {
        console.error('Error importing cookies:', error);
        process.exit(1);
    }
}

// Run the import
importCookies(); 