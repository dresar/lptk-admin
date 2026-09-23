export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta | Record<string, any>;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkDeleteResponse {
  deleted: number;
  failed: Array<{
    id: string;
    reason: string;
  }>;
}
