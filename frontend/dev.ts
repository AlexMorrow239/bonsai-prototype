import { serve } from "bun";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PORT = 5174;
const HOST = "localhost";

console.log(`
🚀 Starting Bun development server...
🔗 URL: http://${HOST}:${PORT}
`);

// Serve the application
serve({
  port: PORT,
  hostname: HOST,
  development: true,
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`📝 Request: ${req.method} ${path}`);

    // Handle favicon.ico specifically
    if (path === "/favicon.ico" || path === "/public/favicon.ico") {
      try {
        // Check if favicon exists in public directory
        if (existsSync("public/favicon.ico")) {
          console.log("✅ Serving favicon from public directory");
          return new Response(Bun.file("public/favicon.ico"));
        } else {
          console.log("⚠️ Favicon not found in public directory");
          return new Response("Not Found", { status: 404 });
        }
      } catch (error) {
        console.error("❌ Error serving favicon:", error);
        return new Response("Server Error", { status: 500 });
      }
    }

    // Serve static files from public directory
    if (path.startsWith("/public/")) {
      try {
        const filePath = path.replace("/public/", "");
        const fullPath = join("public", filePath);

        if (existsSync(fullPath)) {
          console.log(`✅ Serving static file: ${fullPath}`);
          return new Response(Bun.file(fullPath));
        } else {
          console.log(`⚠️ Static file not found: ${fullPath}`);
          return new Response("Not Found", { status: 404 });
        }
      } catch (error) {
        console.error(`❌ Error serving static file ${path}:`, error);
        return new Response("Server Error", { status: 500 });
      }
    }

    // Handle JavaScript, CSS, and other assets
    if (
      path.endsWith(".js") ||
      path.endsWith(".jsx") ||
      path.endsWith(".ts") ||
      path.endsWith(".tsx")
    ) {
      try {
        // Remove leading slash if present
        const cleanPath = path.startsWith("/") ? path.substring(1) : path;

        if (existsSync(cleanPath)) {
          console.log(`✅ Serving JavaScript file: ${cleanPath}`);
          return new Response(Bun.file(cleanPath), {
            headers: { "Content-Type": "application/javascript" },
          });
        } else {
          console.log(`⚠️ JavaScript file not found: ${cleanPath}`);
          return new Response("Not Found", { status: 404 });
        }
      } catch (error) {
        console.error(`❌ Error serving JavaScript file ${path}:`, error);
        return new Response("File Not Found", { status: 404 });
      }
    }

    if (path.endsWith(".css")) {
      try {
        // Remove leading slash if present
        const cleanPath = path.startsWith("/") ? path.substring(1) : path;

        if (existsSync(cleanPath)) {
          console.log(`✅ Serving CSS file: ${cleanPath}`);
          return new Response(Bun.file(cleanPath), {
            headers: { "Content-Type": "text/css" },
          });
        } else {
          console.log(`⚠️ CSS file not found: ${cleanPath}`);
          return new Response("Not Found", { status: 404 });
        }
      } catch (error) {
        console.error(`❌ Error serving CSS file ${path}:`, error);
        return new Response("File Not Found", { status: 404 });
      }
    }

    // For API requests or other non-file requests, pass to the main handler
    if (path.startsWith("/api/")) {
      console.log(`⚠️ No handler for API: ${path}`);
      return new Response("API Not Implemented", { status: 501 });
    }

    // For all other routes, serve the index.html (SPA routing)
    try {
      console.log(`🔄 Serving route: ${path}`);
      // Use dev-index.html for development
      return new Response(Bun.file("dev-index.html"));
    } catch (error) {
      console.error("❌ Error serving application:", error);
      return new Response("Server Error", { status: 500 });
    }
  },
});

console.log(`
✅ Development server running at http://${HOST}:${PORT}
🔄 Hot module replacement is enabled
`);

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down development server...");
  process.exit(0);
});
