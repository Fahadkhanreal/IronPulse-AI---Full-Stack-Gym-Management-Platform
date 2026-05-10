'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitTestimonial, CreateTestimonialData } from '@/lib/services/testimonials.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SubmitTestimonialForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTestimonialData>({
    text: '',
    rating: 5,
    image: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitTestimonial(formData);
      toast.success('Testimonial submitted successfully! It will be reviewed by admin.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Submit Your Testimonial</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className={`text-3xl ${
                  star <= (formData.rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Testimonial Text */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Testimonial <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Share your experience with IronPulse Gym..."
            rows={6}
            required
            minLength={10}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.text.length}/500 characters
          </p>
        </div>

        {/* Image URL (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Profile Image URL (Optional)
          </label>
          <input
            type="url"
            value={formData.image || ''}
            onChange={(e) => setFormData({ ...formData, image: e.target.value || null })}
            placeholder="https://example.com/your-photo.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to use your default avatar
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.text || formData.text.length < 10}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Your testimonial will be reviewed by our admin team before being published on the website.
        </p>
      </div>
    </div>
  );
}
