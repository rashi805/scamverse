import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import LoadMoreButton from '../components/LoadMoreButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TABS = ['Analytics', 'Scenarios', 'Reports', 'Users'];

const statusOptions = ['pending', 'suspicious', 'verified', 'expired', 'revoked', 'archived'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Analytics');
  const [analytics, setAnalytics] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const endpointForTab = {
    Scenarios: { path: '/admin/scenarios', key: 'scenarios', setter: setScenarios },
    Reports: { path: '/admin/reports', key: 'reports', setter: setReports },
    Users: { path: '/admin/users', key: 'users', setter: setUsers },
  };

  function loadTab(pageNum, append) {
    const conf = endpointForTab[tab];
    if (!conf) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError('');
    }

    api.get(conf.path, { params: { page: pageNum, limit: 20 } })
      .then((res) => {
        conf.setter((prev) => (append ? [...prev, ...res.data[conf.key]] : res.data[conf.key]));
        setPagination(res.data.pagination);
        setPage(pageNum);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load tab data.');
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }

  function fetchAnalytics() {
    setLoading(true);
    setError('');
    api.get('/admin/analytics')
      .then((res) => setAnalytics(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load analytics.');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setPagination(null);
    if (tab === 'Analytics') {
      fetchAnalytics();
    } else {
      loadTab(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function toggleScenario(id) {
    try {
      await api.delete(`/admin/scenarios/${id}`);
      loadTab(1, false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update scenario');
    }
  }

  async function updateReportStatus(id, status) {
    try {
      await api.patch(`/threats/${id}/status`, { status });
      loadTab(1, false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report status');
    }
  }

  async function promoteToVerifier(id) {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: 'verifier' });
      loadTab(1, false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote user');
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <PageHeader
        eyebrow="Admin Portal"
        title="Admin Dashboard"
        description="Manage scam scenarios, review threat reports, and promote trusted reporters to verifiers."
      />

      <div className="flex gap-2 mb-8 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary text-primary font-semibold' : 'border-transparent text-textMuted hover:text-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger text-danger p-4 rounded-xl mb-6 flex items-center justify-between">
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => (tab === 'Analytics' ? fetchAnalytics() : loadTab(1, false))}
            className="text-xs bg-danger text-white px-3 py-1.5 rounded-lg font-semibold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center text-textMuted">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading {tab}...</p>
        </div>
      )}

      {!loading && tab === 'Analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={analytics.totalUsers ?? 0} accent="text-primary" />
            <StatCard label="Simulations Completed" value={analytics.totalSimulationsCompleted ?? 0} />
            <StatCard label="Pending Reports" value={analytics.reportsByStatus?.pending || 0} accent="text-warning" />
            <StatCard label="Verified Reports" value={analytics.reportsByStatus?.verified || 0} accent="text-success" />
          </div>

          <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-3 text-text">Most Practiced Categories</h3>
            {(!analytics.mostPracticedCategories || analytics.mostPracticedCategories.length === 0) ? (
              <p className="text-sm text-textMuted">No simulation data collected yet.</p>
            ) : (
              analytics.mostPracticedCategories.map((c) => (
                <div key={c._id} className="flex justify-between text-sm py-2 border-b border-border last:border-0 text-text">
                  <span className="capitalize font-medium">{c._id?.replace('_', ' ')}</span>
                  <span className="text-textMuted">{c.count} simulations</span>
                </div>
              ))
            )}
          </div>

          <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-3 text-text">Average Category Scores (All Users)</h3>
            {(!analytics.averageScores || Object.keys(analytics.averageScores).length === 0) ? (
              <p className="text-sm text-textMuted">No scores recorded yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {Object.entries(analytics.averageScores).filter(([k]) => k !== '_id').map(([k, v]) => (
                  <div key={k} className="bg-surface shadow-smAlt border border-border rounded-lg p-3">
                    <p className="text-xs text-textMuted capitalize">{k.replace('avg', '').replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-lg font-bold text-text">{v ? Number(v).toFixed(1) : '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && tab === 'Scenarios' && (
        <div className="space-y-3">
          {scenarios.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center text-textMuted">
              <p className="text-sm">No scenarios found.</p>
            </div>
          ) : (
            scenarios.map((s) => (
              <div key={s._id} className="bg-surface shadow-sm border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{s.title}</p>
                  <p className="text-xs text-textMuted capitalize">{s.category?.replace('_', ' ')} · {s.difficulty} · {s.language || 'en'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.isActive ? 'bg-success/20 text-success' : 'bg-border text-textMuted'}`}>
                    {s.isActive ? 'Active' : 'Deactivated'}
                  </span>
                  {s.isActive && (
                    <button onClick={() => toggleScenario(s._id)} className="text-xs text-danger font-medium hover:underline">
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <p className="text-xs text-textMuted mt-4">
            New scenarios are seeded via backend data scripts — deactivation here is a soft delete so user progress stays intact.
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

      {!loading && tab === 'Reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center text-textMuted">
              <p className="text-sm">No threat reports submitted yet.</p>
            </div>
          ) : (
            reports.map((r) => (
              <div key={r._id} className="bg-surface shadow-sm border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-text capitalize">{r.threatType?.replace('_', ' ')}</p>
                    <p className="text-xs text-textMuted break-all font-mono mt-0.5">{r.value}</p>
                    <p className="text-xs text-textMuted mt-1">Reporter: <span className="text-text font-medium">{r.reporter?.name || 'Unknown'}</span> (reputation {r.reporter?.reporterReputation ?? '—'})</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-border text-text font-medium uppercase">{r.status}</span>
                </div>
                <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-border">
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateReportStatus(r._id, s)}
                      disabled={r.status === s}
                      className="text-xs border border-border text-text px-2.5 py-1 rounded-md hover:border-primary hover:text-primary disabled:opacity-30 capitalize transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
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

      {!loading && tab === 'Users' && (
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center text-textMuted">
              <p className="text-sm">No users registered.</p>
            </div>
          ) : (
            users.map((u) => (
              <div key={u._id} className="bg-surface shadow-sm border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{u.name} <span className="text-xs text-textMuted font-normal">({u.email})</span></p>
                  <p className="text-xs text-textMuted mt-0.5">Reputation: {u.reporterReputation ?? 10} {u.walletAddress ? `· Wallet: ${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-4)}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-border text-text capitalize font-medium">{u.role}</span>
                  {u.role === 'user' && (
                    <button onClick={() => promoteToVerifier(u._id)} className="text-xs text-primary font-semibold hover:underline">
                      Promote to Verifier
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
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
