import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // better-sqlite3 é um módulo nativo: não deve ser empacotado pelo bundler.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
