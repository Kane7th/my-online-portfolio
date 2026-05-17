/** @type {import('next').NextConfig} */
// Merge this `headers()` block into your existing next.config.js / next.config.mjs

const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/health",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://kane7th.github.io",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
