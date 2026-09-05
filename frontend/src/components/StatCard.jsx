import React from 'react';

export default function StatCard({ label, value, accent }) {
  return (
    <div className="bg-surface shadow-sm border border-border rounded-2xl p-5">
      <p className={`text-xs font-bold tracking-widest uppercase mb-2 ${accent || 'text-textMuted'}`}>{label}</p>
      <p className="text-4xl font-extrabold text-text">{value}</p>
    </div>
  );
}
