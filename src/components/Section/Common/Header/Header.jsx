"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BrandLogo from "~/components/Ui/Logo/BrandLogo";
import { PlayStoreBadge, AppStoreBadge } from "~/components/Ui/StoreBadge";

const Header = ({ dark = false }) => {
  const [isActive, setIsActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsActive(!isActive);
    document.querySelector(".menu-overlay")?.classList.toggle("active");
  };

  const closeMenu = () => {
    setIsActive(false);
    document.querySelector(".menu-overlay")?.classList.remove("active");
  };

  return (
    <motion.header
      className={`site-header site-header--menu-center zubuz-header-section ${dark ? "dark-bg white-menu" : "bg-white"} ${scrolled ? "sticky-menu" : ""}`}
      id="sticky-menu"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container">
        <nav className="navbar site-navbar">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BrandLogo dark={dark} />
          </motion.div>
          <div className="menu-block-wrapper">
            <div className="menu-overlay" onClick={closeMenu}></div>
            <nav
              className={`menu-block ${isActive ? "active" : ""}`}
              id="append-menu-header"
            >
              <div className="mobile-menu-head">
                <div
                  className="mobile-menu-close"
                  onClick={closeMenu}
                >
                  &times;
                </div>
              </div>
              <ul className="site-menu-main">
                <li className="nav-item">
                  <Link href="/" className="nav-link-item" onClick={closeMenu}>Home</Link>
                </li>
                <li className="nav-item">
                  <Link href="/about-us" className="nav-link-item" onClick={closeMenu}>About Us</Link>
                </li>
                <li className="nav-item">
                  <Link href="/service" className="nav-link-item" onClick={closeMenu}>Services</Link>
                </li>
                <li className="nav-item">
                  <Link href="/track" className="nav-link-item" onClick={closeMenu}>Live Tracking</Link>
                </li>
                <li className="nav-item">
                  <Link href="/faq" className="nav-link-item" onClick={closeMenu}>FAQ</Link>
                </li>
                <li className="nav-item">
                  <Link href="/contact-us" className="nav-link-item" onClick={closeMenu}>Contact</Link>
                </li>
              </ul>
            </nav>
          </div>

          <motion.div
            className="header-btn header-btn-l1 ms-auto d-none d-lg-inline-flex"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <Link
              href="/track"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: dark ? "#FFFFFF" : "#111111",
                padding: "8px 16px",
                borderRadius: 100,
                border: dark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.15)",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FFB800";
                e.currentTarget.style.color = "#FFB800";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
                e.currentTarget.style.color = dark ? "#FFFFFF" : "#111111";
              }}
            >
              Track Order
            </Link>
            <Link
              href="/contact-us"
              className="zubuz-default-btn pill"
              style={{ padding: "9px 20px", fontSize: 13 }}
            >
              <span>Book Rider</span>
            </Link>
          </motion.div>
          <div
            className={`mobile-menu-trigger ${dark ? "" : "light"}`}
            onClick={toggleMenu}
          >
            <span></span>
          </div>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
