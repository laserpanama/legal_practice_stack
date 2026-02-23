/**
 * WebSocket Server Integration
 * Integrates WebSocket server with Express app
 */

import { Server as HTTPServer } from "http";
import { initializeWebSocketServer } from "./websocket-notifications";

/**
 * Setup WebSocket server with HTTP server
 */
export function setupWebSocketServer(httpServer: HTTPServer) {
  try {
    const wss = initializeWebSocketServer(httpServer);
    console.log("WebSocket server setup complete");
    return wss;
  } catch (error) {
    console.error("Failed to setup WebSocket server:", error);
    throw error;
  }
}

/**
 * Export notification functions for use in procedures
 */
export {
  broadcastNotification,
  notifyAdmin,
  notifySignatureRejected,
  notifySignatureExpired,
  notifySignatureCompleted,
  notifySignatureSent,
  notifyComplianceAlert,
  getActiveConnectionsCount,
  getActiveAdmins,
  closeAllConnections,
} from "./websocket-notifications";
