"use client";
import React, { useState, useEffect } from "react";
import {
  Rocket,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Sparkles,
  CreditCard,
  DollarSign,
  MapPin,
  Smartphone,
  FileText,
  Users,
  Store,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";

interface AdminGoLiveOnboardingProps {
  db: any;
  settings: any;
  deliveries: any[];
  drivers: any[];
  activeUsers: any[];
  setTab: (tab: any) => void;
  marketplaceEnabled: boolean;
  toggleMarketplace: () => void;
  onOpenCleanseModal: () => void;
  addToast?: (type: "success" | "error" | "info", message: string) => void;
}

export default function AdminGoLiveOnboarding({
  db,
  settings,
  deliveries,
  drivers,
  activeUsers,
  setTab,
  marketplaceEnabled,
  toggleMarketplace,
  onOpenCleanseModal,
  addToast,
}: AdminGoLiveOnboardingProps) {
  const [onboardingDoc, setOnboardingDoc] = useState<any>({});
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Sync onboarding state from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "system_config", "onboarding"),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setOnboardingDoc(d);
          setIsDismissed(d.dismissed === true);
        }
      },
      () => {}
    );
    return () => unsub();
  }, [db]);

  const handleToggleManual = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentChecks = onboardingDoc?.manualChecks || {};
    const updatedChecks = {
      ...currentChecks,
      [taskId]: !currentChecks[taskId],
    };
    try {
      await setDoc(
        doc(db, "system_config", "onboarding"),
        {
          manualChecks: updatedChecks,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (_) {}
  };

  const handleDismiss = async () => {
    try {
      await setDoc(
        doc(db, "system_config", "onboarding"),
        {
          dismissed: true,
          dismissedAt: Timestamp.now(),
        },
        { merge: true }
      );
      setIsDismissed(true);
      addToast?.("info", "Launch Checklist cleared from dashboard. You can re-open it anytime from Settings.");
    } catch (_) {}
  };

  const handleReopen = async () => {
    try {
      await setDoc(
        doc(db, "system_config", "onboarding"),
        {
          dismissed: false,
        },
        { merge: true }
      );
      setIsDismissed(false);
      setIsExpanded(true);
    } catch (_) {}
  };

  // Evaluate task states dynamically
  const manualChecks = onboardingDoc?.manualChecks || {};

  // Task 1: Paystack
  const hasPaystackKey = Boolean(settings?.paystackPublicKey?.trim());
  const isPaystackLive = settings?.paystackPublicKey?.startsWith("pk_live_");
  const task1Pass = manualChecks.paystack || (hasPaystackKey && isPaystackLive);

  // Task 2: Pricing
  const hasPricing =
    Number(settings?.baseFare) > 0 && Number(settings?.perKgRate) > 0;
  const task2Pass = manualChecks.pricing || hasPricing;

  // Task 3: Hub & Support
  const hasHub =
    Boolean(settings?.contactAddress?.trim()) &&
    Boolean(settings?.supportPhone?.trim() || settings?.contactPhone?.trim());
  const task3Pass = manualChecks.hub || hasHub;

  // Task 4: Play Store URL
  const hasPlayStoreUrl = Boolean(
    settings?.playStoreUrl?.includes("com.esdispatch.app")
  );
  const task4Pass = manualChecks.playstore || hasPlayStoreUrl;

  // Task 5: Legal & Deletion URL
  const hasLegal = Boolean(
    settings?.privacyPolicyUrl &&
      settings?.termsUrl &&
      settings?.deleteAccountUrl
  );
  const task5Pass = manualChecks.legal || hasLegal;

  // Task 6: Couriers Ready
  const hasCouriers = drivers.length > 0;
  const task6Pass = manualChecks.couriers || hasCouriers;

  // Task 7: Database Cleanse
  const isDatabaseClean =
    onboardingDoc?.databaseCleaned === true || deliveries.length === 0;
  const task7Pass = manualChecks.cleanse || isDatabaseClean;

  // Task 8: Marketplace Mode
  const task8Pass = true; // Always configured as either Live or Hidden

  const tasks = [
    {
      id: "paystack",
      title: "Live Paystack Payment Gateway",
      category: "Finance",
      icon: <CreditCard className="w-4 h-4 text-[#FFB800]" />,
      passed: task1Pass,
      statusLabel: hasPaystackKey
        ? isPaystackLive
          ? "Live Gateway Connected (pk_live_)"
          : "Staging Mode (pk_test_ detected)"
        : "Missing API Key",
      description:
        "Connect your verified Paystack account to process instant bank and card payments for customer deliveries and rider payouts in Benin City.",
      actionLabel: "Configure Paystack",
      action: () => setTab("settings"),
      isCritical: true,
    },
    {
      id: "pricing",
      title: "Delivery Pricing & Fare Matrix",
      category: "Operations",
      icon: <DollarSign className="w-4 h-4 text-[#FFB800]" />,
      passed: task2Pass,
      statusLabel: hasPricing
        ? `Base: ₦${Number(settings.baseFare).toLocaleString()} &bull; ₦${settings.perKgRate}/kg`
        : "Pricing Incomplete",
      description:
        "Set baseline dispatch fare, weight surcharge, and per-kilometer rates for Economy, Standard, and Express delivery services.",
      actionLabel: "Set Pricing",
      action: () => setTab("settings"),
      isCritical: true,
    },
    {
      id: "hub",
      title: "Dispatch Hub & Support Hotline",
      category: "Operations",
      icon: <MapPin className="w-4 h-4 text-[#FFB800]" />,
      passed: task3Pass,
      statusLabel: hasHub
        ? `${settings.contactAddress || "GRA, Benin City"}`
        : "Hub Address Missing",
      description:
        "Register your Benin City operations address, customer support hotline, and WhatsApp dispatch channel for live communication.",
      actionLabel: "Update Hub",
      action: () => setTab("settings"),
      isCritical: false,
    },
    {
      id: "cleanse",
      title: "Cleanse Test Data & Launch Database",
      category: "Security",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      passed: task7Pass,
      statusLabel: isDatabaseClean
        ? "Database Clean & Ready for Live Bookings"
        : `${deliveries.length} Test Shipments Detected`,
      description:
        "Purge mock deliveries, dummy transactions, and test customer accounts to start with 100% clean finance books and database integrity.",
      actionLabel: isDatabaseClean ? "Recleanse Database" : "Cleanse Database Now",
      action: onOpenCleanseModal,
      isCritical: true,
      buttonColor: "bg-red-600 hover:bg-red-700 text-white",
    },
    {
      id: "couriers",
      title: "Onboard Verified Couriers",
      category: "Fleet",
      icon: <Users className="w-4 h-4 text-[#FFB800]" />,
      passed: task6Pass,
      statusLabel: hasCouriers
        ? `${drivers.length} Verified Courier(s) Ready`
        : "0 Couriers Active",
      description:
        "Verify at least one active rider account so customer orders can be accepted and dispatched immediately.",
      actionLabel: "Manage Couriers",
      action: () => setTab("users"),
      isCritical: true,
    },
    {
      id: "playstore",
      title: "Google Play Store App URL",
      category: "Branding",
      icon: <Smartphone className="w-4 h-4 text-[#FFB800]" />,
      passed: task4Pass,
      statusLabel: hasPlayStoreUrl
        ? "Connected (com.esdispatch.app)"
        : "Link Incomplete",
      description:
        "Link landing page download badges directly to your published Android app on Google Play.",
      actionLabel: "Verify URL",
      action: () => setTab("settings"),
      isCritical: false,
    },
    {
      id: "legal",
      title: "Legal & Google Play Data Compliance",
      category: "Compliance",
      icon: <FileText className="w-4 h-4 text-[#FFB800]" />,
      passed: task5Pass,
      statusLabel: hasLegal
        ? "Privacy, Terms & Deletion Active"
        : "Policies Missing",
      description:
        "Maintain public URLs for Privacy Policy, Terms of Service, and User Account Deletion compliant with Google Play guidelines.",
      actionLabel: "Review Policies",
      action: () => setTab("settings"),
      isCritical: false,
    },
    {
      id: "marketplace",
      title: "Logistics Marketplace & Store Visibility",
      category: "Catalog",
      icon: <Store className="w-4 h-4 text-[#FFB800]" />,
      passed: task8Pass,
      statusLabel: marketplaceEnabled
        ? "LIVE on App (Merchant Stores Visible)"
        : "HIDDEN on App (Couriers-Only Mode)",
      description:
        "Switch between customer logistics mode or full merchant marketplace depending on your launch strategy.",
      actionLabel: marketplaceEnabled ? "Hide Storefront" : "Enable Storefront",
      action: toggleMarketplace,
      isCritical: false,
    },
  ];

  const completedCount = tasks.filter((t) => t.passed).length;
  const totalCount = tasks.length;
  const percent = Math.round((completedCount / totalCount) * 100);
  const isAllComplete = completedCount === totalCount;

  // If dismissed, render a subtle, non-intrusive re-open pill
  if (isDismissed) {
    return (
      <div className="flex items-center justify-between p-3 px-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-emerald-950 dark:text-emerald-200">
            Go-Live Checklist: {completedCount}/{totalCount} Tasks Ready ({percent}%)
          </span>
        </div>
        <button
          onClick={handleReopen}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>View Onboarding Tasks</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FFB800]/15 dark:bg-[#FFB800]/25 border border-[#FFB800]/40 flex items-center justify-center text-[#FFB800] shrink-0">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111] dark:text-[#FFB800] bg-[#FFB800]/20 px-2.5 py-0.5 rounded-full border border-[#FFB800]/30">
                Go-Live Onboarding &bull; Production Readiness
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {completedCount} of {totalCount} completed
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-0.5">
              Admin Launch Readiness Checklist
            </h3>
          </div>
        </div>

        {/* Progress Bar & Actions */}
        <div className="flex items-center gap-3">
          <div className="w-40 sm:w-48 bg-gray-100 dark:bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAllComplete ? "bg-emerald-500" : "bg-[#FFB800]"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-black text-gray-900 dark:text-white font-mono w-10 text-right">
            {percent}%
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Completion Banner (when all tasks done) */}
      {isAllComplete && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                Platform is 100% Launch Ready!
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                All production configurations and cleanups are complete. You can clear this checklist from your dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Clear from Dashboard</span>
          </button>
        </div>
      )}

      {/* Checklist Grid */}
      {isExpanded && (
        <div className="grid md:grid-cols-2 gap-3 pt-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                task.passed
                  ? "bg-gray-50/60 dark:bg-white/[0.02] border-gray-200/80 dark:border-white/5 opacity-85 hover:opacity-100"
                  : "bg-white dark:bg-[#202020] border-amber-300 dark:border-amber-500/40 shadow-xs"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleManual(task.id, e)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        task.passed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-gray-300 dark:border-white/20 hover:border-gray-400 text-transparent"
                      }`}
                      title="Click to toggle manual verification"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {task.title}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      task.passed
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {task.passed ? "READY" : "NEEDS ACTION"}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pl-7">
                  {task.description}
                </p>

                <div className="pl-7 pt-0.5 flex items-center gap-1.5 text-[10px] font-mono font-medium text-gray-600 dark:text-gray-400">
                  <span className={task.passed ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                    &bull;
                  </span>
                  <span className="truncate">{task.statusLabel}</span>
                </div>
              </div>

              <div className="pl-7 pt-1 flex items-center justify-between gap-2 border-t border-gray-100 dark:border-white/5">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                  {task.category}
                </span>

                <button
                  type="button"
                  onClick={task.action}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    task.buttonColor ||
                    "bg-[#FFB800] hover:bg-[#FFB800]/80 text-[#111] shadow-xs"
                  }`}
                >
                  <span>{task.actionLabel}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-2">
        <span className="text-[11px]">
          Tip: You can click any checkbox to manually override verification status.
        </span>

        <button
          onClick={handleDismiss}
          className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
        >
          Hide Checklist for now
        </button>
      </div>
    </div>
  );
}
