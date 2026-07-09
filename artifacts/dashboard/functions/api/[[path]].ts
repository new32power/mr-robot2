// CF Pages Function — proxies /api/* to the backend worker
  // BACKEND_URL is a CF Pages env var (never exposed to browser)

  export async function onRequest(context) {
    try {
      const { request, env, params } = context;
      const backend = (env.BACKEND_URL || "").replace(/\/$/, "");
      if (!backend) {
        return Response.json({ error: "BACKEND_URL not configured", env_keys: Object.keys(env || {}) }, { status: 502 });
      }
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

      // forward response as-is
      return new Response(resp.body, {
        status: resp.status,
        headers: resp.headers,
      });
    } catch (err) {
      return Response.json({ proxy_error: String(err), stack: String(err?.stack).slice(0, 300) }, { status: 502 });
    }
  }
  