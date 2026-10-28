import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor Node autocontido em .next/standalone (usado no Docker).
  output: "standalone",
  // Permite acessar o app pelo celular na mesma rede durante o desenvolvimento.
  allowedDevOrigins: ["192.168.1.10"],
  // libSQL usa carregamento dinâmico (arquivo local x Turso); não empacotar.
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
