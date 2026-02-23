import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProjectResource {
  id: string;
  project_id: string;
  user_id: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
  file_extension: string;
  original_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  resource_type: string;
  created_at: string;
  updated_at: string;
}

// Build full URL for a resource
export const getResourceUrl = (resource: ProjectResource): string => {
  // Use ToggleUp's Supabase bucket URL since we are proxying resources
  const baseUrl = `https://twuvzxjmywyenpsxwavy.supabase.co/storage/v1/object/public`;
  return `${baseUrl}/${resource.storage_bucket}/${resource.storage_path}${resource.file_name}.${resource.file_extension}`;
};

// Normalize domain for storage path
const normalizeDomainForPath = (domain: string): string => {
  let normalized = domain.trim().toLowerCase();
  normalized = normalized.replace(/^https?:\/\//, '');
  normalized = normalized.replace(/\/$/, '');
  return normalized;
};

// Generate a short random ID for file names
const generateFileId = (): string => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// Get file extension from file name or mime type
const getFileExtension = (fileName: string, mimeType?: string): string => {
  const extFromName = fileName.split('.').pop()?.toLowerCase();
  if (extFromName && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extFromName)) {
    return extFromName === 'jpeg' ? 'jpg' : extFromName;
  }
  // Fallback to mime type
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
  };
  return mimeMap[mimeType || ''] || 'png';
};

// Hook to list project resources
export const useProjectResources = (projectId: string | undefined, resourceType?: string) => {
  return useQuery({
    queryKey: ['project-resources', projectId, resourceType],
    queryFn: async () => {
      if (!projectId) return [];

      let query = supabase
        .from('project_resources')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (resourceType) {
        query = query.eq('resource_type', resourceType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ProjectResource[];
    },
    enabled: !!projectId,
  });
};

// Hook to upload a resource
export const useUploadResource = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      projectId,
      projectDomain,
      file,
      resourceType = 'image',
    }: {
      projectId: string;
      projectDomain: string;
      file: File;
      resourceType?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const storagePath = `${normalizeDomainForPath(projectDomain)}/`;
      const fileId = generateFileId();
      const fileExtension = getFileExtension(file.name, file.type);
      const fullFileName = `${fileId}.${fileExtension}`;
      const fullPath = `${storagePath}${fullFileName}`;

      // Note: This uploads to Vibecoders storage, but the hook was designed for ToggleUp.
      // We'll need to ensure the bucket 'branding-assets' exists in Vibecoders or ToggleUp.
      // For now, consistent with proxying, we assume operations target ToggleUp tables
      // through the edge function proxy if the table isn't in Vibecoders.
      
      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('branding-assets')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Register in database
      const { data, error: dbError } = await supabase
        .from('project_resources')
        .insert({
          project_id: projectId,
          user_id: user.id,
          storage_bucket: 'branding-assets',
          storage_path: storagePath,
          file_name: fileId,
          file_extension: fileExtension,
          original_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          resource_type: resourceType,
        })
        .select()
        .single();

      if (dbError) {
        // Rollback storage upload if DB insert fails
        await supabase.storage.from('branding-assets').remove([fullPath]);
        throw dbError;
      }

      return data as ProjectResource;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-resources', data.project_id] });
    },
  });
};

// Hook to delete a resource
export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: ProjectResource) => {
      const fullPath = `${resource.storage_path}${resource.file_name}.${resource.file_extension}`;

      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from(resource.storage_bucket)
        .remove([fullPath]);

      if (storageError) {
        console.error('Storage delete error (continuing):', storageError);
      }

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('project_resources')
        .delete()
        .eq('id', resource.id);

      if (dbError) throw dbError;

      return resource;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-resources', data.project_id] });
    },
  });
};
