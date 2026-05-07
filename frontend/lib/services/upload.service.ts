import api from '@/lib/api';

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

export const uploadService = {
  // Upload image to Cloudinary
  async uploadImage(file: File, folder: 'trainers' | 'testimonials'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(`/upload/image?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<any> {
    return await api.delete('/upload/image', { data: { publicId } });
  },
};
