import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acessar o app pelo celular na mesma rede durante o desenvolvimento.
  allowedDevOrigins: ["192.168.1.10"],
  // SQLite nativo do Node é carregado no servidor; não deve ser empacotado.
  serverExternalPackages: [],
};

export default nextConfig;
