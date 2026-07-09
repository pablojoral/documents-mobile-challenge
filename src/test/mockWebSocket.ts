/* eslint-env jest */

type MessageHandler = (event: { data: unknown }) => void;

/**
 * A controllable stand-in for the global `WebSocket`. Instead of a real
 * connection, tests drive lifecycle events manually via `emit*` helpers and
 * inspect `sent`/`closed`. Every constructed instance is recorded on
 * `MockWebSocket.instances` so reconnect behavior can be asserted.
 */
export class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  sent: unknown[] = [];
  closed = false;

  onopen: (() => void) | null = null;
  onmessage: MessageHandler | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: unknown): void {
    this.sent.push(data);
  }

  close(): void {
    this.closed = true;
    this.onclose?.();
  }

  emitOpen(): void {
    this.onopen?.();
  }

  emitMessage(data: unknown): void {
    this.onmessage?.({ data });
  }

  emitError(error: unknown): void {
    this.onerror?.(error);
  }

  /** Simulate an unexpected drop (server-side close) that should trigger reconnect. */
  emitClose(): void {
    this.onclose?.();
  }

  static reset(): void {
    MockWebSocket.instances = [];
  }

  static last(): MockWebSocket {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }
}

/**
 * Installs `MockWebSocket` as the global `WebSocket` and returns a restore
 * function. Call in `beforeEach`, restore in `afterEach`.
 */
export const installMockWebSocket = (): (() => void) => {
  MockWebSocket.reset();
  const globals = globalThis as unknown as { WebSocket: unknown };
  const original = globals.WebSocket;
  globals.WebSocket = MockWebSocket;
  return () => {
    globals.WebSocket = original;
  };
};
