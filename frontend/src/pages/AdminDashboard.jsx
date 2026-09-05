import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import LoadMoreButton from '../components/LoadMoreButton.jsx';

const TABS = ['Analytics', 'Scenarios', 'Reports', 'Users'];

const statusOptions = ['pending', 'suspicious', 'verified', 'expired', 'revoked', 'archived'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Analytics');
  const [analytics, setAnalytics] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const endpointForTab = {
    Scenarios: { path: '/admin/scenarios', key: 'scenarios', setter: setScenarios },
    Reports: { path: '/admin/reports', key: 'reports', setter: setReports },
    Users: { path: '/admin/users', key: 'users', setter: setUsers },
  };

  function loadTab(pageNum, append) {
    const conf = endpointForTab[tab];
    if (!conf) return;
    setLoadingMore(true);
    api.get(conf.path, { params: { page: pageNum, limit: 20 } })
      .then((res) => {
        conf.setter((prev) => (append ? [...prev, ...res.data[conf.key]] : res.data[conf.key]));
        setPagination(res.data.pagination);
        setPage(pageNum);
      })
      .finally(() => setLoadingMore(false));
  }

  useEffect(() => {
    setPagination(null);
    if (tab === 'Analytics') {
      api.get('/admin/analytics').then((res) => setAnalytics(res.data));
    } else {
      loadTab(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function toggleScenario(id) {
    await api.delete(`/admin/scenarios/${id}`);
    loadTab(1, false);
  }

  async function updateReportStatus(id, status) {
    await api.patch(`/threats/${id}/status`, { status });
    loadTab(1, false);
  }

  async function promoteToVerifier(id) {
    await api.patch(`/admin/users/${id}/role`, { role: 'verifier' });
    loadTab(1, false);
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <PageHeader
        eyebrow="Admin"
        title="Admin Dashboard"
        description="Manage scam scenarios, review threat reports, and promote trusted reporters to verifiers."
      />

      <div className="flex gap-2 mb-8 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMuted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={analytics.totalUsers} accent="text-primary" />
            <StatCard label="Simulations Completed" value={analytics.totalSimulationsCompleted} />
            <StatCard label="Pending Reports" value={analytics.reportsByStatus.pending || 0} accent="text-warning" />
            <StatCard label="Verified Reports" value={analytics.reportsByStatus.verified || 0} accent="text-success" />
          </div>
          <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-3 text-text">Most Practiced Categories</h3>
            {analytics.mostPracticedCategories.map((c) => (
              <div key={c._id} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                <span className="capitalize">{c._id?.replace('_', ' ')}</span>
                <span className="text-textMuted">{c.count} simulations</span>
              </div>
            ))}
          </div>
          <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-3 text-text">Average Category Scores (all users)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {Object.entries(analytics.averageScores).filter(([k]) => k !== '_id').map(([k, v]) => (
                <div key={k} className="bg-surface shadow-smAlt border border-border rounded-lg p-3">
                  <p className="text-xs text-textMuted capitalize">{k.replace('avg', '').replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-lg font-bold text-text">{v ? v.toFixed(1) : '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Scenarios' && (
        <div className="space-y-2">
          {scenarios.map((s) => (
            <div key={s._id} className="bg-surface shadow-sm border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-textMuted capitalize">{s.category.replace('_', ' ')} · {s.difficulty}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${s.isActive ? 'bg-success/20 text-success' : 'bg-border text-textMuted'}`}>
                  {s.isActive ? 'Active' : 'Deactivated'}
                </span>
                {s.isActive && (
                  <button onClick={() => toggleScenario(s._id)} className="text-xs text-danger underline">
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-textMuted mt-4">
            New scenarios are added via the seed script or a future scenario-builder form — deactivation here is a soft delete so past simulation history stays intact.
          </p>
          {pagination && (
            <LoadMoreButton
              onClick={() => loadTab(page + 1, true)}
              loading={loadingMore}
              hasMore={pagination.hasMore}
              total={pagination.total}
              shown={scenarios.length}
            />
          )}
        </div>
      )}

      {tab === 'Reports' && (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r._id} className="bg-surface shadow-sm border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium capitalize">{r.threatType.replace('_', ' ')}</p>
                  <p className="text-xs text-textMuted break-all">{r.value}</p>
                  <p className="text-xs text-textMuted mt-1">Reporter: {r.reporter?.name || 'Unknown'} (reputation {r.reporter?.reporterReputation ?? '—'})</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-border text-textMuted uppercase">{r.status}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateReportStatus(r._id, s)}
                    disabled={r.status === s}
                    className="text-xs border border-border px-2 py-1 rounded-md hover:border-primary disabled:opacity-30"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {pagination && (
            <LoadMoreButton
              onClick={() => loadTab(page + 1, true)}
              loading={loadingMore}
              hasMore={pagination.hasMore}
              total={pagination.total}
              shown={reports.length}
            />
          )}
        </div>
      )}

      {tab === 'Users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="bg-surface shadow-sm border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{u.name} <span className="text-xs text-textMuted">({u.email})</span></p>
                <p className="text-xs text-textMuted">Reputation: {u.reporterReputation} {u.walletAddress ? `· Wallet linked` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-border text-textMuted capitalize">{u.role}</span>
                {u.role === 'user' && (
                  <button onClick={() => promoteToVerifier(u._id)} className="text-xs text-primary underline">
                    Promote to Verifier
                  </button>
                )}
              </div>
            </div>
          ))}
          {pagination && (
            <LoadMoreButton
              onClick={() => loadTab(page + 1, true)}
              loading={loadingMore}
              hasMore={pagination.hasMore}
              total={pagination.total}
              shown={users.length}
            />
          )}
        </div>
      )}
    </div>
  );
}
