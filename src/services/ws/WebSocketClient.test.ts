import { MockWebSocket, installMockWebSocket } from 'test/mockWebSocket';
import { WS_BASE_URL } from './config';
import { WebSocketClient } from './WebSocketClient';

interface Notification {
  UserName: string;
}

describe('WebSocketClient', () => {
  let restore: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
    restore = installMockWebSocket();
  });

  afterEach(() => {
    restore();
    jest.useRealTimers();
  });

  it('builds an absolute URL from a relative path, leaving absolute URLs as-is', () => {
    new WebSocketClient({ url: '/notifications' }).connect();
    expect(MockWebSocket.last().url).toBe(`${WS_BASE_URL}/notifications`);

    new WebSocketClient({ url: 'ws://example.test/live' }).connect();
    expect(MockWebSocket.last().url).toBe('ws://example.test/live');
  });

  it('transitions connecting -> open and notifies status listeners', () => {
    const client = new WebSocketClient<Notification>({ url: '/n' });
    const statuses: string[] = [];
    client.onStatusChange(s => statuses.push(s));

    client.connect();
    expect(client.getStatus()).toBe('connecting');

    MockWebSocket.last().emitOpen();
    expect(client.getStatus()).toBe('open');
    expect(statuses).toEqual(['connecting', 'open']);
  });

  it('parses JSON messages and ignores malformed frames', () => {
    const client = new WebSocketClient<Notification>({ url: '/n' });
    const received: Notification[] = [];
    client.onMessage(msg => received.push(msg));

    client.connect();
    const socket = MockWebSocket.last();
    socket.emitOpen();

    socket.emitMessage(JSON.stringify({ UserName: 'Ada' }));
    socket.emitMessage('not-json{');

    expect(received).toEqual([{ UserName: 'Ada' }]);
  });

  it('stops notifying after unsubscribe', () => {
    const client = new WebSocketClient<Notification>({ url: '/n' });
    const received: Notification[] = [];
    const unsubscribe = client.onMessage(msg => received.push(msg));

    client.connect();
    const socket = MockWebSocket.last();
    socket.emitOpen();
    unsubscribe();
    socket.emitMessage(JSON.stringify({ UserName: 'Bob' }));

    expect(received).toHaveLength(0);
  });

  it('only sends while open, stringifying objects', () => {
    const client = new WebSocketClient({ url: '/n' });
    client.connect();
    const socket = MockWebSocket.last();

    client.send({ hello: 'world' }); // not open yet -> ignored
    socket.emitOpen();
    client.send({ hello: 'world' });
    client.send('raw');

    expect(socket.sent).toEqual([JSON.stringify({ hello: 'world' }), 'raw']);
  });

  it('auto-reconnects with backoff after an unexpected close', () => {
    const client = new WebSocketClient({ url: '/n' });
    client.connect();
    MockWebSocket.last().emitOpen();
    expect(MockWebSocket.instances).toHaveLength(1);

    MockWebSocket.last().emitClose(); // server dropped us
    expect(client.getStatus()).toBe('closed');

    jest.advanceTimersByTime(1000); // base backoff delay
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it('notifies error listeners and supports unsubscribe', () => {
    const client = new WebSocketClient({ url: '/n' });
    const errors: unknown[] = [];
    const unsubscribe = client.onError(err => errors.push(err));

    client.connect();
    MockWebSocket.last().emitError('bad');
    expect(errors).toEqual(['bad']);

    unsubscribe();
    MockWebSocket.last().emitError('again');
    expect(errors).toEqual(['bad']);
  });

  it('is idempotent: connect() while already connecting/open does nothing', () => {
    const client = new WebSocketClient({ url: '/n' });
    client.connect();
    client.connect(); // still connecting
    MockWebSocket.last().emitOpen();
    client.connect(); // now open
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it('does not reconnect after an explicit close()', () => {
    const client = new WebSocketClient({ url: '/n' });
    client.connect();
    MockWebSocket.last().emitOpen();

    client.close();
    expect(client.getStatus()).toBe('closed');

    jest.advanceTimersByTime(60000);
    expect(MockWebSocket.instances).toHaveLength(1);
  });
});
