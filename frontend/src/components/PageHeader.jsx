import React from 'react';

export default function PageHeader({ eyebrow, badge, title, description }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {eyebrow && (
          <span className="text-xs font-bold tracking-widest text-primary uppercase">{eyebrow}</span>
        )}
        {badge && (
          <span className="text-xs font-semibold uppercase bg-warning/15 text-warning border border-warning/40 px-2.5 py-1 rounded-md">
            {badge}
          </span>
        )}
      </div>
      <h1 className="text-3xl font-extrabold text-text">{title}</h1>
      {description && <p className="text-textMuted mt-2 max-w-2xl">{description}</p>}
    </div>
  );
}
