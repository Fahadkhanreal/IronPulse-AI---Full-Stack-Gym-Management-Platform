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

const trainerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  experience: z.number().min(1, 'Experience must be at least 1 year'),
  image: z.string().min(1, 'Image is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  image: string;
  bio?: string;
}

interface TrainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer?: Trainer;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function TrainerDialog({ open, onOpenChange, trainer, onSubmit, isLoading }: TrainerDialogProps) {
  const [imageUrl, setImageUrl] = useState<string>(trainer?.image || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: trainer
      ? {
          name: trainer.name,
          specialization: trainer.specialization,
          experience: trainer.experience,
          image: trainer.image,
          bio: trainer.bio || '',
        }
      : {
          name: '',
          specialization: '',
          experience: 1,
          image: '',
          bio: '',
        },
  });

  // Update image URL when it changes
  useEffect(() => {
    setValue('image', imageUrl);
  }, [imageUrl, setValue]);

  // Reset form and image URL when dialog opens/closes
  useEffect(() => {
    if (open) {
      setImageUrl(trainer?.image || '');
      // Reset form with trainer data when editing
      if (trainer) {
        reset({
          name: trainer.name,
          specialization: trainer.specialization,
          experience: trainer.experience,
          image: trainer.image,
          bio: trainer.bio || '',
        });
      } else {
        // Reset to empty form when creating new
        reset({
          name: '',
          specialization: '',
          experience: 1,
          image: '',
          bio: '',
        });
      }
    }
  }, [open, trainer, reset]);

  const handleFormSubmit = (data: TrainerFormData) => {
    if (trainer) {
      onSubmit({ id: trainer.id, ...data });
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
          <DialogTitle className="text-lg sm:text-xl">{trainer ? 'Edit Trainer' : 'Add New Trainer'}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {trainer ? 'Update the trainer details below.' : 'Fill in the details to add a new trainer.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="name" className="text-xs sm:text-sm">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., John Doe"
              className="text-sm"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="specialization" className="text-xs sm:text-sm">Specialization</Label>
            <Input
              id="specialization"
              {...register('specialization')}
              placeholder="e.g., Strength Training"
              className="text-sm"
            />
            {errors.specialization && (
              <p className="text-xs text-red-500 mt-1">{errors.specialization.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="experience" className="text-xs sm:text-sm">Experience (years)</Label>
            <Input
              id="experience"
              type="number"
              {...register('experience', { valueAsNumber: true })}
              placeholder="1"
              className="text-sm"
            />
            {errors.experience && (
              <p className="text-xs text-red-500 mt-1">{errors.experience.message}</p>
            )}
          </div>

          {/* Image Upload Component */}
          <ImageUpload
            label="Trainer Image"
            currentImageUrl={imageUrl}
            folder="trainers"
            onImageUploaded={setImageUrl}
            disabled={isLoading}
          />
          {errors.image && (
            <p className="text-xs text-red-500 mt-1">{errors.image.message}</p>
          )}

          <div>
            <Label htmlFor="bio" className="text-xs sm:text-sm">Bio (optional)</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Brief description about the trainer..."
              rows={4}
              className="text-sm"
            />
            {errors.bio && (
              <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
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
              {trainer ? 'Update Trainer' : 'Add Trainer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
