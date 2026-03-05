// ============================================================
// NestMoney — API Gateway WebSocket Client
// Real-time transaction events and approval requests.
// Reconnects automatically on disconnect.
// ============================================================

import { getAccessToken } from './auth';
import type { WebSocketMessage, WebSocketMessageType } from '@/types/api';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL;

type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void;

class NestMoneyWebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<WebSocketMessageType, MessageHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 3000;
  private maxReconnectDelay = 30000;
  private isConnecting = false;
  private shouldReconnect = false;

  // ============================================================
  // Connection management
  // ============================================================

  async connect(): Promise<void> {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;

    if (!WS_URL) {
      console.warn('EXPO_PUBLIC_WS_URL is not set — WebSocket disabled');
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    const token = await getAccessToken();
    const url = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectDelay = 3000;
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.dispatch(message);
      } catch {
        // Malformed message — ignore
      }
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.isConnecting = false;
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private scheduleReconnect(): void {
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      void this.connect();
    }, this.reconnectDelay);
  }

  // ============================================================
  // Message routing
  // ============================================================

  on<T>(type: WebSocketMessageType, handler: MessageHandler<T>): () => void {
    const existing = this.handlers.get(type) ?? [];
    this.handlers.set(type, [...existing, handler as MessageHandler]);

    return () => {
      const current = this.handlers.get(type) ?? [];
      this.handlers.set(
        type,
        current.filter((h) => h !== (handler as MessageHandler))
      );
    };
  }

  private dispatch(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type) ?? [];
    handlers.forEach((handler) => handler(message));
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new NestMoneyWebSocketClient();
