import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import { useTranslation } from '../i18n/index.jsx';

const difficultyColor = {
  beginner: 'bg-border',
  basic: 'bg-primary/30 text-primary',
  intermediate: 'bg-warning/30 text-warning',
  advanced: 'bg-danger/30 text-danger',
  expert: 'bg-purple-500/30 text-purple-300',
};

export default function Training() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    api.get('/training/recommendations').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="p-6 text-textMuted">{t('train_loading')}</p>;

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
      <PageHeader eyebrow={t('train_eyebrow')} title={t('train_title')} description={t('train_desc')} />

      {data.recommendations.map((rec) => (
        <div key={rec.category} className="bg-surface shadow-sm border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold capitalize">
              {typeof t('train_section') === 'function'
                ? t('train_section')(rec.category.replace('_', ' '))
                : `${rec.category.replace('_', ' ')} Training`}
            </h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColor[rec.recommendedDifficulty]}`}>
              {rec.recommendedDifficulty}
            </span>
          </div>
          <p className="text-sm text-textMuted mb-4">{rec.reason}</p>
          <div className="space-y-2">
            {rec.scenarios.map((s) => (
              <div key={s._id} className="flex items-center justify-between bg-surface shadow-smAlt/60 rounded-lg px-3 py-2 text-sm">
                <span>{s.title}</span>
                <Link to="/simulator" className="text-primary">{t('train_practice')}</Link>
              </div>
            ))}
            {rec.scenarios.length === 0 && (
              <p className="text-textMuted text-sm">{t('train_no_scenarios')}</p>
            )}
          </div>
        </div>
      ))}

      <Link to="/vulnerability-profile" className="inline-block text-primary text-sm mt-2">
        {t('train_view_profile')}
      </Link>
    </div>
  );
}
