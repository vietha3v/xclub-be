import { PaginatedResult } from '../interfaces/paginated-result.interface';

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function getPaginationParams(page?: number, limit?: number): { page: number; limit: number; skip: number } {
  const currentPage = Math.max(1, page || 1);
  const pageSize = Math.min(100, Math.max(1, limit || 10)); // Giới hạn tối đa 100 items/page
  const skip = (currentPage - 1) * pageSize;
  
  return {
    page: currentPage,
    limit: pageSize,
    skip,
  };
}
