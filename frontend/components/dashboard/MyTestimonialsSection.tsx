'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyTestimonials, deleteMyTestimonial, Testimonial } from '@/lib/services/testimonials.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Pencil, Trash2, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MyTestimonialsSection() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTestimonials();
  }, []);

  const fetchMyTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getMyTestimonials();
      setTestimonials(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      setDeleteLoading(id);
      await deleteMyTestimonial(id);
      toast.success('Testimonial deleted successfully');
      fetchMyTestimonials();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete testimonial');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'APPROVED':
        return 'text-green-600 dark:text-green-400';
      case 'REJECTED':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600';
    }
  };

  const canEdit = (status: string) => status === 'PENDING' || status === 'REJECTED';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Testimonials</CardTitle>
            <CardDescription>Share your experience with IronPulse Gym</CardDescription>
          </div>
          {(!testimonials || testimonials.length === 0 || !testimonials.some(t => t.status === 'PENDING' || t.status === 'APPROVED')) ? (
            <Button onClick={() => router.push('/dashboard/testimonials/submit')} className="gym-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Submit Testimonial
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !testimonials || testimonials.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't submitted any testimonials yet.</p>
            <Button onClick={() => router.push('/dashboard/testimonials/submit')} className="gym-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Submit Your First Testimonial
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Status and Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testimonial.status)}
                    <span className={`text-sm font-medium ${getStatusColor(testimonial.status)}`}>
                      {getStatusText(testimonial.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-sm text-muted-foreground">{testimonial.text}</p>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground">
                  <p>Submitted: {new Date(testimonial.submittedAt).toLocaleDateString()}</p>
                  {testimonial.reviewedAt && (
                    <p>Reviewed: {new Date(testimonial.reviewedAt).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Status Messages */}
                {testimonial.status === 'PENDING' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      Your testimonial is being reviewed by our admin team. You'll be notified once it's approved.
                    </p>
                  </div>
                )}

                {testimonial.status === 'REJECTED' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-xs text-red-800 dark:text-red-200">
                      Your testimonial was not approved. You can edit and resubmit it.
                    </p>
                  </div>
                )}

                {testimonial.status === 'APPROVED' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-xs text-green-800 dark:text-green-200">
                      Your testimonial is now live on our website. Thank you for your feedback!
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {canEdit(testimonial.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/testimonials/edit/${testimonial.id}`)}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={deleteLoading === testimonial.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {deleteLoading === testimonial.id ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-3 w-3" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
