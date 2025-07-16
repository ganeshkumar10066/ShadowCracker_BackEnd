const instagramCookieService = require('../services/instagramCookieService');

// Advanced browser fingerprints
const browserFingerprints = [
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    platform: 'Windows',
    webglVendor: 'Google Inc. (NVIDIA)',
    webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0)',
    screenResolution: '1920x1080',
    colorDepth: 24,
    timezone: 'America/New_York',
    language: 'en-US',
    plugins: ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer', 'Native Client'],
    canvasNoise: 0.1
  },
  {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    webglVendor: 'Apple GPU',
    webglRenderer: 'Apple GPU',
    screenResolution: '1170x2532',
    colorDepth: 32,
    timezone: 'America/Los_Angeles',
    language: 'en-US',
    plugins: [],
    canvasNoise: 0.05
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    platform: 'Macintosh',
    webglVendor: 'Apple GPU',
    webglRenderer: 'Apple M1 Pro',
    screenResolution: '2560x1600',
    colorDepth: 30,
    timezone: 'Europe/London',
    language: 'en-GB',
    plugins: ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer'],
    canvasNoise: 0.08
  }
];

const acceptLanguages = [
  'en-US,en;q=0.9',
  'en-GB,en;q=0.9',
  'en-CA,en;q=0.9',
  'en-AU,en;q=0.9',
  'fr-FR,fr;q=0.9,en;q=0.8',
  'de-DE,de;q=0.9,en;q=0.8',
  'es-ES,es;q=0.9,en;q=0.8',
  'it-IT,it;q=0.9,en;q=0.8'
];

// Advanced request patterns
const requestPatterns = {
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  },
  cookies: {
    // These are now always loaded from DB, not hardcoded
  }
};

function generateRandomIGDid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateRandomMid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getRandomDelay() {
  // More natural delay pattern
  const baseDelay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
  const jitter = Math.random() * 500;
  return baseDelay + jitter;
}

function getRandomIP() {
  // Generate more realistic IP ranges
  const ranges = [
    [192, 168, 0, 0], // Private range
    [10, 0, 0, 0],    // Private range
    [172, 16, 0, 0],  // Private range
    [1, 1, 1, 1],     // Public range
    [8, 8, 8, 8]      // Public range
  ];
  
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  return range.map(num => Math.floor(Math.random() * 256)).join('.');
}

function getRandomFingerprint() {
  return browserFingerprints[Math.floor(Math.random() * browserFingerprints.length)];
}

let currentCookie = null;

async function getRandomCookie() {
  try {
    const cookie = await instagramCookieService.getRandomCookie();
    if (!cookie || !cookie.cookies) {
      throw new Error('No valid active cookies available');
    }
    currentCookie = cookie;
    return cookie;
  } catch (error) {
    // Do not log sensitive cookie info
    console.error('Error getting random cookie:', error.message);
    return currentCookie;
  }
}

// Initialize cookie on startup
async function initializeCookie() {
  try {
    const cookie = await getRandomCookie();
    currentCookie = cookie;
  } catch (error) {
    console.error('Error initializing cookie:', error.message);
  }
}

// Call initialize on module load
initializeCookie();

function getHeaders() {
  const fingerprint = getRandomFingerprint();
  const isMobile = fingerprint.platform === 'iPhone';
  
  // Parse cookies from the current cookie object
  const cookies = currentCookie ? JSON.parse(currentCookie.cookies) : {};
  
  // Base headers with fingerprint
  const headers = {
    ...requestPatterns.headers,
    'User-Agent': fingerprint.userAgent,
    'Accept-Language': fingerprint.language,
    'Sec-Ch-Ua-Mobile': isMobile ? '?1' : '?0',
    'Sec-Ch-Ua-Platform': `"${fingerprint.platform}"`,
    'X-IG-App-ID': '936619743392459',
    'X-IG-WWW-Claim': '0',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; '),
    'X-Forwarded-For': getRandomIP(),
    'X-Real-IP': getRandomIP(),
    'X-Instagram-AJAX': '1',
    'X-ASBD-ID': '198387',
    'X-IG-Capabilities': '3brTvw==',
    'X-IG-Connection-Type': 'WIFI',
    'X-IG-Connection-Speed': `${Math.floor(Math.random() * 1000) + 1000}kbps`,
    'X-IG-Bandwidth-Speed-KBPS': `${Math.floor(Math.random() * 1000) + 1000}`,
    'X-IG-Bandwidth-TotalBytes-B': `${Math.floor(Math.random() * 1000000) + 1000000}`,
    'X-IG-Bandwidth-TotalTime-MS': `${Math.floor(Math.random() * 1000) + 1000}`,
    'X-Bloks-Version-Id': generateRandomBloksVersion(),
    'X-IG-App-Locale': fingerprint.language.split('-')[0],
    'X-IG-Device-ID': generateRandomDeviceId(),
    'X-IG-Android-ID': generateRandomAndroidId(),
    'X-IG-Timezone-Offset': getTimezoneOffset(fingerprint.timezone),
    'X-IG-Connection-Quality': getRandomConnectionQuality(),
    'X-IG-Nav-Chain': generateRandomNavChain(),
    'X-IG-WWW-Claim': '0',
    'X-IG-Device-Locale': fingerprint.language,
    'X-IG-Mapped-Locale': fingerprint.language,
    'X-Pigeon-Session-Id': generateRandomPigeonSessionId(),
    'X-Pigeon-Rawclienttime': Date.now().toFixed(3),
    'X-IG-Client-Platform': isMobile ? 'iOS' : 'Web',
    'X-IG-Client-Version': isMobile ? '155.0.0.37.107' : '123.0.0.0',
    'X-IG-Client-Platform-Version': isMobile ? '16.0' : '10.0',
    'X-IG-Client-Device-Model': isMobile ? 'iPhone' : 'Windows',
    'X-IG-Client-Device-Name': isMobile ? 'iPhone' : 'Windows',
    'X-IG-Client-Device-Manufacturer': isMobile ? 'Apple' : 'PC',
    'X-IG-Client-Device-OS-Version': isMobile ? '16.0' : '10.0',
    'X-IG-Client-Device-OS-Build': isMobile ? '20A362' : '19045',
    'X-IG-Client-Device-OS-Name': isMobile ? 'iOS' : 'Windows',
    'X-IG-Client-Device-OS-Architecture': isMobile ? 'arm64' : 'x86_64',
    'X-IG-Client-Device-OS-Language': fingerprint.language,
    'X-IG-Client-Device-OS-Locale': fingerprint.language,
    'X-IG-Client-Device-OS-Timezone': fingerprint.timezone,
    'X-IG-Client-Device-OS-Timezone-Offset': getTimezoneOffset(fingerprint.timezone),
    'X-IG-Client-Device-OS-Timezone-Abbr': getTimezoneAbbr(fingerprint.timezone),
    'X-IG-Client-Device-OS-Timezone-Name': fingerprint.timezone,
    'X-IG-Client-Device-OS-Timezone-Offset-Seconds': getTimezoneOffsetSeconds(fingerprint.timezone),
    'X-IG-Client-Device-OS-Timezone-Offset-Minutes': getTimezoneOffsetMinutes(fingerprint.timezone),
    'X-IG-Client-Device-OS-Timezone-Offset-Hours': getTimezoneOffsetHours(fingerprint.timezone),
    'X-IG-Client-Device-OS-Timezone-Offset-Days': getTimezoneOffsetDays(fingerprint.timezone),
    'X-IG-Client-Device-OS-Timezone-Offset-Weeks': getTimezoneOffsetWeeks(fingerprint.timezone),
    'X-IG-Client-Device-OS-Timezone-Offset-Months': getTimezoneOffsetMonths(fingerprint.timezone),
    'X-IG-Client-Device-OS-Timezone-Offset-Years': getTimezoneOffsetYears(fingerprint.timezone)
  };

  return headers;
}

function generateRandomBloksVersion() {
  return Math.random().toString(36).substring(2, 15);
}

function generateRandomDeviceId() {
  return Math.random().toString(36).substring(2, 15);
}

function generateRandomAndroidId() {
  return Math.random().toString(36).substring(2, 15);
}

function getTimezoneOffset(timezone) {
  const date = new Date();
  return date.getTimezoneOffset();
}

function getRandomConnectionQuality() {
  const qualities = ['EXCELLENT', 'GOOD', 'POOR'];
  return qualities[Math.floor(Math.random() * qualities.length)];
}

function generateRandomNavChain() {
  return Math.random().toString(36).substring(2, 15);
}

function generateRandomPigeonSessionId() {
  return Math.random().toString(36).substring(2, 15);
}

function getTimezoneAbbr(timezone) {
  const date = new Date();
  return date.toLocaleTimeString('en-US', { timeZone: timezone, timeZoneName: 'short' }).split(' ')[2];
}

function getTimezoneOffsetSeconds(timezone) {
  return getTimezoneOffset(timezone) * 60;
}

function getTimezoneOffsetMinutes(timezone) {
  return getTimezoneOffset(timezone);
}

function getTimezoneOffsetHours(timezone) {
  return getTimezoneOffset(timezone) / 60;
}

function getTimezoneOffsetDays(timezone) {
  return getTimezoneOffsetHours(timezone) / 24;
}

function getTimezoneOffsetWeeks(timezone) {
  return getTimezoneOffsetDays(timezone) / 7;
}

function getTimezoneOffsetMonths(timezone) {
  return getTimezoneOffsetDays(timezone) / 30;
}

function getTimezoneOffsetYears(timezone) {
  return getTimezoneOffsetDays(timezone) / 365;
}

module.exports = {
  getHeaders,
  getRandomDelay,
  getRandomFingerprint,
  getRandomCookie
}; 