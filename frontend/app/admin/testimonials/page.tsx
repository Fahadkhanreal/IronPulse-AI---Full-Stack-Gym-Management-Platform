'use client';

import { useState, useEffect } from 'react';
import {
  getAllTestimonialsAdmin,
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonialAdmin,
  Testimonial
} from '@/lib/services/testimonials.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const status = filter === 'ALL' ? undefined : filter;
      const testimonials = await getAllTestimonialsAdmin(status);
      setTestimonials(testimonials || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch testimonials');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await approveTestimonial(id);
      toast.success('Testimonial approved successfully');
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      await rejectTestimonial(id);
      toast.success('Testimonial rejected');
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) return;

    try {
      setActionLoading(id);
      await deleteTestimonialAdmin(id);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const pendingCount = testimonials?.filter(t => t.status === 'PENDING').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Testimonials Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and manage member testimonials
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium">
                {pendingCount} pending review
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === status
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {status}
            {status !== 'ALL' && (
              <span className="ml-2 text-xs opacity-75">
                ({testimonials?.filter(t => t.status === status).length || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !testimonials || testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {filter === 'ALL' ? 'No testimonials found' : `No ${filter.toLowerCase()} testimonials`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.user.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {testimonial.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{testimonial.user.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate">{testimonial.user.email}</CardDescription>
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
                        <span className="ml-2 text-sm text-muted-foreground">
                          {testimonial.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(testimonial.status)}`}>
                    {testimonial.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Testimonial Text */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {testimonial.text}
                </p>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  <p>Submitted: {new Date(testimonial.submittedAt).toLocaleString()}</p>
                  {testimonial.reviewedAt && (
                    <p>Reviewed: {new Date(testimonial.reviewedAt).toLocaleString()}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {testimonial.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => handleApprove(testimonial.id)}
                        disabled={actionLoading === testimonial.id}
                        className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none"
                      >
                        {actionLoading === testimonial.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(testimonial.id)}
                        disabled={actionLoading === testimonial.id}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 flex-1 sm:flex-none"
                      >
                        {actionLoading === testimonial.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </>
                  )}
                  {testimonial.status === 'REJECTED' && (
                    <Button
                      onClick={() => handleApprove(testimonial.id)}
                      disabled={actionLoading === testimonial.id}
                      className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none"
                    >
                      {actionLoading === testimonial.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  )}
                  {testimonial.status === 'APPROVED' && (
                    <Button
                      onClick={() => handleReject(testimonial.id)}
                      disabled={actionLoading === testimonial.id}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 flex-1 sm:flex-none"
                    >
                      {actionLoading === testimonial.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Revoke
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={actionLoading === testimonial.id}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {actionLoading === testimonial.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
