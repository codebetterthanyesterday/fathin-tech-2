import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { messageEmitter, ContactMessagePayload } from '@/lib/sse/message-emitter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // 1. Authenticate Admin
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Setup Server-Sent Events stream
  const encoder = new TextEncoder();

  let keepAliveInterval: NodeJS.Timeout | null = null;
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connected event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`
        )
      );

      // Subscribe to real-time broadcasts
      unsubscribe = messageEmitter.subscribe((message: ContactMessagePayload) => {
        try {
          const payload = JSON.stringify({ type: 'NEW_MESSAGE', message });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          // Stream already closed by client
        }
      });

      // Keepalive ping comment every 15 seconds to prevent proxy/serverless idle disconnects
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // Stream closed
          if (keepAliveInterval) clearInterval(keepAliveInterval);
        }
      }, 15000);

      // Cleanup on client abort
      req.signal.addEventListener('abort', () => {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (unsubscribe) unsubscribe();
        try {
          controller.close();
        } catch {
          // Ignore
        }
      });
    },
    cancel() {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (unsubscribe) unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in NGINX if deployed behind reverse proxy
    },
  });
}
