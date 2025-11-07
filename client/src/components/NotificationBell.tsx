import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/notifications/${id}/read`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/notifications/mark-all-read", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const unreadCount = unreadData?.count || 0;

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      incidencia_nueva: "Nueva incidencia",
      incidencia_actualizada: "Incidencia actualizada",
      presupuesto_nuevo: "Nuevo presupuesto",
      presupuesto_aprobado: "Presupuesto aprobado",
      rating_nuevo: "Nueva valoración",
      foro_nuevo: "Nueva publicación en foro",
      foro_respuesta: "Nueva respuesta en foro",
      comunidad_aviso: "Aviso de comunidad",
    };
    return labels[type] || type;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              data-testid="badge-notification-count"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" data-testid="dropdown-notifications">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:bg-transparent hover-elevate"
              onClick={() => markAllAsReadMutation.mutate()}
              data-testid="button-mark-all-read"
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {!notifications || notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground" data-testid="text-no-notifications">
              No hay notificaciones
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`cursor-pointer p-3 ${
                  !notification.isRead ? "bg-accent/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium" data-testid={`notification-title-${notification.id}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5" data-testid={`notification-message-${notification.id}`}>
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" data-testid={`notification-unread-${notification.id}`} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid={`notification-time-${notification.id}`}>
                    {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
