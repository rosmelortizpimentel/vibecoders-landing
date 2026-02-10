import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Heart, UserPlus, Send, Zap, Database, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const notificationCases = [
  {
    id: 'follow',
    type: 'follow',
    title: 'Nuevo Seguidor',
    description: 'Se activa cuando un usuario comienza a seguir a otro.',
    icon: UserPlus,
    trigger: 'Insert en tabla follows',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    details: 'Envía una notificación al usuario seguido (recipient_id) identificando al seguidor (actor_id).',
  },
  {
    id: 'app_like',
    type: 'app_like',
    title: 'Like en App',
    description: 'Se activa cuando un usuario le da "me gusta" a una aplicación.',
    icon: Heart,
    trigger: 'Invoke en Edge Function toggle-app-like',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    details: 'Notifica al dueño de la app (recipient_id) que un usuario (actor_id) le ha dado like a su recurso (resource_id).',
  },
  {
    id: 'beta_req',
    type: 'beta_req',
    title: 'Solicitud de Beta',
    description: 'Se activa cuando un usuario se une a un Beta Squad (abierto o pendiente).',
    icon: Zap,
    trigger: 'Invoke en Edge Function join-beta',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    details: 'Notifica al dueño de la app que alguien quiere probar su producto. Incluye el app_id en resource_id.',
  },
  {
    id: 'system',
    type: 'system',
    title: 'Notificación de Sistema',
    description: 'Mensajes administrativos o actualizaciones generales.',
    icon: Send,
    trigger: 'Manual / Admin Action',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    details: 'Utilizado para comunicaciones directas desde la plataforma o anuncios globales.',
  },
];

export function NotificationDocumentation() {
  const { t } = useTranslation('admin');

  return (
    <div className="h-full overflow-y-auto space-y-6 pr-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Casos de Notificación</h1>
        <p className="text-muted-foreground">
          Documentación visual de los disparadores actuales en el sistema de notificaciones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notificationCases.map((notif) => (
          <Card key={notif.id} className="border-border/50 overflow-hidden group hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
              <div className={`p-2.5 rounded-xl ${notif.bgColor} ${notif.color} transition-transform group-hover:scale-110`}>
                <notif.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{notif.title}</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase bg-muted/30">
                    {notif.type}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-1 italic">
                  {notif.trigger}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {notif.description}
              </p>
              
              <div className="bg-muted/30 rounded-lg p-3 border border-border/40">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{notif.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Database className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-mono">Tabla: notifications</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
