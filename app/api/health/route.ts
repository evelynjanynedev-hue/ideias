import { um } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Healthcheck usado por plataformas de deploy (Vercel, Docker, Railway...).
 * Não passa pela autenticação básica do proxy.
 */
export async function GET() {
  try {
    const { n } = (await um<{ n: number }>(
      "SELECT COUNT(*) AS n FROM tarefas",
    )) ?? { n: 0 };

    return Response.json({
      ok: true,
      banco:
        process.env.ZYRA_DB_URL || process.env.TURSO_DATABASE_URL
          ? "remoto (libSQL)"
          : (process.env.ZYRA_DATA_DIR ?? "data"),
      tarefas: n,
      agora: new Date().toISOString(),
    });
  } catch (erro) {
    return Response.json(
      { ok: false, erro: erro instanceof Error ? erro.message : String(erro) },
      { status: 503 },
    );
  }
}
