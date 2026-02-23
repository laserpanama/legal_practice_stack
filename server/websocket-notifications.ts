/**
 * WebSocket Notifications System
 * Real-time notification broadcasting for critical signature events
 */

import { jwtVerify } from "jose";
import { IncomingMessage } from "http";
import { parse } from "url";
import { ENV } from "./_core/env";

// Types for WebSocket notifications
export interface NotificationEvent {
  type:
    | "signature_rejected"
    | "signature_expired"
    | "signature_completed"
    | "signature_sent"
    | "signature_viewed"
    | "audit_alert";
  signatureRequestId: number;
  signerEmail: string;
  signerName: string;
  status: string;
  message: string;
  timestamp: Date;
  severity: "info" | "warning" | "error" | "success";
  data?: Record<string, any>;
}

export interface AdminConnection {
  ws: any;
  userId: number;
  email: string;
  role: string;
  connectedAt: Date;
  lastHeartbeat: Date;
}

// Global WebSocket server instance and admin connections
let wss: any = null;
const adminConnections = new Map<string, AdminConnection>();
const connectionsByUserId = new Map<number, Set<string>>();

/**
 * Initialize WebSocket server
 */
export function initializeWebSocketServer(server: any): any {
  if (wss) return wss;

  try {
    // Lazy load WebSocketServer to avoid ES module issues
    const WebSocketModule = require("ws");
    const WebSocketServer = WebSocketModule.WebSocketServer;

    wss = new WebSocketServer({ server, path: "/api/ws" });

    wss.on("connection", handleWebSocketConnection);
    wss.on("error", (error: any) => {
      console.error("WebSocket server error:", error);
    });

    // Heartbeat interval to detect stale connections
    setInterval(checkHeartbeats, 30000);

    console.log("WebSocket server initialized");
    return wss;
  } catch (error) {
    console.error("Failed to initialize WebSocket server:", error);
    throw error;
  }
}

/**
 * Handle new WebSocket connection
 */
async function handleWebSocketConnection(ws: any, req: IncomingMessage) {
  try {
    // Extract token from query parameters
    const url = req.url ? parse(req.url, true) : null;
    const token = url?.query?.token as string;

    if (!token) {
      ws.close(1008, "Missing authentication token");
      return;
    }

    // Verify JWT token
    let user: any;
    try {
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const verified = await jwtVerify(token, secret);
      user = verified.payload as any;
    } catch (error: any) {
      ws.close(1008, "Invalid authentication token");
      return;
    }

    // Only allow admin connections
    if (user.role !== "admin") {
      ws.close(1008, "Admin access required");
      return;
    }

    // Create connection record
    const connectionId = `${user.id}-${Date.now()}-${Math.random()}`;
    const connection: AdminConnection = {
      ws,
      userId: user.id,
      email: user.email,
      role: user.role,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
    };

    adminConnections.set(connectionId, connection);

    // Track connections by user ID for bulk notifications
    if (!connectionsByUserId.has(user.id)) {
      connectionsByUserId.set(user.id, new Set());
    }
    connectionsByUserId.get(user.id)!.add(connectionId);

    console.log(
      `Admin connected: ${user.email} (${connectionId}) - Total connections: ${adminConnections.size}`
    );

    // Send connection confirmation
    ws.send(
      JSON.stringify({
        type: "connection_established",
        connectionId,
        timestamp: new Date(),
      })
    );

    // Handle incoming messages (heartbeat, preferences, etc.)
    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(connectionId, message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    // Handle connection close
    ws.on("close", () => {
      handleWebSocketClose(connectionId);
    });

    // Handle errors
    ws.on("error", (error: any) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
    });
  } catch (error) {
    console.error("Error handling WebSocket connection:", error);
    ws.close(1011, "Internal server error");
  }
}

/**
 * Handle incoming WebSocket messages
 */
function handleWebSocketMessage(connectionId: string, message: any) {
  const connection = adminConnections.get(connectionId);
  if (!connection) return;

  switch (message.type) {
    case "heartbeat":
      connection.lastHeartbeat = new Date();
      connection.ws.send(
        JSON.stringify({
          type: "heartbeat_ack",
          timestamp: new Date(),
        })
      );
      break;

    case "subscribe_to_events":
      // Admin can subscribe to specific event types
      if (!connection.ws.subscriptions) {
        connection.ws.subscriptions = new Set();
      }
      connection.ws.subscriptions.add(message.eventType);
      break;

    case "unsubscribe_from_events":
      if (connection.ws.subscriptions) {
        connection.ws.subscriptions.delete(message.eventType);
      }
      break;

    default:
      console.log(`Unknown message type: ${message.type}`);
  }
}

/**
 * Handle WebSocket connection close
 */
function handleWebSocketClose(connectionId: string) {
  const connection = adminConnections.get(connectionId);
  if (!connection) return;

  adminConnections.delete(connectionId);

  const userConnections = connectionsByUserId.get(connection.userId);
  if (userConnections) {
    userConnections.delete(connectionId);
    if (userConnections.size === 0) {
      connectionsByUserId.delete(connection.userId);
    }
  }

  console.log(
    `Admin disconnected: ${connection.email} (${connectionId}) - Total connections: ${adminConnections.size}`
  );
}

/**
 * Check for stale connections and remove them
 */
function checkHeartbeats() {
  const now = new Date();
  const staleThreshold = 90000; // 90 seconds

  for (const [connectionId, connection] of Array.from(adminConnections.entries())) {
    const timeSinceHeartbeat =
      now.getTime() - connection.lastHeartbeat.getTime();

    if (timeSinceHeartbeat > staleThreshold) {
      console.log(`Closing stale connection: ${connectionId}`);
      connection.ws.close(1000, "Heartbeat timeout");
      handleWebSocketClose(connectionId);
    }
  }
}

/**
 * Broadcast notification to all connected admins
 */
export function broadcastNotification(event: NotificationEvent) {
  if (!wss || adminConnections.size === 0) {
    console.log("No admin connections to broadcast to");
    return;
  }

  const notification = {
    ...event,
    timestamp: new Date(),
  };

  let broadcastCount = 0;

  for (const [connectionId, connection] of Array.from(adminConnections.entries())) {
    try {
      // Check if admin has subscribed to this event type
      const subscriptions = connection.ws.subscriptions;
      if (subscriptions && !subscriptions.has(event.type)) {
        continue;
      }

      if (connection.ws.readyState === 1) { // WebSocket.OPEN = 1
        connection.ws.send(JSON.stringify(notification));
        broadcastCount++;
      }
    } catch (error) {
      console.error(`Error broadcasting to ${connectionId}:`, error);
    }
  }

  console.log(
    `Notification broadcast: ${event.type} to ${broadcastCount} admins`
  );
}

/**
 * Broadcast notification to specific admin
 */
export function notifyAdmin(userId: number, event: NotificationEvent) {
  const userConnections = connectionsByUserId.get(userId);
  if (!userConnections || userConnections.size === 0) {
    console.log(`No connections for user ${userId}`);
    return;
  }

  const notification = {
    ...event,
    timestamp: new Date(),
  };

  let notifyCount = 0;

  for (const connectionId of Array.from(userConnections)) {
    const connection = adminConnections.get(connectionId);
    if (!connection) continue;

    try {
      if (connection.ws.readyState === 1) { // WebSocket.OPEN = 1
        connection.ws.send(JSON.stringify(notification));
        notifyCount++;
      }
    } catch (error: any) {
      console.error(`Error notifying admin ${userId}:`, error);
    }
  }

  console.log(`Notified user ${userId} via ${notifyCount} connections`);
}

/**
 * Broadcast signature rejection event
 */
export function notifySignatureRejected(
  signatureRequestId: number,
  signerEmail: string,
  signerName: string,
  reason: string
) {
  broadcastNotification({
    type: "signature_rejected",
    signatureRequestId,
    signerEmail,
    signerName,
    status: "rejected",
    message: `Signature request from ${signerName} (${signerEmail}) was rejected: ${reason}`,
    timestamp: new Date(),
    severity: "error",
    data: { reason },
  });
}

/**
 * Broadcast signature expiration event
 */
export function notifySignatureExpired(
  signatureRequestId: number,
  signerEmail: string,
  signerName: string
) {
  broadcastNotification({
    type: "signature_expired",
    signatureRequestId,
    signerEmail,
    signerName,
    status: "expired",
    message: `Signature request for ${signerName} (${signerEmail}) has expired`,
    timestamp: new Date(),
    severity: "warning",
  });
}

/**
 * Broadcast signature completion event
 */
export function notifySignatureCompleted(
  signatureRequestId: number,
  signerEmail: string,
  signerName: string,
  certificateId: string
) {
  broadcastNotification({
    type: "signature_completed",
    signatureRequestId,
    signerEmail,
    signerName,
    status: "signed",
    message: `${signerName} (${signerEmail}) has successfully signed the document`,
    timestamp: new Date(),
    severity: "success",
    data: { certificateId },
  });
}

/**
 * Broadcast signature sent event
 */
export function notifySignatureSent(
  signatureRequestId: number,
  signerEmail: string,
  signerName: string
) {
  broadcastNotification({
    type: "signature_sent",
    signatureRequestId,
    signerEmail,
    signerName,
    status: "sent",
    message: `Signature request sent to ${signerName} (${signerEmail})`,
    timestamp: new Date(),
    severity: "info",
  });
}

/**
 * Broadcast compliance alert
 */
export function notifyComplianceAlert(
  message: string,
  severity: "info" | "warning" | "error"
) {
  broadcastNotification({
    type: "audit_alert",
    signatureRequestId: 0,
    signerEmail: "system",
    signerName: "System",
    status: "alert",
    message,
    timestamp: new Date(),
    severity,
  });
}

/**
 * Get active admin connections count
 */
export function getActiveConnectionsCount(): number {
  return adminConnections.size;
}

/**
 * Get active admins
 */
export function getActiveAdmins(): Array<{
  userId: number;
  email: string;
  connectedAt: Date;
  connectionCount: number;
}> {
  const adminMap = new Map<
    number,
    { userId: number; email: string; connectedAt: Date; connectionCount: number }
  >();

  for (const connection of Array.from(adminConnections.values())) {
    if (!adminMap.has(connection.userId)) {
      adminMap.set(connection.userId, {
        userId: connection.userId,
        email: connection.email,
        connectedAt: connection.connectedAt,
        connectionCount: 0,
      });
    }
    const admin = adminMap.get(connection.userId)!;
    admin.connectionCount++;
  }

  return Array.from(adminMap.values());
}

/**
 * Close all WebSocket connections (for graceful shutdown)
 */
export function closeAllConnections() {
  for (const connection of Array.from(adminConnections.values())) {
    try {
      connection.ws.close(1000, "Server shutdown");
    } catch (error: any) {
      console.error("Error closing connection:", error);
    }
  }
  adminConnections.clear();
  connectionsByUserId.clear();
  console.log("All WebSocket connections closed");
}
