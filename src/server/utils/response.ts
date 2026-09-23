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
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server.';
  return errorResponse('INTERNAL_SERVER_ERROR', message, 500);
}
