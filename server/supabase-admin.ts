import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase admin client not configured - storage features will be limited');
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export async function initializeStorageBucket(bucketName: string = 'resumes') {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  try {
    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }

    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB in bytes
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png'
        ]
      });

      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }

      console.log(`Storage bucket '${bucketName}' created successfully`);
      return { success: true, created: true, bucket: data };
    }

    console.log(`Storage bucket '${bucketName}' already exists`);
    return { success: true, created: false };
  } catch (error) {
    console.error('Error initializing storage bucket:', error);
    throw error;
  }
}
