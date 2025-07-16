const mongoose = require('mongoose');
const Proxy = require('../models/Proxy');
const connectDB = require('../config/db');

const proxies = [
    {
        host: '38.154.227.167',
        port: 5868,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '92.113.242.158',
        port: 6742,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '198.23.239.134',
        port: 6540,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '207.244.217.165',
        port: 6712,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '107.172.163.27',
        port: 6543,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '216.10.27.159',
        port: 6837,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '136.0.207.84',
        port: 6661,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '64.64.118.149',
        port: 6732,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '142.147.128.93',
        port: 6593,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    },
    {
        host: '206.41.172.74',
        port: 6634,
        username: 'iiukzukr',
        password: '2anbpukm09xk',
        protocol: 'http',
        isActive: true
    }
];

async function importProxies() {
    try {
        console.log('🔗 Connecting to database...');
        
        // Connect to database
        await connectDB();

        console.log('🗑️ Clearing existing proxies...');
        
        // Clear existing proxies
        await Proxy.deleteMany({});

        console.log('📥 Importing new proxies...');
        
        // Insert new proxies
        const result = await Proxy.insertMany(proxies);
        console.log(`✅ Successfully imported ${result.length} proxies`);

        // Disconnect from database
        await mongoose.disconnect();
        console.log('🔌 Database disconnected');
        
        console.log('🎉 Proxy import completed successfully!');
    } catch (error) {
        console.error('❌ Error importing proxies:', error);
        process.exit(1);
    }
}

// Run the import
importProxies(); 