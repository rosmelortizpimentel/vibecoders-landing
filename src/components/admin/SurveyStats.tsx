import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  X, 
  Users, 
  Target,
  Trophy,
  MessageSquare,
  Trash2,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SurveyStatsProps {
  surveyId: string;
  onClose: () => void;
}

export function SurveyStats({ surveyId, onClose }: SurveyStatsProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('summary');

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['survey-stats', surveyId],
    queryFn: async () => {
      // 1. Get survey and options
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('title, question, survey_options(id, text)')
        .eq('id', surveyId)
        .single();

      if (surveyError) throw surveyError;

      // 2. Get all responses (including skipped for details)
      const { data: responses, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*, profiles(name, avatar_url, username)')
        .eq('survey_id', surveyId)
        .order('created_at', { ascending: false });

      if (responsesError) throw responsesError;

      // 3. Filter for valid responses for the chart
      const validResponses = (responses || []).filter(r => !r.skipped);

      // 4. Process scores
      const optionScores: Record<string, number> = {};
      const optionCounts: Record<string, number> = {};
      const numOptions = survey.survey_options.length;

      survey.survey_options.forEach(opt => {
        optionScores[opt.id] = 0;
        optionCounts[opt.id] = 0;
      });

      validResponses.forEach(resp => {
        resp.ordered_option_ids.forEach((optId: string, index: number) => {
          if (optionScores[optId] !== undefined) {
            optionScores[optId] += (numOptions - index);
            optionCounts[optId]++;
          }
        });
      });

      const chartData = survey.survey_options.map(opt => ({
        id: opt.id,
        name: opt.text,
        score: optionScores[opt.id],
        responses: optionCounts[opt.id]
      })).sort((a, b) => b.score - a.score);

      const optionsMap = survey.survey_options.reduce((acc, opt) => {
        acc[opt.id] = opt.text;
        return acc;
      }, {} as Record<string, string>);

      return {
        question: survey.question,
        chartData,
        totalResponses: validResponses.length,
        totalAttempts: responses?.length || 0,
        responses: responses || [],
        optionsMap
      };
    }
  });

  const deleteResponseMutation = useMutation({
    mutationFn: async (responseId: string) => {
      const { error } = await supabase
        .from('survey_responses')
        .delete()
        .eq('id', responseId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Respuesta eliminada. El usuario volverá a ver la encuesta.');
      queryClient.invalidateQueries({ queryKey: ['survey-stats', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['admin-surveys'] });
    },
    onError: () => {
      toast.error('Error al eliminar la respuesta.');
    }
  });

  const COLORS = ['#3D5AFE', '#536DFE', '#8C9EFF', '#C5CAE9', '#E8EAF6'];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {stats?.title || 'Estadísticas de la Encuesta'}
            </h2>
            {stats && <p className="text-sm text-gray-500 mt-1">{stats.question}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 border-b border-gray-100">
            <TabsList className="bg-transparent gap-6 h-12 w-full justify-start border-none">
              <TabsTrigger 
                value="summary" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3D5AFE] data-[state=active]:bg-transparent px-0 text-gray-500 data-[state=active]:text-[#3D5AFE] font-bold"
              >
                Resumen
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3D5AFE] data-[state=active]:bg-transparent px-0 text-gray-500 data-[state=active]:text-[#3D5AFE] font-bold"
              >
                Respuestas Individuales
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                </div>
              </div>
            ) : stats ? (
              <>
                <TabsContent value="summary" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-400 uppercase">Respuestas</p>
                        <p className="text-2xl font-black text-blue-700">{stats.totalResponses}</p>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase">Ganador</p>
                        <p className="text-sm font-bold text-indigo-700 truncate w-32">
                          {stats.chartData[0]?.name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-violet-600 shadow-sm">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-violet-400 uppercase">Total Vistas/Skips</p>
                        <p className="text-2xl font-black text-violet-700">
                          {stats.totalAttempts}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Visualización de Prioridades</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.chartData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={120}
                            style={{ fontSize: '12px', fontWeight: '500' }}
                          />
                          <Tooltip 
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={32}>
                            {stats.chartData.map((entry, index) => (
                              <Cell key={`cell-chart-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Comments Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Feedback Reciente</h3>
                    </div>
                    
                    {stats.responses.filter(r => r.comment).length === 0 ? (
                      <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">Nadie ha dejado comentarios aún.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stats.responses.filter(r => r.comment).slice(0, 4).map((r, i) => (
                          <div key={`summary-comment-${i}`} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-600 italic">
                            "{r.comment}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-4">
                    {stats.responses.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Aún no hay respuestas para mostrar.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.responses.map((resp) => (
                          <div key={resp.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors group">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-gray-100">
                                  <AvatarImage src={resp.profiles?.avatar_url} />
                                  <AvatarFallback>{getInitials(resp.profiles?.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900 text-sm">
                                      {resp.profiles?.name || 'Usuario Anónimo'}
                                    </p>
                                    {resp.skipped && (
                                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        Saltado
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(resp.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteResponseMutation.mutate(resp.id)}
                                disabled={deleteResponseMutation.isPending}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {!resp.skipped && (
                              <div className="mt-4 pl-[52px] space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {resp.ordered_option_ids.map((id: string, idx: number) => (
                                    <div key={`${resp.id}-${id}`} className="flex items-center gap-1.5 bg-[#F8FAFF] border border-[#E0E7FF] px-2.5 py-1 rounded-full text-xs text-[#3D5AFE] font-medium">
                                      <span className="opacity-50 font-bold">{idx + 1}.</span>
                                      {stats.optionsMap[id] || 'Opción eliminada'}
                                    </div>
                                  ))}
                                </div>
                                {resp.comment && (
                                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-200 text-sm text-gray-600 italic">
                                    "{resp.comment}"
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </>
            ) : (
              <p className="text-center text-gray-500 py-10">No se pudieron cargar las estadísticas.</p>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
