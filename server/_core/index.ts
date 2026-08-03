import "dotenv/config";
import express, { Request, Response, Express } from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth.js";
import { registerStorageProxy } from "./storageProxy.js";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { serveStatic, setupVite } from "./vite.js";

async function startServer() {
  const app: Express = express();
  const server = createServer(app);

  // Health check routes for container monitoring & Cloud Run probes
  app.get(["/healthz", "/api/health"], (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});

