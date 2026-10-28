"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { agoraISO, hoje } from "@/lib/format";

const texto = (fd: FormData, chave: string) =>
  (fd.get(chave)?.toString() ?? "").trim();

const opcional = (fd: FormData, chave: string) => texto(fd, chave) || null;

const numero = (fd: FormData, chave: string, padrao: number) => {
  const n = Number(texto(fd, chave));
  return Number.isFinite(n) && n > 0 ? n : padrao;
};

const novoId = () => crypto.randomUUID();

function atualizar() {
  revalidatePath("/", "layout");
}

/* ---------------- Captura ---------------- */

export async function capturar(fd: FormData) {
  const conteudo = texto(fd, "texto");
  if (!conteudo) return;

  db.prepare(
    `INSERT INTO itens (id, texto, fonte, status, demo, criado_em)
     VALUES (?, ?, ?, 'inbox', 0, ?)`,
  ).run(novoId(), conteudo, opcional(fd, "fonte") ?? "captura rápida", agoraISO());

  atualizar();
}

export async function arquivarItem(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  db.prepare("UPDATE itens SET status = 'arquivado' WHERE id = ?").run(id);
  atualizar();
}

export async function excluirItem(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  db.prepare("DELETE FROM itens WHERE id = ?").run(id);
  atualizar();
}

/* ---------------- Processar item ---------------- */

export async function processarItem(fd: FormData) {
  const itemId = texto(fd, "item_id");
  const tipo = texto(fd, "tipo");
  if (!itemId || !tipo) return;

  let destinoId: string;

  if (tipo === "tarefa") {
    destinoId = novoId();
    db.prepare(
      `INSERT INTO tarefas
        (id, titulo, notas, status, prioridade, foco, area, projeto_id, pessoa_id, janela, vence_em, criado_em, demo)
       VALUES (?, ?, ?, 'aberta', ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    ).run(
      destinoId,
      texto(fd, "titulo") || "Tarefa sem título",
      opcional(fd, "notas"),
      numero(fd, "prioridade", 3),
      fd.get("foco") ? 1 : 0,
      texto(fd, "area") || "pessoal",
      opcional(fd, "projeto_id"),
      opcional(fd, "pessoa_id"),
      opcional(fd, "janela"),
      opcional(fd, "vence_em"),
      agoraISO(),
    );
  } else if (tipo === "nota") {
    destinoId = novoId();
    db.prepare(
      `INSERT INTO notas (id, titulo, corpo, tipo, area, tags, pessoa_id, projeto_id, criado_em, demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    ).run(
      destinoId,
      opcional(fd, "titulo"),
      texto(fd, "corpo") || "Sem conteúdo",
      texto(fd, "nota_tipo") || "nota",
      opcional(fd, "area"),
      opcional(fd, "tags"),
      opcional(fd, "pessoa_id"),
      opcional(fd, "projeto_id"),
      agoraISO(),
    );
  } else if (tipo === "pessoa") {
    destinoId = novoId();
    db.prepare(
      `INSERT INTO pessoas
        (id, nome, contexto, area, proximo_passo, proximo_em, criado_em, demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    ).run(
      destinoId,
      texto(fd, "nome") || "Sem nome",
      opcional(fd, "contexto"),
      opcional(fd, "area") ?? "pessoal",
      opcional(fd, "proximo_passo"),
      opcional(fd, "proximo_em"),
      agoraISO(),
    );
  } else if (tipo === "projeto") {
    destinoId = novoId();
    db.prepare(
      `INSERT INTO projetos (id, nome, resultado, area, status, proxima_acao, criado_em, demo)
       VALUES (?, ?, ?, ?, 'ativo', ?, ?, 0)`,
    ).run(
      destinoId,
      texto(fd, "nome") || "Projeto sem nome",
      opcional(fd, "resultado"),
      texto(fd, "area") || "trabalho",
      opcional(fd, "proxima_acao"),
      agoraISO(),
    );
  } else {
    return;
  }

  db.prepare(
    "UPDATE itens SET status = 'processado', destino_tipo = ?, destino_id = ? WHERE id = ?",
  ).run(tipo, destinoId, itemId);

  atualizar();
}

/* ---------------- Tarefas ---------------- */

export async function criarTarefa(fd: FormData) {
  const titulo = texto(fd, "titulo");
  if (!titulo) return;

  db.prepare(
    `INSERT INTO tarefas
      (id, titulo, notas, status, prioridade, foco, area, projeto_id, pessoa_id, janela, vence_em, criado_em, demo)
     VALUES (?, ?, NULL, 'aberta', ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
  ).run(
    novoId(),
    titulo,
    numero(fd, "prioridade", 3),
    fd.get("foco") ? 1 : 0,
    texto(fd, "area") || "pessoal",
    opcional(fd, "projeto_id"),
    opcional(fd, "pessoa_id"),
    opcional(fd, "janela"),
    opcional(fd, "vence_em"),
    agoraISO(),
  );

  atualizar();
}

export async function alternarTarefa(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  const tarefa = db.prepare("SELECT status FROM tarefas WHERE id = ?").get(id) as
    | { status: string }
    | undefined;
  if (!tarefa) return;

  if (tarefa.status === "feita") {
    db.prepare(
      "UPDATE tarefas SET status = 'aberta', concluido_em = NULL WHERE id = ?",
    ).run(id);
  } else {
    db.prepare(
      "UPDATE tarefas SET status = 'feita', concluido_em = ?, foco = 0 WHERE id = ?",
    ).run(agoraISO(), id);
  }
  atualizar();
}

export async function alternarFoco(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  const tarefa = db.prepare("SELECT foco FROM tarefas WHERE id = ?").get(id) as
    | { foco: number }
    | undefined;
  if (!tarefa) return;

  if (tarefa.foco) {
    db.prepare("UPDATE tarefas SET foco = 0 WHERE id = ?").run(id);
  } else {
    const ativos = db.prepare(
      "SELECT COUNT(*) AS n FROM tarefas WHERE status = 'aberta' AND foco = 1",
    ).get() as { n: number };
    if (ativos.n >= 3) {
      db.prepare(
        `UPDATE tarefas SET foco = 0 WHERE id = (
           SELECT id FROM tarefas WHERE status = 'aberta' AND foco = 1 ORDER BY criado_em ASC LIMIT 1
         )`,
      ).run();
    }
    db.prepare("UPDATE tarefas SET foco = 1 WHERE id = ?").run(id);
  }
  atualizar();
}

export async function excluirTarefa(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  db.prepare("DELETE FROM tarefas WHERE id = ?").run(id);
  atualizar();
}

export async function adiarTarefa(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const iso = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, "0")}-${String(
    amanha.getDate(),
  ).padStart(2, "0")}`;
  db.prepare("UPDATE tarefas SET vence_em = ? WHERE id = ?").run(iso, id);
  atualizar();
}

/* ---------------- Notas ---------------- */

export async function criarNota(fd: FormData) {
  const corpo = texto(fd, "corpo");
  if (!corpo) return;

  db.prepare(
    `INSERT INTO notas (id, titulo, corpo, tipo, area, tags, criado_em, demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
  ).run(
    novoId(),
    opcional(fd, "titulo"),
    corpo,
    texto(fd, "tipo") || "nota",
    opcional(fd, "area"),
    opcional(fd, "tags"),
    agoraISO(),
  );

  atualizar();
}

export async function excluirNota(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  db.prepare("DELETE FROM notas WHERE id = ?").run(id);
  atualizar();
}

/* ---------------- Pessoas ---------------- */

export async function criarPessoa(fd: FormData) {
  const nome = texto(fd, "nome");
  if (!nome) return;

  db.prepare(
    `INSERT INTO pessoas
      (id, nome, contexto, area, email, telefone, proximo_passo, proximo_em, notas, criado_em, demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
  ).run(
    novoId(),
    nome,
    opcional(fd, "contexto"),
    texto(fd, "area") || "pessoal",
    opcional(fd, "email"),
    opcional(fd, "telefone"),
    opcional(fd, "proximo_passo"),
    opcional(fd, "proximo_em"),
    opcional(fd, "notas"),
    agoraISO(),
  );

  atualizar();
}

export async function registrarContato(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  db.prepare(
    "UPDATE pessoas SET ultimo_contato = ?, proximo_em = NULL WHERE id = ?",
  ).run(agoraISO(), id);
  atualizar();
}

export async function excluirPessoa(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  db.prepare("UPDATE tarefas SET pessoa_id = NULL WHERE pessoa_id = ?").run(id);
  db.prepare("UPDATE notas SET pessoa_id = NULL WHERE pessoa_id = ?").run(id);
  db.prepare("DELETE FROM pessoas WHERE id = ?").run(id);
  atualizar();
}

/* ---------------- Projetos ---------------- */

export async function criarProjeto(fd: FormData) {
  const nome = texto(fd, "nome");
  if (!nome) return;

  db.prepare(
    `INSERT INTO projetos (id, nome, resultado, area, status, proxima_acao, criado_em, demo)
     VALUES (?, ?, ?, ?, 'ativo', ?, ?, 0)`,
  ).run(
    novoId(),
    nome,
    opcional(fd, "resultado"),
    texto(fd, "area") || "trabalho",
    opcional(fd, "proxima_acao"),
    agoraISO(),
  );

  atualizar();
}

export async function definirProximaAcao(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  db.prepare("UPDATE projetos SET proxima_acao = ? WHERE id = ?").run(
    opcional(fd, "proxima_acao"),
    id,
  );
  atualizar();
}

export async function mudarStatusProjeto(fd: FormData) {
  const id = texto(fd, "id");
  const status = texto(fd, "status");
  if (!id || !["ativo", "pausado", "concluido"].includes(status)) return;
  db.prepare("UPDATE projetos SET status = ? WHERE id = ?").run(status, id);
  atualizar();
}

export async function excluirProjeto(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  db.prepare("UPDATE tarefas SET projeto_id = NULL WHERE projeto_id = ?").run(id);
  db.prepare("UPDATE notas SET projeto_id = NULL WHERE projeto_id = ?").run(id);
  db.prepare("DELETE FROM projetos WHERE id = ?").run(id);
  atualizar();
}

/* ---------------- Rituais / revisão ---------------- */

export async function alternarRitual(fd: FormData) {
  const janela = texto(fd, "janela");
  if (!janela) return;

  const atual = db
    .prepare("SELECT id, feito FROM rituais WHERE data = ? AND janela = ?")
    .get(hoje(), janela) as { id: string; feito: number } | undefined;

  if (atual) {
    db.prepare("UPDATE rituais SET feito = ? WHERE id = ?").run(
      atual.feito ? 0 : 1,
      atual.id,
    );
  } else {
    db.prepare(
      "INSERT INTO rituais (id, data, janela, feito) VALUES (?, ?, ?, 1)",
    ).run(novoId(), hoje(), janela);
  }

  atualizar();
}

export async function fecharRevisao() {
  db.prepare(
    "INSERT INTO revisoes (id, data, criado_em) VALUES (?, ?, ?) ON CONFLICT(data) DO NOTHING",
  ).run(novoId(), hoje(), agoraISO());
  atualizar();
}

/* ---------------- Exemplos ---------------- */

export async function limparExemplos() {
  db.prepare("DELETE FROM tarefas WHERE demo = 1").run();
  db.prepare("DELETE FROM notas WHERE demo = 1").run();
  db.prepare("DELETE FROM itens WHERE demo = 1").run();
  db.prepare("DELETE FROM projetos WHERE demo = 1").run();
  db.prepare("DELETE FROM pessoas WHERE demo = 1").run();
  atualizar();
}
