import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PPR + "use cache" + cacheLife. Ver SDD/NEXT.md §6
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
