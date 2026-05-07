'use client';

import { useState } from 'react';
import { useAdminBookings } from '@/hooks/useAdminStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function AdminBookingsPage() {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
  });

  const { data, isLoading } = useAdminBookings(filters);

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value === 'all' ? '' : value, page: 1 });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        <p className="text-muted-foreground">View and manage all member bookings</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by member name or email..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            {data ? `${data.total} total bookings` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data && data.data && data.data.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 whitespace-nowrap">Member</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Plan</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Date</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Status</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{booking.user.name}</p>
                            <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">{booking.plan.title}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' :
                            'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {booking.payment ? (
                            <span className="text-sm text-green-600 whitespace-nowrap">Paid</span>
                          ) : (
                            <span className="text-sm text-muted-foreground whitespace-nowrap">No payment</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {data.data.map((booking) => (
                  <Card key={booking.id} className="border">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-base">{booking.user.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Plan:</span>
                            <span className="font-medium">{booking.plan.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'CONFIRMED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' :
                              'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment:</span>
                            {booking.payment ? (
                              <span className="text-green-600 font-medium">Paid</span>
                            ) : (
                              <span className="text-muted-foreground">No payment</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No bookings found</p>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm">
                Page {filters.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === data.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
