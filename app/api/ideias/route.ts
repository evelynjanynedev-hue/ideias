import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { executar } from "@/lib/db";
import { agoraISO } from "@/lib/format";
import { contarInbox, listarInbox, tarefasAtrasadas, tarefasFoco } from "@/lib/queries";

/**
 * API para o agente do WhatsApp jogar ideias dentro do Zyra.
 *
 * Autenticação por token (não usa o Basic Auth da interface):
 *   Authorization: Bearer $ZYRA_API_TOKEN
 *   ou x-zyra-token: $ZYRA_API_TOKEN
 *
 * POST /api/ideias  { "texto": "...", "fonte": "whatsapp" }
 * GET  /api/ideias  -> caixa de entrada + foco + atrasadas
 */

export const dynamic = "force-dynamic";

function tokenValido(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function autorizado(req: NextRequest): boolean {
  const esperado = process.env.ZYRA_API_TOKEN?.trim();
  if (!esperado) return false;
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const recebido = bearer || (req.headers.get("x-zyra-token") ?? "").trim();
  if (!recebido) return false;
  return tokenValido(recebido, esperado);
}

function negado() {
  return NextResponse.json({ ok: false, erro: "token inválido" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (!autorizado(req)) return negado();

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  const dados = (corpo ?? {}) as { texto?: unknown; fonte?: unknown };
  const texto = typeof dados.texto === "string" ? dados.texto.trim().slice(0, 4000) : "";
  if (!texto) {
    return NextResponse.json({ ok: false, erro: "campo 'texto' é obrigatório" }, { status: 400 });
  }
  const fonte = typeof dados.fonte === "string" && dados.fonte.trim() ? dados.fonte.trim().slice(0, 120) : "agente";

  const id = crypto.randomUUID();
  await executar(
    `INSERT INTO itens (id, texto, fonte, status, demo, criado_em)
     VALUES (?, ?, ?, 'inbox', 0, ?)`,
    id,
    texto,
    fonte,
    agoraISO(),
  );

  return NextResponse.json({ ok: true, id, texto, fonte }, { status: 201 });
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) return negado();

  const [inbox, total, foco, atrasadas] = await Promise.all([
    listarInbox(),
    contarInbox(),
    tarefasFoco(),
    tarefasAtrasadas(),
  ]);

  return NextResponse.json({
    ok: true,
    inbox: {
      total,
      itens: inbox.slice(0, 20).map((i) => ({ id: i.id, texto: i.texto, fonte: i.fonte, criado_em: i.criado_em })),
    },
    foco: foco.map((t) => ({ id: t.id, titulo: t.titulo, prioridade: t.prioridade, janela: t.janela, vence_em: t.vence_em })),
    atrasadas: atrasadas.map((t) => ({ id: t.id, titulo: t.titulo, vence_em: t.vence_em })),
  });
}
