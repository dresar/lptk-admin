import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.S3_BUCKET || 'assets';
const ENDPOINT = process.env.AWS_ENDPOINT_URL_S3;
const REGION = process.env.AWS_REGION || 'ap-southeast-1';

if (!ENDPOINT) {
  throw new Error('AWS_ENDPOINT_URL_S3 is not defined');
}

const s3Client = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

import { uploadToGitHubStorage } from './github-storage';

/**
 * Upload a file buffer to Neon Object Storage (S3-compatible) with GitHub CDN fallback.
 * Returns the S3 key.
 */
export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return key;
  } catch (s3Err) {
    console.warn('Neon S3 upload issue, attempting GitHub Storage fallback:', s3Err);
    const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
    const ghRes = await uploadToGitHubStorage(key, buf);
    if (ghRes.success) {
      return key;
    }
    throw s3Err;
  }
}

/**
 * Generate a time-limited presigned URL to download a private file.
 * Default expiry: 1 hour (3600s).
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a single file from S3 storage.
 */
export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  );
}

/**
 * Bulk delete files from S3 storage (max 1000 per call).
 */
export async function bulkDeleteFromS3(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true,
      },
    })
  );
}

/**
 * List objects from S3 storage with optional prefix.
 */
export async function listObjectsFromS3(prefix = 'cdn/'): Promise<Array<{ key: string; size: number; lastModified?: Date }>> {
  const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
  const res = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
    })
  );
  return (res.Contents || [])
    .filter((item) => Boolean(item.Key && !item.Key.endsWith('/')))
    .map((item) => ({
      key: item.Key!,
      size: item.Size || 0,
      lastModified: item.LastModified,
    }));
}

/**
 * Get object stream and metadata from S3 storage.
 */
export async function getObjectFromS3(key: string) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return s3Client.send(command);
}

export { s3Client, BUCKET };
