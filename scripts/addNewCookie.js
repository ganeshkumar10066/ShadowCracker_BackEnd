const mongoose = require('mongoose');
const InstagramCookie = require('../models/InstagramCookie');
const connectDB = require('../config/db');

// Parse the cookie string into individual cookies
function parseCookieString(cookieString) {
    const cookies = {};
    const pairs = cookieString.split('; ');
    
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
            cookies[key.trim()] = value.trim();
        }
    });
    
    return cookies;
}

// The cookie string you provided
const cookieString = 'datr=J1M7aPNHUU5pkRzIVJKT7HAK; ig_did=298C8DB5-530A-4FC7-8E85-3FABC4CB22D6; ps_l=1; ps_n=1; mid=aDtTJwALAAERlDSz2YpB5wUKNzab; ig_nrcb=1; wd=562x718; dpr=0.8955223880597015; csrftoken=PPluNpx7aU7mXdBi5FXV74e649V68FhI; sessionid=74995136842%3AMPwAYk1UiDUbML%3A20%3AAYfjNxQnb7ue-jaPJ6OfkkwNFSravwVLiyhQxF2ZlA; ds_user_id=74995136842; rur="NCG\\05474995136842\\0541783843684:01fea7fa948a74493a04d332ec8d480aed1f075054bfb105bf6fea14699cebfc3a7e938f"';

// Parse the cookies
const parsedCookies = parseCookieString(cookieString);

// Create the cookie document
const newCookie = {
    username: 'instagram_user_74995136842', // Using the ds_user_id as username
    cookies: JSON.stringify(parsedCookies),
    sessionId: `session_${Date.now()}`, // Generate unique session ID
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
};

async function addNewCookie() {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to database');

        // Check if cookie with same sessionid already exists
        const existingCookie = await InstagramCookie.findOne({
            'cookies': { $regex: parsedCookies.sessionid }
        });

        if (existingCookie) {
            console.log('Cookie with this sessionid already exists:', existingCookie._id);
            console.log('Updating existing cookie...');
            
            // Update the existing cookie
            const updatedCookie = await InstagramCookie.findByIdAndUpdate(
                existingCookie._id,
                {
                    cookies: JSON.stringify(parsedCookies),
                    isActive: true,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    updatedAt: Date.now()
                },
                { new: true }
            );
            
            console.log('Cookie updated successfully:', updatedCookie._id);
        } else {
            // Add new cookie
            const cookie = new InstagramCookie(newCookie);
            const savedCookie = await cookie.save();
            console.log('New cookie added successfully:', savedCookie._id);
        }

        // Display the parsed cookies
        console.log('\nParsed cookies:');
        console.log(JSON.stringify(parsedCookies, null, 2));

        // Disconnect from database
        await mongoose.disconnect();
        console.log('Database disconnected');
    } catch (error) {
        console.error('Error adding cookie:', error);
        process.exit(1);
    }
}

// Run the script
addNewCookie(); 