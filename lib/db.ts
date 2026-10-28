import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { adicionarDias, agoraISO, hoje } from "./format";

const globalForDb = globalThis as unknown as { __zyraDb?: DatabaseSync };

const schema = `
CREATE TABLE IF NOT EXISTS meta (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS itens (
  id TEXT PRIMARY KEY,
  texto TEXT NOT NULL,
  fonte TEXT,
  status TEXT NOT NULL DEFAULT 'inbox',
  destino_tipo TEXT,
  destino_id TEXT,
  demo INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tarefas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  notas TEXT,
  status TEXT NOT NULL DEFAULT 'aberta',
  prioridade INTEGER NOT NULL DEFAULT 3,
  foco INTEGER NOT NULL DEFAULT 0,
  area TEXT NOT NULL DEFAULT 'pessoal',
  projeto_id TEXT,
  pessoa_id TEXT,
  janela TEXT,
  vence_em TEXT,
  criado_em TEXT NOT NULL,
  concluido_em TEXT,
  demo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notas (
  id TEXT PRIMARY KEY,
  titulo TEXT,
  corpo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'nota',
  area TEXT,
  tags TEXT,
  pessoa_id TEXT,
  projeto_id TEXT,
  criado_em TEXT NOT NULL,
  demo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pessoas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  contexto TEXT,
  area TEXT,
  email TEXT,
  telefone TEXT,
  ultimo_contato TEXT,
  proximo_passo TEXT,
  proximo_em TEXT,
  notas TEXT,
  criado_em TEXT NOT NULL,
  demo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projetos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  resultado TEXT,
  area TEXT NOT NULL DEFAULT 'trabalho',
  status TEXT NOT NULL DEFAULT 'ativo',
  proxima_acao TEXT,
  criado_em TEXT NOT NULL,
  demo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rituais (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  janela TEXT NOT NULL,
  feito INTEGER NOT NULL DEFAULT 0,
  nota TEXT,
  UNIQUE (data, janela)
);

CREATE TABLE IF NOT EXISTS revisoes (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL UNIQUE,
  criado_em TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_itens_status ON itens (status, criado_em);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas (status, vence_em);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto ON tarefas (projeto_id);
CREATE INDEX IF NOT EXISTS idx_notas_tipo ON notas (tipo, criado_em);
CREATE INDEX IF NOT EXISTS idx_rituais_data ON rituais (data);
`;

/**
 * O banco nasce vazio em produção; os dados de exemplo só entram quando
 * `ZYRA_SEED=1` ou fora de produção (desenvolvimento local).
 */
function deveSemear(): boolean {
  const flag = process.env.ZYRA_SEED?.trim().toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off") return false;
  if (flag === "1" || flag === "true" || flag === "on") return true;
  return process.env.NODE_ENV !== "production";
}

function abrir(): DatabaseSync {
  const dir = process.env.ZYRA_DATA_DIR ?? path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });

  const db = new DatabaseSync(path.join(dir, "zyra.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 4000;");
  db.exec(schema);
  if (deveSemear()) semear(db);
  return db;
}

function semear(db: DatabaseSync) {
  const marcado = db
    .prepare("SELECT valor FROM meta WHERE chave = 'seed_version'")
    .get() as { valor: string } | undefined;
  if (marcado) return;

  const agora = agoraISO();
  const tresDiasAtras = new Date(Date.now() - 3 * 86400000).toISOString();
  const cincoDiasAtras = new Date(Date.now() - 5 * 86400000).toISOString();

  const item = db.prepare(
    `INSERT OR IGNORE INTO itens (id, texto, fonte, status, demo, criado_em)
     VALUES (?, ?, ?, 'inbox', 1, ?)`,
  );
  item.run(
    "demo-item-1",
    "Transformar as janelas do relógio dos órgãos em um ritual diário dentro do app — cada faixa de 2h com uma função clara.",
    "ideia solta",
    cincoDiasAtras,
  );
  item.run(
    "demo-item-2",
    "Falar com a Ana sobre a proposta de outubro.",
    "WhatsApp",
    tresDiasAtras,
  );
  item.run(
    "demo-item-3",
    "Insight: primeiro eu, depois servir o próximo. Organizar o interno antes de entregar para fora.",
    "conversa",
    agora,
  );

  const tarefa = db.prepare(
    `INSERT OR IGNORE INTO tarefas
      (id, titulo, status, prioridade, foco, area, projeto_id, pessoa_id, janela, vence_em, criado_em, demo)
     VALUES (?, ?, 'aberta', ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
  );
  tarefa.run(
    "demo-tarefa-1",
    "Definir as 3 prioridades de amanhã",
    1,
    1,
    "pessoal",
    null,
    null,
    "23-01",
    hoje(),
    agora,
  );
  tarefa.run(
    "demo-tarefa-2",
    "Revisar a caixa de entrada e transformar em ações",
    2,
    1,
    "trabalho",
    "demo-projeto-1",
    null,
    "09-11",
    hoje(),
    agora,
  );
  tarefa.run(
    "demo-tarefa-3",
    "Mapear as janelas do dia no papel",
    2,
    0,
    "pessoal",
    "demo-projeto-1",
    null,
    "07-09",
    adicionarDias(1),
    agora,
  );
  tarefa.run(
    "demo-tarefa-4",
    "Enviar escopo revisado para Ana",
    1,
    0,
    "trabalho",
    "demo-projeto-2",
    "demo-pessoa-1",
    "11-13",
    adicionarDias(1),
    agora,
  );
  tarefa.run(
    "demo-tarefa-5",
    "Caminhar 15 minutos e beber água",
    3,
    0,
    "saude",
    null,
    null,
    "15-17",
    null,
    agora,
  );

  const nota = db.prepare(
    `INSERT OR IGNORE INTO notas (id, titulo, corpo, tipo, area, tags, criado_em, demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
  );
  nota.run(
    "demo-nota-1",
    "Primeiro eu, depois servir o próximo",
    "Organizar o interno antes de entregar para fora. Minha energia é o primeiro projeto: se eu estou inteira, o que sirvo tem qualidade. Servir não é se esvaziar — é transbordar.",
    "insight",
    "pessoal",
    "propósito, energia, limites",
    tresDiasAtras,
  );
  nota.run(
    "demo-nota-2",
    "O fluxo do app",
    "Capturar sem julgar → processar em tarefa, nota, pessoa ou projeto → escolher a janela do dia → executar → revisar. Nada fica solto na cabeça.",
    "nota",
    "pessoal",
    "método",
    cincoDiasAtras,
  );
  nota.run(
    "demo-nota-3",
    "Relógio dos órgãos — resumo",
    "12 faixas de 2h, cada uma ligada a um órgão e a uma emoção. Uso como ritmo simbólico do dia: fechar, soltar, inspirar, eliminar, nutrir, focar, conectar, discernir, liberar, agradecer, proteger, recolher.",
    "referencia",
    "espiritual",
    "tradição chinesa, ritmo",
    cincoDiasAtras,
  );

  db.prepare(
    `INSERT OR IGNORE INTO pessoas
      (id, nome, contexto, area, ultimo_contato, proximo_passo, proximo_em, notas, criado_em, demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
  ).run(
    "demo-pessoa-1",
    "Ana",
    "Consultoria — proposta de outubro",
    "trabalho",
    tresDiasAtras,
    "Enviar escopo revisado",
    hoje(),
    "Prefere alinhamentos curtos pela manhã.",
    tresDiasAtras,
  );

  const projeto = db.prepare(
    `INSERT OR IGNORE INTO projetos (id, nome, resultado, area, status, proxima_acao, criado_em, demo)
     VALUES (?, ?, ?, ?, 'ativo', ?, ?, 1)`,
  );
  projeto.run(
    "demo-projeto-1",
    "Zyra — sistema pessoal",
    "Capturar tudo, organizar sem fricção e executar o que importa.",
    "pessoal",
    "Usar o app por 7 dias e ajustar o fluxo",
    cincoDiasAtras,
  );
  projeto.run(
    "demo-projeto-2",
    "Proposta Ana",
    "Fechar o escopo de outubro e começar com clareza.",
    "trabalho",
    "Enviar escopo revisado",
    tresDiasAtras,
  );

  db.prepare("INSERT OR IGNORE INTO meta (chave, valor) VALUES ('seed_version', '1')").run();
}

export const db: DatabaseSync = globalForDb.__zyraDb ?? (globalForDb.__zyraDb = abrir());

export type Param = string | number | null;
