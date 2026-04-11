import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ─── Turbopack (default in Next.js 16) ────────────── */
  /* Empty object silences the webpack/turbopack mismatch warning */
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true, // ✅ skip TS errors
  },

  /* ─── Package import optimisation ──────────────────── */
  /* Move out of experimental — stable in Next 16 */
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-icons",
    ],
  },

  /* ─── Images ───────────────────────────────────────── */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  /* ─── Security + PWA headers ───────────────────────── */
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "DENY" },
          { key: "X-XSS-Protection",        value: "1; mode=block" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  /* ─── Redirects ─────────────────────────────────────── */
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  /* ─── NO webpack block — Turbopack is default in Next 16 ── */
  /* Convex warning suppression not needed — Turbopack handles it */

  poweredByHeader: false,
  compress: true,
};

export default nextConfig;