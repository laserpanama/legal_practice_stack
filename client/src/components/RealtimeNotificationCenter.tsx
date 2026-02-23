/**
 * Real-Time Notification Center
 * Displays WebSocket notifications in admin dashboard
 */

import { useState, useEffect } from "react";
import { useWebSocketNotifications } from "@/_core/hooks/useWebSocketNotifications";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Bell,
  Trash2,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

export interface RealtimeNotificationCenterProps {
  compact?: boolean;
  maxHeight?: string;
}

/**
 * Real-time notification center component
 */
export function RealtimeNotificationCenter({
  compact = false,
  maxHeight = "400px",
}: RealtimeNotificationCenterProps) {
  const { user } = useAuth();
  const {
    isConnected,
    notifications,
    unreadCount,
    clearNotifications,
    markAsRead,
  } = useWebSocketNotifications({
    enabled: user?.role === "admin",
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Only show for admins
  if (!user || user.role !== "admin") {
    return null;
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "signature_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "signature_rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "signature_expired":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getSeverityBadgeVariant = (
    severity: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "success":
        return "default";
      default:
        return "outline";
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-green-600" : "bg-red-600"
            }`}
          />
          <span className="text-muted-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-1">
            {notifications.slice(0, 3).map((notification, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded border text-sm ${getSeverityColor(
                  notification.severity
                )}`}
              >
                {getIconForType(notification.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {notification.signerName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Real-Time Notifications
            </CardTitle>
            <CardDescription>
              Live updates on signature events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected ? "bg-green-600" : "bg-red-600"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-xs mt-1">
              {isConnected
                ? "Waiting for signature events..."
                : "Connecting to notification server..."}
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className={`w-full border rounded-md`} style={{ height: maxHeight }}>
              <div className="space-y-2 p-4">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${getSeverityColor(
                      notification.severity
                    )} ${
                      expandedId === index ? "ring-2 ring-offset-2 ring-blue-500" : ""
                    }`}
                    onClick={() =>
                      setExpandedId(expandedId === index ? null : index)
                    }
                  >
                    <div className="flex items-start gap-3">
                      {getIconForType(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {notification.signerName}
                          </p>
                          <Badge
                            variant={getSeverityBadgeVariant(
                              notification.severity
                            )}
                            className="text-xs"
                          >
                            {notification.type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.signerEmail}
                        </p>
                        {expandedId === index && (
                          <div className="mt-2 pt-2 border-t space-y-1 text-xs">
                            <p>
                              <span className="font-medium">Status:</span>{" "}
                              {notification.status}
                            </p>
                            <p>
                              <span className="font-medium">Request ID:</span>{" "}
                              {notification.signatureRequestId}
                            </p>
                            <p>
                              <span className="font-medium">Time:</span>{" "}
                              {format(
                                new Date(notification.timestamp),
                                "PPpp"
                              )}
                            </p>
                            {notification.data && (
                              <details className="mt-2">
                                <summary className="cursor-pointer font-medium">
                                  Additional Details
                                </summary>
                                <pre className="mt-1 text-xs bg-muted p-1 rounded overflow-auto max-h-32">
                                  {JSON.stringify(notification.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(
                          new Date(notification.timestamp),
                          "HH:mm"
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAsRead}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearNotifications}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Notification badge component for header
 */
export function NotificationBadge() {
  const { user } = useAuth();
  const { isConnected, unreadCount } = useWebSocketNotifications({
    enabled: user?.role === "admin",
  });

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
      {!isConnected && (
        <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-yellow-600 rounded-full border border-white" />
      )}
    </div>
  );
}
