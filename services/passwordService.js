const crypto = require('crypto');

class PasswordService {
    static generatePassword(userData) {
        const { username, fullName, bio } = userData;
        
        // Extract name components
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0].toLowerCase();
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
        
        // Common password patterns
        const patterns = [
            // Pattern 1: Firstname + Year (e.g., john2023)
            () => `${firstName}${new Date().getFullYear()}`,
            
            // Pattern 2: Firstname + Special char + Number (e.g., john!123)
            () => `${firstName}${this.getRandomSpecialChar()}${this.getRandomNumber(100, 999)}`,
            
            // Pattern 3: First letter of firstname + Lastname + Year (e.g., jsmith2023)
            () => `${firstName[0]}${lastName}${new Date().getFullYear()}`,
            
            // Pattern 4: Username + Common number (e.g., username123)
            () => `${username}${this.getRandomNumber(100, 999)}`,
            
            // Pattern 5: Firstname + Lastname + Number (e.g., johnsmith123)
            () => `${firstName}${lastName}${this.getRandomNumber(100, 999)}`,
            
            // Pattern 6: Firstname + Special char + Lastname (e.g., john@smith)
            () => `${firstName}${this.getRandomSpecialChar()}${lastName}`,
            
            // Pattern 7: Firstname + Lastname + Special char + Year (e.g., johnsmith!2023)
            () => `${firstName}${lastName}${this.getRandomSpecialChar()}${new Date().getFullYear()}`,
            
            // Pattern 8: Firstname + Common word from bio + Number (e.g., johnlove123)
            () => {
                const bioWords = bio.toLowerCase().split(/\s+/).filter(word => word.length > 3);
                const randomWord = bioWords[Math.floor(Math.random() * bioWords.length)] || 'love';
                return `${firstName}${randomWord}${this.getRandomNumber(100, 999)}`;
            }
        ];

        // Select a random pattern
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
        let password = selectedPattern();

        // 50% chance to capitalize first letter
        if (Math.random() > 0.5) {
            password = password.charAt(0).toUpperCase() + password.slice(1);
        }

        return password;
    }

    static getRandomSpecialChar() {
        const specialChars = ['!', '@', '#', '$', '%', '&', '*', '_', '-', '.'];
        return specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    static getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = PasswordService; 