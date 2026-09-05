import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { LangSwitcher } from '../App.jsx';
import { 
  LayoutDashboard, Gamepad2, Target, BarChart3, GraduationCap, 
  Link as LinkIcon, Mail, Wallet, Flag, FolderOpen, Lock, 
  Settings, ShieldCheck, Moon, Sun, LogOut 
} from 'lucide-react';

function NavItem({ to, label, icon }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
        active
          ? 'bg-primary/10 text-primary border border-primary/40'
          : 'text-textMuted hover:text-text hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className="w-5 flex justify-center text-textMuted">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const trainSection = [
    { to: '/dashboard', label: t('nav_dashboard'), icon: <LayoutDashboard size={18} /> },
    { to: '/simulator', label: t('nav_simulator'), icon: <Gamepad2 size={18} /> },
    { to: '/training', label: t('nav_training'), icon: <Target size={18} /> },
    { to: '/vulnerability-profile', label: t('nav_vulnerability'), icon: <BarChart3 size={18} /> },
    { to: '/certificate', label: t('nav_certificate'), icon: <GraduationCap size={18} /> },
  ];

  const detectSection = [
    { to: '/url-detector', label: t('nav_url'), icon: <LinkIcon size={18} /> },
    { to: '/message-detector', label: t('nav_message'), icon: <Mail size={18} /> },
    { to: '/wallet-checker', label: t('nav_wallet'), icon: <Wallet size={18} /> },
    { to: '/report-threat', label: t('nav_report'), icon: <Flag size={18} /> },
    { to: '/threat-registry', label: t('nav_registry'), icon: <FolderOpen size={18} /> },
    { to: '/evidence', label: t('nav_evidence'), icon: <Lock size={18} /> },
  ];

  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 bg-surface shadow-smAlt border-r border-border flex flex-col">
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">SV360</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-1.5 rounded-md transition hover:bg-slate-100 dark:hover:bg-slate-800 text-textMuted"
              title="Toggle Light/Dark Mode"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <LangSwitcher />
          </div>
        </div>
        <h1 className="text-lg font-bold text-text leading-tight">{t('appTagline')}</h1>
        <p className="text-xs text-textMuted mt-1 leading-relaxed">
          {t('appSubtitle')}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pt-5 pb-5 space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-widest text-textMuted uppercase px-3 mb-2">{t('nav_train')}</p>
          <div className="space-y-1">
            {trainSection.map((item) => <NavItem key={item.to} {...item} />)}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-textMuted uppercase px-3 mb-2">{t('nav_detect')}</p>
          <div className="space-y-1">
            {detectSection.map((item) => <NavItem key={item.to} {...item} />)}
          </div>
        </div>
        {user?.role === 'admin' && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-textMuted uppercase px-3 mb-2">{t('nav_admin')}</p>
            <div className="space-y-1">
              <NavItem to="/admin" label={t('nav_admin_dashboard')} icon={<Settings size={18} />} />
            </div>
          </div>
        )}
      </nav>

      <div className="px-4 pb-4">
        <Link
          to="/emergency"
          className="flex items-center justify-center gap-2 w-full bg-danger/15 border border-danger text-danger font-semibold text-sm py-2.5 rounded-lg hover:bg-danger/25 transition"
        >
          {t('nav_emergency')}
        </Link>
      </div>

      <div className="px-4 py-4 border-t border-border">
        <p className="text-sm font-medium text-text">{user?.name || 'Guest'}</p>
        <p className="text-xs text-textMuted mb-3 capitalize">
          {(user?.userCategory || 'general_user').replace('_', ' ')}
          {user?.isGuest ? ' · guest' : ''}
        </p>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full text-left text-sm text-textMuted hover:text-danger flex items-center gap-2"
        >
          <LogOut size={16} /> {t('nav_signout')}
        </button>
      </div>
    </aside>
  );
}
