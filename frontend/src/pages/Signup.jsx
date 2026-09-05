import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../i18n/index.jsx';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      loginWithToken(data.token, data.user);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="bg-surface shadow-sm border border-border rounded-2xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6">{t('signup_title')}</h2>
        {error && <p className="text-danger text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder={t('signup_name')} value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary" />
          <input type="email" required placeholder={t('signup_email')} value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary" />
          <input type="password" required placeholder={t('signup_password')} value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary" />
          <button disabled={loading} className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
            {loading ? t('signup_loading') : t('signup_btn')}
          </button>
        </form>
        <p className="text-sm text-textMuted mt-5 text-center">
          {t('signup_already')} <Link to="/login" className="text-primary">{t('signup_login_link')}</Link>
        </p>
      </div>
    </div>
  );
}
