import React from 'react';

export default function LoadMoreButton({ onClick, loading, hasMore, total, shown }) {
  if (!hasMore) {
    return total > 0 ? (
      <p className="text-xs text-textMuted text-center pt-2">Showing all {total} record{total === 1 ? '' : 's'}.</p>
    ) : null;
  }
  return (
    <div className="flex justify-center pt-2">
      <button
        onClick={onClick}
        disabled={loading}
        className="text-sm border border-border hover:border-primary text-textMuted px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Loading...' : `Load more (${shown} of ${total})`}
      </button>
    </div>
  );
}
