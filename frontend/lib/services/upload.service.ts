import api from '@/lib/api';

interface UploadData {
  url: string;
  publicId: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadData;
}

export const uploadService = {
  // Upload image to Cloudinary
  async uploadImage(file: File, folder: 'trainers' | 'testimonials'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    // Use /upload/image for admin (trainers) and /upload for members (testimonials)
    const endpoint = folder === 'trainers' ? '/upload/image' : '/upload';

    const response = await api.post<UploadResponse>(`${endpoint}?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // api interceptor already extracts response.data, so response is the actual data
    return response as unknown as UploadResponse;
  },

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<any> {
    return await api.delete('/upload/image', { data: { publicId } });
  },
};
