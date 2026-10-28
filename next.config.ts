import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autocontido só quando pedido (Docker/VPS); na Vercel o build é dela.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  outputFileTracingRoot: process.cwd(),
  // Permite acessar o app pelo celular na mesma rede durante o desenvolvimento.
  allowedDevOrigins: ["192.168.1.10"],
  // libSQL usa carregamento dinâmico (arquivo local x Turso); não empacotar.
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
