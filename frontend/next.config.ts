import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return [
      {
        source: "/oauth/:path*",
        destination: `${apiBase}/oauth/:path*`,
      },
      {
        source: "/.well-known/openid-configuration",
        destination: `${apiBase}/.well-known/openid-configuration`,
      },
    ];
  },
};

export default nextConfig;
