import { NextResponse } from 'next/server';
import { aggregateNews } from '../../../../lib/newsAggregator';
import { generateFOSignal, generateStreamingSignal, postProcessParsedSignal } from '../../../../lib/gemini';
import { checkRateLimit } from '../../../../lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function encodeEvent(event: object) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function extractJSON(text: string): object | null {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try removing leading non-JSON text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    
    try {
      return JSON.parse(match[0]);
    } catch {
      // Try to find and fix common issues
      let cleaned = text.replace(/^[^\{]*/s, '').replace(/[^\}]*$/s, '');
      
      // Try to match curly braces properly
      let braceCount = 0;
      let endIdx = 0;
      for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === '{') braceCount++;
        if (cleaned[i] === '}') braceCount--;
        if (braceCount === 0 && cleaned[i] === '}') {
          endIdx = i + 1;
          break;
        }
      }
      
      if (endIdx > 0) {
        cleaned = cleaned.slice(0, endIdx);
        return JSON.parse(cleaned);
      }
      
      return null;
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') ?? 'NIFTY').toUpperCase();
  const refresh = url.searchParams.get('refresh') === 'true';
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const rate = checkRateLimit('/api/signals', ip);
  if (!rate.allowed) {
    // Return an SSE stream with a single error event so EventSource clients receive structured error
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(encodeEvent({ type: 'error', message: 'Rate limited', retryAfter: rate.retryAfter })));
        controller.close();
      },
    });

    return new Response(stream, {
      status: 429,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const safeEnqueue = (buf: Uint8Array) => {
        try {
          controller.enqueue(buf);
        } catch (e) {
          // ignore if controller closed
        }
      };
      const heartbeat = setInterval(() => {
        try {
          safeEnqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          // ignore if controller closed
        }
      }, 15000);
      try {
        console.log(`[SSE] start stream for ${symbol} (refresh=${refresh})`);
        const news = await aggregateNews(symbol);
        safeEnqueue(encoder.encode(encodeEvent({ type: 'news', items: news.slice(0, 15) })));
        safeEnqueue(encoder.encode(encodeEvent({ type: 'token', content: `Streaming analysis for ${symbol}...\n` })));

        // Try the stream with a small number of retries on recoverable errors
        const maxAttempts = 2;
        let attempt = 0;
        let success = false;
        let lastErr: any = null;
        while (attempt < maxAttempts && !success) {
          attempt += 1;
          console.log(`[SSE] attempt ${attempt} to generate stream for ${symbol}`);
          let accumulator = '';
          try {
            const idleTimeout = 60000; // 60s idle timeout
            let lastChunkAt = Date.now();

            // consume generator with overall timeout to avoid indefinite hang
            const gen = generateStreamingSignal(symbol, news);
            const overallTimeout = 55000; // keep within route maxDuration with room for cleanup/fallback
            await Promise.race([
              (async () => {
                try {
                  for await (const chunk of gen) {
                    try {
                      console.log('[SSE] received chunk length', chunk.length ?? chunk.toString().length);
                    } catch {}
                    lastChunkAt = Date.now();
                    accumulator += chunk;
                    safeEnqueue(encoder.encode(encodeEvent({ type: 'token', content: chunk })));
                    // check idle
                    if (Date.now() - lastChunkAt > idleTimeout) throw new Error('AI stream idle timeout');
                  }
                } finally {
                  try {
                    if (gen && typeof gen.return === 'function') await gen.return();
                  } catch {}
                }
              })(),
              new Promise((_, rej) => setTimeout(() => rej(new Error('overall attempt timeout')), overallTimeout)),
            ]);

            const parsed = extractJSON(accumulator);
            if (parsed) {
              const processed = postProcessParsedSignal(parsed, symbol, news);
              safeEnqueue(encoder.encode(encodeEvent({ type: 'done', signal: processed })));
              success = true;
              break;
            } else {
              lastErr = new Error('Could not parse final JSON from AI stream.');
              // try again in next attempt
            }
          } catch (err) {
            lastErr = err;
            console.error('[SSE] stream attempt error', String(err));
            // short delay before retrying
            await new Promise((res) => setTimeout(res, 500 * attempt));
          }
        }

        if (!success) {
          console.error('[SSE] all attempts failed for', symbol, lastErr, 'falling back to non-stream analysis');
          try {
            const fallbackSignal = await generateFOSignal(symbol, news);
            safeEnqueue(encoder.encode(encodeEvent({
              type: 'token',
              content: '\nLive stream degraded. Finalizing with non-stream analysis...\n',
            })));
            safeEnqueue(encoder.encode(encodeEvent({ type: 'done', signal: fallbackSignal, fallback: true })));
            success = true;
          } catch (fallbackError) {
            console.error('[SSE] fallback analysis failed for', symbol, fallbackError);
            const isDev = process.env.NODE_ENV !== 'production';
            safeEnqueue(encoder.encode(encodeEvent({ 
              type: 'error', 
              message: isDev ? String(fallbackError || lastErr || 'Unknown streaming error') : 'Streaming analysis interrupted' 
            })));
          }
        }
      } catch (error) {
        console.error('[SSE] unexpected error in stream handler', String(error));
        const isDev = process.env.NODE_ENV !== 'production';
        safeEnqueue(encoder.encode(encodeEvent({ 
          type: 'error', 
          message: isDev ? String(error) : 'Internal stream error' 
        })));
      }
      clearInterval(heartbeat);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
