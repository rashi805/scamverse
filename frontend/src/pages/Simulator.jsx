import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { MessageSquare, Smartphone, Mail, Phone, Globe, TabletSmartphone, User, Megaphone, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const channelIcon = { sms: <MessageSquare size={16} className="inline mr-1" />, whatsapp: <Smartphone size={16} className="inline mr-1" />, email: <Mail size={16} className="inline mr-1" />, call: <Phone size={16} className="inline mr-1" />, website: <Globe size={16} className="inline mr-1" />, app: <TabletSmartphone size={16} className="inline mr-1" />, in_person: <User size={16} className="inline mr-1" />, social_media: <Megaphone size={16} className="inline mr-1" /> };

export default function Simulator() {
  const [scenarios, setScenarios] = useState([]);
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [scoreUpdate, setScoreUpdate] = useState(null);
  const stepStartRef = useRef(Date.now());
  const { t, lang } = useTranslation();

  useEffect(() => {
    api.get('/simulations', { params: { lang } }).then((res) => setScenarios(res.data.scenarios));
  }, [lang]);

  async function startScenario(id) {
    setResult(null);
    setSessionSummary(null);
    setScoreUpdate(null);
    const { data } = await api.post(`/simulations/${id}/start`);
    setActive(data);
    stepStartRef.current = Date.now();
  }

  async function choose(optionId) {
    if (!active) return;
    const responseTimeMs = Date.now() - stepStartRef.current;
    const { data } = await api.post(`/simulations/session/${active.sessionId}/decide`, {
      stepId: active.step.stepId,
      optionId,
      responseTimeMs,
    });
    setResult(data.result);
    if (data.sessionEnded) {
      setSessionSummary(data.sessionSummary);
      setScoreUpdate(data.scoreUpdate);
    } else {
      setActive((prev) => ({ ...prev, step: data.nextStep, pendingContinue: true }));
    }
  }

  function continueToNextStep() {
    setResult(null);
    stepStartRef.current = Date.now();
    setActive((prev) => ({ ...prev, pendingContinue: false }));
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <PageHeader
        eyebrow={t('sim_eyebrow')}
        title={t('sim_title')}
        description={t('sim_desc')}
      />

      {!active && (
        <div className="grid sm:grid-cols-2 gap-4">
          {scenarios.map((s) => (
            <button key={s._id} onClick={() => startScenario(s._id)}
              className="text-left bg-surface shadow-sm border border-border rounded-xl p-4 hover:border-primary transition">
              <p className="text-xs uppercase text-primary mb-1">{s.category.replace('_', ' ')} · {s.difficulty}</p>
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-textMuted mt-1">{s.description}</p>
              {s.isMultiStage && <span className="text-xs text-warning">Multi-stage chain</span>}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
          <div className="bg-warning/10 border border-warning text-warning text-xs font-semibold rounded-lg px-3 py-2 mb-5 text-center">
            {t('sim_mode_banner')}
          </div>

          {!sessionSummary && (
            <>
              <p className="text-sm text-textMuted mb-2">
                {channelIcon[active.step.channel]} {active.step.channel.toUpperCase()}
              </p>
              <p className="text-lg mb-6 leading-relaxed">{active.step.narrative}</p>

              {!result && (
                <div className="space-y-3">
                  {active.step.options.map((o) => (
                    <button key={o.optionId} onClick={() => choose(o.optionId)}
                      className="w-full text-left bg-surface shadow-smAlt hover:bg-border border border-border rounded-xl px-4 py-3">
                      {o.text}
                    </button>
                  ))}
                </div>
              )}

              {result && (
                <div className={`rounded-xl p-4 border ${result.isCorrect ? 'border-success bg-success/10' : 'border-danger bg-danger/10'}`}>
                  <p className="font-semibold mb-1 flex items-center gap-2">{result.isCorrect ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />} {result.isCorrect ? t('sim_safe') : t('sim_risky')}</p>
                  <p className="text-sm text-textMuted">{result.explanation}</p>
                  {active.pendingContinue && (
                    <button onClick={continueToNextStep} className="mt-4 bg-primary text-white font-semibold px-4 py-2 rounded-lg">
                      {t('sim_continue')}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {sessionSummary && (
            <div>
              <h3 className="text-xl font-bold mb-3">{t('sim_complete')}</h3>
              <p className="text-sm text-textMuted mb-4">
                {t('sim_correct')}: {sessionSummary.correctDecisions} &nbsp;
                {t('sim_incorrect')}: {sessionSummary.incorrectDecisions} &nbsp;
                {t('sim_risky_count')}: {sessionSummary.riskyActions}
              </p>
              {scoreUpdate && (
                <p className="text-sm text-primary mb-4">
                  {scoreUpdate.category.replace('_', ' ')} score: {scoreUpdate.previousScore} → {scoreUpdate.newScore} (Overall: {scoreUpdate.overallScore})
                </p>
              )}
              <div className="bg-surface shadow-smAlt/60 rounded-xl p-4 mb-4">
                <p className="font-semibold mb-2 text-sm">{t('sim_red_flags')}</p>
                <ul className="list-disc list-inside text-sm text-textMuted space-y-1">
                  {sessionSummary.redFlagsSummary.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              <button onClick={() => setActive(null)} className="bg-primary text-white font-semibold px-4 py-2 rounded-lg">
                {t('sim_back')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
