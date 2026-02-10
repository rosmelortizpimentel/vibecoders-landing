import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Heart, 
  UserPlus, 
  Send, 
  Zap, 
  Database, 
  Info, 
  Loader2 
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const notificationCases = [
  {
    id: 'follow',
    type: 'follow',
    title: 'Nuevo Seguidor',
    description: 'Se activa cuando un usuario comienza a seguir a otro.',
    icon: UserPlus,
    trigger: 'Insert en follows',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    details: 'Notifica al usuario seguido (recipient_id).',
  },
  {
    id: 'app_like',
    type: 'app_like',
    title: 'Like en App',
    description: 'Se activa cuando un usuario le da "me gusta" a una app.',
    icon: Heart,
    trigger: 'Edge Function toggle-app-like',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    details: 'Notifica al dueño de la app (actor_id -> recipient_id).',
  },
  {
    id: 'beta_req',
    type: 'beta_req',
    title: 'Solicitud de Beta',
    description: 'Usuario se une a un Beta Squad.',
    icon: Send,
    trigger: 'Edge Function join-beta',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    details: 'Notifica al dueño de la app que tiene un nuevo tester potencial.',
  },
  {
    id: 'beta_accepted',
    type: 'beta_accepted',
    title: 'Aceptación en Beta',
    description: 'Aprobación de tester por el dueño.',
    icon: Zap,
    trigger: 'Trigger: tr_beta_tester_accepted',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    details: 'Notifica al tester que ha sido aceptado en el Squad.',
  },
  {
    id: 'beta_feedback',
    type: 'beta_feedback',
    title: 'Reporte de Tester',
    description: 'Tester envía feedback o bug.',
    icon: Send,
    trigger: 'Edge Function submit-beta-feedback',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    details: 'Notifica al dueño de la app sobre nuevo feedback.',
  },
  {
    id: 'feedback_status',
    type: 'feedback_status',
    title: 'Status de Reporte',
    description: 'Cambio de estado (Cerrado/Abierto).',
    icon: Database,
    trigger: 'Trigger: tr_feedback_status_change',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    details: 'Notifica al tester/dueño sobre el avance del reporte.',
  },
  {
    id: 'system',
    type: 'system',
    title: 'Sistema',
    description: 'Actualizaciones generales.',
    icon: Bell,
    trigger: 'Manual / Admin Action',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    details: 'Usado para anuncios globales o mensajes administrativos directos.',
  },
];

export function NotificationDocumentation() {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ['notification-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_configs')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ type, enabled }: { type: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('notification_configs')
        .update({ enabled })
        .eq('type', type);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-configs'] });
      toast.success('Estado actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-6 pr-2">
      <div>
        <h1 className="text-xl font-bold text-foreground">Gestión de Disparadores</h1>
        <p className="text-muted-foreground text-sm">
          Configuración y documentación técnica de las notificaciones automáticas.
        </p>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[200px]">Tipo / Evento</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
              <TableHead>Disparador Técnico</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notificationCases.map((notif) => {
              const config = configs?.find(c => c.type === notif.type);
              const isEnabled = config?.enabled ?? true;

              return (
                <TableRow 
                  key={notif.id} 
                  className={`group transition-colors ${!isEnabled ? 'opacity-60 bg-muted/10' : ''}`}
                >
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${notif.bgColor} ${notif.color}`}>
                        <notif.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{notif.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase leading-none">{notif.type}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 hidden md:table-cell">
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-foreground line-clamp-1">{notif.description}</p>
                      <p className="text-[10px] text-muted-foreground italic line-clamp-1">{notif.details}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge variant="outline" className="text-[9px] font-mono bg-muted/20 px-1.5 py-0 h-4 whitespace-nowrap">
                      {notif.trigger}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className={`text-[10px] font-medium hidden sm:inline ${isEnabled ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {isEnabled ? 'ON' : 'OFF'}
                      </span>
                      <Switch 
                        checked={isEnabled}
                        onCheckedChange={(checked) => toggleMutation.mutate({ type: notif.type, enabled: checked })}
                        disabled={toggleMutation.isPending}
                        className="scale-75 origin-right"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-[11px] font-semibold">Nota técnica para el Administrador</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Las notificaciones marcadas como <b>Inactivas</b> no se generarán en la base de datos. 
            El tipo <b>Sistema</b> se reserva para comunicaciones manuales desde Supabase o scripts de mantenimiento 
            (ej: anuncios globales o correcciones de perfil) sin necesidad de una acción disparada por un usuario.
          </p>
        </div>
      </div>
    </div>
  );
}
