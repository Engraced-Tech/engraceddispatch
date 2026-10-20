export const metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Refund and Cancellation Policy for ESDispatch (Engraced Dispatch). Transparent terms for booking cancellations, delivery disputes, and wallet settlements in Benin City.",
};

import Header from "~/components/Section/Common/Header/Header";
import PageHeader from "~/components/Section/Common/PageHeader";
import Footer from "~/components/Section/Common/Footer";
import Link from "next/link";
import { RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <>
      <Header dark />
      <PageHeader title="Refund & Cancellation Policy" />
      <div className="section zubuz-section-padding white-bg" style={{ minHeight: "60vh" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 24,
                  padding: "clamp(24px, 5vw, 48px)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#111111",
                      color: "#FFB800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900, color: "#111111", margin: 0 }}>
                      Refund &amp; Cancellation Policy
                    </h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
                      Clear, transparent dispatch settlement terms &bull; ESDispatch Logistics
                    </p>
                  </div>
                </div>

                <div className="policy-content" style={{ color: "#374151", fontSize: 15, lineHeight: 1.8 }}>
                  <p>
                    At <strong>ESDispatch</strong> (&ldquo;Engraced Dispatch&rdquo;), we aim to provide reliable, professional, and friction-free logistics operations across Benin City. We understand that delivery schedules, package availability, and recipient circumstances can change. This Refund &amp; Cancellation Policy defines your rights and the procedural steps for refunds, cancellations, and delivery disputes.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    1. Booking Cancellations
                  </h3>
                  <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                    <div style={{ padding: "16px 20px", borderRadius: 16, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111111", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={16} className="text-[#FFB800]" /> Cancellation Before Rider Acceptance
                      </h4>
                      <p style={{ fontSize: 14, color: "#4B5563", margin: "6px 0 0" }}>
                        If you cancel a delivery request while it is still in <strong>PENDING</strong> status (before a rider accepts the dispatch), you receive a <strong>100% full refund</strong> instantly credited back to your ESDispatch in-app wallet balance.
                      </p>
                    </div>

                    <div style={{ padding: "16px 20px", borderRadius: 16, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111111", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={16} className="text-[#FFB800]" /> Cancellation After Rider Assignment (Pre-Pickup)
                      </h4>
                      <p style={{ fontSize: 14, color: "#4B5563", margin: "6px 0 0" }}>
                        If a rider has already been assigned and is in transit to the pickup address, a nominal rider mobilization allowance (up to ₦300 depending on transit distance covered) may be deducted. The remainder of the delivery fee is immediately refunded to your wallet.
                      </p>
                    </div>

                    <div style={{ padding: "16px 20px", borderRadius: 16, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111111", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <AlertTriangle size={16} className="text-amber-500" /> Cancellation In-Transit (Post-Pickup)
                      </h4>
                      <p style={{ fontSize: 14, color: "#4B5563", margin: "6px 0 0" }}>
                        Once a parcel has been physically picked up and verified by the rider, the delivery cannot be cancelled unilaterally. If you require the package returned, return transit fees equal to the standard trip fare apply to deliver the parcel back to the sender.
                      </p>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    2. Failed Deliveries &amp; Recipient Unavailability
                  </h3>
                  <p>
                    Our dispatch riders will attempt to reach the recipient via phone call upon arrival at the destination address. Riders will wait at the destination for a maximum grace period of <strong>15 minutes</strong>. If the recipient remains unreachable after repeated calls, the courier will report the delivery as unsuccessful. The parcel will be returned safely to the sender, with return transit fees charged to the booking account.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    3. Damaged or Lost Parcel Claims
                  </h3>
                  <p>
                    ESDispatch takes utmost care with every consignment. In the rare event that an item is verified lost or physically damaged during transit by our courier:
                  </p>
                  <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                    <li>You must file a formal dispute in the mobile app or via email within <strong>24 hours</strong> of the scheduled delivery time.</li>
                    <li>Provide photographic evidence, parcel booking ID, and declared value receipt.</li>
                    <li>Verified claims are settled within <strong>48 to 72 business hours</strong> up to the declared parcel value insured at booking time.</li>
                  </ul>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    4. Wallet Withdrawals
                  </h3>
                  <p>
                    Funds deposited or refunded into your ESDispatch wallet can be used for future deliveries across Benin City or withdrawn directly to your linked Nigerian commercial bank account. Bank withdrawal payouts are verified and settled via our licensed payment processor (Paystack) within standard banking hours.
                  </p>

                  <div
                    style={{
                      marginTop: 36,
                      padding: "20px 24px",
                      borderRadius: 16,
                      background: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 16,
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111111", margin: 0 }}>Need help with a cancellation or refund?</h4>
                      <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Our dispatch resolution desk is available 7 days a week.</p>
                    </div>
                    <Link
                      href="/contact-us"
                      className="zubuz-default-btn"
                      style={{ padding: "10px 22px", fontSize: 13 }}
                    >
                      <span>File a Request</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
