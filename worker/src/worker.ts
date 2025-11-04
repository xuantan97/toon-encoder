import { encode, decode } from '@toon-format/toon';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    }
  });
}

function textResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'access-control-allow-origin': '*',
    }
  });
}

function corsPreflight(req: Request) {
  if (req.method !== 'OPTIONS') return null;
  return new Response(null, {
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400'
    }
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const preflight = corsPreflight(request);
    if (preflight) return preflight;

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    if (path === '/encode') {
      try {
        const data = await request.json();
        const toon = encode(data);
        return textResponse(toon, 200);
      } catch (err: any) {
        return jsonResponse({ error: 'Invalid JSON or encode failure', detail: String(err?.message || err) }, 400);
      }
    }

    if (path === '/decode') {
      try {
        const body = await request.text();
        if (!body || !body.trim()) {
          return jsonResponse({ error: 'Empty body' }, 400);
        }
        const obj = decode(body);
        return jsonResponse(obj, 200);
      } catch (err: any) {
        return jsonResponse({ error: 'Decode failure', detail: String(err?.message || err) }, 400);
      }
    }

    return jsonResponse({ error: 'Not found' }, 404);
  }
};