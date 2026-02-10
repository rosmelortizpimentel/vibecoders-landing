import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

      <Card className="border-border/50">
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
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${notif.bgColor} ${notif.color}`}>
                        <notif.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{notif.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">{notif.type}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 hidden md:table-cell">
                    <div className="space-y-1">
                      <p className="text-xs text-foreground line-clamp-1">{notif.description}</p>
                      <p className="text-[10px] text-muted-foreground italic line-clamp-1">{notif.details}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="text-[10px] font-mono bg-muted/20 whitespace-nowrap">
                      {notif.trigger}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`text-[10px] font-medium hidden sm:inline ${isEnabled ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {isEnabled ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                      <Switch 
                        checked={isEnabled}
                        onCheckedChange={(checked) => toggleMutation.mutate({ type: notif.type, enabled: checked })}
                        disabled={toggleMutation.isPending}
                        className="scale-90"
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
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-semibold">Nota técnica para el Administrador</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Las notificaciones marcadas como <b>Inactivas</b> dejarán de insertarse en la base de datos <code>notifications</code>. 
            Este control es global y afecta a todos los usuarios de la plataforma por igual. 
            El tipo <b>Sistema</b> permite envíos manuales desde scripts o el dashboard de Supabase omitiendo el actor.
          </p>
        </div>
      </div>
    </div>
  );
}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Nota sobre el Sistema</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Todas las notificaciones se almacenan en la tabla <code>notifications</code> y se distribuyen en tiempo real 
                mediante Supabase Realtime Channels. Si añades un nuevo tipo, recuerda registrarlo en el enum 
                <code>NotificationType</code> en el hook <code>useNotifications.ts</code>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
