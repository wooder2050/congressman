import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.assembly.go.kr",
        pathname: "/photo/**",
      },
    ],
  },
};

export default nextConfig;
