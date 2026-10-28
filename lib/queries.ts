import { db, type Param } from "./db";
import { adicionarDias, isoDate } from "./format";
import type {
  Item,
  Nota,
  Pessoa,
  ProgressoProjeto,
  Projeto,
  Tarefa,
} from "./types";

function todos<T>(sql: string, ...params: Param[]): T[] {
  return (db.prepare(sql).all(...params) as unknown as Record<string, unknown>[]).map(
    (linha) => ({ ...linha }) as T,
  );
}

function um<T>(sql: string, ...params: Param[]): T | undefined {
  const linha = db.prepare(sql).get(...params) as unknown as
    | Record<string, unknown>
    | undefined;
  return linha ? ({ ...linha } as T) : undefined;
}

/* ---------- Caixa de entrada ---------- */

export function contarInbox(): number {
  return um<{ n: number }>("SELECT COUNT(*) AS n FROM itens WHERE status = 'inbox'")?.n ?? 0;
}

export function listarInbox(): Item[] {
  return todos<Item>(
    "SELECT * FROM itens WHERE status = 'inbox' ORDER BY criado_em DESC",
  );
}

export function listarProcessados(limite = 8): Item[] {
  return todos<Item>(
    "SELECT * FROM itens WHERE status = 'processado' ORDER BY criado_em DESC LIMIT ?",
    limite,
  );
}

/* ---------- Tarefas ---------- */

export function listarTarefasAbertas(): Tarefa[] {
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

export function listarTarefasFeitas(limite = 20): Tarefa[] {
  return todos<Tarefa>(
    `SELECT * FROM tarefas WHERE status = 'feita'
     ORDER BY concluido_em DESC LIMIT ?`,
    limite,
  );
}

export function tarefasFoco(): Tarefa[] {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND foco = 1
     ORDER BY prioridade ASC, vence_em ASC, criado_em ASC`,
  );
}

export function tarefasDaJanela(janela: string): Tarefa[] {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND janela = ?
     ORDER BY prioridade ASC, criado_em ASC`,
    janela,
  );
}

export function tarefasAtrasadas(): Tarefa[] {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND vence_em IS NOT NULL AND vence_em < ?
     ORDER BY vence_em ASC, prioridade ASC`,
    isoDate(),
  );
}

export function tarefasSemData(): Tarefa[] {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND vence_em IS NULL
     ORDER BY prioridade ASC, criado_em ASC`,
  );
}

export function tarefaPorId(id: string): Tarefa | undefined {
  return um<Tarefa>("SELECT * FROM tarefas WHERE id = ?", id);
}

/* ---------- Pessoas ---------- */

export function listarPessoas(): Pessoa[] {
  return todos<Pessoa>(
    `SELECT * FROM pessoas
     ORDER BY (proximo_em IS NULL), proximo_em ASC, nome ASC`,
  );
}

export function pessoasParaRetomar(limite = 6): Pessoa[] {
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

export function contarPessoasParaRetomar(): number {
  return pessoasParaRetomar(99).length;
}

export function pessoaPorId(id: string): Pessoa | undefined {
  return um<Pessoa>("SELECT * FROM pessoas WHERE id = ?", id);
}

/* ---------- Projetos ---------- */

export function listarProjetos(): Projeto[] {
  return todos<Projeto>(
    `SELECT * FROM projetos
     ORDER BY CASE status WHEN 'ativo' THEN 0 WHEN 'pausado' THEN 1 ELSE 2 END, nome ASC`,
  );
}

export function progressoProjetos(): ProgressoProjeto[] {
  return todos<ProgressoProjeto>(
    `SELECT projeto_id, COUNT(*) AS total, SUM(status = 'feita') AS feitas
     FROM tarefas WHERE projeto_id IS NOT NULL GROUP BY projeto_id`,
  );
}

export function projetosSemProximaAcao(): Projeto[] {
  return todos<Projeto>(
    `SELECT * FROM projetos
     WHERE status = 'ativo' AND (proxima_acao IS NULL OR TRIM(proxima_acao) = '')
     ORDER BY criado_em ASC`,
  );
}

export function projetoPorId(id: string): Projeto | undefined {
  return um<Projeto>("SELECT * FROM projetos WHERE id = ?", id);
}

/* ---------- Notas ---------- */

export function listarNotas(tipo?: string): Nota[] {
  if (tipo && tipo !== "todas") {
    return todos<Nota>(
      "SELECT * FROM notas WHERE tipo = ? ORDER BY criado_em DESC",
      tipo,
    );
  }
  return todos<Nota>("SELECT * FROM notas ORDER BY criado_em DESC");
}

export function notasDaSemana(): Nota[] {
  const desde = new Date(Date.now() - 7 * 86400000).toISOString();
  return todos<Nota>(
    "SELECT * FROM notas WHERE criado_em >= ? ORDER BY criado_em DESC",
    desde,
  );
}

/* ---------- Rituais ---------- */

export function rituaisHoje(): Set<string> {
  const linhas = todos<{ janela: string }>(
    "SELECT janela FROM rituais WHERE data = ? AND feito = 1",
    isoDate(),
  );
  return new Set(linhas.map((l) => l.janela));
}

export function contarRituaisHoje(): { feitos: number; total: number } {
  const feitos = um<{ n: number }>(
    "SELECT COUNT(*) AS n FROM rituais WHERE data = ? AND feito = 1",
    isoDate(),
  )?.n ?? 0;
  return { feitos, total: 12 };
}

/* ---------- Revisão ---------- */

export function ultimaRevisao(): string | null {
  return um<{ data: string }>(
    "SELECT data FROM revisoes ORDER BY data DESC LIMIT 1",
  )?.data ?? null;
}

export function contarRevisoes(): number {
  return um<{ n: number }>("SELECT COUNT(*) AS n FROM revisoes")?.n ?? 0;
}

export function contarExemplos(): number {
  return (
    um<{ n: number }>(
      `SELECT
        (SELECT COUNT(*) FROM itens WHERE demo = 1) +
        (SELECT COUNT(*) FROM tarefas WHERE demo = 1) +
        (SELECT COUNT(*) FROM notas WHERE demo = 1) +
        (SELECT COUNT(*) FROM pessoas WHERE demo = 1) +
        (SELECT COUNT(*) FROM projetos WHERE demo = 1) AS n`,
    )?.n ?? 0
  );
}

export function resumoRevisao() {
  return {
    inbox: contarInbox(),
    atrasadas: tarefasAtrasadas().length,
    pessoas: contarPessoasParaRetomar(),
    projetosSemAcao: projetosSemProximaAcao().length,
    notasSemana: notasDaSemana().length,
    ultima: ultimaRevisao(),
  };
}

/* ---------- Utilidades ---------- */

export function tarefasPorProjeto(projetoId: string): Tarefa[] {
  return todos<Tarefa>(
    `SELECT * FROM tarefas WHERE projeto_id = ? AND status = 'aberta'
     ORDER BY prioridade ASC, criado_em ASC`,
    projetoId,
  );
}

export function proximasTarefas(limite = 5): Tarefa[] {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND vence_em IS NOT NULL AND vence_em >= ?
     ORDER BY vence_em ASC, prioridade ASC LIMIT ?`,
    isoDate(),
    limite,
  );
}

export function contarTarefasHoje(): number {
  return um<{ n: number }>(
    "SELECT COUNT(*) AS n FROM tarefas WHERE status = 'aberta' AND vence_em = ?",
    isoDate(),
  )?.n ?? 0;
}

export function tarefasDeHoje(): Tarefa[] {
  return todos<Tarefa>(
    `SELECT * FROM tarefas WHERE status = 'aberta' AND vence_em = ?
     ORDER BY prioridade ASC, criado_em ASC`,
    isoDate(),
  );
}

export function amanha(): string {
  return adicionarDias(1);
}
