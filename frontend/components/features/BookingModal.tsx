'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '@/lib/schemas';
import { BookingFormData, Plan } from '@/types';
import { useCreateBooking } from '@/hooks/useBookings';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Check } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
}

export function BookingModal({ isOpen, onClose, selectedPlan }: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const createBooking = useCreateBooking();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setValue('bookingDate', selectedDate.toISOString());
    }
  };

  const onSubmit = async () => {
    if (!selectedPlan || !date) return;

    try {
      // Call backend API with planId and bookingDate
      await createBooking.mutateAsync({
        planId: selectedPlan.id,
        bookingDate: date.toISOString(),
      });

      // Reset form and close modal on success
      reset();
      setDate(undefined);
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  if (!selectedPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Your Session</DialogTitle>
          <DialogDescription>
            Select a date for your {selectedPlan.title} membership
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Selected Plan Display */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold text-lg mb-2">{selectedPlan.title}</h3>
            <p className="text-2xl font-bold text-primary mb-1">
              ${selectedPlan.price}
              <span className="text-sm text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedPlan.duration} month{selectedPlan.duration > 1 ? 's' : ''} duration
            </p>
            <div className="mt-3 space-y-1">
              {selectedPlan.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
              {selectedPlan.features.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{selectedPlan.features.length - 3} more features
                </p>
              )}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Select Booking Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            {errors.bookingDate && (
              <p className="text-sm text-destructive">{errors.bookingDate.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 gym-gradient"
              disabled={createBooking.isPending || !date}
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createBooking.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
