import { todos, um, type Param } from "./db";
import { adicionarDias, isoDate } from "./format";
import { PRATICAS } from "./presenca";
import type {
  Ancora,
  Item,
  Nota,
  Pessoa,
  Pomodoro,
  ProgressoProjeto,
  ProgressoSprint,
  Projeto,
  Sprint,
  Tarefa,
} from "./types";

/* ---------- janela de um dia no fuso local ---------- */

function inicioDoDia(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia, 0, 0, 0, 0).toISOString();
}

function fimDoDia(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia + 1, 0, 0, 0, 0).toISOString();
}

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

/* ---------- Âncoras / presença ---------- */

export async function ancorasHoje(): Promise<Ancora[]> {
  return todos<Ancora>(
    "SELECT * FROM ancoras WHERE data = ? ORDER BY criado_em ASC",
    isoDate(),
  );
}

export async function contarAncorasHoje(): Promise<{ feitas: number; total: number }> {
  const linha = await um<{ feitas: number }>(
    "SELECT COUNT(*) AS feitas FROM ancoras WHERE data = ? AND feito = 1",
    isoDate(),
  );
  return { feitas: linha?.feitas ?? 0, total: PRATICAS.length };
}

export async function ancorasDaSemana(limite = 30): Promise<Ancora[]> {
  return todos<Ancora>(
    `SELECT * FROM ancoras
     WHERE data >= ? AND feito = 1
     ORDER BY data DESC, criado_em DESC LIMIT ?`,
    adicionarDias(-7),
    limite,
  );
}

/* ---------- Pomodoros / foco ---------- */

const SQL_POMODOROS = `SELECT p.*, t.titulo AS tarefa_titulo
  FROM pomodoros p
  LEFT JOIN tarefas t ON t.id = p.tarefa_id`;

export async function pomodorosHoje(limite = 40): Promise<Pomodoro[]> {
  const dia = isoDate();
  return todos<Pomodoro>(
    `${SQL_POMODOROS}
     WHERE p.concluido_em >= ? AND p.concluido_em < ?
     ORDER BY p.concluido_em DESC LIMIT ?`,
    inicioDoDia(dia),
    fimDoDia(dia),
    limite,
  );
}

export async function pomodorosDaSemana(limite = 60): Promise<Pomodoro[]> {
  return todos<Pomodoro>(
    `${SQL_POMODOROS}
     WHERE p.concluido_em >= ?
     ORDER BY p.concluido_em DESC LIMIT ?`,
    inicioDoDia(adicionarDias(-7)),
    limite,
  );
}

export async function pomodorosDaTarefa(
  tarefaId: string,
  limite = 20,
): Promise<Pomodoro[]> {
  return todos<Pomodoro>(
    `${SQL_POMODOROS}
     WHERE p.tarefa_id = ?
     ORDER BY p.concluido_em DESC LIMIT ?`,
    tarefaId,
    limite,
  );
}

export async function resumoPomodorosHoje(): Promise<{
  sessoes: number;
  minutos: number;
  pausas: number;
}> {
  const dia = isoDate();
  const inicio = inicioDoDia(dia);
  const fim = fimDoDia(dia);
  const linha = await um<{
    sessoes: number;
    minutos: number;
    pausas: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM pomodoros WHERE tipo = 'foco' AND concluido_em >= ? AND concluido_em < ?) AS sessoes,
       (SELECT COALESCE(SUM(minutos), 0) FROM pomodoros WHERE tipo = 'foco' AND concluido_em >= ? AND concluido_em < ?) AS minutos,
       (SELECT COUNT(*) FROM pomodoros WHERE tipo = 'pausa' AND concluido_em >= ? AND concluido_em < ?) AS pausas`,
    inicio,
    fim,
    inicio,
    fim,
    inicio,
    fim,
  );
  return {
    sessoes: linha?.sessoes ?? 0,
    minutos: linha?.minutos ?? 0,
    pausas: linha?.pausas ?? 0,
  };
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

/* ---------- Scrum / sprints ---------- */

export async function sprintAtiva(): Promise<Sprint | undefined> {
  return um<Sprint>(
    "SELECT * FROM sprints WHERE status = 'ativa' ORDER BY inicio DESC LIMIT 1",
  );
}

export async function listarSprints(): Promise<Sprint[]> {
  return todos<Sprint>(
    `SELECT * FROM sprints
     ORDER BY CASE status WHEN 'ativa' THEN 0 WHEN 'planejada' THEN 1 ELSE 2 END,
              inicio DESC`,
  );
}

export async function sprintsConcluidas(limite = 6): Promise<Sprint[]> {
  return todos<Sprint>(
    "SELECT * FROM sprints WHERE status = 'concluida' ORDER BY fim DESC LIMIT ?",
    limite,
  );
}

export async function sprintPorId(id: string): Promise<Sprint | undefined> {
  return um<Sprint>("SELECT * FROM sprints WHERE id = ?", id);
}

export async function tarefasDoSprint(sprintId: string): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas WHERE sprint_id = ?
     ORDER BY status ASC, prioridade ASC, criado_em ASC`,
    sprintId,
  );
}

export async function backlog(): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'aberta' AND sprint_id IS NULL
     ORDER BY prioridade ASC, criado_em ASC`,
  );
}

export async function contarBacklog(): Promise<number> {
  return (
    (
      await um<{ n: number }>(
        "SELECT COUNT(*) AS n FROM tarefas WHERE status = 'aberta' AND sprint_id IS NULL",
      )
    )?.n ?? 0
  );
}

export async function progressoSprint(sprintId: string): Promise<ProgressoSprint> {
  const linha = await um<{
    total: number;
    feitas: number;
    pontos_total: number;
    pontos_feitos: number;
  }>(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status = 'feita'), 0) AS feitas,
            COALESCE(SUM(pontos), 0) AS pontos_total,
            COALESCE(SUM(CASE WHEN status = 'feita' THEN pontos ELSE 0 END), 0) AS pontos_feitos
     FROM tarefas WHERE sprint_id = ?`,
    sprintId,
  );

  return {
    total: linha?.total ?? 0,
    feitas: linha?.feitas ?? 0,
    pontosTotal: linha?.pontos_total ?? 0,
    pontosFeitos: linha?.pontos_feitos ?? 0,
  };
}

/* ---------- Visão global ---------- */

export type ResumoGlobal = {
  inbox: number;
  atrasadas: number;
  hoje: number;
  foco: number;
  abertas: number;
  feitasHoje: number;
  rituais: number;
  pessoas: number;
  semAcao: number;
  backlog: number;
  revisouHoje: number;
  feitasSemana: number;
  ancoras: number;
};

export async function resumoGlobal(): Promise<ResumoGlobal> {
  const h = isoDate();
  const semana = adicionarDias(-7);
  const limiteContato = new Date(Date.now() - 21 * 86400000).toISOString();

  const linha = await um<{
    inbox: number;
    atrasadas: number;
    hoje: number;
    foco: number;
    abertas: number;
    feitas_hoje: number;
    rituais: number;
    pessoas: number;
    sem_acao: number;
    backlog: number;
    revisou_hoje: number;
    feitas_semana: number;
    ancoras: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM itens WHERE status = 'inbox') AS inbox,
       (SELECT COUNT(*) FROM tarefas WHERE status = 'aberta' AND vence_em IS NOT NULL AND vence_em < ?) AS atrasadas,
       (SELECT COUNT(*) FROM tarefas WHERE status = 'aberta' AND vence_em = ?) AS hoje,
       (SELECT COUNT(*) FROM tarefas WHERE status = 'aberta' AND foco = 1) AS foco,
       (SELECT COUNT(*) FROM tarefas WHERE status = 'aberta') AS abertas,
       (SELECT COUNT(*) FROM tarefas WHERE status = 'feita' AND substr(concluido_em, 1, 10) = ?) AS feitas_hoje,
       (SELECT COUNT(*) FROM rituais WHERE data = ? AND feito = 1) AS rituais,
       (SELECT COUNT(*) FROM ancoras WHERE data = ? AND feito = 1) AS ancoras,
       (SELECT COUNT(*) FROM pessoas
         WHERE (proximo_em IS NOT NULL AND proximo_em <= ?)
            OR ultimo_contato IS NULL
            OR ultimo_contato < ?) AS pessoas,
       (SELECT COUNT(*) FROM projetos
         WHERE status = 'ativo' AND (proxima_acao IS NULL OR TRIM(proxima_acao) = '')) AS sem_acao,
       (SELECT COUNT(*) FROM tarefas WHERE status = 'aberta' AND sprint_id IS NULL) AS backlog,
       (SELECT COUNT(*) FROM revisoes WHERE data = ?) AS revisou_hoje,
       (SELECT COUNT(*) FROM tarefas
         WHERE status = 'feita' AND substr(concluido_em, 1, 10) >= ?) AS feitas_semana`,
    h,
    h,
    h,
    h,
    h,
    h,
    limiteContato,
    h,
    semana,
  );

  return {
    inbox: linha?.inbox ?? 0,
    atrasadas: linha?.atrasadas ?? 0,
    hoje: linha?.hoje ?? 0,
    foco: linha?.foco ?? 0,
    abertas: linha?.abertas ?? 0,
    feitasHoje: linha?.feitas_hoje ?? 0,
    rituais: linha?.rituais ?? 0,
    pessoas: linha?.pessoas ?? 0,
    semAcao: linha?.sem_acao ?? 0,
    backlog: linha?.backlog ?? 0,
    revisouHoje: linha?.revisou_hoje ?? 0,
    feitasSemana: linha?.feitas_semana ?? 0,
    ancoras: linha?.ancoras ?? 0,
  };
}

export async function tarefasFeitasHoje(): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'feita' AND substr(concluido_em, 1, 10) = ?
     ORDER BY concluido_em DESC`,
    isoDate(),
  );
}

export async function tarefasConcluidasSemana(limite = 20): Promise<Tarefa[]> {
  return todos<Tarefa>(
    `SELECT * FROM tarefas
     WHERE status = 'feita' AND substr(concluido_em, 1, 10) >= ?
     ORDER BY concluido_em DESC LIMIT ?`,
    adicionarDias(-7),
    limite,
  );
}

export async function resumoSemana(): Promise<{
  feitas: number;
  notas: number;
  rituais: number;
  contatos: number;
  revisoes: number;
  ancoras: number;
  pomodoros: number;
  minutosFoco: number;
}> {
  const semana = adicionarDias(-7);
  const linha = await um<{
    feitas: number;
    notas: number;
    rituais: number;
    contatos: number;
    revisoes: number;
    ancoras: number;
    pomodoros: number;
    minutos_foco: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM tarefas WHERE status = 'feita' AND substr(concluido_em, 1, 10) >= ?) AS feitas,
       (SELECT COUNT(*) FROM notas WHERE criado_em >= ?) AS notas,
       (SELECT COUNT(*) FROM rituais WHERE data >= ? AND feito = 1) AS rituais,
       (SELECT COUNT(*) FROM pessoas WHERE ultimo_contato >= ?) AS contatos,
       (SELECT COUNT(*) FROM revisoes WHERE data >= ?) AS revisoes,
       (SELECT COUNT(*) FROM ancoras WHERE data >= ? AND feito = 1) AS ancoras,
       (SELECT COUNT(*) FROM pomodoros WHERE tipo = 'foco' AND concluido_em >= ?) AS pomodoros,
       (SELECT COALESCE(SUM(minutos), 0) FROM pomodoros WHERE tipo = 'foco' AND concluido_em >= ?) AS minutos_foco`,
    semana,
    semana,
    semana,
    semana,
    semana,
    semana,
    inicioDoDia(semana),
    inicioDoDia(semana),
  );

  return {
    feitas: linha?.feitas ?? 0,
    notas: linha?.notas ?? 0,
    rituais: linha?.rituais ?? 0,
    contatos: linha?.contatos ?? 0,
    revisoes: linha?.revisoes ?? 0,
    ancoras: linha?.ancoras ?? 0,
    pomodoros: linha?.pomodoros ?? 0,
    minutosFoco: linha?.minutos_foco ?? 0,
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
