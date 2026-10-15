/**
 * Serverless API: Real-Time Phone Number Format & Availability Verification
 * Route: /api/auth/check-phone
 *
 * Hardened (2026-10-15): the availability check is now performed server-side
 * against the phone registry (previously it returned `available: true`
 * unconditionally, and the length check used a broken `in` expression).
 */

// Rate limiting (in-memory, per serverless instance)
const rateLimitMap = new Map();
function isRateLimited(key, maxLimit = 30, windowMs = 60 * 1000) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter((ts) => now - ts < windowMs);
  if (timestamps.length >= maxLimit) {
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return false;
}

let adminDb = null;
function getDb() {
  if (!adminDb) {
    try {
      const admin = require("firebase-admin");
      if (admin.apps.length === 0) {
        const sa = process.env.FIREBASE_SERVICE_ACCOUNT
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : null;
        admin.initializeApp(
          sa
            ? { credential: admin.credential.cert(sa) }
            : { projectId: process.env.FIREBASE_PROJECT_ID || "engraceddispatch-ffba4" }
        );
      }
      adminDb = admin.firestore();
    } catch (err) {
      console.warn("[check-phone] firebase-admin unavailable:", err.message);
    }
  }
  return adminDb;
}

function normalizePhone(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  let filtered = "";
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (c === "+" && i === 0) filtered += c;
    else if (/\d/.test(c)) filtered += c;
  }
  const digitsOnly = filtered.startsWith("+") ? filtered.slice(1) : filtered;
  if (!digitsOnly) return "";

  if (digitsOnly.startsWith("0") && digitsOnly.length === 11) {
    return "+234" + digitsOnly.slice(1);
  }
  if (digitsOnly.startsWith("234") && digitsOnly.length === 13) {
    return "+" + digitsOnly;
  }
  if (/^[789]/.test(digitsOnly) && digitsOnly.length === 10) {
    return "+234" + digitsOnly;
  }
  if (filtered.startsWith("+")) return filtered;
  if (digitsOnly.length >= 10 && digitsOnly.length <= 15) return "+" + digitsOnly;
  return filtered;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(`ip:${clientIp}`, 30, 60 * 1000)) {
    return res.status(429).json({ success: false, error: "Too many checks. Please wait a moment." });
  }

  const queryOrBody = req.method === "POST"
    ? (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}))
    : req.query;

  const rawPhone = (queryOrBody.phone || "").trim();
  const excludeUid = (queryOrBody.excludeUid || "").trim();

  if (!rawPhone) {
    return res.status(400).json({ success: false, error: "Phone number is required." });
  }

  const normalized = normalizePhone(rawPhone);
  const key = normalized.replace("+", "");

  if (key.length < 10) {
    return res.status(400).json({
      success: false,
      error: "Please enter a valid phone number with at least 10 digits.",
      valid: false
    });
  }

  const isValidNigerian = /^\+234[789][01]\d{8}$/.test(normalized);
  const lengthValid = key.length >= 10 && key.length <= 15;

  // Server-side uniqueness check against the phone registry.
  let available = true;
  let checked = false;
  const db = getDb();
  if (db) {
    try {
      const indexSnap = await db.collection("phone_indices").doc(key).get();
      if (indexSnap.exists) {
        const data = indexSnap.data() || {};
        available = String(data.uid || "") === excludeUid || !data.uid;
      }
      if (available) {
        // Fall back to a direct user scan for numbers not yet indexed.
        const usersSnap = await db
          .collection("users")
          .where("phone", "in", [normalized, key, "+" + key])
          .limit(5)
          .get();
        const taken = usersSnap.docs.some((doc) => doc.id !== excludeUid);
        if (taken) {
          available = false;
        }
      }
      checked = true;
    } catch (err) {
      console.warn("[check-phone] Registry lookup failed:", err.message);
    }
  }

  return res.status(200).json({
    success: true,
    valid: isValidNigerian || lengthValid,
    isNigerianMobile: isValidNigerian,
    normalized,
    key,
    available,
    checked,
  });
};
