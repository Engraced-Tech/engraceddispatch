import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, CheckCircle, AlertTriangle, FileText, Phone, Mail, HelpCircle, UserX, Clock, Database, Lock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useSiteContent } from "@/lib/useSiteContent";

export const DeleteAccountPage: React.FC = () => {
  const { content } = useSiteContent();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("No longer using the service");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const supportPhone = content?.contactPhone || "+234 905 626 3010";
  const supportEmail = content?.contactEmail || "support@engracedsmile.com";

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "account_deletion_requests"), {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        reason: reason + (additionalNotes.trim() ? `: ${additionalNotes.trim()}` : ""),
        status: "PENDING",
        source: "web_portal",
        createdAt: serverTimestamp(),
        requestedAt: serverTimestamp(),
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Account deletion submission failed:", err);
      setErrorMessage(
        "We could not submit your request at this time. Please contact our support desk directly at " +
          supportEmail +
          " or call " +
          supportPhone +
          "."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      {/* Top Header */}
      <header className="bg-[#111111]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3.5 border-b border-white/10 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-[#FFB800] flex items-center justify-center text-black font-black text-sm shadow-md">
            ES
          </div>
          <div>
            <div className="text-sm font-black tracking-wider text-white group-hover:text-[#FFB800] transition-colors">
              ESDISPATCH
            </div>
            <div className="text-[9px] font-bold tracking-widest text-[#FFB800]">
              PREMIUM LOGISTICS & DISPATCH
            </div>
          </div>
        </Link>

        <Link
          to="/"
          className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Title Badge */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider mb-3">
            <UserX className="w-3.5 h-3.5 text-red-400" />
            <span>Account & Data Erasure</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Request ESDispatch Account Deletion
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Pursuant to Google Play Store and data privacy guidelines, users of ESDispatch (Engraced Smile Logistics) can request the permanent removal of their account credentials and personal data.
          </p>
        </div>

        {/* Policy & Explanation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-3 text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Data Deleted Upon Request</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-2 list-disc list-inside">
              <li>Profile name, email, phone number, and account avatar</li>
              <li>Login credentials, encrypted PIN hashes, and biometric identifiers</li>
              <li>Saved personal delivery addresses and delivery contact books</li>
              <li>Active push notification tokens and device hardware signatures</li>
            </ul>
          </div>

          <div className="bg-[#161616] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-bold text-sm">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Data Retained & Regulatory Scope</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-2 list-disc list-inside">
              <li>Completed financial and payment transaction ledger entries</li>
              <li>Dispatched proof-of-delivery receipts required for statutory taxation</li>
              <li>Legal audit records retained strictly under Nigerian commercial laws</li>
              <li>Non-identifiable anonymized operational metrics</li>
            </ul>
          </div>
        </div>

        {/* Form or Success State */}
        <div className="bg-[#161616] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Deletion Request Submitted
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Your request has been securely queued in our audit register. Our compliance department will review and process your account removal within <strong className="text-white">30 business days</strong>. Any outstanding wallet balance or active orders will be settled before final deletion.
              </p>
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FFB800] text-black font-black text-xs hover:bg-[#ffc833] transition-all"
                >
                  Return to Home
                </Link>
                <a
                  href={`mailto:${supportEmail}`}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/15 transition-all"
                >
                  Contact Support Desk
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Submit Deletion Information</h2>
                <p className="text-xs text-neutral-400">
                  Please provide the exact phone number or email registered with your ESDispatch account.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Full Name (as registered)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Osas Ighodaro"
                    className="w-full bg-[#202020] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Registered Mobile Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 818 584 0000"
                    className="w-full bg-[#202020] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Registered Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full bg-[#202020] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Primary Reason for Deletion
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#202020] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFB800]"
                >
                  <option value="No longer using the service">No longer using the service</option>
                  <option value="Created duplicate account">Created duplicate account</option>
                  <option value="Moving out of Benin City / Edo State">Moving out of Benin City / Edo State</option>
                  <option value="Privacy concerns">Privacy concerns</option>
                  <option value="Switching to corporate account">Switching to corporate account</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Tell us if there is anything we can improve or if you have specific requests regarding active deliveries..."
                  className="w-full bg-[#202020] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFB800] resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-[#202020] text-[#FFB800] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-300 leading-normal">
                    I understand that deleting my account is permanent and irreversible. I will permanently lose access to any remaining promo balances and order tracking once processed.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {isSubmitting ? "Submitting Request..." : "Confirm Account Deletion Request"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Immediate Support Desk Info */}
        <div className="mt-10 p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Need Immediate Help With Your Account?</h3>
            <p className="text-xs text-neutral-400">
              Our 24/7 dispatch control room in Benin City can resolve wallet, login, or parcel issues immediately.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${supportPhone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-neutral-200 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>{supportPhone}</span>
            </a>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-neutral-200 transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-neutral-500 font-mono">
        &copy; {new Date().getFullYear()} ESDISPATCH. ALL RIGHTS RESERVED. PREMIUM LOGISTICS & DISPATCH.
      </footer>
    </div>
  );
};

export default DeleteAccountPage;
