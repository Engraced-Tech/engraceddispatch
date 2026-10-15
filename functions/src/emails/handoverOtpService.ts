import * as crypto from 'crypto';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Server-authoritative handover OTP service.
 *
 * Design goals (remediation of audit findings C3/M7):
 *  - Codes are generated ONLY server-side with a CSPRNG (never client-supplied).
 *  - The delivery document stores ONLY a salted HMAC-SHA256 hash bound to the
 *    deliveryId — never the plaintext code.
 *  - The plaintext code is kept solely in `delivery_otp_secrets/{deliveryId}`,
 *    a collection locked to the Admin SDK by security rules
 *    (`allow read, write: if false`), so no client can ever read it back.
 *  - Verification uses a constant-time comparison and a server-side attempt
 *    lockout that clients cannot reset (rules deny client writes to otp* fields).
 *  - Legacy plaintext `otpCode` documents are migrated to the hashed format on
 *    first successful verification and the plaintext is purged.
 */

const HANDOVER_PEPPER =
  (process.env.HANDOVER_OTP_PEPPER || 'ESDISPATCH_HANDOVER_OTP_PEPPER_2026').trim();

const MAX_ATTEMPTS = 5;
const OTP_VALIDITY_MINUTES = 30;
const OTP_LENGTH = 4;

function hashHandoverCode(deliveryId: string, code: string): string {
  return crypto
    .createHmac('sha256', HANDOVER_PEPPER)
    .update(`${deliveryId}|${code.trim()}`)
    .digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function generateCode(): string {
  return crypto.randomInt(0, 10000).toString().padStart(OTP_LENGTH, '0');
}

export interface HandoverOtpIssueResult {
  code: string;
  expiresAt: Date;
}

/**
 * Issues a fresh handover OTP for a delivery: hash on the delivery doc,
 * plaintext only inside the rules-locked secrets collection.
 */
export async function issueHandoverOtp(deliveryId: string): Promise<HandoverOtpIssueResult> {
  const db = getFirestore();
  const deliveryRef = db.collection('deliveries').doc(deliveryId);
  const snap = await deliveryRef.get();

  if (!snap.exists) {
    throw new Error('Delivery not found.');
  }

  const code = generateCode();
  const hashed = hashHandoverCode(deliveryId, code);
  const now = Date.now();
  const expiresAt = new Date(now + OTP_VALIDITY_MINUTES * 60 * 1000);

  await db.collection('delivery_otp_secrets').doc(deliveryId).set({
    code,
    expiresAt: Timestamp.fromDate(expiresAt),
    issuedAt: FieldValue.serverTimestamp(),
  });

  await deliveryRef.update({
    otpHash: hashed,
    otpExpiresAt: Timestamp.fromDate(expiresAt),
    otpIssuedAt: FieldValue.serverTimestamp(),
    otpAttempts: 0,
    otpVerified: false,
    // Purge legacy plaintext copies so the code never rests in clear text
    otpCode: FieldValue.delete(),
    handoverCode: FieldValue.delete(),
    securityCode: FieldValue.delete(),
  });

  return { code, expiresAt };
}

/**
 * Returns the currently active plaintext code (if unexpired) from the locked
 * secrets collection. Returns null when no active code exists.
 */
export async function getActiveHandoverOtp(
  deliveryId: string
): Promise<{ code: string; expiresAt: Date } | null> {
  const db = getFirestore();
  const secretSnap = await db.collection('delivery_otp_secrets').doc(deliveryId).get();
  if (!secretSnap.exists) {
    return null;
  }
  const data = secretSnap.data() || {};
  const code = String(data.code || '').trim();
  if (!/^\d{4}$/.test(code)) {
    return null;
  }
  const expiresAt = data.expiresAt?.toMillis
    ? new Date(data.expiresAt.toMillis())
    : new Date(data.expiresAt || 0);
  if (expiresAt.getTime() <= Date.now()) {
    return null;
  }
  return { code, expiresAt };
}

export interface HandoverOtpVerifyResult {
  verified: boolean;
  message: string;
}

/**
 * Verifies a rider-submitted handover code against the stored hash.
 * Enforces the attempt lockout and migrates legacy plaintext codes.
 */
export async function verifyHandoverOtp(
  deliveryId: string,
  inputCode: string
): Promise<HandoverOtpVerifyResult> {
  const db = getFirestore();
  const deliveryRef = db.collection('deliveries').doc(deliveryId);
  const snap = await deliveryRef.get();

  if (!snap.exists) {
    return { verified: false, message: 'Delivery not found.' };
  }

  const data = snap.data() || {};
  const attempts = Number(data.otpAttempts) || 0;

  if (attempts >= MAX_ATTEMPTS) {
    return {
      verified: false,
      message: 'Maximum verification attempts exceeded. Please contact dispatch.',
    };
  }

  const now = Date.now();
  const expiresAtMs = data.otpExpiresAt?.toMillis
    ? data.otpExpiresAt.toMillis()
    : new Date(data.otpExpiresAt || 0).getTime();

  if (expiresAtMs && now > expiresAtMs) {
    return {
      verified: false,
      message: 'Handover code has expired. The recipient can request a fresh code.',
    };
  }

  const input = String(inputCode).trim();
  let matched = false;

  if (data.otpHash) {
    matched = safeEqual(hashHandoverCode(deliveryId, input), String(data.otpHash));
  } else {
    // Legacy migration: documents created before the hardened flow stored the
    // code in plaintext. Accept once, then upgrade to the hashed format.
    const legacyCode = String(data.otpCode || data.handoverCode || data.securityCode || '').trim();
    matched = legacyCode.length > 0 && legacyCode === input;
    if (matched) {
      await deliveryRef.update({
        otpHash: hashHandoverCode(deliveryId, input),
        otpCode: FieldValue.delete(),
        handoverCode: FieldValue.delete(),
        securityCode: FieldValue.delete(),
      });
    }
  }

  if (!matched) {
    await deliveryRef.update({ otpAttempts: FieldValue.increment(1) });
    const remaining = MAX_ATTEMPTS - attempts - 1;
    return {
      verified: false,
      message:
        remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Invalid code. Maximum attempts reached. Please contact dispatch.',
    };
  }

  await deliveryRef.update({
    otpVerified: true,
    otpAttempts: 0,
    handoverVerifiedAt: FieldValue.serverTimestamp(),
  });

  return { verified: true, message: 'Handover code verified.' };
}
