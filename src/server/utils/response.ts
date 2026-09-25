import { NextResponse } from 'next/server';
import { ApiResponse, PaginationMeta } from '@/types/api';

export function successResponse<T>(
  data: T,
  meta?: PaginationMeta | Record<string, any>,
  status = 200,
  headers?: HeadersInit
) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(body, { status, headers });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  headers?: HeadersInit
) {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };
  return NextResponse.json(body, { status, headers });
}

export function handleServerError(err: unknown) {
  console.error('Unhandled Server Error:', err);

  const pgError = err as { code?: string; message?: string; detail?: string };
  if (pgError?.code === '23505' || pgError?.message?.includes('unique constraint')) {
    return errorResponse(
      'DUPLICATE_DATA',
      'Data dengan kode, nama, atau identitas tersebut sudah digunakan.',
      400
    );
  }

  if (pgError?.code === '23503' || pgError?.message?.includes('foreign key constraint')) {
    return errorResponse(
      'FOREIGN_KEY_VIOLATION',
      'Data tidak dapat dihapus atau diubah karena masih terhubung dengan data lain.',
      400
    );
  }

  const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server.';
  return errorResponse('INTERNAL_SERVER_ERROR', message, 500);
}
