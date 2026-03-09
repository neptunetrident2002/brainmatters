/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for Supabase SSR
    serverComponentsExternalPackages: [],
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Cache public API routes at the edge — PRD non-negotiable
      {
        source: "/api/feed",
        headers: [
          { key: "Cache-Control", value: "s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/api/daily",
        headers: [
          { key: "Cache-Control", value: "s-maxage=300, stale-while-revalidate=600" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
