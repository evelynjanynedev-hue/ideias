import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Na Vercel o build é gerenciado por ela; o standalone é para Docker/VPS.
  output: process.env.VERCEL ? undefined : "standalone",
  // Permite acessar o app pelo celular na mesma rede durante o desenvolvimento.
  allowedDevOrigins: ["192.168.1.10"],
  // libSQL usa carregamento dinâmico (arquivo local x Turso); não empacotar.
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
