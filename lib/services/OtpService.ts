import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { parcels } from '@/lib/db/schema';

export type OtpVerificationStatus =
  | 'success'
  | 'invalid'
  | 'locked'
  | 'already_collected'
  | 'not_found';

export interface OtpVerifyResult {
  status: OtpVerificationStatus;
  attempts?: number;
}

export class OtpService {
  private getKey(): Buffer {
    const keyHex = process.env.OTP_ENCRYPTION_KEY;
    if (!keyHex) {
      throw new Error('OTP_ENCRYPTION_KEY environment variable is missing.');
    }
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) {
      throw new Error('OTP_ENCRYPTION_KEY must be a 32-byte hex-encoded string (64 hex characters).');
    }
    return key;
  }

  /**
   * Encrypts a plaintext OTP using AES-256-GCM.
   * Returns format: `iv:authTag:ciphertext` in hex.
   */
  private encryptOtp(code: string): string {
    const iv = crypto.randomBytes(12); // Standard 12-byte IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', this.getKey(), iv);
    let ciphertext = cipher.update(code, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
  }

  /**
   * Decrypts an encrypted OTP string formatted as `iv:authTag:ciphertext`.
   */
  private decryptOtp(encrypted: string): string {
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted OTP format.');
    }
    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.getKey(), iv);
    decipher.setAuthTag(authTag);
    let plaintext = decipher.update(ciphertextHex, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
  }

  /**
   * Generates a random 4-digit code, encrypts it using AES-256-GCM, stores it in the DB,
   * resets attempts to 0, and returns the PLAINTEXT code.
   */
  async generate(parcelId: string): Promise<string> {
    const plaintextCode = crypto.randomInt(0, 10000).toString().padStart(4, '0');
    const encryptedCode = this.encryptOtp(plaintextCode);

    const [updated] = await db
      .update(parcels)
      .set({
        otpCode: encryptedCode,
        otpGeneratedAt: new Date(),
        otpAttempts: 0,
      })
      .where(eq(parcels.id, parcelId))
      .returning();

    if (!updated) {
      throw new Error(`Parcel not found: ${parcelId}`);
    }

    return plaintextCode;
  }

  /**
   * Fetches the parcel, decrypts otpCode, and returns the plaintext.
   * Returns null if parcel not found, code never generated, or parcel is already collected.
   */
  async getPlaintextOtp(parcelId: string): Promise<string | null> {
    const [parcel] = await db
      .select({
        otpCode: parcels.otpCode,
        collectedAt: parcels.collectedAt,
      })
      .from(parcels)
      .where(eq(parcels.id, parcelId));

    if (!parcel || !parcel.otpCode || parcel.collectedAt) {
      return null;
    }

    try {
      return this.decryptOtp(parcel.otpCode);
    } catch {
      return null;
    }
  }

  /**
   * Regenerates a random 4-digit code (invalidates old code, issues new one, resets attempts).
   */
  async regenerate(parcelId: string): Promise<string> {
    return this.generate(parcelId);
  }

  /**
   * Verifies the submitted OTP code.
   * Lockout occurs after 5 failed attempts.
   */
  async verify(parcelId: string, submittedCode: string): Promise<OtpVerifyResult> {
    const [parcel] = await db
      .select()
      .from(parcels)
      .where(eq(parcels.id, parcelId));

    if (!parcel) {
      return { status: 'not_found' };
    }

    if (parcel.collectedAt) {
      return { status: 'already_collected' };
    }

    if (parcel.otpAttempts >= 5) {
      return { status: 'locked', attempts: parcel.otpAttempts };
    }

    if (!parcel.otpCode) {
      return { status: 'invalid', attempts: parcel.otpAttempts };
    }

    let decryptedCode: string;
    try {
      decryptedCode = this.decryptOtp(parcel.otpCode);
    } catch {
      return { status: 'invalid', attempts: parcel.otpAttempts };
    }

    const isMatch = decryptedCode === submittedCode.trim();

    if (isMatch) {
      await db
        .update(parcels)
        .set({ collectedAt: new Date() })
        .where(eq(parcels.id, parcelId));

      return { status: 'success' };
    } else {
      const newAttempts = parcel.otpAttempts + 1;
      await db
        .update(parcels)
        .set({ otpAttempts: newAttempts })
        .where(eq(parcels.id, parcelId));

      if (newAttempts >= 5) {
        return { status: 'locked', attempts: newAttempts };
      }

      return { status: 'invalid', attempts: newAttempts };
    }
  }
}
