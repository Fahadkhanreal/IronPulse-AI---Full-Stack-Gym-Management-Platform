'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Loader2, Upload, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import Image from 'next/image';

export default function SubmitTestimonialPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    rating: 5,
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', imageFile);

      const response = await api.post('/upload?folder=testimonials', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.text.length < 10) {
      toast.error('Testimonial must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image first if selected
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setIsSubmitting(false);
          return;
        }
      }

      // Submit testimonial
      await api.post('/testimonials', {
        text: formData.text,
        rating: formData.rating,
        image: imageUrl || null,
      });

      toast.success('Testimonial submitted successfully! It will be reviewed by admin.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Share Your Experience
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Tell us about your journey at IronPulse Gym
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold">
                  How would you rate us? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-all hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`h-8 w-8 sm:h-10 sm:w-10 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-base sm:text-lg font-medium text-muted-foreground">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              {/* Testimonial Text */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold">
                  Your Testimonial <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Share your experience... What do you love about IronPulse Gym? How has it helped you achieve your fitness goals?"
                  rows={6}
                  required
                  minLength={10}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 transition-all resize-none text-sm sm:text-base"
                />
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <p className="text-muted-foreground">
                    Minimum 10 characters
                  </p>
                  <p className={`font-medium ${
                    formData.text.length > 500
                      ? 'text-red-500'
                      : formData.text.length > 450
                      ? 'text-yellow-500'
                      : 'text-muted-foreground'
                  }`}>
                    {formData.text.length}/500
                  </p>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold">
                  Your Photo (Optional)
                </label>

                {imagePreview ? (
                  <div className="relative w-full sm:w-48 h-48 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 mx-auto sm:mx-0">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 sm:p-12 text-center hover:border-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
                      </div>
                      <span className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Click to upload your photo
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </label>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Add your photo to make your testimonial more personal
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  <strong className="font-semibold">📝 Note:</strong> Your testimonial will be reviewed by our team before being published. You'll be notified once it's approved and live on our website!
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading || !formData.text || formData.text.length < 10}
                  className="flex-1 gym-gradient h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isUploading ? 'Uploading Image...' : 'Submitting...'}
                    </>
                  ) : (
                    'Submit Testimonial'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting || isUploading}
                  className="sm:w-32 h-12 text-base font-medium"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
