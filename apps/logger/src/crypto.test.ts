import { encrypt, decrypt, hash } from './crypto';

describe('Crypto Module', () => {
  describe('encrypt function', () => {
    it('should encrypt a simple string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(plaintext.length);
    });

    it('should encrypt empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
    });

    it('should encrypt special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
    });

    it('should encrypt unicode characters', () => {
      const plaintext = 'Hello 世界 🌍';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
    });

    it('should produce consistent encrypted values for same input with fixed IV', () => {
      const plaintext = 'test';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      expect(encrypted1).toBe(encrypted2);
    });

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(1000);
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
    });
  });

  describe('decrypt function', () => {
    it('should decrypt an encrypted string back to original', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt unicode characters', () => {
      const plaintext = 'Hello 世界 🌍';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(1000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid encrypted string', () => {
      expect(() => {
        decrypt('invalid-encrypted-string');
      }).toThrow();
    });

    it('should throw error for empty encrypted string', () => {
      expect(() => {
        decrypt('');
      }).toThrow();
    });
  });

  describe('hash function', () => {
    it('should hash a string with default MD5 algorithm', () => {
      const input = 'Hello, World!';
      const hashed = hash(input);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(input);
      expect(hashed.length).toBe(32); // MD5 hash length
    });

    it('should hash empty string', () => {
      const input = '';
      const hashed = hash(input);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(input);
      expect(hashed.length).toBe(32); // MD5 hash length
    });

    it('should produce consistent hash for same input', () => {
      const input = 'test';
      const hashed1 = hash(input);
      const hashed2 = hash(input);
      
      expect(hashed1).toBe(hashed2);
    });

    it('should hash with SHA256 algorithm', () => {
      const input = 'Hello, World!';
      const hashed = hash(input, 'sha256');
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(input);
      expect(hashed.length).toBe(64); // SHA256 hash length
    });

    it('should hash with SHA1 algorithm', () => {
      const input = 'Hello, World!';
      const hashed = hash(input, 'sha1');
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(input);
      expect(hashed.length).toBe(40); // SHA1 hash length
    });

    it('should handle special characters in hash input', () => {
      const input = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hashed = hash(input);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(input);
    });

    it('should handle unicode characters in hash input', () => {
      const input = 'Hello 世界 🌍';
      const hashed = hash(input);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(input);
    });

    it('should handle long strings', () => {
      const input = 'a'.repeat(1000);
      const hashed = hash(input);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(input);
      expect(hashed.length).toBe(32); // MD5 hash length
    });
  });

  describe('Integration Tests', () => {
    it('should encrypt and decrypt complex JSON data', () => {
      const jsonData = {
        user: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
          preferences: {
            theme: 'dark',
            language: 'en',
          },
        },
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'api',
          version: '1.0.0',
        },
      };
      
      const plaintext = JSON.stringify(jsonData);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      const parsed = JSON.parse(decrypted);
      
      expect(parsed).toEqual(jsonData);
    });

    it('should handle encryption/decryption round trip with various data types', () => {
      const testCases = [
        'simple string',
        '',
        '123456789',
        '!@#$%^&*()',
        'Hello 世界 🌍',
        'a'.repeat(100),
        'line1\nline2\ttabbed',
        'quotes: "double" and \'single\'',
      ];

      testCases.forEach((testCase) => {
        const encrypted = encrypt(testCase);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(testCase);
      });
    });
  });
}); 