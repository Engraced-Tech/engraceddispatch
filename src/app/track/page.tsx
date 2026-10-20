"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "~/components/Section/Common/Header/Header";
import PageHeader from "~/components/Section/Common/PageHeader";
import Footer from "~/components/Section/Common/Footer";
import { Search, Package, MapPin, ShieldCheck, ArrowRight, Clock, Navigation } from "lucide-react";

export default function TrackSearchPage() {
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackingId.trim();
    if (!cleanId) {
      setError("Please enter a valid tracking number or parcel ID.");
      return;
    }
    setError("");
    router.push(`/track/${encodeURIComponent(cleanId)}`);
  };

  return (
    <>
      <Header dark />
      <PageHeader title="Live Shipment Tracking" />

      <div className="section zubuz-section-padding white-bg" style={{ minHeight: "65vh" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 24,
                  padding: "clamp(24px, 5vw, 48px)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "#111111",
                    color: "#FFB800",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  }}
                >
                  <Navigation size={28} strokeWidth={2.4} />
                </div>

                <h2 style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", fontWeight: 900, color: "#111111", margin: 0 }}>
                  Track Your Package
                </h2>
                <p style={{ fontSize: 15, color: "#6B7280", maxWidth: 520, margin: "10px auto 32px", lineHeight: 1.6 }}>
                  Enter your 6-digit reference, parcel ID, or waybill number to view live GPS courier movement, route telemetry, and delivery ETA in Benin City.
                </p>

                <form onSubmit={handleSearch} style={{ maxWidth: 540, margin: "0 auto" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#F9FAFB",
                      borderRadius: 100,
                      border: "2px solid #E5E7EB",
                      padding: "6px 8px 6px 20px",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                    }}
                  >
                    <Search size={20} className="text-gray-400" style={{ flexShrink: 0, marginRight: 10 }} />
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => {
                        setTrackingId(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="e.g. DEL-82914 or parcel ID"
                      style={{
                        flex: 1,
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#111111",
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#FFB800",
                        color: "#111111",
                        border: "none",
                        borderRadius: 100,
                        padding: "12px 24px",
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: "pointer",
                        transition: "transform 0.2s, background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#E5A93B")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#FFB800")}
                    >
                      <span>Track</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  {error && (
                    <p style={{ color: "#EF4444", fontSize: 13, fontWeight: 600, marginTop: 12, textAlign: "left", paddingLeft: 16 }}>
                      {error}
                    </p>
                  )}
                </form>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 16,
                    marginTop: 48,
                    textAlign: "left",
                    paddingTop: 32,
                    borderTop: "1px solid #F3F4F6",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F3F4F6", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Navigation size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: "#111111", margin: 0 }}>Live Telemetry</h4>
                      <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>Real-time GPS pin updates every few seconds.</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F3F4F6", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: "#111111", margin: 0 }}>Handover PIN</h4>
                      <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>Unique 4-digit code required for parcel receipt.</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F3F4F6", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: "#111111", margin: 0 }}>Instant ETA</h4>
                      <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>Accurate arrival estimates based on traffic.</p>
                    </div>
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
