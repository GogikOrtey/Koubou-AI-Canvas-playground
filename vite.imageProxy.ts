/**
 * Локальный прокси картинок для Vite dev и preview.
 * Браузер не может звать CloseRouter напрямую из-за CORS, поэтому запросы
 * приходят на /api/closerouter, а плагин пересылает их на api.closerouter.dev.
 * Если в запросе нет ключа, подставляется CLOSEROUTER_API_KEY из .env.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";

const CLOSEROUTER_ORIGIN = "https://api.closerouter.dev/v1";

/** Читает сырое тело запроса, чтобы переслать и JSON, и multipart без перекодирования */
function readRawBody(req: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/** Пишет JSON-ответ прокси в браузер */
function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

/** Берёт ключ из запроса, а если его нет — из .env */
function authorizationHeader(req: IncomingMessage, fallbackKey: string) {
  const header = String(req.headers.authorization || "");
  if (header.startsWith("Bearer ") && header.trim().length > "Bearer ".length) {
    return header;
  }
  return fallbackKey ? `Bearer ${fallbackKey}` : "";
}

/** Пересылает Images API CloseRouter как есть */
async function proxyCloseRouter(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  fallbackKey: string
) {
  const authorization = authorizationHeader(req, fallbackKey);
  if (!authorization) {
    sendJson(res, 401, {
      error: { message: "CloseRouter API key is missing. Add it in settings or .env" },
    });
    return;
  }

  const headers: Record<string, string> = { Authorization: authorization };
  if (req.headers["content-type"]) {
    headers["Content-Type"] = String(req.headers["content-type"]);
  }
  const upstream = await fetch(`${CLOSEROUTER_ORIGIN}${path}`, {
    method: "POST",
    headers,
    body: await readRawBody(req),
    signal: AbortSignal.timeout(180_000),
  });
  const text = await upstream.text();
  res.statusCode = upstream.status;
  res.setHeader(
    "Content-Type",
    upstream.headers.get("content-type") || "application/json"
  );
  res.end(text);
}

/** Вешает прокси на connect-сервер Vite */
function attach(middlewares: Connect.Server, fallbackKey: string) {
  middlewares.use(async (req, res, next) => {
    const path = (req.url || "").split("?")[0];
    if (req.method !== "POST" || !path.startsWith("/api/closerouter/images/")) {
      next();
      return;
    }
    try {
      await proxyCloseRouter(path.replace("/api/closerouter", ""), req, res, fallbackKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image proxy failed";
      sendJson(res, 502, { error: { message } });
    }
  });
}

/** Плагин Vite: те же маршруты в dev-сервере и в preview. fallbackKey приходит из .env */
export function imageProxyPlugin(fallbackKey = ""): Plugin {
  return {
    name: "koubou-image-proxy",
    configureServer(server) {
      attach(server.middlewares, fallbackKey);
    },
    configurePreviewServer(server) {
      attach(server.middlewares, fallbackKey);
    },
  };
}
