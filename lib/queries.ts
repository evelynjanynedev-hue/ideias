import { todos, um, type Param } from "./db";
import { adicionarDias, isoDate } from "./format";
import type {
  Item,
  Nota,
  Pessoa,
  ProgressoProjeto,
  Projeto,
  Tarefa,
} from "./types";

/* ---------- Caixa de entrada ---------- */

export async function contarInbox(): Promise<number> {
  return (await um<{ n: number }>("SELECT COUNT(*) AS n FROM itens WHERE status = 'inbox'"))?.n ?? 0;
}

export async function listarInbox(): Promise<Item[]> {
  return todos<Item>(
    "SELECT * FROM itens WHERE status = 'inbox' ORDER BY criado_em DESC",
  );
}

export async function listarProcessados(limite = 8): Promise<Item[]> {
  return todos<Item>(
    "SELECT * FROM itens WHERE status = 'processado' ORDER BY criado_em DESC LIMIT ?",
    limite,
  );
}

/* ---------- Tarefas ---------- */

export async function listarTarefasAbertas(): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta'
     ORDER BY
       CASE WHEN vence_em IS NULL THEN 2 WHEN vence_em < ? THEN 0 WHEN vence_em = ? THEN 1 ELSE 2 END,
       prioridade ASC,
       criado_em ASC`,
    isoDate(),
    isoDate(),
  );
}

export async function listarTarefasFeitas(limite = 20): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas WHERE status = 'feita'
     ORDER BY concluido_em DESC LIMIT ?`,
    limite,
  );
}

export async function tarefasFoco(): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND foco = 1
     ORDER BY prioridade ASC, vence_em ASC, criado_em ASC`,
  );
}

export async function tarefasDaJanela(janela: string): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND janela = ?
     ORDER BY prioridade ASC, criado_em ASC`,
    janela,
  );
}

export async function tarefasAtrasadas(): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND vence_em IS NOT NULL AND vence_em < ?
     ORDER BY vence_em ASC, prioridade ASC`,
    isoDate(),
  );
}

export async function tarefasSemData(): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND vence_em IS NULL
     ORDER BY prioridade ASC, criado_em ASC`,
  );
}

export async function tarefaPorId(id: string): Promise<Tarefa | undefined> {
  return um<Tarefa>("SELECT * FROM tarefas WHERE id = ?", id);
}

/* ---------- Pessoas ---------- */

export async function listarPessoas(): Promise<Pessoa[]> {
  return todos<Pessoa>(
    `SELECT * FROM pessoas
     ORDER BY (proximo_em IS NULL), proximo_em ASC, nome ASC`,
  );
}

export async function pessoasParaRetomar(limite = 6): Promise<Pessoa[]> {
  const limiteContato = new Date(Date.now() - 21 * 86400000).toISOString();
  return todos<Pessoa>(
    `SELECT * FROM pessoas
     WHERE (proximo_em IS NOT NULL AND proximo_em <= ?)
        OR ultimo_contato IS NULL
        OR ultimo_contato < ?
     ORDER BY (proximo_em IS NULL), proximo_em ASC, ultimo_contato ASC
     LIMIT ?`,
    isoDate(),
    limiteContato,
    limite,
  );
}

export async function contarPessoasParaRetomar(): Promise<number> {
  return (await pessoasParaRetomar(99)).length;
}

export async function pessoaPorId(id: string): Promise<Pessoa | undefined> {
  return um<Pessoa>("SELECT * FROM pessoas WHERE id = ?", id);
}

/* ---------- Projetos ---------- */

export async function listarProjetos(): Promise<Projeto[]> {
  return todos<Projeto>(
    `SELECT * FROM projetos
     ORDER BY CASE status WHEN 'ativo' THEN 0 WHEN 'pausado' THEN 1 ELSE 2 END, nome ASC`,
  );
}

export async function progressoProjetos(): Promise<ProgressoProjeto[]> {
  return todos<ProgressoProjeto>(
    `SELECT projeto_id, COUNT(*) AS total, SUM(status = 'feita') AS feitas
     FROM tarefas WHERE projeto_id IS NOT NULL GROUP BY projeto_id`,
  );
}

export async function projetosSemProximaAcao(): Promise<Projeto[]> {
  return todos<Projeto>(
    `SELECT * FROM projetos
     WHERE status = 'ativo' AND (proxima_acao IS NULL OR TRIM(proxima_acao) = '')
     ORDER BY criado_em ASC`,
  );
}

export async function projetoPorId(id: string): Promise<Projeto | undefined> {
  return um<Projeto>("SELECT * FROM projetos WHERE id = ?", id);
}

/* ---------- Notas ---------- */

export async function listarNotas(tipo?: string): Promise<Nota[]> {
  if (tipo && tipo !== "todas") {
    return todos<Nota>(
      "SELECT * FROM notas WHERE tipo = ? ORDER BY criado_em DESC",
      tipo,
    );
  }
  return todos<Nota>("SELECT * FROM notas ORDER BY criado_em DESC");
}

export async function notasDaSemana(): Promise<Nota[]> {
  const desde = new Date(Date.now() - 7 * 86400000).toISOString();
  return todos<Nota>(
    "SELECT * FROM notas WHERE criado_em >= ? ORDER BY criado_em DESC",
    desde,
  );
}

/* ---------- Rituais ---------- */

export async function rituaisHoje(): Promise<Set<string>> {
  const linhas = await todos<{ janela: string }>(
    "SELECT janela FROM rituais WHERE data = ? AND feito = 1",
    isoDate(),
  );
  return new Set(linhas.map((l) => l.janela));
}

export async function contarRituaisHoje(): Promise<{ feitos: number; total: number }> {
  const feitos =
    (
      await um<{ n: number }>(
        "SELECT COUNT(*) AS n FROM rituais WHERE data = ? AND feito = 1",
        isoDate(),
      )
    )?.n ?? 0;
  return { feitos, total: 12 };
}

/* ---------- Revisão ---------- */

export async function ultimaRevisao(): Promise<string | null> {
  return (
    (
      await um<{ data: string }>(
        "SELECT data FROM revisoes ORDER BY data DESC LIMIT 1",
      )
    )?.data ?? null
  );
}

export async function contarRevisoes(): Promise<number> {
  return (await um<{ n: number }>("SELECT COUNT(*) AS n FROM revisoes"))?.n ?? 0;
}

export async function contarExemplos(): Promise<number> {
  return (
    (
      await um<{ n: number }>(
        `SELECT
          (SELECT COUNT(*) FROM itens WHERE demo = 1) +
          (SELECT COUNT(*) FROM tarefas WHERE demo = 1) +
          (SELECT COUNT(*) FROM notas WHERE demo = 1) +
          (SELECT COUNT(*) FROM pessoas WHERE demo = 1) +
          (SELECT COUNT(*) FROM projetos WHERE demo = 1) AS n`,
      )
    )?.n ?? 0
  );
}

export async function resumoRevisao(): Promise<{
  inbox: number;
  atrasadas: number;
  pessoas: number;
  projetosSemAcao: number;
  notasSemana: number;
  ultima: string | null;
}> {
  const [inbox, atrasadas, pessoas, projetos, notas, ultima] = await Promise.all([
    contarInbox(),
    tarefasAtrasadas(),
    contarPessoasParaRetomar(),
    projetosSemProximaAcao(),
    notasDaSemana(),
    ultimaRevisao(),
  ]);

  return {
    inbox,
    atrasadas: atrasadas.length,
    pessoas,
    projetosSemAcao: projetos.length,
    notasSemana: notas.length,
    ultima,
  };
}

/* ---------- Utilidades ---------- */

export async function tarefasPorProjeto(projetoId: string): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas WHERE projeto_id = ? AND status = 'aberta'
     ORDER BY prioridade ASC, criado_em ASC`,
    projetoId,
  );
}

export async function proximasTarefas(limite = 5): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND vence_em IS NOT NULL AND vence_em >= ?
     ORDER BY vence_em ASC, prioridade ASC LIMIT ?`,
    isoDate(),
    limite,
  );
}

export async function contarTarefasHoje(): Promise<number> {
  return (
    (
      await um<{ n: number }>(
        "SELECT COUNT(*) AS n FROM tarefas WHERE status = 'aberta' AND vence_em = ?",
        isoDate(),
      )
    )?.n ?? 0
  );
}

export async function tarefasDeHoje(): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas WHERE status = 'aberta' AND vence_em = ?
     ORDER BY prioridade ASC, criado_em ASC`,
    isoDate(),
  );
}

export function amanha(): string {
  return adicionarDias(1);
}

export type { Param };
