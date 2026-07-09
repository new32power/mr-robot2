// CF Pages Function — proxies /api/* to the backend worker
  // BACKEND_URL env var is preferred; falls back to default worker URL
  // This code runs on Cloudflare's edge (server-side) — never exposed to browser

  export async function onRequest(context) {
    try {
      const { request, env, params } = context;
      // env.BACKEND_URL preferred; hardcoded fallback (safe: this file runs server-side only)
      const backend = (env.BACKEND_URL || "https://mr-robot2-api.newpwor898.workers.dev").replace(/\/$/, "");

      const url = new URL(request.url);
      const path = [].concat(params.path || []).join("/");
      const target = backend + "/api/" + path + url.search;

      const headers = new Headers(request.headers);
      headers.delete("host");

      const hasBody = !["GET", "HEAD"].includes(request.method);
      const body = hasBody ? await request.arrayBuffer() : null;

      const resp = await fetch(target, {
        method: request.method,
        headers,
        body,
      });

      return new Response(resp.body, {
        status: resp.status,
        headers: resp.headers,
      });
    } catch (err) {
      return Response.json({ proxy_error: String(err) }, { status: 502 });
    }
  }
  