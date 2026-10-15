import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

/**
 * Email verification landing page.
 *
 * Security remediation (audit findings C3/C7): verification codes are no
 * longer transported in URL query parameters (browser history/referrer leak).
 * The code is emailed securely and entered in the app, where verification
 * happens server-side against the hashed record.
 */
export const EmailVerifiedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = (searchParams.get("email") || "").trim();
  const hasEmail = email.length > 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col selection:bg-[#FFB800] selection:text-black">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#262626] bg-[#111111]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-[#FFB800] flex items-center justify-center text-black font-black text-sm shadow-md shadow-[#FFB800]/20">
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
          className="h-10 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all"
        >
          <span>Main Site</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          <div className="bg-[#141414] border border-[#2E2E2E] rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB800]/15 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black font-mono tracking-widest text-[#FFB800] uppercase">
                  EMAIL VERIFICATION
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Verification code sent
                </h1>
              </div>
            </div>

            <div className="bg-black/60 border border-[#FFB800]/40 rounded-2xl px-4 py-6 sm:py-7 text-center">
              <div className="text-sm font-bold text-neutral-200">
                Your confidential verification passcode has been dispatched.
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                Open the ESDispatch app and enter the code from the email to finish verifying your account.
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              The code expires shortly and can only be used once. ESDispatch support staff and
              riders will never ask you for your verification code.
            </p>

            {hasEmail && (
              <div className="text-[11px] font-mono text-neutral-500 break-all">
                Sent to <span className="text-neutral-300">{email}</span>
              </div>
            )}

            <div className="pt-1">
              <Link
                to="/"
                className="w-full h-11 px-5 bg-[#FFB800] hover:bg-[#FFB800]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <span>Track a shipment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] py-6 text-center text-xs text-neutral-500 font-mono">
        &copy; {new Date().getFullYear()} ESDISPATCH. ALL RIGHTS RESERVED. PREMIUM LOGISTICS & DISPATCH.
      </footer>
    </div>
  );
};
