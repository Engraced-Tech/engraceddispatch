"use client";
import React, { useState } from "react";
import { db } from "~/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useSiteContent } from "~/lib/useSiteContent";

export default function DeleteAccountForm() {
  const { content } = useSiteContent();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("No longer using the service");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() && !phone.trim()) {
      setErrorMessage("Please enter either your registered email address or phone number.");
      return;
    }

    if (!agreed) {
      setErrorMessage("Please acknowledge the account deletion terms to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "account_deletion_requests"), {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        reason: reason + (additionalNotes.trim() ? `: ${additionalNotes.trim()}` : ""),
        status: "PENDING",
        source: "web_marketing",
        createdAt: serverTimestamp(),
        requestedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to submit deletion request. Please contact our support team at " + (content.contactEmail || "support@engracedsmile.com"));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", background: "#ECFDF5", borderRadius: 16, border: "1px solid #A7F3D0" }}>
        <CheckCircle size={48} style={{ color: "#059669", margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#065F46", marginBottom: 8 }}>Deletion Request Submitted</h3>
        <p style={{ fontSize: 14, color: "#047857", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
          Your request has been received. Our compliance team will review and process your account and personal data erasure within 30 days. You will receive confirmation via email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: "#F9FAFB", padding: 24, borderRadius: 16, border: "1px solid #E5E7EB" }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111111", marginBottom: 4 }}>Submit Deletion Details</h3>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
        Enter your registered credentials to initiate the data removal process.
      </p>

      {errorMessage && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626", fontSize: 13, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", marginBottom: 6 }}>
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Osas Ighodaro"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", marginBottom: 6 }}>
            Registered Phone <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +234 818 584 0000"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14 }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", marginBottom: 6 }}>
          Registered Email Address <span style={{ color: "#DC2626" }}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. user@example.com"
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", marginBottom: 6 }}>
          Reason for Deletion
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14, background: "#FFF" }}
        >
          <option value="No longer using the service">No longer using the service</option>
          <option value="Created duplicate account">Created duplicate account</option>
          <option value="Moving out of Benin City / Edo State">Moving out of Benin City / Edo State</option>
          <option value="Privacy concerns">Privacy concerns</option>
          <option value="Switching to corporate account">Switching to corporate account</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", marginBottom: 6 }}>
          Additional Notes (Optional)
        </label>
        <textarea
          rows={3}
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Optional feedback..."
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>
            I understand that deleting my account is permanent and irreversible. Any remaining loyalty points or unused promotion credits will be forfeited upon completion.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          background: "#DC2626",
          color: "#FFF",
          padding: "12px 28px",
          borderRadius: 12,
          border: "none",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: 0.5,
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Submitting..." : "Submit Deletion Request"}
      </button>
    </form>
  );
}
