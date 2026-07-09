import {
  WS_BASE_URL,
  WS_MAX_RECONNECT_ATTEMPTS,
  WS_RECONNECT_BASE_DELAY_MS,
  WS_RECONNECT_MAX_DELAY_MS,
} from './config';

export type WebSocketStatus = 'connecting' | 'open' | 'closed';

type MessageListener<TMessage> = (message: TMessage) => void;
type StatusListener = (status: WebSocketStatus) => void;
type ErrorListener = (error: unknown) => void;
type Unsubscribe = () => void;

export interface WebSocketClientOptions {
  /** Absolute `ws(s)://` URL, or a path (e.g. `/notifications`) appended to `WS_BASE_URL`. */
  url: string;
  /** Reconnect automatically after an unexpected close. Default `true`. */
  autoReconnect?: boolean;
  baseDelayMs?: number;
  maxDelayMs?: number;
  maxAttempts?: number;
}

/**
 * A thin, reconnecting wrapper around the platform `WebSocket`.
 *
 * Generic over the message payload: incoming text frames are JSON-parsed to
 * `TMessage` before reaching listeners. Instantiate one per endpoint and export
 * a singleton, mirroring how services wrap `apiClient`:
 *
 *   export const notificationsSocket = new WebSocketClient<NewDocumentNotification>({
 *     url: '/notifications',
 *   });
 *
 * Listeners return an unsubscribe function; call `connect()` to open and
 * `close()` to tear down (which also cancels any pending reconnect).
 */
export class WebSocketClient<TMessage> {
  private readonly url: string;
  private readonly autoReconnect: boolean;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly maxAttempts: number;

  private socket: WebSocket | null = null;
  private status: WebSocketStatus = 'closed';
  private manualClose = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly messageListeners = new Set<MessageListener<TMessage>>();
  private readonly statusListeners = new Set<StatusListener>();
  private readonly errorListeners = new Set<ErrorListener>();

  constructor(options: WebSocketClientOptions) {
    this.url = /^wss?:\/\//.test(options.url)
      ? options.url
      : `${WS_BASE_URL}${options.url}`;
    this.autoReconnect = options.autoReconnect ?? true;
    this.baseDelayMs = options.baseDelayMs ?? WS_RECONNECT_BASE_DELAY_MS;
    this.maxDelayMs = options.maxDelayMs ?? WS_RECONNECT_MAX_DELAY_MS;
    this.maxAttempts = options.maxAttempts ?? WS_MAX_RECONNECT_ATTEMPTS;
  }

  /** Open the connection. No-op if already connecting/open. */
  connect(): void {
    if (this.status === 'connecting' || this.status === 'open') {
      return;
    }
    this.manualClose = false;
    this.reconnectAttempts = 0;
    this.open();
  }

  /** Close the connection and stop reconnecting. */
  close(): void {
    this.manualClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.setStatus('closed');
  }

  /** Send a message. Objects are JSON-stringified. Ignored if not open. */
  send(data: unknown): void {
    if (this.socket && this.status === 'open') {
      this.socket.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  onMessage(listener: MessageListener<TMessage>): Unsubscribe {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  onStatusChange(listener: StatusListener): Unsubscribe {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  onError(listener: ErrorListener): Unsubscribe {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  private open(): void {
    this.setStatus('connecting');
    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus('open');
    };

    socket.onmessage = event => {
      const message = this.parse((event as { data: unknown }).data);
      if (message !== undefined) {
        this.messageListeners.forEach(listener => listener(message));
      }
    };

    socket.onerror = event => {
      this.errorListeners.forEach(listener => listener(event));
    };

    socket.onclose = () => {
      this.socket = null;
      this.setStatus('closed');
      if (!this.manualClose && this.autoReconnect) {
        this.scheduleReconnect();
      }
    };
  }

  private parse(data: unknown): TMessage | undefined {
    if (typeof data !== 'string') {
      return undefined;
    }
    try {
      return JSON.parse(data) as TMessage;
    } catch {
      return undefined;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxAttempts) {
      return;
    }
    const delay = Math.min(
      this.baseDelayMs * 2 ** this.reconnectAttempts,
      this.maxDelayMs,
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this.open(), delay);
  }

  private setStatus(status: WebSocketStatus): void {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.statusListeners.forEach(listener => listener(status));
  }
}
