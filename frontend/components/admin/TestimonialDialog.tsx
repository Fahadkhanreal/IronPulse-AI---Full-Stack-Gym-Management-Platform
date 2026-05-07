'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  text: z.string().min(10, 'Testimonial must be at least 10 characters'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  image: z.string().min(1, 'Image is required'),
  role: z.string().max(50, 'Role must be less than 50 characters').optional(),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  image: string;
  role: string;
}

interface TestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function TestimonialDialog({ open, onOpenChange, testimonial, onSubmit, isLoading }: TestimonialDialogProps) {
  const [imageUrl, setImageUrl] = useState<string>(testimonial?.image || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          text: testimonial.text,
          rating: testimonial.rating,
          image: testimonial.image,
          role: testimonial.role || 'Member',
        }
      : {
          name: '',
          text: '',
          rating: 5,
          image: '',
          role: 'Member',
        },
  });

  // Update image URL when it changes
  useEffect(() => {
    setValue('image', imageUrl);
  }, [imageUrl, setValue]);

  // Reset image URL when dialog opens/closes
  useEffect(() => {
    if (open) {
      setImageUrl(testimonial?.image || '');
    }
  }, [open, testimonial]);

  const handleFormSubmit = (data: TestimonialFormData) => {
    if (testimonial) {
      onSubmit({ id: testimonial.id, ...data });
    } else {
      onSubmit(data);
    }

    reset();
    setImageUrl('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {testimonial ? 'Update the testimonial details below.' : 'Fill in the details to add a new testimonial.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="name" className="text-xs sm:text-sm">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Sarah Johnson"
              className="text-sm"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role" className="text-xs sm:text-sm">Role</Label>
            <Input
              id="role"
              {...register('role')}
              placeholder="e.g., Member"
              className="text-sm"
            />
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rating" className="text-xs sm:text-sm">Rating (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              {...register('rating', { valueAsNumber: true })}
              placeholder="5"
              className="text-sm"
            />
            {errors.rating && (
              <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Image Upload Component */}
          <ImageUpload
            label="Profile Image"
            currentImageUrl={imageUrl}
            folder="testimonials"
            onImageUploaded={setImageUrl}
            disabled={isLoading}
          />
          {errors.image && (
            <p className="text-xs text-red-500 mt-1">{errors.image.message}</p>
          )}

          <div>
            <Label htmlFor="text" className="text-xs sm:text-sm">Testimonial Text</Label>
            <Textarea
              id="text"
              {...register('text')}
              placeholder="Write the testimonial here..."
              rows={5}
              className="text-sm"
            />
            {errors.text && (
              <p className="text-xs text-red-500 mt-1">{errors.text.message}</p>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setImageUrl('');
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" className="gym-gradient w-full sm:w-auto text-xs sm:text-sm" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {testimonial ? 'Update Testimonial' : 'Add Testimonial'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
