'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function uploadImage(formData: FormData) {
  try {
    // Basic auth check
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    // Basic file validation
    if (!file.type.startsWith('image/')) {
      return { error: 'Invalid file type. Only images are allowed.' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { error: 'File size exceeds 10MB limit.' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('portfolio-assets')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return { error: 'Failed to upload image to storage' };
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('portfolio-assets')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return { error: 'An unexpected error occurred during upload' };
  }
}
