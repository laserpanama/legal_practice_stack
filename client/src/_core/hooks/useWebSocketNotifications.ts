/**
 * WebSocket Notifications Hook
 * Real-time notification management for admin dashboard
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface WebSocketNotification {
  type:
    | "signature_rejected"
    | "signature_expired"
    | "signature_completed"
    | "signature_sent"
    | "signature_viewed"
    | "audit_alert"
    | "connection_established"
    | "heartbeat_ack";
  signatureRequestId: number;
  signerEmail: string;
  signerName: string;
  status: string;
  message: string;
  timestamp: Date;
  severity: "info" | "warning" | "error" | "success";
  data?: Record<string, any>;
}

export interface UseWebSocketNotificationsOptions {
  enabled?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * Hook for managing WebSocket notifications
 */
export function useWebSocketNotifications(
  options: UseWebSocketNotificationsOptions = {}
) {
  const {
    enabled = true,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!enabled || !user || user.role !== "admin") {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Get authentication token from localStorage or session
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.warn("No authentication token available for WebSocket");
        return;
      }

      // Construct WebSocket URL
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/ws?token=${encodeURIComponent(
        token
      )}`;

      console.log("Connecting to WebSocket:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Start heartbeat
        startHeartbeat(ws);

        // Show connection toast
        toast.success("Real-time notifications connected");
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as WebSocketNotification;
          handleNotification(notification);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        stopHeartbeat();

        // Attempt to reconnect
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
          );
          setTimeout(connect, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          toast.error(
            "Failed to connect to real-time notifications. Please refresh the page."
          );
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setIsConnected(false);
    }
  }, [enabled, user, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    stopHeartbeat();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  /**
   * Start heartbeat to keep connection alive
   */
  const startHeartbeat = (ws: WebSocket) => {
    stopHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "heartbeat" }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  };

  /**
   * Stop heartbeat
   */
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  /**
   * Handle incoming notification
   */
  const handleNotification = (notification: WebSocketNotification) => {
    // Skip connection acknowledgment messages
    if (notification.type === "connection_established") {
      console.log("WebSocket connection established:", notification);
      return;
    }

    // Skip heartbeat acknowledgments
    if (notification.type === "heartbeat_ack") {
      return;
    }

    // Add to notifications list
    setNotifications((prev) => [notification, ...prev].slice(0, 100)); // Keep last 100
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    showNotificationToast(notification);
  };

  /**
   * Show toast notification based on event type
   */
  const showNotificationToast = (notification: WebSocketNotification) => {
    const toastOptions = {
      description: notification.message,
      duration: 5000,
    };

    switch (notification.severity) {
      case "error":
        toast.error(notification.message, toastOptions);
        break;
      case "warning":
        toast.warning(notification.message, toastOptions);
        break;
      case "success":
        toast.success(notification.message, toastOptions);
        break;
      case "info":
      default:
        toast.info(notification.message, toastOptions);
    }
  };

  /**
   * Subscribe to specific event types
   */
  const subscribe = useCallback((eventType: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "subscribe_to_events",
          eventType,
        })
      );
    }
  }, []);

  /**
   * Unsubscribe from specific event types
   */
  const unsubscribe = useCallback((eventType: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "unsubscribe_from_events",
          eventType,
        })
      );
    }
  }, []);

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * Mark notifications as read
   */
  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  /**
   * Effect: Connect on mount, disconnect on unmount
   */
  useEffect(() => {
    if (enabled && user?.role === "admin") {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, user, connect, disconnect]);

  return {
    isConnected,
    notifications,
    unreadCount,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    clearNotifications,
    markAsRead,
  };
}
