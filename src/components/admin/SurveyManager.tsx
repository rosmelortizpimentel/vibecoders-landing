import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  BarChart3,
  Loader2,
  ClipboardList
} from 'lucide-react';
import { SurveyForm, SurveyFormData } from './SurveyForm';
import { SurveyStats } from './SurveyStats';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Survey {
  id: string;
  title: string;
  question: string;
  badge_text: string;
  description: string;
  is_active: boolean;
  show_comment_field: boolean;
  created_at: string;
  options: { id: string; text: string; description?: string; order_index: number }[];
  _count_responses?: number;
}

export function SurveyManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [viewingStatsId, setViewingStatsId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all surveys with their options and response count
  const { data: surveys, isLoading } = useQuery({
    queryKey: ['admin-surveys'],
    queryFn: async () => {
      // Get surveys
      const { data: surveysData, error: surveysError } = await (supabase as any)
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (surveysError) throw surveysError;

      const { data: optionsData, error: optionsError } = await (supabase as any)
        .from('survey_options')
        .select('*');

      if (optionsError) throw optionsError;

      const { data: countsData, error: countsError } = await (supabase as any)
        .from('survey_responses')
        .select('survey_id');

      if (countsError) throw countsError;

      const countsMap = (countsData || []).reduce((acc: Record<string, number>, curr: any) => {
        acc[curr.survey_id] = (acc[curr.survey_id] || 0) + 1;
        return acc;
      }, {});

      const optionsMap = (optionsData || []).reduce((acc: Record<string, any[]>, curr: any) => {
        if (!acc[curr.survey_id]) acc[curr.survey_id] = [];
        acc[curr.survey_id].push(curr);
        return acc;
      }, {});

      return surveysData.map(s => ({
        ...s,
        options: (optionsMap[s.id] || []).sort((a, b) => a.order_index - b.order_index),
        _count_responses: countsMap[s.id] || 0
      })) as Survey[];
    },
  });

  // Create survey mutation
  const createMutation = useMutation({
    mutationFn: async (data: SurveyFormData) => {
      // 1. Insert survey
      const { data: survey, error: surveyError } = await (supabase as any)
        .from('surveys')
        .insert({
          title: data.title,
          question: data.question,
          badge_text: data.badge_text,
          description: data.description,
          is_active: data.is_active,
          show_comment_field: data.show_comment_field
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      // 2. Insert options
      const optionsToInsert = data.options.map((opt, index) => ({
        survey_id: survey.id,
        text: opt.text,
        description: opt.description,
        order_index: index
      }));

      const { error: optionsError } = await (supabase as any)
        .from('survey_options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
      setShowForm(false);
      toast.success('Encuesta creada exitosamente');
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast.error('Error al crear la encuesta');
    },
  });

  // Update survey mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SurveyFormData) => {
      if (!data.id) throw new Error('Missing survey ID');

      // 1. Update survey
      const { error: surveyError } = await (supabase as any)
        .from('surveys')
        .update({
          title: data.title,
          question: data.question,
          badge_text: data.badge_text,
          description: data.description,
          is_active: data.is_active,
          show_comment_field: data.show_comment_field,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (surveyError) throw surveyError;

      // 2. Options management is more complex (Delete old, Insert new is simplest for maintenance)
      // First, delete current options
      const { error: deleteError } = await (supabase as any)
        .from('survey_options')
        .delete()
        .eq('survey_id', data.id);

      if (deleteError) throw deleteError;

      // Insert new/updated ones
      const optionsToInsert = data.options.map((opt, index) => ({
        survey_id: data.id!,
        text: opt.text,
        description: opt.description,
        order_index: index
      }));

      const { error: insertError } = await (supabase as any)
        .from('survey_options')
        .insert(optionsToInsert);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
      setEditingSurvey(null);
      toast.success('Encuesta actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Error al actualizar la encuesta');
    },
  });

  // Delete survey mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('surveys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
      setDeletingId(null);
      toast.success('Encuesta eliminada');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Error al eliminar la encuesta');
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // If activating, we might want to deactivate others (if project only supports one active survey)
      // For now, simple toggle
      const { error } = await (supabase as any)
        .from('surveys')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
    },
  });

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-2 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1c1c1c]">Gestión de Encuestas</h1>
          <p className="text-sm text-gray-500">
            Crea encuestas de priorización para tus usuarios
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
          <Plus className="h-4 w-4 mr-1" />
          Nueva Encuesta
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : surveys?.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <ClipboardList className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm">No has creado ninguna encuesta aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {surveys?.map((survey) => (
              <div key={survey.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  survey.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <ClipboardList className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{survey.title}</h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{survey.question}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      {survey.options.length} opciones
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <ClipboardList className="h-3 w-3" />
                      {survey._count_responses} respuestas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-1 mr-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Status</span>
                    <Switch 
                      checked={survey.is_active} 
                      onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: survey.id, is_active: checked })}
                    />
                  </div>

                  <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-blue-600"
                      title="Ver Resultados"
                      onClick={() => setViewingStatsId(survey.id)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-gray-900"
                      onClick={() => setEditingSurvey(survey)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => setDeletingId(survey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showForm || editingSurvey) && (
        <SurveyForm
          key={editingSurvey?.id || 'new'}
          initialData={editingSurvey ? {
            id: editingSurvey.id,
            title: editingSurvey.title,
            question: editingSurvey.question,
            badge_text: editingSurvey.badge_text,
            description: editingSurvey.description,
            is_active: editingSurvey.is_active,
            show_comment_field: editingSurvey.show_comment_field,
            options: editingSurvey.options
          } : undefined}
          onSubmit={async (data) => {
            if (editingSurvey) {
              await updateMutation.mutateAsync(data);
            } else {
              await createMutation.mutateAsync(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingSurvey(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {viewingStatsId && (
        <SurveyStats
          surveyId={viewingStatsId}
          onClose={() => setViewingStatsId(null)}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar encuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la encuesta y todas sus respuestas de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
