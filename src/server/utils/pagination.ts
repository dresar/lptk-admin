import { PaginationMeta } from '@/types/api';

export interface ParsedListParams {
  page: number;
  pageSize: number;
  offset: number;
  q?: string;
  sort: string;
  order: 'asc' | 'desc';
}

export function parseListParams(url: string | URL): ParsedListParams {
  const searchParams = typeof url === 'string' ? new URL(url).searchParams : url.searchParams;

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') || '20', 10)));
  const offset = (page - 1) * pageSize;
  const q = searchParams.get('q')?.trim() || undefined;
  const rawSort = searchParams.get('sort')?.trim() || 'created_at';
  // sanitize sort column to alphanumeric + underscore
  const sort = /^[a-zA-Z0-9_]+$/.test(rawSort) ? rawSort : 'created_at';
  const order = searchParams.get('order')?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return { page, pageSize, offset, q, sort, order };
}

export function createPaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number
): PaginationMeta {
  return {
    page,
    page_size: pageSize,
    total_items: totalItems,
    total_pages: Math.ceil(totalItems / pageSize) || 1,
  };
}
