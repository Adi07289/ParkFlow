/**
 * Documentation generator script with TypeScript support
 */
import { generateRoutes, generateSpec } from "tsoa";
import fs from "fs";
import path from "path";

/**
 * Generate API documentation and route files using tsoa
 * @returns Promise that resolves when generation is complete
 */
async function generateDocs(): Promise<void> {
  // Generate tsoa routes and specs
  await generateSpec({
    entryFile: "src/app.ts",
    specVersion: 3,
    outputDirectory: "build",
    noImplicitAdditionalProperties: "throw-on-extras",
    controllerPathGlobs: ["src/controllers/*Controller.ts"],
    securityDefinitions: {
      jwt: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    // Add additional TypeScript-focused options
    specMerging: "recursive",
    spec: {
      // You can add global descriptions here
      info: {
        title: "ParkFlow API",
        version: "1.0.0",
        description: "API for the ParkFlow application",
        contact: {
          name: "API Support",
          email: "support@ParkFlow.com",
        },
      },
      // Set the base path for all routes
      servers: [
        {
          url: "/",
          description: "Default API server",
        },
      ],
    },
  });

  await generateRoutes({
    entryFile: "src/app.ts",
    routesDir: "src/routes",
    noImplicitAdditionalProperties: "throw-on-extras",
    controllerPathGlobs: ["src/controllers/*Controller.ts"],
    bodyCoercion: true,
  });

  // Generate TypeScript definition file for the API
  const swaggerPath = path.join(process.cwd(), "build", "swagger.json");
  if (fs.existsSync(swaggerPath)) {
    // const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    console.log("✅ OpenAPI specification generated successfully");

    // Optional: Generate TypeScript client if needed
    // await generateClient(swagger);
  }

  console.log("✅ Documentation generated successfully");
}

generateDocs().catch(console.error);