// CF Pages Function — proxies /api/* to the backend worker
  // BACKEND_URL is a CF Pages env var (never exposed to browser)
  interface Env {
    BACKEND_URL: string;
  }

  export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const pathParts = params.path as string[];
    const backend = (env.BACKEND_URL ?? "").replace(/\/$/, "");
    const targetUrl = backend + "/api/" + pathParts.join("/") + url.search;

    const headers = new Headers(request.headers);
    headers.delete("host");

    // WebSocket upgrade — proxy transparently
    if (request.headers.get("Upgrade") === "websocket") {
      const wsUrl = targetUrl.replace(/^http/, "ws");
      return fetch(new Request(wsUrl, { method: request.method, headers }));
    }

    return fetch(new Request(targetUrl, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    }));
  };
  