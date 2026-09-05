import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import { useTranslation } from '../i18n/index.jsx';

const riskStyles = {
  'HIGH RISK': 'border-danger bg-danger/10 text-danger',
  'MEDIUM RISK': 'border-warning bg-warning/10 text-warning',
  'LOW RISK': 'border-success bg-success/10 text-success',
};

export default function UrlDetector() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post('/detectors/url', { url });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || t('url_error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <PageHeader eyebrow={t('url_eyebrow')} title={t('url_title')} description={t('url_desc')} />
      <div className="flex gap-4 text-sm mb-6 flex-wrap">
        <Link to="/url-detector" className="text-primary font-semibold">{t('nav_url')}</Link>
        <Link to="/message-detector" className="text-textMuted hover:text-primary">{t('nav_message')}</Link>
        <Link to="/wallet-checker" className="text-textMuted hover:text-primary">{t('nav_wallet')}</Link>
        <Link to="/report-threat" className="text-textMuted hover:text-primary">{t('nav_report')}</Link>
        <Link to="/threat-registry" className="text-textMuted hover:text-primary">{t('nav_registry')}</Link>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          value={url} onChange={(e) => setUrl(e.target.value)} required
          placeholder={t('url_placeholder')}
          className="flex-1 bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
        />
        <button disabled={loading} className="bg-primary text-white font-semibold px-5 rounded-lg disabled:opacity-50">
          {loading ? t('url_checking') : t('url_btn')}
        </button>
      </form>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {result && (
        <div className={`border rounded-2xl p-6 ${riskStyles[result.riskLevel] || 'border-border bg-surface'}`}>
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-extrabold">{result.riskLevel}</span>
            <span className="text-lg font-bold">{t('url_risk_score')}: {result.riskScore}/100</span>
          </div>
          {result.reasons && result.reasons.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-text">
              {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">Safety Recommendations</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-text">
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          <p className="text-xs text-textMuted mt-4">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
