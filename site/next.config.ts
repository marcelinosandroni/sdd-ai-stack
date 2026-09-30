import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The site is fully static: no server runtime needed, so Vercel serves it
  // from the edge cache.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
