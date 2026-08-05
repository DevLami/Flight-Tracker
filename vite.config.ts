import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const API_BASE = "https://opensky-network.org/api";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

interface OpenSkyTokenResponse {
  access_token: string;
  expires_in: number;
}

function isOpenSkyTokenResponse(value: unknown): value is OpenSkyTokenResponse {
  if (typeof value !== "object" || value === null) return false;

  const data = value as Record<string, unknown>;
  return typeof data.access_token === "string" && typeof data.expires_in === "number";
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const { clientId, clientSecret } = JSON.parse(
    readFileSync("./credentials.json", "utf-8")
  );

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao obter token OpenSky (HTTP ${res.status})`);
  }

  const data: unknown = await res.json();
  if (!isOpenSkyTokenResponse(data)) {
    throw new Error("Resposta de autentica\u00e7\u00e3o da OpenSky inv\u00e1lida.");
  }

  cachedToken = data.access_token;
  // Renova 60s antes de expirar, pra nunca usar um token vencido
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

/**
 * A OpenSky Network não envia headers de CORS, então o navegador bloqueia
 * chamadas diretas ("Failed to fetch"). Em desenvolvimento, o próprio
 * servidor do Vite repassa a chamada (Node não sofre CORS) e já aproveita
 * pra anexar o Bearer token OAuth2 — assim o client_secret nunca chega
 * ao navegador. Em produção, essa mesma lógica precisa rodar num proxy
 * próprio (função serverless, Cloudflare Worker, etc.).
 */
function openSkyAuthProxy(): Plugin {
  return {
    name: "opensky-auth-proxy",
    configureServer(server) {
      server.middlewares.use("/opensky-api", async (req, res) => {
        try {
          const token = await getAccessToken();
          const upstream = await fetch(`${API_BASE}${req.url}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          res.statusCode = upstream.status;
          res.setHeader(
            "Content-Type",
            upstream.headers.get("content-type") ?? "application/json"
          );
          res.end(await upstream.text());
        } catch (err) {
          console.error("[opensky-proxy]", err);
          res.statusCode = 502;
          res.end(JSON.stringify({ error: "Falha ao consultar a OpenSky" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), openSkyAuthProxy()],
  server: {
    port: 5173,
  },
});
