import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BroadcastSender } from "./BroadcastSender";
import { BroadcastHistory } from "./BroadcastHistory";
import { NotificationDocumentation } from "./NotificationDocumentation";
import { Send, History, BookOpen } from "lucide-react";

interface Broadcast {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  status: 'draft' | 'sent';
  is_popup?: boolean;
  auto_show?: boolean;
}

export function NotificationManager() {
  const [activeTab, setActiveTab] = useState("send");
  const [editDraft, setEditDraft] = useState<Broadcast | null>(null);

  const handleEditDraft = (draft: Broadcast) => {
    setEditDraft(draft);
    setActiveTab("send");
  };

  const handleClone = (broadcast: Broadcast) => {
    // Create a copy without the ID and set status to draft
    const { id, ...rest } = broadcast;
    const clonedBroadcast = {
      ...rest,
      status: 'draft' as const,
      // We don't want an ID so it's treated as a new record when saving
    } as any;
    
    setEditDraft(clonedBroadcast);
    setActiveTab("send");
  };

  const clearEditDraft = () => {
    setEditDraft(null);
  };

  return (
    <div className="h-full flex flex-col space-y-6 pr-2 overflow-hidden">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-foreground">Gestión de Notificaciones</h1>
        <p className="text-muted-foreground text-sm">
          Envía anuncios de sistema, monitorea el alcance y consulta la documentación técnica.
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="flex-shrink-0 mb-4 bg-muted/30 p-1 rounded-xl w-fit">
          <TabsList className="bg-transparent gap-1">
            <TabsTrigger value="send" className="gap-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Send className="w-4 h-4" />
              {editDraft ? 'Editar Borrador' : 'Enviar'}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <History className="w-4 h-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="w-4 h-4" />
              Documentación
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <TabsContent value="send" className="mt-0 focus-visible:outline-none">
            <BroadcastSender 
              editDraft={editDraft} 
              onClearDraft={clearEditDraft} 
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0 focus-visible:outline-none">
            <BroadcastHistory onEditDraft={handleEditDraft} onClone={handleClone} />
          </TabsContent>

          <TabsContent value="docs" className="mt-0 focus-visible:outline-none">
            <NotificationDocumentation />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
