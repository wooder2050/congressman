import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.assembly.go.kr",
        pathname: "/static/portal/img/**",
      },
      {
        protocol: "https",
        hostname: "www.assembly.go.kr",
        pathname: "/photo/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react", "@radix-ui/react-select", "@radix-ui/react-tabs"],
  },
};

export default nextConfig;
