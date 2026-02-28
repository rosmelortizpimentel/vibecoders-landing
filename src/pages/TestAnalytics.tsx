import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, RefreshCw, ExternalLink } from "lucide-react";
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader";
import { useAuth } from "@/hooks/useAuth";

const TestAnalytics = () => {
  const { profile, signOut } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testAppId] = useState("0f169b59-5869-f083-8f0b-e3f9b8446cc6"); // Using a sample UUID format ID

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vibe_analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const injectSDK = () => {
    // Check if already injected
    if (document.getElementById("vibe-sdk-test")) return;

    const script = document.createElement("script");
    script.id = "vibe-sdk-test";
    script.src = `https://cdn.vibecoders.la/sdk.js?id=${testAppId}&services=analytics`;
    script.async = true;
    document.head.appendChild(script);
    
    setTimeout(fetchEvents, 2000); // Refresh after some time
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader profile={profile} onSignOut={signOut} />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          <section>
            <h1 className="text-3xl font-bold tracking-tight mb-2">SDK Analytics Test</h1>
            <p className="text-muted-foreground">
              Esta página sirve para probar la integración del SDK de analíticas y ver los resultados en tiempo real.
            </p>
          </section>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>¿Cómo probar?</AlertTitle>
            <AlertDescription>
              Haz clic en el botón de abajo para inyectar el SDK Dinámicamente en esta página. Luego de unos segundos, refresca la tabla para ver tu visita registrada.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={injectSDK} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Inyectar SDK Localmente
            </Button>
            <Button variant="outline" onClick={fetchEvents} className="gap-2" disabled={loading}>
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refrescar Datos
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Últimos Eventos de Analíticas</CardTitle>
              <CardDescription>
                Eventos registrados en la tabla <code>vibe_analytics_events</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Project ID</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Anónimo (Hash)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No hay eventos registrados aún.
                        </TableCell>
                      </TableRow>
                    ) : (
                      events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-xs">
                            {new Date(event.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{event.project_id}</TableCell>
                          <TableCell>{event.page_path}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={event.referrer}>
                            {event.referrer || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{event.user_hash}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TestAnalytics;
