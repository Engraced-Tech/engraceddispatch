export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for ESDispatch (Engraced Dispatch). Understand how we collect, protect, and handle your data across our logistics and courier services in Benin City.",
};

import Header from "~/components/Section/Common/Header/Header";
import PageHeader from "~/components/Section/Common/PageHeader";
import Footer from "~/components/Section/Common/Footer";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header dark />
      <PageHeader title="Privacy Policy" />
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
                    <Shield size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900, color: "#111111", margin: 0 }}>
                      ESDispatch Privacy Policy
                    </h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
                      Last Updated: October 2026 &bull; Benin City, Edo State, Nigeria
                    </p>
                  </div>
                </div>

                <div className="privacy-content" style={{ color: "#374151", fontSize: 15, lineHeight: 1.8 }}>
                  <p>
                    At <strong>ESDispatch</strong> (&ldquo;Engraced Dispatch&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we take your privacy and the security of your personal information very seriously. This Privacy Policy details how we collect, store, process, and safeguard your data when you use our mobile application, website, and delivery dispatch ecosystem across Benin City and Nigeria.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    1. Information We Collect
                  </h3>
                  <p>To provide high-precision courier and dispatch services, we collect:</p>
                  <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                    <li><strong>Account Credentials:</strong> Name, phone number, email address, and optional security PIN.</li>
                    <li><strong>Logistics Data:</strong> Item descriptions, declared parcel value, pickup address, recipient address, recipient name, and recipient contact telephone.</li>
                    <li><strong>Geolocation Data:</strong> Real-time device coordinates (GPS) for senders requesting on-demand dispatch and active couriers in transit to calculate routing, ETA, and proximity alerts.</li>
                    <li><strong>Transaction &amp; Billing Records:</strong> In-app wallet ledger records, payment references, and Paystack settlement confirmation tokens (we never store raw card numbers or CVVs).</li>
                    <li><strong>Proof of Delivery (POD):</strong> Digital handover signatures, delivery verification timestamps, and optional delivery verification photos captured at the destination.</li>
                  </ul>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    2. How We Use Your Information
                  </h3>
                  <p>Your information is used strictly to power our logistics platform:</p>
                  <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                    <li>Dispatching riders nearest to your pickup location in Benin City.</li>
                    <li>Generating secure 4-digit handover PINs to guarantee that packages are handed over only to the intended recipient.</li>
                    <li>Providing real-time live map telemetry and ETA updates to both sender and recipient.</li>
                    <li>Settling automated wallet deductions, delivery fees, and optional courier gratuities.</li>
                    <li>Preventing fraud, resolving parcel disputes, and ensuring accountability throughout the delivery cycle.</li>
                  </ul>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    3. Geolocation &amp; Background Tracking
                  </h3>
                  <p>
                    For delivery riders, continuous background GPS tracking is required while on duty to broadcast accurate transit progress, estimate arrival times, and trigger proximity alerts within 50 meters of the delivery destination. Customers only transmit location data when specifying pickup or tracking active shipments.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    4. Data Sharing &amp; Third Parties
                  </h3>
                  <p>
                    We do not sell, rent, or trade your personal data. We disclose operational details only to:
                  </p>
                  <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                    <li><strong>Assigned Couriers:</strong> Providing pickup addresses, recipient contact numbers, and delivery instructions to complete assigned dispatches.</li>
                    <li><strong>Infrastructure Partners:</strong> Google Cloud Firebase (encrypted database &amp; authentication), Mapbox/ESRI (vector mapping and routing telemetry), and Paystack (licensed payment gateway).</li>
                    <li><strong>Law Enforcement:</strong> Only when legally mandated under Nigerian federal or Edo State statutory laws.</li>
                  </ul>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    5. Security &amp; Encryption
                  </h3>
                  <p>
                    All communication between your device and our servers is encrypted using Transport Layer Security (TLS 1.3). Sensitive credentials such as wallet security PINs are salted and hashed (SHA-256) and cannot be recovered in plaintext. Access to customer records is restricted by role-based Cloud Firestore Security Rules.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    6. Your Rights &amp; Data Deletion
                  </h3>
                  <p>
                    You have the right to inspect, update, or request the deletion of your account and associated personal data at any time. You can request account deletion directly from the mobile app settings or by writing to our compliance officer at <a href="mailto:support@esdispatch.com" style={{ color: "#FFB800", fontWeight: 700 }}>support@esdispatch.com</a>.
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
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111111", margin: 0 }}>Have questions regarding your privacy?</h4>
                      <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Contact our legal &amp; privacy team anytime.</p>
                    </div>
                    <Link
                      href="/contact-us"
                      className="zubuz-default-btn"
                      style={{ padding: "10px 22px", fontSize: 13 }}
                    >
                      <span>Contact Privacy Team</span>
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
