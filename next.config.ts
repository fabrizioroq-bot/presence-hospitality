import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
  },
  productionBrowserSourceMaps: process.env.ANALYZE === "1",
  async headers() {
    return [
      {
        source: "/hologram/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Never index a *.vercel.app host (production alias or deployment URLs): only the domain.
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<sub>.+)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // The production alias duplicates the site: send visitors and crawlers to the domain (308).
      // The dashboard and API stay reachable there (auth email links, the keep-alive cron).
      {
        source: "/:path((?!dashboard|api|_next).*)",
        has: [{ type: "host", value: "presence-hospitality.vercel.app" }],
        destination: "https://presence-hospitality.com/:path",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
