'use client';

import { useState } from 'react';
import { usePlans } from '@/hooks/usePlans';
import { useCreatePlan, useUpdatePlan, useDeletePlan } from '@/hooks/useAdminPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlanDialog } from '@/components/admin/PlanDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

interface Plan {
  id: string;
  title: string;
  price: number;
  duration: number;
  features: string[];
  stripePriceId?: string;
}

export default function AdminPlansPage() {
  const { data: plans, isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(undefined);

  const handleCreatePlan = (data: any) => {
    createPlan.mutate(data);
  };

  const handleUpdatePlan = (data: any) => {
    updatePlan.mutate(data);
  };

  const handleDeletePlan = () => {
    if (selectedPlan) {
      deletePlan.mutate(selectedPlan.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedPlan(undefined);
        },
      });
    }
  };

  const openEditDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanDialogOpen(true);
  };

  const openDeleteDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedPlan(undefined);
    setPlanDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Plans Management</h1>
            <p className="text-muted-foreground">Manage membership plans and pricing</p>
          </div>
          <Button className="gym-gradient" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Button>
        </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Duration: {plan.duration} month{plan.duration > 1 ? 's' : ''}
                  </p>
                  {plan.stripePriceId && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Stripe Price ID: {plan.stripePriceId.substring(0, 20)}...
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Features:</p>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-sm text-muted-foreground">
                        +{plan.features.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    size="sm"
                    onClick={() => openDeleteDialog(plan)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
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
            <p className="text-center text-muted-foreground">No plans found</p>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Plan Create/Edit Dialog */}
      <PlanDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        plan={selectedPlan}
        onSubmit={selectedPlan ? handleUpdatePlan : handleCreatePlan}
        isLoading={createPlan.isPending || updatePlan.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePlan}
        title={selectedPlan?.title || ''}
        description={`This will permanently delete the "${selectedPlan?.title}" plan. All associated bookings and payments will remain, but users won't be able to subscribe to this plan anymore.`}
        isLoading={deletePlan.isPending}
      />
    </>
  );
}
