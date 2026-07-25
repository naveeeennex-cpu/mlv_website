import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Simple plugin to execute Vercel API routes locally in Vite
const vercelApiPlugin = () => {
  return {
    name: 'vercel-api-plugin',
    config(config, { mode }) {
      const env = loadEnv(mode, process.cwd(), '');
      Object.assign(process.env, env);
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api')) {
          return next();
        }

        try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
          let pathname = parsedUrl.pathname;
          
          let filePath = path.join(process.cwd(), pathname + '.js');
          if (!fs.existsSync(filePath)) {
            filePath = path.join(process.cwd(), pathname, 'index.js');
          }

          if (!fs.existsSync(filePath)) {
             return next();
          }

          // Parse query
          req.query = Object.fromEntries(parsedUrl.searchParams);
          
          // Parse body if it's a POST/PUT
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString();
            try {
              req.body = JSON.parse(rawBody);
            } catch (e) {
              req.body = rawBody;
            }
          }

          // Add helper methods expected by Vercel functions
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };
          res.send = (data) => {
            res.end(data);
          };

          // Import and run the handler
          const moduleUrl = new URL(`file://${filePath}`).href;
          const module = await import(moduleUrl + '?t=' + Date.now());
          const handler = module.default;
          
          await handler(req, res);
        } catch (err) {
          console.error('API Route Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  }
};

export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiPlugin()],
})
