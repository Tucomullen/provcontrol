import {
  Home,
  AlertCircle,
  Users,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  UserPlus,
  Wallet,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const menuItems = [
  {
    title: "Feed",
    url: "/",
    icon: Activity,
    roles: ["presidente", "propietario", "proveedor"],
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["presidente", "propietario", "proveedor"],
  },
  {
    title: "Incidencias",
    url: "/incidencias",
    icon: AlertCircle,
    roles: ["presidente", "propietario"],
  },
  {
    title: "Proveedores",
    url: "/proveedores",
    icon: Users,
    roles: ["presidente", "propietario"],
  },
  {
    title: "Presupuestos",
    url: "/presupuestos",
    icon: BarChart3,
    roles: ["presidente", "proveedor"],
  },
  {
    title: "Contabilidad",
    url: "/contabilidad",
    icon: Wallet,
    roles: ["presidente"],
  },
  {
    title: "Documentos",
    url: "/documentos",
    icon: FileText,
    roles: ["presidente", "propietario"],
  },
  {
    title: "Invitaciones",
    url: "/invitaciones",
    icon: UserPlus,
    roles: ["presidente"],
  },
  {
    title: "Foro Comunidad",
    url: "/foro",
    icon: MessageSquare,
    roles: ["presidente", "propietario"],
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
    roles: ["presidente", "propietario", "proveedor"],
  },
];

export function AppSidebar() {
  const { user } = useAuth();

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "U";

  const visibleMenuItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : true
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Provcontrol</h2>
            <p className="text-xs text-muted-foreground">Control Vecinal</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/ /g, "-")}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="text-user-name">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            {user.role && <RoleBadge role={user.role} className="w-full justify-center" />}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => (window.location.href = "/api/logout")}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}