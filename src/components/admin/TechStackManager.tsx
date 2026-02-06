 import { useState } from 'react';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Badge } from '@/components/ui/badge';
 import { 
   Plus, 
   Pencil, 
   Trash2, 
   ExternalLink, 
   GripVertical,
   Loader2
 } from 'lucide-react';
 import { TechStackForm, TechStackFormData } from './TechStackForm';
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
 import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   DragEndEvent,
 } from '@dnd-kit/core';
 import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   useSortable,
   verticalListSortingStrategy,
 } from '@dnd-kit/sortable';
 import { CSS } from '@dnd-kit/utilities';
 
 interface TechStack {
   id: string;
   name: string;
   logo_url: string;
   tags: string[];
   display_order: number;
   website_url: string | null;
   referral_url: string | null;
   referral_param: string | null;
   default_referral_code: string | null;
   created_at: string;
 }
 
 function SortableTechStackRow({ 
   stack, 
   onEdit, 
   onDelete 
 }: { 
   stack: TechStack; 
   onEdit: (s: TechStack) => void;
   onDelete: (id: string) => void;
 }) {
   const {
     attributes,
     listeners,
     setNodeRef,
     transform,
     transition,
     isDragging,
   } = useSortable({ id: stack.id });
 
   const style = {
     transform: CSS.Transform.toString(transform),
     transition,
     opacity: isDragging ? 0.5 : 1,
   };
 
   const hasReferral = stack.referral_url || stack.referral_param;
 
   return (
     <div 
       ref={setNodeRef}
       style={style}
       className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
     >
       {/* Drag handle */}
       <button 
         {...attributes} 
         {...listeners}
         className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded touch-none"
       >
         <GripVertical className="h-4 w-4 text-gray-400" />
       </button>
 
       {/* Logo */}
       <img 
         src={stack.logo_url} 
         alt={stack.name}
         className="h-10 w-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
       />
 
       {/* Info */}
       <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2">
           <h3 className="font-medium text-sm text-[#1c1c1c] truncate">{stack.name}</h3>
           {hasReferral && (
             <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
               Referido
             </Badge>
           )}
         </div>
         <div className="flex items-center gap-1 mt-0.5">
           {stack.tags.slice(0, 3).map((tag) => (
             <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-600">
               {tag}
             </Badge>
           ))}
         </div>
       </div>
 
       {/* Actions */}
       <div className="flex items-center gap-2 flex-shrink-0">
         {stack.website_url && (
           <a
             href={stack.website_url}
             target="_blank"
             rel="noopener noreferrer"
             className="p-1.5 hover:bg-gray-200 rounded transition-colors"
           >
             <ExternalLink className="h-4 w-4 text-gray-500" />
           </a>
         )}
 
         <button
           onClick={() => onEdit(stack)}
           className="p-1.5 hover:bg-gray-200 rounded transition-colors"
         >
           <Pencil className="h-4 w-4 text-gray-500" />
         </button>
 
         <button
           onClick={() => onDelete(stack.id)}
           className="p-1.5 hover:bg-red-100 rounded transition-colors"
         >
           <Trash2 className="h-4 w-4 text-red-500" />
         </button>
       </div>
     </div>
   );
 }
 
 export function TechStackManager() {
   const queryClient = useQueryClient();
   const [showForm, setShowForm] = useState(false);
   const [editingStack, setEditingStack] = useState<TechStack | null>(null);
   const [deletingId, setDeletingId] = useState<string | null>(null);
 
   const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: {
         distance: 8,
       },
     }),
     useSensor(KeyboardSensor, {
       coordinateGetter: sortableKeyboardCoordinates,
     })
   );
 
   const { data: stacks, isLoading } = useQuery({
     queryKey: ['admin-tech-stacks'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('tech_stacks')
         .select('*')
         .order('display_order', { ascending: true });
 
       if (error) throw error;
       return (data || []).map(stack => ({
         ...stack,
         tags: Array.isArray(stack.tags) ? (stack.tags as string[]) : [],
       })) as TechStack[];
     },
   });
 
   const createMutation = useMutation({
     mutationFn: async (data: TechStackFormData) => {
       const { error } = await supabase.from('tech_stacks').insert({
         name: data.name,
         logo_url: data.logo_url,
         tags: data.tags,
         display_order: data.display_order,
         website_url: data.website_url,
         referral_url: data.referral_url,
         referral_param: data.referral_param,
         default_referral_code: data.default_referral_code,
       });
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
       queryClient.invalidateQueries({ queryKey: ['tech-stacks'] });
       setShowForm(false);
       toast.success('Tech Stack creado exitosamente');
     },
     onError: (error) => {
       console.error('Create error:', error);
       toast.error('Error al crear el tech stack');
     },
   });
 
   const updateMutation = useMutation({
     mutationFn: async (data: TechStackFormData) => {
       if (!data.id) throw new Error('Missing stack ID');
       const { error } = await supabase
         .from('tech_stacks')
         .update({
           name: data.name,
           logo_url: data.logo_url,
           tags: data.tags,
           display_order: data.display_order,
           website_url: data.website_url,
           referral_url: data.referral_url,
           referral_param: data.referral_param,
           default_referral_code: data.default_referral_code,
         })
         .eq('id', data.id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
       queryClient.invalidateQueries({ queryKey: ['tech-stacks'] });
       setEditingStack(null);
       toast.success('Tech Stack actualizado exitosamente');
     },
     onError: (error) => {
       console.error('Update error:', error);
       toast.error('Error al actualizar el tech stack');
     },
   });
 
   const deleteMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from('tech_stacks').delete().eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
       queryClient.invalidateQueries({ queryKey: ['tech-stacks'] });
       setDeletingId(null);
       toast.success('Tech Stack eliminado');
     },
     onError: (error) => {
       console.error('Delete error:', error);
       toast.error('Error al eliminar el tech stack');
     },
   });
 
   const updateOrderMutation = useMutation({
     mutationFn: async (updates: { id: string; display_order: number }[]) => {
       const promises = updates.map(({ id, display_order }) =>
         supabase
           .from('tech_stacks')
           .update({ display_order })
           .eq('id', id)
       );
       const results = await Promise.all(promises);
       const errorResult = results.find(r => r.error);
       if (errorResult?.error) throw errorResult.error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
       queryClient.invalidateQueries({ queryKey: ['tech-stacks'] });
     },
   });
 
   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;
 
     if (over && active.id !== over.id && stacks) {
       const oldIndex = stacks.findIndex((s) => s.id === active.id);
       const newIndex = stacks.findIndex((s) => s.id === over.id);
       
       const reordered = arrayMove(stacks, oldIndex, newIndex);
       queryClient.setQueryData(['admin-tech-stacks'], reordered);
       
       const updates = reordered.map((item, index) => ({
         id: item.id,
         display_order: index,
       }));
       updateOrderMutation.mutate(updates);
     }
   };
 
   const handleFormSubmit = async (data: TechStackFormData) => {
     if (editingStack) {
       await updateMutation.mutateAsync({ ...data, id: editingStack.id });
     } else {
       await createMutation.mutateAsync(data);
     }
   };
 
   return (
    <div className="h-full overflow-y-auto space-y-4 pr-2">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-xl font-bold text-[#1c1c1c]">Tech Stacks</h1>
           <p className="text-sm text-gray-500">
             Tecnologías disponibles para el combo de apps
           </p>
         </div>
         <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
           <Plus className="h-4 w-4 mr-1" />
           Nuevo Stack
         </Button>
       </div>
 
       <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
         {isLoading ? (
           <div className="p-4 space-y-3">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center gap-3">
                 <Skeleton className="h-10 w-10 rounded-lg" />
                 <div className="flex-1 space-y-1">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-3 w-48" />
                 </div>
               </div>
             ))}
           </div>
         ) : stacks?.length === 0 ? (
           <div className="p-8 text-center">
             <p className="text-gray-500 text-sm">No hay tech stacks aún. ¡Crea el primero!</p>
           </div>
         ) : (
           <DndContext
             sensors={sensors}
             collisionDetection={closestCenter}
             onDragEnd={handleDragEnd}
           >
             <SortableContext
               items={stacks?.map(s => s.id) || []}
               strategy={verticalListSortingStrategy}
             >
               <div>
                 {stacks?.map((stack) => (
                   <SortableTechStackRow
                     key={stack.id}
                     stack={stack}
                     onEdit={setEditingStack}
                     onDelete={setDeletingId}
                   />
                 ))}
               </div>
             </SortableContext>
           </DndContext>
         )}
       </div>
 
       {(showForm || editingStack) && (
         <TechStackForm
           initialData={editingStack ? {
             id: editingStack.id,
             name: editingStack.name,
             logo_url: editingStack.logo_url,
             tags: editingStack.tags,
             display_order: editingStack.display_order,
             website_url: editingStack.website_url,
             referral_url: editingStack.referral_url,
             referral_param: editingStack.referral_param,
             default_referral_code: editingStack.default_referral_code,
           } : undefined}
           onSubmit={handleFormSubmit}
           onCancel={() => {
             setShowForm(false);
             setEditingStack(null);
           }}
           isLoading={createMutation.isPending || updateMutation.isPending}
         />
       )}
 
       <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
         <AlertDialogContent className="bg-white">
           <AlertDialogHeader>
             <AlertDialogTitle>¿Eliminar este tech stack?</AlertDialogTitle>
             <AlertDialogDescription>
               Esta acción no se puede deshacer. Las apps que usen este stack perderán la referencia.
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