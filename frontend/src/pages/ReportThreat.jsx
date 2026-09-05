import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import { useTranslation } from '../i18n/index.jsx';

const threatTypes = [
  { value: 'phishing_url', label: 'Phishing URL' },
  { value: 'scam_phone_number', label: 'Scam Phone Number' },
  { value: 'fake_upi_id', label: 'Fake UPI ID' },
  { value: 'fake_email', label: 'Fake Email Address' },
  { value: 'scam_domain', label: 'Scam Domain' },
  { value: 'crypto_wallet_address', label: 'Crypto Wallet Address' },
];

const categories = ['banking', 'digital_payment', 'phishing', 'investment', 'job_loan', 'social_engineering', 'web3', 'other'];

export default function ReportThreat() {
  const [form, setForm] = useState({ threatType: 'phishing_url', value: '', description: '', category: 'other' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post('/threats/report', form);
      setResult(data);
      setForm({ threatType: 'phishing_url', value: '', description: '', category: 'other' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <PageHeader
        eyebrow={t('report_eyebrow')}
        title={t('report_title')}
        description={t('report_desc')}
      />
      <div className="flex gap-4 text-sm mb-6 flex-wrap">
        <Link to="/url-detector" className="text-textMuted hover:text-primary">{t('nav_url')}</Link>
        <Link to="/message-detector" className="text-textMuted hover:text-primary">{t('nav_message')}</Link>
        <Link to="/wallet-checker" className="text-textMuted hover:text-primary">{t('nav_wallet')}</Link>
        <Link to="/report-threat" className="text-primary font-semibold">{t('nav_report')}</Link>
        <Link to="/threat-registry" className="text-textMuted hover:text-primary">{t('nav_registry')}</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-surface shadow-sm border border-border rounded-2xl p-6">
        <div>
          <label className="block mb-1.5 text-sm text-textMuted">{t('report_type')}</label>
          <select value={form.threatType} onChange={(e) => update('threatType', e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5">
            {threatTypes.map((tItem) => <option key={tItem.value} value={tItem.value}>{tItem.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-sm text-textMuted">{t('report_value')}</label>
          <input required value={form.value} onChange={(e) => update('value', e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5" />
        </div>

        <div>
          <label className="block mb-1.5 text-sm text-textMuted">Category</label>
          <select value={form.category} onChange={(e) => update('category', e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5">
            {categories.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-sm text-textMuted">{t('report_details')}</label>
          <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 resize-none" />
        </div>

        <button disabled={loading} className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
          {loading ? t('report_submitting') : t('report_btn')}
        </button>
      </form>

      {error && <p className="text-danger text-sm mt-4">{error}</p>}

      {result && (
        <div className="mt-6 bg-success/10 border border-success rounded-xl p-4 text-sm">
          <p className="font-semibold text-success mb-1">
            {result.duplicate ? 'Already reported' : 'Report submitted'}
          </p>
          <p className="text-textMuted">{result.message}</p>
          <p className="text-textMuted text-xs mt-2">Status: {result.report.status}</p>
          {result.blockchainRegistered !== undefined && (
            <p className="text-xs mt-1 flex items-center gap-1.5">
              {result.blockchainRegistered ? (
                <span className="text-primary">⛓ Registered on-chain (hash-only, no personal data)</span>
              ) : (
                <span className="text-textMuted">Blockchain layer not configured on this deployment — stored off-chain only.</span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
