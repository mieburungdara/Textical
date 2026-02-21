/**
 * Centralized pagination helper to standardize skip/take calculation.
 * Prevents magic numbers and ensures consistent page math across repositories.
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Build Prisma-compatible pagination args from page/limit params.
 * @param {number} page - 1-indexed page number.
 * @param {number} limit - Items per page.
 * @returns {{ skip: number, take: number }} Prisma skip/take args.
 */
function buildPaginationArgs(page = 1, limit = DEFAULT_LIMIT) {
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    return {
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
    };
}

/**
 * Build the meta object to include in paginated API responses.
 * @param {number} page - 1-indexed page number.
 * @param {number} limit - Items per page.
 * @param {number} total - Total item count from the DB.
 * @returns {{ page: number, limit: number, total: number, totalPages: number, hasNext: boolean }}
 */
function buildPaginationMeta(page, limit, total) {
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    const totalPages = Math.ceil(total / safeLimit);
    return {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
    };
}

module.exports = { buildPaginationArgs, buildPaginationMeta, DEFAULT_LIMIT };
