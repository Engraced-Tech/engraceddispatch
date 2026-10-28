"use client";
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Lock,
  Shield,
  X,
  Database,
  Sparkles,
  Info,
  ShieldAlert,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  setDoc,
  Timestamp,
  limit,
} from "firebase/firestore";

interface SystemCleanseModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: any;
  currentUser: any;
  adminProfile?: any;
  addLog: (action: string, details: string, category?: string) => Promise<void>;
  addToast?: (type: "success" | "error" | "info", message: string) => void;
  onSuccess?: () => void;
}

const COLLECTIONS_TO_PURGE = [
  { id: "deliveries", label: "Deliveries & Live Bookings" },
  { id: "parcels", label: "Parcel Logistics Records" },
  { id: "transactions", label: "Wallet & Financial Transactions" },
  { id: "withdrawal_requests", label: "Rider Tip Payout Requests" },
  { id: "disputes", label: "Delivery Disputes & Incidents" },
  { id: "driver_locations", label: "Courier GPS Telemetry" },
  { id: "fleet_locations", label: "Realtime Fleet Map Pins" },
  { id: "fleet_broadcasts", label: "Broadcast Dispatch Claims" },
  { id: "customer_loyalty_points", label: "Loyalty Points History" },
  { id: "marketplace_orders", label: "Test Marketplace Orders" },
  { id: "notifications", label: "System Notification Feed" },
  { id: "account_deletion_requests", label: "Account Deletion Logs" },
];

const REQUIRED_CONFIRM_PHRASE = "GO LIVE CLEANUP";

export default function SystemCleanseModal({
  isOpen,
  onClose,
  db,
  currentUser,
  adminProfile,
  addLog,
  addToast,
  onSuccess,
}: SystemCleanseModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [progressDetails, setProgressDetails] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [summaryStats, setSummaryStats] = useState<{
    purgedDocs: number;
    purgedUsers: number;
    preservedAdmins: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
      setIsProcessing(false);
      setCurrentStep("");
      setProgressDetails([]);
      setIsComplete(false);
      setSummaryStats(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteCleanse = async () => {
    if (confirmText.trim() !== REQUIRED_CONFIRM_PHRASE) {
      addToast?.("error", `Please type "${REQUIRED_CONFIRM_PHRASE}" exactly to proceed.`);
      return;
    }

    setIsProcessing(true);
    setProgressDetails([]);
    let totalPurgedDocs = 0;
    let totalPurgedUsers = 0;
    let totalPreservedAdmins = 0;

    try {
      // 1. Purge root data collections in chunked batches
      for (const col of COLLECTIONS_TO_PURGE) {
        setCurrentStep(`Purging ${col.label}...`);
        let colDeleted = 0;
        while (true) {
          const q = query(collection(db, col.id), limit(250));
          const snap = await getDocs(q);
          if (snap.empty) break;

          const batch = writeBatch(db);
          snap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
          colDeleted += snap.size;
          totalPurgedDocs += snap.size;

          if (snap.size < 250) break;
        }

        if (colDeleted > 0) {
          setProgressDetails((prev) => [
            ...prev,
            `Cleared ${colDeleted} records from ${col.label}`,
          ]);
        }
      }

      // 2. Purge non-admin user accounts and subcollections
      setCurrentStep("Inspecting user accounts and preserving administrators...");
      const userSnap = await getDocs(collection(db, "users"));
      const nonAdminDocs: any[] = [];

      for (const uDoc of userSnap.docs) {
        const uData = uDoc.data();
        const role = (uData.role || uData.userRole || "").toLowerCase();
        const isAdmin =
          role === "admin" ||
          role === "super_admin" ||
          role === "superadmin" ||
          role === "manager" ||
          role === "owner" ||
          uData.isAdmin === true ||
          uData.isSuperAdmin === true ||
          (Array.isArray(uData.permissions) && uData.permissions.length > 0) ||
          uDoc.id === currentUser?.uid;

        if (isAdmin) {
          totalPreservedAdmins++;
        } else {
          nonAdminDocs.push(uDoc);
        }
      }

      setProgressDetails((prev) => [
        ...prev,
        `Identified ${totalPreservedAdmins} Administrator account(s) to strictly PRESERVE.`,
      ]);

      setCurrentStep(`Purging ${nonAdminDocs.length} non-admin customer & rider test accounts...`);

      const subcollectionNames = [
        "deliveries",
        "notifications",
        "transactions",
        "addresses",
        "cart",
        "payment_cards",
        "activity_logs",
      ];

      for (const uDoc of nonAdminDocs) {
        // Delete subcollections for non-admin
        for (const subName of subcollectionNames) {
          try {
            const subSnap = await getDocs(
              query(collection(db, "users", uDoc.id, subName), limit(100))
            );
            if (!subSnap.empty) {
              const batch = writeBatch(db);
              subSnap.docs.forEach((sd) => batch.delete(sd.ref));
              await batch.commit();
              totalPurgedDocs += subSnap.size;
            }
          } catch (_) {}
        }

        // Delete user profile document
        try {
          await deleteDoc(uDoc.ref);
          totalPurgedUsers++;
        } catch (_) {}
      }

      setProgressDetails((prev) => [
        ...prev,
        `Purged ${totalPurgedUsers} mock customer and rider accounts.`,
      ]);

      // 3. Mark database cleaned in system_config/onboarding
      setCurrentStep("Recording Go-Live Certification & Audit Trail...");
      await setDoc(
        doc(db, "system_config", "onboarding"),
        {
          databaseCleaned: true,
          databaseCleanedAt: Timestamp.now(),
          databaseCleanedBy: currentUser?.email || "SuperAdmin",
          purgedDocsCount: totalPurgedDocs,
          purgedUsersCount: totalPurgedUsers,
          preservedAdminsCount: totalPreservedAdmins,
          status: "LAUNCH_READY",
        },
        { merge: true }
      );

      // 4. Record high-visibility official audit log
      const adminName =
        adminProfile?.name || currentUser?.email?.split("@")[0] || "Administrator";
      await addLog(
        "Production System Cleanse",
        `Database purged and initialized for production go-live by ${adminName}. Wiped ${totalPurgedUsers} test accounts and ${totalPurgedDocs} operational records across all operational collections. ${totalPreservedAdmins} administrator profiles verified and preserved.`,
        "System"
      );

      setSummaryStats({
        purgedDocs: totalPurgedDocs,
        purgedUsers: totalPurgedUsers,
        preservedAdmins: totalPreservedAdmins,
      });

      setIsComplete(true);
      addToast?.("success", "Database cleaned successfully! System is now certified for production launch.");
      onSuccess?.();
    } catch (err: any) {
      console.error("Cleanse error:", err);
      addToast?.("error", `Cleanse failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
      setCurrentStep("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={!isProcessing ? onClose : undefined}
    >
      <div
        className="animate-scale-in bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl space-y-5 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-300 dark:border-red-800">
                  Critical Action &bull; Danger Zone
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-1">
                Production Go-Live System Cleanse
              </h3>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!isComplete ? (
          <>
            {/* Explanatory description */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-xs space-y-2 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-black">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Prepare System For Official Public Launch</span>
              </div>
              <p className="leading-relaxed text-[11px] opacity-90">
                This utility resets test data and mock accounts so your finances, bookings, and customer databases start completely fresh. Only run this when you are ready to transition from internal staging to live dispatch operations.
              </p>
            </div>

            {/* Scope Matrix */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                  <Shield className="w-4 h-4" />
                  <span>PRESERVED &amp; PROTECTED</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>All Administrator &amp; Staff profiles</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>System pricing matrix &amp; fare tiers</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Paystack, FCM &amp; platform API keys</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Marketplace vendor stores &amp; catalog</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Website CMS content &amp; hero banners</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-800/50 rounded-2xl">
                <div className="flex items-center gap-2 font-bold text-red-800 dark:text-red-300 mb-2">
                  <Trash2 className="w-4 h-4" />
                  <span>PERMANENTLY DELETED</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>All test customer &amp; courier accounts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>All test deliveries &amp; parcel shipments</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>All wallet transactions &amp; payout requests</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>Live GPS courier pins &amp; claim broadcasts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>Customer loyalty points &amp; test notifications</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Live Progress Display */}
            {isProcessing && (
              <div className="p-4 bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFB800]">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>{currentStep || "Processing..."}</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-gray-600 dark:text-gray-400 font-mono">
                  {progressDetails.map((msg, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-500">&bull;</span>
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation Input */}
            {!isProcessing && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Type <span className="font-mono text-red-600 dark:text-red-400 font-black">{REQUIRED_CONFIRM_PHRASE}</span> below to confirm database wipe:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`Type ${REQUIRED_CONFIRM_PHRASE}`}
                  className="w-full bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#111] dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                disabled={isProcessing}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || confirmText.trim() !== REQUIRED_CONFIRM_PHRASE}
                onClick={handleExecuteCleanse}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Wiping Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Cleanse Database &amp; Go Live</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Completion State */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-gray-900 dark:text-white">
                Database Certified Clean for Launch!
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                All test deliveries, wallet transactions, and mock user accounts have been successfully erased. Administrator profiles and core system configurations remain 100% intact.
              </p>
            </div>

            {summaryStats && (
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-white/10 rounded-2xl max-w-md mx-auto text-xs">
                <div>
                  <p className="text-lg font-black text-emerald-600">{summaryStats.preservedAdmins}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Admins Protected</p>
                </div>
                <div>
                  <p className="text-lg font-black text-red-600">{summaryStats.purgedUsers}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Accounts Purged</p>
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{summaryStats.purgedDocs}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Records Cleared</p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#111] font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
