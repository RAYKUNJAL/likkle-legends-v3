import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type StorageBucket = 'avatars' | 'activities' | 'book-assets' | 'consent-evidence';

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export async function uploadFile(
    bucket: StorageBucket,
    file: File,
    path: string
): Promise<UploadResult> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        return { success: false, error: message };
    }
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
}

export function getFileUrl(bucket: StorageBucket, path: string): string {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
}
