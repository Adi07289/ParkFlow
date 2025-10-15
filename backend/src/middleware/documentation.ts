import type { Express, Request, Response, NextFunction } from "express";
import { apiReference } from "@scalar/express-api-reference";
import fs from "fs";
import path from "path";
import { OpenAPISpec } from "../types/openapi";

export interface DocumentationConfig {
  enableDocs: boolean;
  basePath: string;
  port: number;
}

/**
 * Configure documentation based on environment
 */
export function getDocumentationConfig(): DocumentationConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const enableDocs =
    process.env.ENABLE_DOCS === "true" || nodeEnv === "development";

  return {
    enableDocs,
    basePath: process.env.API_BASE_PATH || "",
    port: parseInt(process.env.PORT || "8000", 10),
  };
}

/**
 * Setup API documentation middleware
 */
export function setupDocumentation(app: Express): void {
  const docConfig = getDocumentationConfig();

  if (!docConfig.enableDocs) {
    console.log("📚 API documentation is disabled in this environment");
    return;
  }

  try {
    // Try to load the OpenAPI specification
    const swaggerPath = path.join(process.cwd(), "build/swagger.json");

    if (!fs.existsSync(swaggerPath)) {
      console.warn(
        "⚠️  OpenAPI specification not found. Run 'npm run generate' to create it.",
      );
      return;
    }

    const openApiSpec = JSON.parse(
      fs.readFileSync(swaggerPath, "utf8"),
    ) as OpenAPISpec;

    // Set up Scalar API Reference
    app.use(
      "/docs",
      apiReference({
        spec: {
          content: openApiSpec,
        },
        theme: {
          colors: {
            primary: {
              main: "#8A2BE2", // Purple theme
            },
          },
          sidebar: {
            width: "320px",
            fontSize: "14px",
          },
        },
        configuration: {
          baseUrl: `http://localhost:${docConfig.port}${docConfig.basePath}`,
          authentication: {
            preferred: "bearer",
            bearer: {
              token: "YOUR_JWT_TOKEN_HERE",
            },
          },
        },
        searchHotkey: "k",
        servers: [
          {
            url: `http://localhost:${docConfig.port}${docConfig.basePath}`,
            description: "Local development server",
          },
        ],
      }),
    );

    console.log(
      `📚 API documentation available at http://localhost:${docConfig.port}/docs`,
    );
  } catch (error) {
    console.error("❌ Failed to setup API documentation:", error);
  }
}

/**
 * Middleware to block documentation access in production if not explicitly enabled
 */
export function protectDocumentation() {
  return (req: Request, res: Response, next: NextFunction): any => {
    const docConfig = getDocumentationConfig();

    if (!docConfig.enableDocs && req.path.startsWith("/docs")) {
      res.status(404).json({
        error: "Documentation is not available in production mode",
      });
      return;
    }

    next();
  };
}