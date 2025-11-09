import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingDown, FileCheck, MessageSquare, ShieldCheck, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Provcontrol</h1>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/login">Iniciar sesión</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Control Vecinal y Transparencia Total
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                La primera plataforma especializada para comunidades de propietarios que garantiza 
                la transparencia, controla el gasto descontrolado y verifica la calidad de los proveedores.
              </p>
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/login" className="text-lg">
                  Comenzar ahora
                </a>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              <Card>
                <CardHeader>
                  <ShieldCheck className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Rating Verificable</CardTitle>
                  <CardDescription>
                    Sistema anti-fraude que vincula calificaciones a incidencias reales, presupuestos 
                    aprobados y facturas validadas.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingDown className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Control de Gasto</CardTitle>
                  <CardDescription>
                    Compara presupuestos automáticamente y controla que el trabajo profesional 
                    esté a la par del coste cobrado.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <FileCheck className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Trazabilidad Total</CardTitle>
                  <CardDescription>
                    Seguimiento completo desde la incidencia hasta la resolución con documentación 
                    verificable y valor probatorio.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Marketplace de Proveedores</CardTitle>
                  <CardDescription>
                    Directorio clasificado de profesionales con calificaciones verificadas y 
                    comparativas de presupuestos transparentes.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Comunicación Directa</CardTitle>
                  <CardDescription>
                    Foros y tablón de anuncios para la comunicación entre vecinos sin intermediarios, 
                    fortaleciendo la comunidad.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Independiente</CardTitle>
                  <CardDescription>
                    Contratado directamente por la comunidad. La propiedad de los datos permanece 
                    siempre en manos de los propietarios.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">
                  ¿Listo para tomar el control de tu comunidad?
                </CardTitle>
                <CardDescription className="text-lg mt-4">
                  Únete a las comunidades que ya están mejorando su transparencia y control financiero.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <Button size="lg" asChild>
                  <a href="/register">Solicitar acceso</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="container max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Provcontrol. Plataforma independiente de control vecinal.</p>
        </div>
      </footer>
    </div>
  );
}