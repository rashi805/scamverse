import React from 'react';

const levelStyles = {
  HIGH: 'bg-danger/15 text-danger border-danger/40',
  MEDIUM: 'bg-warning/15 text-warning border-warning/40',
  LOW: 'bg-primary/15 text-primary border-primary/40',
};

export default function PriorityCard({ level, timestamp, title, description, tags = [] }) {
  return (
    <div className="bg-surface shadow-sm border border-border rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md border ${levelStyles[level] || levelStyles.LOW}`}>
          {level}
        </span>
        {timestamp && <span className="text-xs text-textMuted">{timestamp}</span>}
      </div>
      <h3 className="font-semibold text-text mb-1.5">{title}</h3>
      <p className="text-sm text-textMuted mb-4 flex-1">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-xs bg-surface shadow-smAlt text-textMuted px-2 py-1 rounded-md border border-border">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
