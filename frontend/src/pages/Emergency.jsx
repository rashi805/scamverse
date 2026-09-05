import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';

const SITUATION_KEYS = [
  'sent_money', 'clicked_link', 'shared_info',
  'installed_app', 'suspicious_call', 'account_compromised', 'wallet_compromised',
];

const labelKey = {
  sent_money: 'em_sent_money',
  clicked_link: 'em_clicked_link',
  shared_info: 'em_shared_info',
  installed_app: 'em_installed_app',
  suspicious_call: 'em_suspicious_call',
  account_compromised: 'em_account_compromised',
  wallet_compromised: 'em_wallet_compromised',
};

export default function Emergency() {
  const [selected, setSelected] = useState(null);
  const { t } = useTranslation();

  const steps = selected ? t('em_steps')?.[selected] : [];

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="bg-danger/10 border border-danger rounded-2xl p-6 mb-6 text-center">
        <h2 className="text-2xl font-bold text-danger">{t('em_heading')}</h2>
        <p className="text-textMuted text-sm mt-2">{t('em_sub')}</p>
      </div>

      {!selected && (
        <div className="grid sm:grid-cols-2 gap-3">
          {SITUATION_KEYS.map((key) => (
            <button key={key} onClick={() => setSelected(key)}
              className="text-left bg-surface shadow-sm border border-border hover:border-danger rounded-xl px-4 py-3">
              {t(labelKey[key])}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">{t(labelKey[selected])}</h3>
          <ol className="list-decimal list-inside space-y-2 text-text">
            {(steps || []).map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <p className="text-xs text-textMuted mt-5">{t('em_disclaimer')}</p>
          <button onClick={() => setSelected(null)} className="mt-5 bg-border px-4 py-2 rounded-lg">
            {t('em_back')}
          </button>
        </div>
      )}
    </div>
  );
}
