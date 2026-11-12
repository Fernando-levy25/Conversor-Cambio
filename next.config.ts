import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // better-sqlite3 é um módulo nativo: não deve ser empacotado pelo bundler.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
