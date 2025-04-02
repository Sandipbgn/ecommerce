import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3030",
        pathname: "/storage/uploads/**",
      },
    ],
  },
};

export default nextConfig;
