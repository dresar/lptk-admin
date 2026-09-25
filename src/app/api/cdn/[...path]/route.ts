import { NextRequest, NextResponse } from 'next/server';
import { getObjectFromS3 } from '@/server/utils/s3';
import { fetchFromGitHubCdn } from '@/server/utils/github-storage';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    if (!params.path || params.path.length === 0) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    // Sanitize path components to prevent directory traversal
    const cleanSegments = params.path
      .map((p) => p.replace(/\.\./g, '').trim())
      .filter(Boolean);
    const key = cleanSegments.join('/');

    if (!key) {
      return new NextResponse('Invalid Key', { status: 400 });
    }

    // Try fetching from S3
    try {
      const s3Obj = await getObjectFromS3(key);
      if (s3Obj.Body) {
        const bytes = await s3Obj.Body.transformToByteArray();
        return new Response(Buffer.from(bytes), {
          status: 200,
          headers: {
            'Content-Type': s3Obj.ContentType || 'application/octet-stream',
            'Content-Length': bytes.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            ...(s3Obj.ETag ? { ETag: s3Obj.ETag } : {}),
          },
        });
      }
    } catch (s3Err: unknown) {
      // If key doesn't start with cdn/, try with cdn/ prefix
      if (!key.startsWith('cdn/')) {
        try {
          const s3Obj = await getObjectFromS3(`cdn/${key}`);
          if (s3Obj.Body) {
            const bytes = await s3Obj.Body.transformToByteArray();
            return new Response(Buffer.from(bytes), {
              status: 200,
              headers: {
                'Content-Type': s3Obj.ContentType || 'application/octet-stream',
                'Content-Length': bytes.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
                ...(s3Obj.ETag ? { ETag: s3Obj.ETag } : {}),
              },
            });
          }
        } catch {}
      }
    }

    // Try fetching from GitHub CDN fallback if S3 misses
    try {
      const ghRes = await fetchFromGitHubCdn(key);
      if (ghRes && ghRes.ok) {
        const buffer = await ghRes.arrayBuffer();
        const contentType = ghRes.headers.get('content-type') || 'application/octet-stream';
        return new Response(Buffer.from(buffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch {}

    // Local filesystem fallback for base assets
    const filename = cleanSegments[cleanSegments.length - 1];
    const localFallbackPath = path.join(process.cwd(), 'public', 'images', filename);
    if (fs.existsSync(localFallbackPath)) {
      const fileBuffer = fs.readFileSync(localFallbackPath);
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        svg: 'image/svg+xml',
      };
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': mimeMap[ext || ''] || 'application/octet-stream',
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return new NextResponse('File Not Found', { status: 404 });
  } catch (err: unknown) {
    console.error('CDN proxy error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
