import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Turbopack'in proje kökünü netleştir (HMR / yanlış workspace kökü hatalarını azaltır)
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
};

export default nextConfig;
