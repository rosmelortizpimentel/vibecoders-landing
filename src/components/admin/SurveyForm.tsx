import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  X, 
  Plus, 
  GripVertical, 
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
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

export interface SurveyOptionData {
  id?: string;
  text: string;
  description?: string;
  order_index: number;
}

export interface SurveyFormData {
  id?: string;
  title: string;
  question: string;
  badge_text?: string;
  description?: string;
  is_active: boolean;
  show_comment_field: boolean;
  options: SurveyOptionData[];
}

interface SurveyFormProps {
  initialData?: SurveyFormData;
  onSubmit: (data: SurveyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function SortableOptionRow({ 
  option, 
  onRemove, 
  onUpdate 
}: { 
  option: { id: string; text: string; description?: string }; 
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'text' | 'description', value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200"
    >
      <button 
        {...attributes} 
        {...listeners}
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded touch-none"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </button>
      <div className="flex-1 space-y-2">
        <Input
          value={option.text}
          onChange={(e) => onUpdate(option.id, 'text', e.target.value)}
          placeholder="Título corto (e.g. Analytics Dashboard)"
          className="h-9 bg-white font-bold"
        />
        <textarea
          value={option.description || ''}
          onChange={(e) => onUpdate(option.id, 'description', e.target.value)}
          placeholder="Descripción detallada..."
          className="w-full text-xs p-2 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#3D5AFE] outline-none min-h-[60px]"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(option.id)}
        className="p-2 hover:bg-red-100 rounded text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SurveyForm({ initialData, onSubmit, onCancel, isLoading }: SurveyFormProps) {
  const [title, setTitle] = useState(initialData?.title || 'Feedback Semanal');
  const [question, setQuestion] = useState(initialData?.question ?? '');
  const [badgeText, setBadgeText] = useState(initialData?.badge_text ?? 'ENCUESTA');
  const [description, setDescription] = useState(initialData?.description ?? 'Ordena las funcionalidades según su prioridad.');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [showCommentField, setShowCommentField] = useState(initialData?.show_comment_field ?? true);
  
  const [options, setOptions] = useState<{ id: string; text: string; description?: string; originalId?: string }[]>(
    initialData?.options.map(opt => ({ 
      id: opt.id || Math.random().toString(36).substr(2, 9), 
      text: opt.text,
      description: opt.description,
      originalId: opt.id
    })) || []
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddOption = () => {
    setOptions([...options, { id: Math.random().toString(36).substr(2, 9), text: '', description: '' }]);
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleUpdateOption = (id: string, field: 'text' | 'description', value: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = options.findIndex((opt) => opt.id === active.id);
      const newIndex = options.findIndex((opt) => opt.id === over.id);
      setOptions(arrayMove(options, oldIndex, newIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    if (!question.trim()) {
      toast.error('La pregunta es requerida');
      return;
    }
    if (options.length < 2) {
      toast.error('Debes añadir al menos 2 opciones');
      return;
    }

    const data: SurveyFormData = {
      id: initialData?.id,
      title,
      question,
      badge_text: badgeText,
      description,
      is_active: isActive,
      show_comment_field: showCommentField,
      options: options.map((opt, index) => ({
        id: opt.originalId,
        text: opt.text,
        description: opt.description,
        order_index: index
      }))
    };

    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Error al guardar la encuesta');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-in duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Editar Encuesta' : 'Nueva Encuesta'}
          </h2>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la Encuesta (uso interno)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Feedback Semanal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Texto del Badge</label>
                  <Input
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. ENCUESTA o BETA"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subtítulo / Instrucción</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Ordena según importancia"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Pregunta de la Encuesta</label>
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="¿Qué funcionalidades deberíamos priorizar?"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="space-y-0.5">
                <Label>Estado de la Encuesta</Label>
                <p className="text-xs text-gray-500">Activa el popup para los usuarios</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="space-y-0.5">
                <Label>Campo de Comentarios</Label>
                <p className="text-xs text-gray-500">Permite al usuario dejar un comentario general</p>
              </div>
              <Switch checked={showCommentField} onCheckedChange={setShowCommentField} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Opciones a Priorizar (Arrastra para reordenar por defecto)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddOption}
                  className="h-8 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir Opción
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={options.map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {options.map((option) => (
                      <SortableOptionRow
                        key={option.id}
                        option={option}
                        onRemove={handleRemoveOption}
                        onUpdate={handleUpdateOption}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
              
              {options.length === 0 && (
                <p className="text-center py-4 text-sm text-gray-400 italic">
                  Aún no has añadido ninguna opción.
                </p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10 -mx-6 -mb-6 mt-6">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 min-w-[120px]">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : initialData ? 'Guardar Cambios' : 'Crear Encuesta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
