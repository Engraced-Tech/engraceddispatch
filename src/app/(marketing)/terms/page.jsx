export const metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for ESDispatch (Engraced Dispatch). Official guidelines, user responsibilities, and courier terms for logistics services in Benin City.",
};

import Header from "~/components/Section/Common/Header/Header";
import PageHeader from "~/components/Section/Common/PageHeader";
import Footer from "~/components/Section/Common/Footer";
import Link from "next/link";
import { FileText, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <>
      <Header dark />
      <PageHeader title="Terms of Service" />
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
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900, color: "#111111", margin: 0 }}>
                      Terms of Service
                    </h2>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
                      Operational agreement &bull; ESDispatch Logistics Ecosystem
                    </p>
                  </div>
                </div>

                <div className="terms-content" style={{ color: "#374151", fontSize: 15, lineHeight: 1.8 }}>
                  <p>
                    These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the <strong>ESDispatch</strong> (&ldquo;Engraced Dispatch&rdquo;) mobile applications, websites, and associated delivery solutions in Benin City, Edo State, Nigeria. By using our platform, you agree to comply with and be legally bound by these Terms.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    1. Permitted Deliveries &amp; Prohibited Goods
                  </h3>
                  <p>
                    Senders may request courier delivery for legitimate goods, legal merchandise, business documents, food supplies, and consumer parcels. Senders are strictly prohibited from booking dispatches containing:
                  </p>
                  <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                    <li>Illicit narcotics, illegal drugs, or unauthorized pharmaceutical substances.</li>
                    <li>Firearms, explosives, hazardous chemicals, ammunition, or flammable materials.</li>
                    <li>Counterfeit currency, stolen property, or contraband goods prohibited under Nigerian law.</li>
                    <li>Unpackaged perishable raw foodstuffs without protective hermetic insulation.</li>
                  </ul>
                  <p>
                    ESDispatch riders reserve the right to decline any parcel that is improperly packaged, suspicious, or in violation of public safety regulations.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    2. Handover Security PIN Protocol
                  </h3>
                  <p>
                    To guarantee secure custody and prevent unauthorized delivery handover:
                  </p>
                  <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                    <li>Every delivery generates a unique, confidential <strong>4-digit handover verification PIN</strong> accessible to the customer.</li>
                    <li>The recipient must provide this 4-digit PIN to the courier upon arrival.</li>
                    <li>Couriers cannot complete delivery verification without valid PIN input or authorized dispatch admin clearance.</li>
                  </ul>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    3. Pricing, Tariffs &amp; Payment
                  </h3>
                  <p>
                    Delivery tariffs are computed dynamically using GPS geodesic route distance, package category, and weight parameters in Benin City. All bookings must be funded via linked in-app wallet balance or licensed digital payment channels before rider dispatch.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginTop: 32, marginBottom: 12 }}>
                    4. Limitation of Liability
                  </h3>
                  <p>
                    ESDispatch maintains strict vetting and background verification standards for all dispatch riders. Our maximum liability for lost or damaged parcels during transit is limited to the declared insured value entered during booking.
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
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111111", margin: 0 }}>Questions about our Terms?</h4>
                      <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Reach out to our customer operations team.</p>
                    </div>
                    <Link
                      href="/contact-us"
                      className="zubuz-default-btn"
                      style={{ padding: "10px 22px", fontSize: 13 }}
                    >
                      <span>Contact Us</span>
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
