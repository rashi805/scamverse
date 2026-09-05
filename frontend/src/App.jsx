import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider, useTranslation } from './i18n/index.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Simulator from './pages/Simulator.jsx';
import Emergency from './pages/Emergency.jsx';
import Training from './pages/Training.jsx';
import VulnerabilityProfile from './pages/VulnerabilityProfile.jsx';
import UrlDetector from './pages/UrlDetector.jsx';
import MessageDetector from './pages/MessageDetector.jsx';
import ReportThreat from './pages/ReportThreat.jsx';
import ThreatRegistry from './pages/ThreatRegistry.jsx';
import Evidence from './pages/Evidence.jsx';
import Certificate from './pages/Certificate.jsx';
import CertificateVerify from './pages/CertificateVerify.jsx';
import WalletChecker from './pages/WalletChecker.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'mr', label: 'मरा' },
];

export function LangSwitcher({ className = '' }) {
  const { lang, setLang } = useTranslation();
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`text-xs font-semibold px-2 py-1 rounded-md transition ${
            lang === l.code
              ? 'bg-primary text-white'
              : 'text-textMuted hover:text-text border border-transparent hover:border-border'
          }`}
          aria-label={`Switch to ${l.label}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function PublicTopBar() {
  const { t } = useTranslation();
  return (
    <nav className="border-b border-border px-4 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <ShieldCheck className="text-primary" size={24} />
        <span className="font-bold text-primary tracking-wide">SCAMVERSE 360</span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <LangSwitcher />
        <Link to="/certificate-verify" className="hover:text-primary">{t('nav_verify_cert')}</Link>
        <Link to="/login" className="hover:text-primary">{t('nav_login')}</Link>
        <Link to="/signup" className="bg-primary text-white font-semibold px-3 py-1.5 rounded-lg">
          {t('nav_signup')}
        </Link>
      </div>
    </nav>
  );
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppInner() {
  const { user, loading } = useAuth();

  if (user && !loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
            <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/training" element={<Training />} />
            <Route path="/vulnerability-profile" element={<VulnerabilityProfile />} />
            <Route path="/url-detector" element={<UrlDetector />} />
            <Route path="/message-detector" element={<MessageDetector />} />
            <Route path="/report-threat" element={<ReportThreat />} />
            <Route path="/threat-registry" element={<ThreatRegistry />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/certificate-verify" element={<CertificateVerify />} />
            <Route path="/wallet-checker" element={<WalletChecker />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicTopBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/certificate-verify" element={<CertificateVerify />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
        <Route path="/vulnerability-profile" element={<ProtectedRoute><VulnerabilityProfile /></ProtectedRoute>} />
        <Route path="/url-detector" element={<ProtectedRoute><UrlDetector /></ProtectedRoute>} />
        <Route path="/message-detector" element={<ProtectedRoute><MessageDetector /></ProtectedRoute>} />
        <Route path="/report-threat" element={<ProtectedRoute><ReportThreat /></ProtectedRoute>} />
        <Route path="/threat-registry" element={<ProtectedRoute><ThreatRegistry /></ProtectedRoute>} />
        <Route path="/evidence" element={<ProtectedRoute><Evidence /></ProtectedRoute>} />
        <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
        <Route path="/wallet-checker" element={<ProtectedRoute><WalletChecker /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </ThemeProvider>
  );
}
