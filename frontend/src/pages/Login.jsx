import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../i18n/index.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      loginWithToken(data.token, data.user);
      navigate(data.user.onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || t('login_failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/guest');
      loginWithToken(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(t('login_guest_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="bg-surface shadow-sm border border-border rounded-2xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6">{t('login_title')}</h2>
        {error && <p className="text-danger text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" required placeholder={t('login_email')} value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
          />
          <input
            type="password" required placeholder={t('login_password')} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
          />
          <button disabled={loading} className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
            {loading ? t('login_loading') : t('login_btn')}
          </button>
        </form>
        <button onClick={handleGuest} disabled={loading} className="w-full mt-3 border border-border py-2.5 rounded-lg hover:border-primary">
          {t('login_guest')}
        </button>
        <p className="text-sm text-textMuted mt-5 text-center">
          {t('login_no_account')} <Link to="/signup" className="text-primary">{t('login_signup_link')}</Link>
        </p>
      </div>
    </div>
  );
}
