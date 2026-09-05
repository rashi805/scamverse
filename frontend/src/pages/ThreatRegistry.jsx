import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';
import { AlertTriangle } from 'lucide-react';
import LoadMoreButton from '../components/LoadMoreButton.jsx';

const statusStyles = {
  verified: 'bg-success/20 text-success',
  suspicious: 'bg-warning/20 text-warning',
  pending: 'bg-border text-textMuted',
  expired: 'bg-border text-textMuted',
  revoked: 'bg-danger/20 text-danger',
  archived: 'bg-border text-textMuted',
};

export default function ThreatRegistry() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [checkValue, setCheckValue] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [chainRecord, setChainRecord] = useState(null);
  const [chainLoading, setChainLoading] = useState(false);

  function loadPage(pageNum, append) {
    setLoadingMore(true);
    api.get('/threats/registry', { params: { page: pageNum, limit: 15 } })
      .then((res) => {
        setReports((prev) => (append ? [...prev, ...res.data.reports] : res.data.reports));
        setPagination(res.data.pagination);
        setPage(pageNum);
      })
      .finally(() => setLoadingMore(false));
  }

  useEffect(() => { loadPage(1, false); }, []);

  async function handleCheck(e) {
    e.preventDefault();
    setCheckResult(null);
    const { data } = await api.get('/threats/check', { params: { value: checkValue } });
    setCheckResult(data);
  }

  async function toggleChainRecord(id) {
    if (expandedId === id) {
      setExpandedId(null);
      setChainRecord(null);
      return;
    }
    setExpandedId(id);
    setChainRecord(null);
    setChainLoading(true);
    try {
      const { data } = await api.get(`/threats/${id}/chain-record`);
      setChainRecord(data);
    } finally {
      setChainLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
      <PageHeader
        eyebrow="Threat Intelligence"
        title="Threat Registry"
        description={'Community-reported threats. Only reviewed reports appear here — a "verified" status reflects reviewer confirmation, not an absolute guarantee.'}
      />
      <div className="flex gap-4 text-sm -mt-4 flex-wrap">
        <Link to="/url-detector" className="text-textMuted hover:text-primary">URL Detector</Link>
        <Link to="/message-detector" className="text-textMuted hover:text-primary">Message Detector</Link>
        <Link to="/wallet-checker" className="text-textMuted hover:text-primary">Wallet Checker</Link>
        <Link to="/report-threat" className="text-textMuted hover:text-primary">Report a Threat</Link>
        <Link to="/threat-registry" className="text-primary font-semibold">Threat Registry</Link>
      </div>

      <form onSubmit={handleCheck} className="flex gap-3">
        <input
          value={checkValue} onChange={(e) => setCheckValue(e.target.value)}
          placeholder="Check a wallet address, URL, phone number..."
          className="flex-1 bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5"
        />
        <button className="bg-primary text-white font-semibold px-5 rounded-lg">Check</button>
      </form>

      {checkResult && (
        <div className={`rounded-xl p-4 border text-sm ${checkResult.found ? 'border-warning bg-warning/10' : 'border-success bg-success/10'}`}>
          {checkResult.found ? (
            <div>
              <p className="font-semibold mb-2"><span className="flex items-center gap-2 text-warning"><AlertTriangle size={18} /> Found {checkResult.matches.length} matching record(s)</span></p>
              {checkResult.matches.map((m, i) => (
                <p key={i} className="text-textMuted">{m.threatType.replace('_', ' ')} — {m.status.toUpperCase()}</p>
              ))}
            </div>
          ) : (
            <p>{checkResult.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {reports.length === 0 && <p className="text-textMuted text-sm">No reviewed threats yet.</p>}
        {reports.map((r) => (
          <div key={r._id} className="bg-surface shadow-sm border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium capitalize">{r.threatType.replace('_', ' ')}</p>
                <p className="text-xs text-textMuted break-all">{r.value}</p>
              </div>
              <div className="flex items-center gap-2">
                {r.registeredOnChain && (
                  <span className="text-xs text-primary border border-primary/40 bg-primary/10 px-2 py-1 rounded-full">
                    ⛓ On-chain
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[r.status]}`}>
                  {r.status.toUpperCase()}
                </span>
                <button
                  onClick={() => toggleChainRecord(r._id)}
                  className="text-xs text-textMuted hover:text-primary underline"
                >
                  {expandedId === r._id ? 'Hide' : 'Details'}
                </button>
              </div>
            </div>

            {expandedId === r._id && (
              <div className="mt-3 pt-3 border-t border-border text-xs text-textMuted space-y-1">
                {chainLoading && <p>Loading chain record...</p>}
                {!chainLoading && chainRecord && !chainRecord.blockchainEnabled && (
                  <p>{chainRecord.message}</p>
                )}
                {!chainLoading && chainRecord?.blockchainEnabled && !chainRecord.registeredOnChain && (
                  <p>{chainRecord.message}</p>
                )}
                {!chainLoading && chainRecord?.registeredOnChain && (
                  <>
                    <p>On-chain status: <span className="text-text">{chainRecord.onChain?.status}</span></p>
                    <p>
                      Hash match:{' '}
                      <span className={chainRecord.onChainHashMatches ? 'text-success' : 'text-danger'}>
                        {chainRecord.onChainHashMatches ? 'MATCH' : 'MISMATCH'}
                      </span>
                    </p>
                    <p>Status changes recorded on-chain: {chainRecord.history?.length ?? 0}</p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {pagination && (
        <LoadMoreButton
          onClick={() => loadPage(page + 1, true)}
          loading={loadingMore}
          hasMore={pagination.hasMore}
          total={pagination.total}
          shown={reports.length}
        />
      )}
    </div>
  );
}
