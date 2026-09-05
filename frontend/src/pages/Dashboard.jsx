import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import PriorityCard from '../components/PriorityCard.jsx';
import { useTranslation } from '../i18n/index.jsx';

const riskColor = { HIGH_RISK: 'text-danger', MEDIUM_RISK: 'text-warning', LOW_RISK: 'text-success' };
const riskLevel = { HIGH_RISK: 'HIGH', MEDIUM_RISK: 'MEDIUM', LOW_RISK: 'LOW' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data)).catch(() => setError(t('dash_error')));
  }, []);

  if (error) return <p className="p-6 text-danger">{error}</p>;
  if (!data) return <p className="p-6 text-textMuted">{t('dash_loading')}</p>;

  const priorityCards = [
    ...data.weakAreas.map((a) => ({
      level: riskLevel[a.risk] || 'MEDIUM',
      title: typeof t('dash_weak_title') === 'function' ? t('dash_weak_title')(a.category.replace('_', ' ')) : `${a.category.replace('_', ' ')} needs attention`,
      description: typeof t('dash_weak_desc') === 'function' ? t('dash_weak_desc')(a.score) : `Score: ${a.score}/100`,
      tags: ['WEAK AREA', `${a.score}%`],
    })),
    ...data.strongAreas.map((a) => ({
      level: 'LOW',
      title: typeof t('dash_strong_title') === 'function' ? t('dash_strong_title')(a.category.replace('_', ' ')) : `${a.category.replace('_', ' ')} is a strength`,
      description: typeof t('dash_strong_desc') === 'function' ? t('dash_strong_desc')(a.score) : `Score: ${a.score}/100`,
      tags: ['STRONG AREA', `${a.score}%`],
    })),
  ].slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <PageHeader
        eyebrow={t('dash_eyebrow')}
        badge={t('dash_badge')}
        title={t('dash_title')}
        description={t('dash_desc')}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('dash_stat_score')} value={`${data.overallScore}/100`} accent="text-primary" />
        <StatCard label={t('dash_stat_sims')} value={data.totalSimulationsCompleted} />
        <StatCard label={t('dash_stat_weak')} value={data.weakAreas.length} accent="text-warning" />
        <StatCard label={t('dash_stat_strong')} value={data.strongAreas.length} accent="text-success" />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">{t('dash_priorities')}</h2>
          <span className="text-xs font-semibold uppercase bg-primary/10 text-primary border border-primary/30 px-2.5 py-1 rounded-md">
            {t('dash_focus')}
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {priorityCards.map((c, i) => <PriorityCard key={i} {...c} />)}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4 text-text">{t('dash_scores')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {data.categoryScores.map((c) => (
              <div key={c.category} className="bg-surface shadow-smAlt border border-border rounded-xl p-3">
                <p className="text-xs text-textMuted capitalize mb-1">{c.category.replace('_', ' ')}</p>
                <p className={`text-lg font-bold ${riskColor[c.risk]}`}>{c.score}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4 text-text">{t('dash_recent')}</h3>
          {data.recentSimulations.length === 0 ? (
            <p className="text-textMuted text-sm">{t('dash_no_sims')}</p>
          ) : (
            <div className="space-y-2">
              {data.recentSimulations.map((s) => (
                <div key={s.id} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                  <span className="text-textMuted">{s.title}</span>
                  <span className="text-textMuted"><CheckCircle2 size={14} className="inline mr-1 text-success"/>{s.correctDecisions} / <XCircle size={14} className="inline ml-2 mr-1 text-danger"/>{s.incorrectDecisions}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link to="/simulator" className="bg-primary text-white font-semibold px-5 py-3 rounded-xl">
          {t('dash_start')}
        </Link>
        <Link to="/training" className="border border-border hover:border-primary text-text px-5 py-3 rounded-xl">
          {t('dash_plan')}
        </Link>
        <Link to="/emergency" className="bg-danger/15 border border-danger text-danger font-semibold px-5 py-3 rounded-xl">
          {t('dash_emergency')}
        </Link>
      </div>
    </div>
  );
}
