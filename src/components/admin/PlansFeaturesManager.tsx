import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Plus, Trash2, Key, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Plan {
  id: string;
  key: string;
  name: string;
  description: string | null;
  stripe_product_id: string | null;
  price_yearly: number | null;
  is_active: boolean;
}

interface Feature {
  id: string;
  key: string;
  name: string;
  description: string | null;
}

interface PlanFeature {
  plan_id: string;
  feature_id: string;
}

export function PlansFeaturesManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'plans' | 'features' | 'mapping'>('plans');
  
  // Dialog states for Features
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  // Dialog states for Plans
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [newPlanKey, setNewPlanKey] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscription_plans').select('*').order('created_at');
      if (error) throw error;
      return data as Plan[];
    },
  });

  const { data: features, isLoading: featuresLoading } = useQuery({
    queryKey: ['admin-features'],
    queryFn: async () => {
      const { data, error } = await supabase.from('features').select('*').order('created_at');
      if (error) throw error;
      return data as Feature[];
    },
  });

  const { data: planFeatures, isLoading: mappingLoading } = useQuery({
    queryKey: ['admin-plan-features'],
    queryFn: async () => {
      const { data, error } = await supabase.from('plan_features').select('*');
      if (error) throw error;
      return data as PlanFeature[];
    },
  });

  const isLoading = plansLoading || featuresLoading || mappingLoading;

  // --- FEATURE MUTATIONS ---
  const createFeatureMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('features').insert({
        key: newFeatureKey,
        name: newFeatureName,
        description: newFeatureDesc
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      setIsFeatureDialogOpen(false);
      setNewFeatureKey('');
      setNewFeatureName('');
      setNewFeatureDesc('');
      toast.success('Funcionalidad creada');
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('features').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plan-features'] });
      toast.success('Funcionalidad eliminada');
    },
    onError: (e: Error) => toast.error(e.message)
  });

  // --- PLAN MUTATIONS ---
  const createPlanMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('subscription_plans').insert({
        key: newPlanKey,
        name: newPlanName,
        description: newPlanDesc
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      setIsPlanDialogOpen(false);
      setNewPlanKey('');
      setNewPlanName('');
      setNewPlanDesc('');
      toast.success('Plan creado');
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plan-features'] });
      toast.success('Plan eliminado');
    },
    onError: (e: Error) => toast.error(e.message)
  });

  // --- MAPPING MUTATIONS ---
  const toggleMappingMutation = useMutation({
    mutationFn: async ({ plan_id, feature_id, isMapped }: { plan_id: string, feature_id: string, isMapped: boolean }) => {
      if (isMapped) {
        // Remove mapping
        const { error } = await supabase.from('plan_features')
          .delete()
          .match({ plan_id, feature_id });
        if (error) throw error;
      } else {
        // Add mapping
        const { error } = await supabase.from('plan_features')
          .insert({ plan_id, feature_id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plan-features'] });
    },
    onError: (e: Error) => toast.error('Error al actualizar mapeo: ' + e.message)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-6 pr-2">
      <div className="flex items-center gap-3">
        <Key className="h-6 w-6 text-gray-400" />
        <h2 className="text-xl font-semibold text-[#1C1C1C]">Planes y Permisos</h2>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <Button 
          variant={activeTab === 'plans' ? 'default' : 'ghost'} 
          className={activeTab === 'plans' ? 'bg-[#3D5AFE] hover:bg-[#3D5AFE]/90' : ''}
          onClick={() => setActiveTab('plans')}
        >
          Planes
        </Button>
        <Button 
          variant={activeTab === 'features' ? 'default' : 'ghost'}
          className={activeTab === 'features' ? 'bg-[#3D5AFE] hover:bg-[#3D5AFE]/90' : ''}
          onClick={() => setActiveTab('features')}
        >
          Funcionalidades (Features)
        </Button>
        <Button 
          variant={activeTab === 'mapping' ? 'default' : 'ghost'}
          className={activeTab === 'mapping' ? 'bg-[#3D5AFE] hover:bg-[#3D5AFE]/90' : ''}
          onClick={() => setActiveTab('mapping')}
        >
          Mapeo Plan-Feature
        </Button>
      </div>

      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Lista de Funcionalidades</h3>
            <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Feature
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Nueva Funcionalidad</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input value={newFeatureKey} onChange={e => setNewFeatureKey(e.target.value)} placeholder="Clave (ej: advanced_analytics)" />
                  <Input value={newFeatureName} onChange={e => setNewFeatureName(e.target.value)} placeholder="Nombre (ej: Analíticas Avanzadas)" />
                  <Textarea value={newFeatureDesc} onChange={e => setNewFeatureDesc(e.target.value)} placeholder="Descripción..." />
                  <Button 
                    onClick={() => createFeatureMutation.mutate()} 
                    disabled={!newFeatureKey || !newFeatureName || createFeatureMutation.isPending}
                    className="w-full bg-[#3D5AFE]"
                  >
                    Crear
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-3">
            {features?.map(f => (
              <div key={f.id} className="p-4 bg-white border border-gray-200 rounded-xl flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">{f.name}</p>
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{f.key}</code>
                  </div>
                  <p className="text-sm text-gray-500">{f.description}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white">
                    <AlertDialogTitle>¿Eliminar {f.name}?</AlertDialogTitle>
                    <AlertDialogDescription>Esta acción quitará el permiso de todos los planes que lo tengan asignado.</AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteFeatureMutation.mutate(f.id)} className="bg-red-500">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Lista de Planes</h3>
            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Nuevo Plan de Suscripción</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input value={newPlanKey} onChange={e => setNewPlanKey(e.target.value)} placeholder="Clave (ej: enterprise)" />
                  <Input value={newPlanName} onChange={e => setNewPlanName(e.target.value)} placeholder="Nombre (ej: Enterprise Plan)" />
                  <Textarea value={newPlanDesc} onChange={e => setNewPlanDesc(e.target.value)} placeholder="Descripción..." />
                  <Button 
                    onClick={() => createPlanMutation.mutate()} 
                    disabled={!newPlanKey || !newPlanName || createPlanMutation.isPending}
                    className="w-full bg-[#3D5AFE]"
                  >
                    Crear
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-3">
            {plans?.map(p => (
              <div key={p.id} className="p-4 bg-white border border-gray-200 rounded-xl flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p.key}</code>
                  </div>
                  <p className="text-sm text-gray-500">{p.description}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white">
                    <AlertDialogTitle>¿Eliminar {p.name}?</AlertDialogTitle>
                    <AlertDialogDescription>Si un usuario está en este plan perderá acceso a sus permisos asignados.</AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deletePlanMutation.mutate(p.id)} className="bg-red-500">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mapping' && (
        <div className="space-y-4 overflow-x-auto">
          <h3 className="text-lg font-medium mb-4">Mapeo de Funcionalidades por Plan</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                  <th className="p-4 border-r border-gray-200 w-1/4">Funcionalidad</th>
                  {plans?.map(p => (
                    <th key={p.id} className="p-4 text-center border-r border-gray-200">
                      <p className="text-gray-900">{p.name}</p>
                      <span className="text-xs font-normal text-gray-500">{p.key}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features?.map(f => (
                  <tr key={f.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-r border-gray-200">
                      <p className="font-medium text-gray-900 text-sm">{f.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">{f.key}</p>
                    </td>
                    {plans?.map(p => {
                      const isMapped = planFeatures?.some(pf => pf.plan_id === p.id && pf.feature_id === f.id) || false;
                      const isToggling = toggleMappingMutation.isPending && 
                        toggleMappingMutation.variables?.plan_id === p.id && 
                        toggleMappingMutation.variables?.feature_id === f.id;
                      
                      return (
                        <td key={`${f.id}-${p.id}`} className="p-4 border-r border-gray-200 text-center">
                          <Switch 
                            checked={isMapped}
                            disabled={isToggling}
                            onCheckedChange={() => toggleMappingMutation.mutate({ plan_id: p.id, feature_id: f.id, isMapped })}
                            className="scale-90"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {(!features || features.length === 0) && (
                  <tr>
                    <td colSpan={plans?.length ? plans.length + 1 : 1} className="p-8 text-center text-gray-500">
                      Crea funcionalidades primero para realizar el mapeo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
