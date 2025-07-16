const mongoose = require('mongoose');
const Proxy = require('../models/Proxy');
const connectDB = require('../config/db');
const axios = require('axios');

async function testProxies() {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();

        console.log('📋 Fetching all proxies...');
        const proxies = await Proxy.find({ isActive: true });
        
        if (proxies.length === 0) {
            console.log('❌ No active proxies found');
            return;
        }

        console.log(`✅ Found ${proxies.length} active proxies`);
        console.log('\n📊 Proxy List:');
        
        proxies.forEach((proxy, index) => {
            console.log(`${index + 1}. ${proxy.host}:${proxy.port} (${proxy.protocol})`);
        });

        console.log('\n🧪 Testing proxy connectivity...');
        
        // Test a few proxies
        const testProxies = proxies.slice(0, 3); // Test first 3 proxies
        
        for (let i = 0; i < testProxies.length; i++) {
            const proxy = testProxies[i];
            console.log(`\n🔍 Testing proxy ${i + 1}: ${proxy.host}:${proxy.port}`);
            
            try {
                const proxyConfig = {
                    host: proxy.host,
                    port: proxy.port,
                    auth: {
                        username: proxy.username,
                        password: proxy.password
                    },
                    protocol: proxy.protocol
                };

                // Test with a simple HTTP request
                const response = await axios.get('http://httpbin.org/ip', {
                    proxy: proxyConfig,
                    timeout: 10000
                });

                console.log(`✅ Proxy ${i + 1} is working - Response: ${response.data.origin}`);
                
            } catch (error) {
                console.log(`❌ Proxy ${i + 1} failed - ${error.message}`);
            }
        }

        console.log('\n📈 Proxy Statistics:');
        console.log(`Total proxies: ${proxies.length}`);
        console.log(`Active proxies: ${proxies.filter(p => p.isActive).length}`);
        
        // Show proxy usage stats
        const usedProxies = proxies.filter(p => p.lastUsed);
        if (usedProxies.length > 0) {
            console.log(`Used proxies: ${usedProxies.length}`);
            const lastUsed = usedProxies.sort((a, b) => b.lastUsed - a.lastUsed)[0];
            console.log(`Last used: ${lastUsed.host}:${lastUsed.port} at ${new Date(lastUsed.lastUsed).toLocaleString()}`);
        }

        await mongoose.disconnect();
        console.log('\n🎉 Proxy testing completed!');
        
    } catch (error) {
        console.error('❌ Error testing proxies:', error);
        process.exit(1);
    }
}

// Run the test
testProxies(); 