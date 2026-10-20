import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./pages/AdminPage";
import { PublicTrackingPage } from "./pages/PublicTrackingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { EmailVerifiedPage } from "./pages/EmailVerifiedPage";
import { SignInPage, SignUpPage, ResetPasswordPage } from "./pages/AuthPages";
import AboutPage from "@/app/(marketing)/about-us/page";
import ServicePage from "@/app/(marketing)/service/page";
import ContactUsPage from "@/app/(marketing)/contact-us/page";
import FaqPage from "@/app/(marketing)/faq/page";
import PrivacyPolicyPage from "@/app/(marketing)/privacy/page";
import TermsOfServicePage from "@/app/(marketing)/terms/page";
import RefundPolicyPage from "@/app/(marketing)/refund/page";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about-us" element={<AboutPage />} />
      <Route path="/service" element={<ServicePage />} />
      <Route path="/services" element={<Navigate to="/service" replace />} />
      <Route path="/contact-us" element={<ContactUsPage />} />
      <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/faqs" element={<Navigate to="/faq" replace />} />
      <Route path="/engdadmin" element={<AdminPage />} />
      <Route path="/engadmin" element={<Navigate to="/engdadmin" replace />} />
      <Route path="/track" element={<PublicTrackingPage />} />
      <Route path="/track/:id" element={<PublicTrackingPage />} />
      <Route path="/verified" element={<EmailVerifiedPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
      <Route path="/refund" element={<RefundPolicyPage />} />
      <Route path="/refund-policy" element={<Navigate to="/refund" replace />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
