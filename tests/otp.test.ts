import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

// Test AES-256-GCM OTP crypto logic directly
describe('OtpService Crypto Logic', () => {
  const mockKey = crypto.randomBytes(32);
  const mockKeyHex = mockKey.toString('hex');

  function encryptOtp(code: string, keyHex: string): string {
    const key = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let ciphertext = cipher.update(code, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
  }

  function decryptOtp(encrypted: string, keyHex: string): string {
    const key = Buffer.from(keyHex, 'hex');
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted OTP format.');
    }
    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let plaintext = decipher.update(ciphertextHex, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
  }

  it('generates, encrypts, and decrypts 4-digit OTP codes correctly', () => {
    const testCodes = ['0000', '1234', '9999', '0521'];

    for (const code of testCodes) {
      const encrypted = encryptOtp(code, mockKeyHex);
      assert.ok(encrypted.includes(':'), 'Encrypted string should have IV and AuthTag segments');
      const decrypted = decryptOtp(encrypted, mockKeyHex);
      assert.equal(decrypted, code, 'Decrypted OTP code must match original plaintext');
    }
  });

  it('fails decryption if encrypted ciphertext is tampered with', () => {
    const originalCode = '4321';
    const encrypted = encryptOtp(originalCode, mockKeyHex);
    const parts = encrypted.split(':');
    // Tamper with the ciphertext
    const tamperedCiphertext = parts[2].slice(0, -2) + (parts[2].endsWith('a') ? 'b' : 'a');
    const tampered = `${parts[0]}:${parts[1]}:${tamperedCiphertext}`;

    assert.throws(() => {
      decryptOtp(tampered, mockKeyHex);
    }, 'Tampered ciphertext must fail authentication tag check');
  });

  it('formats random codes to exactly 4 digits with leading zeros', () => {
    for (let i = 0; i < 50; i++) {
      const code = crypto.randomInt(0, 10000).toString().padStart(4, '0');
      assert.equal(code.length, 4);
      assert.match(code, /^\d{4}$/);
    }
  });
});
