import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const MEDIA_BUCKET = 'media';
const SIGNED_URL_EXPIRY = 3600; // 1 hour

export interface UploadUrlResponse {
  uploadUrl: string;
  path: string;
  signedUrl: string;
}

export async function createSignedUploadUrl(
  userId: string,
  fileName: string,
  contentType: string,
  size: number
): Promise<UploadUrlResponse> {
  // Validate file size (max 100MB for video)
  const MAX_SIZE = 100 * 1024 * 1024;
  if (size > MAX_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_SIZE / 1024 / 1024}MB`);
  }

  // Validate content type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'video/webm',
    'video/mp4',
  ];
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`File type ${contentType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Generate unique path
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = fileName.split('.').pop();
  const path = `${userId}/${timestamp}-${randomId}.${extension}`;

  // Ensure bucket exists before uploading
  await ensureBucketExists();

  // Create signed upload URL
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUploadUrl(path, {
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to create upload URL: ${error.message}`);
  }

  return {
    uploadUrl: data.signedUrl,
    path,
    // Download URL will be generated after upload via getSignedUrl
    signedUrl: '',
  };
}

export async function getSignedUrl(path: string, expiresIn: number = SIGNED_URL_EXPIRY): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

export async function deleteMedia(path: string): Promise<void> {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);

  if (error) {
    throw new Error(`Failed to delete media: ${error.message}`);
  }
}

export async function ensureBucketExists(): Promise<void> {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  const bucketExists = buckets?.some((bucket) => bucket.name === MEDIA_BUCKET);

  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
      public: false,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'video/webm',
        'video/mp4',
      ],
    });

    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
  }
}
