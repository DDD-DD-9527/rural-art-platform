import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  const backendPort = parseInt(env.VITE_BACKEND_PORT) || 3001;

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 5173,
      open: true,
      allowedHosts: ["localhost", "127.0.0.1", "api.ai-future-rural-art.top"],
      proxy: {
        "/api": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on("error", (err, req, res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, res) => {
              console.log(
                "Sending Request to the Target:",
                req.method,
                req.url,
              );
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url,
              );
            });
          },
        },
      },
    },
    build: {
      sourcemap: env.VITE_BUILD_SOURCEMAP === "true",
      minify: env.VITE_BUILD_MINIFY !== "false",
    },
  };
});
