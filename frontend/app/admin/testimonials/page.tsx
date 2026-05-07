'use client';

import { useState } from 'react';
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from '@/hooks/useTestimonials';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestimonialDialog } from '@/components/admin/TestimonialDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Loader2, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Testimonial } from '@/lib/services/testimonial.service';

export default function AdminTestimonialsPage() {
  const { data: testimonials, isLoading } = useTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | undefined>(undefined);

  const handleCreateTestimonial = (data: any) => {
    createTestimonial.mutate(data);
  };

  const handleUpdateTestimonial = (data: any) => {
    updateTestimonial.mutate({ id: data.id, data });
  };

  const handleDeleteTestimonial = () => {
    if (selectedTestimonial) {
      deleteTestimonial.mutate(selectedTestimonial.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedTestimonial(undefined);
        },
      });
    }
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setTestimonialDialogOpen(true);
  };

  const openDeleteDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedTestimonial(undefined);
    setTestimonialDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Testimonials Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage customer testimonials and reviews</p>
          </div>
          <Button className="gym-gradient w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{testimonial.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate">{testimonial.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          i < testimonial.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-4">
                    {testimonial.text}
                  </p>

                  <div className="flex flex-col gap-2 mt-auto">
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm"
                      onClick={() => openEditDialog(testimonial)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => openDeleteDialog(testimonial)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-sm sm:text-base text-muted-foreground">No testimonials found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Testimonial Create/Edit Dialog */}
      <TestimonialDialog
        open={testimonialDialogOpen}
        onOpenChange={setTestimonialDialogOpen}
        testimonial={selectedTestimonial}
        onSubmit={selectedTestimonial ? handleUpdateTestimonial : handleCreateTestimonial}
        isLoading={createTestimonial.isPending || updateTestimonial.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTestimonial}
        title={selectedTestimonial?.name || ''}
        description={`This will permanently delete the testimonial from "${selectedTestimonial?.name}". This action cannot be undone.`}
        isLoading={deleteTestimonial.isPending}
      />
    </>
  );
}
