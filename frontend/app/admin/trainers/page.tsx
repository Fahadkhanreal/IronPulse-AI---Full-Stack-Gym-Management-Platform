'use client';

import { useState } from 'react';
import { useTrainers, useCreateTrainer, useUpdateTrainer, useDeleteTrainer } from '@/hooks/useTrainers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrainerDialog } from '@/components/admin/TrainerDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Trainer } from '@/lib/services/trainer.service';

export default function AdminTrainersPage() {
  const { data: trainers, isLoading } = useTrainers();
  const createTrainer = useCreateTrainer();
  const updateTrainer = useUpdateTrainer();
  const deleteTrainer = useDeleteTrainer();

  const [trainerDialogOpen, setTrainerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | undefined>(undefined);

  const handleCreateTrainer = (data: any) => {
    createTrainer.mutate(data);
  };

  const handleUpdateTrainer = (data: any) => {
    updateTrainer.mutate({ id: data.id, data });
  };

  const handleDeleteTrainer = () => {
    if (selectedTrainer) {
      deleteTrainer.mutate(selectedTrainer.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedTrainer(undefined);
        },
      });
    }
  };

  const openEditDialog = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setTrainerDialogOpen(true);
  };

  const openDeleteDialog = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedTrainer(undefined);
    setTrainerDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Trainers Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage gym trainers and their profiles</p>
          </div>
          <Button className="gym-gradient w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trainer
          </Button>
        </div>

        {/* Trainers Grid */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trainers && trainers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">{trainer.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate">{trainer.specialization}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Experience: {trainer.experience} year{trainer.experience > 1 ? 's' : ''}
                    </p>
                    {trainer.bio && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-3">
                        {trainer.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm"
                      onClick={() => openEditDialog(trainer)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => openDeleteDialog(trainer)}
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
              <p className="text-center text-sm sm:text-base text-muted-foreground">No trainers found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trainer Create/Edit Dialog */}
      <TrainerDialog
        open={trainerDialogOpen}
        onOpenChange={setTrainerDialogOpen}
        trainer={selectedTrainer}
        onSubmit={selectedTrainer ? handleUpdateTrainer : handleCreateTrainer}
        isLoading={createTrainer.isPending || updateTrainer.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTrainer}
        title={selectedTrainer?.name || ''}
        description={`This will permanently delete trainer "${selectedTrainer?.name}". This action cannot be undone.`}
        isLoading={deleteTrainer.isPending}
      />
    </>
  );
}
