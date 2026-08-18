import { EventEmitter } from 'events';

export type ContactMessagePayload = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
};

class MessageEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow up to 100 concurrent SSE listeners per process without warnings
    this.setMaxListeners(100);
  }

  public broadcast(message: ContactMessagePayload) {
    try {
      this.emit('new_message', message);
    } catch (error) {
      console.error('[SSE Emitter] Broadcast error:', error);
    }
  }

  public subscribe(listener: (message: ContactMessagePayload) => void) {
    this.on('new_message', listener);
    return () => {
      this.off('new_message', listener);
    };
  }
}

// Attach singleton to globalThis to preserve state across module reloads in Next.js
const globalForEmitter = globalThis as unknown as {
  messageEmitter?: MessageEmitter;
};

export const messageEmitter = globalForEmitter.messageEmitter ?? new MessageEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEmitter.messageEmitter = messageEmitter;
}
