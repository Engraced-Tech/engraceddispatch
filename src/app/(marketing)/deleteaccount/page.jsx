export const metadata = {
  title: "Delete Account - ESDispatch",
  description:
    "Request permanent deletion of your ESDispatch account and personal data pursuant to data protection and Google Play Store policies.",
};

import Header from "~/components/Section/Common/Header/Header";
import PageHeader from "~/components/Section/Common/PageHeader";
import Footer from "~/components/Section/Common/Footer";
import { UserX, Shield, CheckCircle, Database } from "lucide-react";
import DeleteAccountForm from "./DeleteAccountForm";

export default function DeleteAccountMarketingPage() {
  return (
    <>
      <Header dark />
      <PageHeader title="Delete Account" />
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
                    <UserX size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900, color: "#111111", margin: 0 }}>
                      Account & Data Erasure
                    </h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
                      ESDispatch (Engraced Smile Logistics) &bull; Google Play Data Compliance
                    </p>
                  </div>
                </div>

                <div style={{ color: "#374151", fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
                  <p>
                    Users of the <strong>ESDispatch</strong> mobile application have full control over their personal data. In accordance with Google Play Developer Policies and global data privacy standards, you may request the permanent deletion of your account and associated personal information through the interactive form below.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
                  <div style={{ background: "#F9FAFB", padding: 20, borderRadius: 16, border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#059669", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                      <CheckCircle size={18} />
                      <span>Permanently Deleted</span>
                    </div>
                    <ul style={{ fontSize: 13, color: "#4B5563", paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
                      <li>Profile name, telephone, email address &amp; photo</li>
                      <li>Encrypted login credentials and security PIN hashes</li>
                      <li>Saved pickup and recipient address books</li>
                      <li>Device push tokens and geolocation telemetry</li>
                    </ul>
                  </div>

                  <div style={{ background: "#F9FAFB", padding: 20, borderRadius: 16, border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#D97706", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                      <Database size={18} />
                      <span>Legally Retained</span>
                    </div>
                    <ul style={{ fontSize: 13, color: "#4B5563", paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
                      <li>Completed transaction financial ledger records</li>
                      <li>Tax compliance and statutory accounting invoices</li>
                      <li>Non-identifiable anonymized logistics analytics</li>
                    </ul>
                  </div>
                </div>

                <DeleteAccountForm />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
