const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking MongoDB status...');

// Check if MongoDB is running on default port
const net = require('net');
const testConnection = () => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(27017, 'localhost');
  });
};

const startMongoDB = async () => {
  const isRunning = await testConnection();
  
  if (isRunning) {
    console.log('✅ MongoDB is already running on port 27017');
    return;
  }
  
  console.log('❌ MongoDB is not running. Attempting to start...');
  
  // Try to start MongoDB using different methods
  const commands = [
    { cmd: 'mongod', args: ['--dbpath', './data/db'] },
    { cmd: 'mongod', args: ['--dbpath', 'C:/data/db'] },
    { cmd: 'mongod', args: ['--dbpath', '/data/db'] }
  ];
  
  for (const command of commands) {
    try {
      console.log(`🔄 Trying: ${command.cmd} ${command.args.join(' ')}`);
      
      const mongoProcess = spawn(command.cmd, command.args, {
        stdio: 'pipe',
        detached: true
      });
      
      mongoProcess.on('error', (error) => {
        console.log(`❌ Failed to start with ${command.cmd}: ${error.message}`);
      });
      
      mongoProcess.on('spawn', () => {
        console.log(`✅ MongoDB started successfully with ${command.cmd}`);
        console.log('💡 You can now start the backend server with: npm start');
        process.exit(0);
      });
      
      // Wait a bit before trying next command
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ Error with ${command.cmd}: ${error.message}`);
    }
  }
  
  console.log('❌ Could not start MongoDB automatically.');
  console.log('📋 Please start MongoDB manually:');
  console.log('   1. Install MongoDB if not already installed');
  console.log('   2. Create data directory: mkdir -p data/db');
  console.log('   3. Start MongoDB: mongod --dbpath ./data/db');
  console.log('   4. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:6.0');
};

startMongoDB(); 