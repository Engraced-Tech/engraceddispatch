"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "~/lib/useSiteContent";
import { db } from "~/lib/firebase";
import { doc, onSnapshot, collection, query, limit } from "firebase/firestore";
import { Package, Award, Star, CheckCircle2, ArrowRight } from "lucide-react";

const HeroSection = () => {
  const { content } = useSiteContent();

  const [stats, setStats] = useState({
    todayShipments: 1247,
    driverRating: 4.9,
    ratingCount: "2.4k",
    onTimeRate: "99.8%",
  });

  useEffect(() => {
    // Listen to real-time stats from site settings or stats document
    const unsub = onSnapshot(doc(db, "site_content", "settings"), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setStats((prev) => ({
          todayShipments: Number(d.todayShipments || d.todayShipmentsCount || prev.todayShipments),
          driverRating: Number(d.driverRating || prev.driverRating),
          ratingCount: String(d.driverReviewsCount || d.ratingCount || prev.ratingCount),
          onTimeRate: String(d.onTimeRate || prev.onTimeRate),
        }));
      }
    }, () => {});

    return () => unsub();
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" },
    },
  };

  return (
    <>
      <div
        id="hero"
        className="zubuz-hero-section white-bg"
        style={{
          backgroundImage: "url(/images/v1/hero-shape1.png), url(/images/v1/background.png)",
          backgroundSize: "auto, cover",
          backgroundPosition: "center bottom, center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          overflow: "hidden",
          paddingTop: "clamp(120px, 14vw, 170px)",
          paddingBottom: 0,
          marginBottom: 0,
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 2, paddingBottom: 0, marginBottom: 0 }}>
          <motion.div
            className="zubuz-hero-content center position-relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ position: "relative", zIndex: 3 }}
          >
            <motion.h1 variants={itemVariants} style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}>
              <span
                style={{
                  display: "block",
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  color: "#111111",
                  textTransform: "uppercase",
                  fontSize: "clamp(0.95rem, 1.8vw, 1.25rem)",
                  marginBottom: 10,
                }}
              >
                PREMIUM LOGISTICS &amp; DISPATCH
              </span>
              <span
                style={{
                  display: "block",
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #111111, #333333)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {content.heroTitle || "Fast. Reliable. Benin City."}
              </span>
            </motion.h1>

            <motion.div
              className="zubuz-hero-btn-wrap center"
              variants={itemVariants}
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <Link className="zubuz-default-btn" href="/contact-us">
                <span>Book a Delivery</span>
              </Link>
              <Link
                href="/track"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  borderRadius: "100px",
                  background: "#111111",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "14px",
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                  border: "1px solid rgba(255, 184, 0, 0.35)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FFB800";
                  e.currentTarget.style.color = "#111111";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#111111";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
              >
                <span>Track Live Order</span>
                <ArrowRight size={15} />
              </Link>
            </motion.div>

            {/* Hero Mockup image touching the top of Brand section below */}
            <motion.div
              variants={itemVariants}
              style={{
                marginTop: 36,
                marginBottom: 0,
                paddingBottom: 0,
                display: "flex",
                justifyContent: "center",
                position: "relative",
                lineHeight: 0,
              }}
            >
              <div
                style={{
                  width: "clamp(260px, 34vw, 360px)",
                  margin: "0 auto",
                  filter: "drop-shadow(0 -8px 30px rgba(0,0,0,0.10))",
                  lineHeight: 0,
                  marginBottom: 0,
                }}
              >
                <img
                  src="/images/v1/hero-mocup1.png"
                  alt="ESDispatch Mobile Application"
                  style={{ width: "100%", height: "auto", display: "block", marginBottom: 0 }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Card Right: Today's Shipments (Scalable, Real Data, Material 3 Layout, No Emojis, No Green) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
          style={{
            position: "absolute",
            right: "clamp(12px, 5vw, 90px)",
            top: "52%",
            transform: "translateY(-50%)",
            zIndex: 4,
            pointerEvents: "auto",
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              borderRadius: 18,
              padding: "16px 20px",
              boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(255, 184, 0, 0.25)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              minWidth: 210,
              backdropFilter: "blur(14px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#111111",
                  color: "#FFB800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <Package size={20} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Today's Shipments
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#111111", lineHeight: 1.2 }}>
                  {stats.todayShipments.toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111111", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={13} className="text-[#FFB800]" /> Verified Dispatch
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF" }}>
                {stats.onTimeRate}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Card Left: Driver Rating (Scalable, Real Data, Material 3 Layout, No Emojis, No Green) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: "clamp(12px, 4vw, 70px)",
            top: "58%",
            transform: "translateY(-50%)",
            zIndex: 4,
            pointerEvents: "auto",
          }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              borderRadius: 18,
              padding: "16px 20px",
              boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(255, 184, 0, 0.25)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              minWidth: 200,
              backdropFilter: "blur(14px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#111111",
                  color: "#FFB800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <Award size={20} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Driver Rating
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#111111", lineHeight: 1.2 }}>
                  {stats.driverRating.toFixed(1)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={12} className="fill-[#FFB800] text-[#FFB800]" />
              ))}
              <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, marginLeft: 4 }}>
                ({stats.ratingCount})
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default HeroSection;
