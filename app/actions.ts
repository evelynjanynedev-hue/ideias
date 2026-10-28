"use server";

import { revalidatePath } from "next/cache";
import { executar, um } from "@/lib/db";
import { adicionarDias, agoraISO, hoje } from "@/lib/format";

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

  await executar(
    `INSERT INTO itens (id, texto, fonte, status, demo, criado_em)
     VALUES (?, ?, ?, 'inbox', 0, ?)`,
    novoId(),
    conteudo,
    opcional(fd, "fonte") ?? "captura rápida",
    agoraISO(),
  );

  atualizar();
}

export async function arquivarItem(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  await executar("UPDATE itens SET status = 'arquivado' WHERE id = ?", id);
  atualizar();
}

export async function excluirItem(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  await executar("DELETE FROM itens WHERE id = ?", id);
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
    await executar(
      `INSERT INTO tarefas
        (id, titulo, notas, status, prioridade, foco, area, projeto_id, pessoa_id, janela, vence_em, criado_em, demo)
       VALUES (?, ?, ?, 'aberta', ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
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
    await executar(
      `INSERT INTO notas (id, titulo, corpo, tipo, area, tags, pessoa_id, projeto_id, criado_em, demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
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
    await executar(
      `INSERT INTO pessoas
        (id, nome, contexto, area, proximo_passo, proximo_em, criado_em, demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
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
    await executar(
      `INSERT INTO projetos (id, nome, resultado, area, status, proxima_acao, criado_em, demo)
       VALUES (?, ?, ?, ?, 'ativo', ?, ?, 0)`,
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

  await executar(
    "UPDATE itens SET status = 'processado', destino_tipo = ?, destino_id = ? WHERE id = ?",
    tipo,
    destinoId,
    itemId,
  );

  atualizar();
}

/* ---------------- Tarefas ---------------- */

export async function criarTarefa(fd: FormData) {
  const titulo = texto(fd, "titulo");
  if (!titulo) return;

  await executar(
    `INSERT INTO tarefas
      (id, titulo, notas, status, prioridade, foco, area, projeto_id, pessoa_id, janela, vence_em, criado_em, demo)
     VALUES (?, ?, NULL, 'aberta', ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
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
  const tarefa = await um<{ status: string }>(
    "SELECT status FROM tarefas WHERE id = ?",
    id,
  );
  if (!tarefa) return;

  if (tarefa.status === "feita") {
    await executar(
      "UPDATE tarefas SET status = 'aberta', concluido_em = NULL WHERE id = ?",
      id,
    );
  } else {
    await executar(
      "UPDATE tarefas SET status = 'feita', concluido_em = ?, foco = 0 WHERE id = ?",
      agoraISO(),
      id,
    );
  }
  atualizar();
}

export async function alternarFoco(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  const tarefa = await um<{ foco: number }>("SELECT foco FROM tarefas WHERE id = ?", id);
  if (!tarefa) return;

  if (tarefa.foco) {
    await executar("UPDATE tarefas SET foco = 0 WHERE id = ?", id);
  } else {
    const ativos = await um<{ n: number }>(
      "SELECT COUNT(*) AS n FROM tarefas WHERE status = 'aberta' AND foco = 1",
    );
    if ((ativos?.n ?? 0) >= 3) {
      await executar(
        `UPDATE tarefas SET foco = 0 WHERE id = (
           SELECT id FROM tarefas WHERE status = 'aberta' AND foco = 1 ORDER BY criado_em ASC LIMIT 1
         )`,
      );
    }
    await executar("UPDATE tarefas SET foco = 1 WHERE id = ?", id);
  }
  atualizar();
}

export async function excluirTarefa(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  await executar("DELETE FROM tarefas WHERE id = ?", id);
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
  await executar("UPDATE tarefas SET vence_em = ? WHERE id = ?", iso, id);
  atualizar();
}

/* ---------------- Notas ---------------- */

export async function criarNota(fd: FormData) {
  const corpo = texto(fd, "corpo");
  if (!corpo) return;

  await executar(
    `INSERT INTO notas (id, titulo, corpo, tipo, area, tags, criado_em, demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
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
  await executar("DELETE FROM notas WHERE id = ?", id);
  atualizar();
}

/* ---------------- Pessoas ---------------- */

export async function criarPessoa(fd: FormData) {
  const nome = texto(fd, "nome");
  if (!nome) return;

  await executar(
    `INSERT INTO pessoas
      (id, nome, contexto, area, email, telefone, proximo_passo, proximo_em, notas, criado_em, demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
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
  await executar(
    "UPDATE pessoas SET ultimo_contato = ?, proximo_em = NULL WHERE id = ?",
    agoraISO(),
    id,
  );
  atualizar();
}

export async function excluirPessoa(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  await executar("UPDATE tarefas SET pessoa_id = NULL WHERE pessoa_id = ?", id);
  await executar("UPDATE notas SET pessoa_id = NULL WHERE pessoa_id = ?", id);
  await executar("DELETE FROM pessoas WHERE id = ?", id);
  atualizar();
}

/* ---------------- Projetos ---------------- */

export async function criarProjeto(fd: FormData) {
  const nome = texto(fd, "nome");
  if (!nome) return;

  await executar(
    `INSERT INTO projetos (id, nome, resultado, area, status, proxima_acao, criado_em, demo)
     VALUES (?, ?, ?, ?, 'ativo', ?, ?, 0)`,
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
  await executar(
    "UPDATE projetos SET proxima_acao = ? WHERE id = ?",
    opcional(fd, "proxima_acao"),
    id,
  );
  atualizar();
}

export async function mudarStatusProjeto(fd: FormData) {
  const id = texto(fd, "id");
  const status = texto(fd, "status");
  if (!id || !["ativo", "pausado", "concluido"].includes(status)) return;
  await executar("UPDATE projetos SET status = ? WHERE id = ?", status, id);
  atualizar();
}

export async function excluirProjeto(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  await executar("UPDATE tarefas SET projeto_id = NULL WHERE projeto_id = ?", id);
  await executar("UPDATE notas SET projeto_id = NULL WHERE projeto_id = ?", id);
  await executar("DELETE FROM projetos WHERE id = ?", id);
  atualizar();
}

/* ---------------- Rituais / revisão ---------------- */

export async function alternarRitual(fd: FormData) {
  const janela = texto(fd, "janela");
  if (!janela) return;

  const atual = await um<{ id: string; feito: number }>(
    "SELECT id, feito FROM rituais WHERE data = ? AND janela = ?",
    hoje(),
    janela,
  );

  if (atual) {
    await executar(
      "UPDATE rituais SET feito = ? WHERE id = ?",
      atual.feito ? 0 : 1,
      atual.id,
    );
  } else {
    await executar(
      "INSERT INTO rituais (id, data, janela, feito) VALUES (?, ?, ?, 1)",
      novoId(),
      hoje(),
      janela,
    );
  }

  atualizar();
}

export async function fecharRevisao() {
  await executar(
    "INSERT INTO revisoes (id, data, criado_em) VALUES (?, ?, ?) ON CONFLICT(data) DO NOTHING",
    novoId(),
    hoje(),
    agoraISO(),
  );
  atualizar();
}

/* ---------------- Scrum (sprints) ---------------- */

const PONTOS_VALIDOS = new Set([0, 1, 2, 3, 5, 8, 13, 21]);

export async function criarSprint(fd: FormData) {
  const nome = texto(fd, "nome") || "Sprint";
  const objetivo = opcional(fd, "objetivo");
  const inicio = texto(fd, "inicio") || hoje();
  const fim = texto(fd, "fim") || adicionarDias(7);

  const ativa = await um<{ n: number }>(
    "SELECT COUNT(*) AS n FROM sprints WHERE status = 'ativa'",
  );
  const status = (ativa?.n ?? 0) > 0 ? "planejada" : "ativa";

  await executar(
    `INSERT INTO sprints (id, nome, objetivo, inicio, fim, status, criado_em, demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    novoId(),
    nome,
    objetivo,
    inicio,
    fim,
    status,
    agoraISO(),
  );

  atualizar();
}

export async function ativarSprint(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  await executar("UPDATE sprints SET status = 'planejada' WHERE status = 'ativa'");
  await executar("UPDATE sprints SET status = 'ativa' WHERE id = ?", id);
  atualizar();
}

export async function adicionarAoSprint(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;

  let sprintId = texto(fd, "sprint_id");
  if (!sprintId) {
    const ativa = await um<{ id: string }>(
      "SELECT id FROM sprints WHERE status = 'ativa' LIMIT 1",
    );
    if (!ativa) return;
    sprintId = ativa.id;
  }

  const pontos = Number(texto(fd, "pontos"));
  if (PONTOS_VALIDOS.has(pontos)) {
    await executar(
      "UPDATE tarefas SET sprint_id = ?, pontos = ? WHERE id = ?",
      sprintId,
      pontos,
      id,
    );
  } else {
    await executar("UPDATE tarefas SET sprint_id = ? WHERE id = ?", sprintId, id);
  }

  atualizar();
}

export async function removerDoSprint(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  await executar("UPDATE tarefas SET sprint_id = NULL WHERE id = ?", id);
  atualizar();
}

export async function definirPontos(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  const pontos = Number(texto(fd, "pontos"));
  if (!PONTOS_VALIDOS.has(pontos)) return;
  await executar("UPDATE tarefas SET pontos = ? WHERE id = ?", pontos, id);
  atualizar();
}

export async function encerrarSprint(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  const retrospectiva = opcional(fd, "retrospectiva");

  const sprint = await um<{ nome: string }>(
    "SELECT nome FROM sprints WHERE id = ?",
    id,
  );
  if (!sprint) return;

  await executar(
    "UPDATE sprints SET status = 'concluida', retrospectiva = ? WHERE id = ?",
    retrospectiva,
    id,
  );

  // O que não foi concluído volta para o Product Backlog.
  await executar(
    "UPDATE tarefas SET sprint_id = NULL WHERE sprint_id = ? AND status = 'aberta'",
    id,
  );

  if (retrospectiva) {
    await executar(
      `INSERT INTO notas (id, titulo, corpo, tipo, area, tags, criado_em, demo)
       VALUES (?, ?, ?, 'nota', 'pessoal', 'scrum, retrospectiva', ?, 0)`,
      novoId(),
      `Retrospectiva — ${sprint.nome}`,
      retrospectiva,
      agoraISO(),
    );
  }

  atualizar();
}

export async function excluirSprint(fd: FormData) {
  const id = texto(fd, "id");
  if (!id) return;
  await executar("UPDATE tarefas SET sprint_id = NULL WHERE sprint_id = ?", id);
  await executar("DELETE FROM sprints WHERE id = ?", id);
  atualizar();
}

/* ---------------- Exemplos ---------------- */
export async function limparExemplos() {
  await executar("DELETE FROM tarefas WHERE demo = 1");
  await executar("DELETE FROM notas WHERE demo = 1");
  await executar("DELETE FROM itens WHERE demo = 1");
  await executar("DELETE FROM projetos WHERE demo = 1");
  await executar("DELETE FROM pessoas WHERE demo = 1");
  atualizar();
}
