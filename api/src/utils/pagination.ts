export const parsePagination = (page?: string, limit?: string, maxLimit = 100) => {
  const p = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const l = Math.min(maxLimit, Math.max(1, parseInt(limit ?? "10", 10) || 10));
  return { page: p, limit: l, skip: (p - 1) * l };
};
