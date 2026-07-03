/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone permite rodar em Docker com "node apps/web/server.js".
  output: "standalone",
  reactStrictMode: true
};

export default nextConfig;
