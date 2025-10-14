import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "agitto-api.fly.dev",
    ],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "*", pathname: "/uploads/**" },
      { protocol: "https", hostname: "agitto-api.fly.dev", pathname: "/**" },
    ],
  },
};

export default nextConfig;
