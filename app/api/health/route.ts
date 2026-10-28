import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Healthcheck usado por plataformas de deploy (Railway, Render, Fly, Docker).
 * Não passa pela autenticação básica do proxy.
 */
export function GET() {
  try {
    const { n } = db.prepare("SELECT COUNT(*) AS n FROM tarefas").get() as {
      n: number;
    };
    return Response.json({
      ok: true,
      banco: process.env.ZYRA_DATA_DIR ?? "data",
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
