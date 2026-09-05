import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../i18n/index.jsx';

export default function WalletChecker() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.get('/threats/check', { params: { value: address.trim() } });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <PageHeader
        eyebrow={t('wallet_eyebrow')}
        title={t('wallet_title')}
        description={t('wallet_desc')}
      />
      <div className="flex gap-4 text-sm mb-6 flex-wrap">
        <Link to="/url-detector" className="text-textMuted hover:text-primary">{t('nav_url')}</Link>
        <Link to="/message-detector" className="text-textMuted hover:text-primary">{t('nav_message')}</Link>
        <Link to="/wallet-checker" className="text-primary font-semibold">{t('nav_wallet')}</Link>
        <Link to="/report-threat" className="text-textMuted hover:text-primary">{t('nav_report')}</Link>
        <Link to="/threat-registry" className="text-textMuted hover:text-primary">{t('nav_registry')}</Link>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          value={address} onChange={(e) => setAddress(e.target.value)} required
          placeholder={t('wallet_placeholder')}
          className="flex-1 bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
        />
        <button disabled={loading} className="bg-primary text-white font-semibold px-5 rounded-lg disabled:opacity-50">
          {loading ? t('wallet_checking') : t('wallet_btn')}
        </button>
      </form>

      {result && (
        <div className={`rounded-2xl p-6 border ${result.found ? 'border-danger bg-danger/10' : 'border-success bg-success/10'}`}>
          {result.found ? (
            <div>
              <p className="text-xl font-extrabold text-danger mb-3"><span className="flex items-center gap-2"><AlertTriangle size={24} /> HIGH RISK — matches found</span></p>
              {result.matches.map((m, i) => (
                <p key={i} className="text-sm text-textMuted mb-1 capitalize">
                  {m.threatType.replace('_', ' ')} — status: {m.status.toUpperCase()}
                </p>
              ))}
              <p className="text-xs text-textMuted mt-3">
                A match means this value has been reported. Review the Threat Registry for full context before trusting it.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-extrabold text-success mb-2">No matches found</p>
              <p className="text-sm text-textMuted">{result.message}</p>
              <p className="text-xs text-textMuted mt-3">
                No match doesn't guarantee safety — it only means nobody has reported this value yet. Stay cautious.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
