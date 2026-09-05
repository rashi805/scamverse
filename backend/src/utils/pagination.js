/**
 * SCAMVERSE 360 - Pagination helper
 *
 * Small, explicit, and reused everywhere instead of ad-hoc .limit(100) calls
 * scattered across controllers. Every paginated list endpoint returns the
 * same { data, pagination } shape so the frontend can use one pattern.
 */
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePagination(query, defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return { page, limit, skip: (page - 1) * limit };
}

function buildPaginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasMore: page * limit < total,
  };
}

module.exports = { parsePagination, buildPaginationMeta, DEFAULT_LIMIT, MAX_LIMIT };
