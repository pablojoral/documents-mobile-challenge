import { WebSocketClient } from './WebSocketClient';
import type { NewDocumentNotification } from 'models/models';

/** Pushes a `NewDocumentNotification` whenever another user creates a document. */
export const notificationsSocket = new WebSocketClient<NewDocumentNotification>(
  { url: '/notifications' },
);
