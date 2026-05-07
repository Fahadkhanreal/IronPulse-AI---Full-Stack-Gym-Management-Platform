'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface KnowledgeDocument {
  id: number;
  content: string;
  metadata: {
    category: string;
    language: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export default function KnowledgeBasePage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);
  const queryClient = useQueryClient();

  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ['knowledge-documents', page, category],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), pageSize: '20' });
      if (category !== 'all') params.append('category', category);
      const response = await api.get(`/admin/knowledge?${params}`);
      return response.data;
    },
  });

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: async (data: { content: string; category: string; language: string }) => {
      return api.post('/admin/knowledge', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
      toast.success('Document created successfully');
      setIsCreateOpen(false);
    },
    onError: () => {
      toast.error('Failed to create document');
    },
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.put(`/admin/knowledge/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
      toast.success('Document updated successfully');
      setEditingDoc(null);
    },
    onError: () => {
      toast.error('Failed to update document');
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/knowledge/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
      toast.success('Document deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete document');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };

  const categories = ['all', 'timing', 'plan', 'trainer', 'facility', 'workout', 'exercise'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Knowledge Base Management</h1>
        <p className="text-muted-foreground">Manage chatbot knowledge base documents</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gym-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <DocumentForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {data?.documents?.map((doc: KnowledgeDocument) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        <span className="inline-block px-2 py-1 text-xs rounded bg-primary/10 text-primary mr-2">
                          {doc.metadata.category}
                        </span>
                        Document #{doc.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        {doc.content.substring(0, 200)}...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingDoc(doc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data?.total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {Math.ceil(data.total / 20)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / 20)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingDoc && (
        <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Document #{editingDoc.id}</DialogTitle>
            </DialogHeader>
            <DocumentForm
              initialData={editingDoc}
              onSubmit={(data) => updateMutation.mutate({ id: editingDoc.id, data })}
              isLoading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function DocumentForm({
  initialData,
  onSubmit,
  isLoading,
}: {
  initialData?: KnowledgeDocument;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.metadata.category || 'workout');
  const [language, setLanguage] = useState(initialData?.metadata.language || 'en');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ content, category, language });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter document content..."
          rows={8}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timing">Timing</SelectItem>
              <SelectItem value="plan">Plan</SelectItem>
              <SelectItem value="trainer">Trainer</SelectItem>
              <SelectItem value="facility">Facility</SelectItem>
              <SelectItem value="workout">Workout</SelectItem>
              <SelectItem value="exercise">Exercise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ur">Urdu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading} className="gym-gradient">
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
