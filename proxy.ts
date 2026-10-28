import { NextResponse, type NextRequest } from "next/server";

/**
 * Proteção opcional por HTTP Basic Auth.
 *
 * Ativa somente quando `ZYRA_PASSWORD` está definida — o uso local continua
 * sem login. Em produção, defina usuário e senha para não expor sua vida
 * pessoal na internet.
 */
const USUARIO = process.env.ZYRA_USER?.trim() || "zyra";
const SENHA = process.env.ZYRA_PASSWORD ?? "";

function credenciaisValidas(header: string | null): boolean {
  if (!header?.startsWith("Basic ")) return false;
  try {
    const decodificado = atob(header.slice(6).trim());
    const separador = decodificado.indexOf(":");
    if (separador === -1) return false;
    const usuario = decodificado.slice(0, separador);
    const senha = decodificado.slice(separador + 1);
    return usuario === USUARIO && senha === SENHA;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  if (!SENHA) return NextResponse.next();
  if (credenciaisValidas(request.headers.get("authorization"))) {
    return NextResponse.next();
  }

  return new NextResponse("Acesso restrito.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Zyra", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  // Libera assets estáticos e o healthcheck para as plataformas de deploy.
  matcher: [
    "/((?!api/health|_next/static|_next/image|icon.svg|manifest.webmanifest|favicon.ico).*)",
  ],
};
