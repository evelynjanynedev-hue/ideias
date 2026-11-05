import type { Tarefa } from "./types";

/**
 * Toda tarefa tem cinco fases. Separar o tempo de cada uma evita a ilusão
 * de que "fazer" é uma coisa só — e mostra onde a decisão realmente custa.
 */
export type FaseKey =
  | "analisar"
  | "organizar"
  | "criar"
  | "executar"
  | "registrar";

export type Fase = {
  key: FaseKey;
  label: string;
  curto: string;
  descricao: string;
  pergunta: string;
  tom: "projetos" | "notas" | "ouro" | "foco" | "feito";
  cor: string;
};

export const FASES: Fase[] = [
  {
    key: "analisar",
    label: "Analisar",
    curto: "analisar",
    descricao: "Entender o problema, o contexto e o que está em jogo.",
    pergunta: "O que precisa ser verdade para isso dar certo?",
    tom: "projetos",
    cor: "#2f63a0",
  },
  {
    key: "organizar",
    label: "Organizar",
    curto: "organizar",
    descricao: "Separar o essencial, escolher a ordem e cortar o resto.",
    pergunta: "Qual é o menor caminho até o resultado?",
    tom: "notas",
    cor: "#6b52a8",
  },
  {
    key: "criar",
    label: "Criar",
    curto: "criar",
    descricao: "Produzir a primeira versão sem julgar enquanto escreve.",
    pergunta: "Qual é a versão feia que já resolve?",
    tom: "ouro",
    cor: "#9c5f2c",
  },
  {
    key: "executar",
    label: "Executar",
    curto: "executar",
    descricao: "Fazer a coisa, de preferência em uma janela só.",
    pergunta: "O que eu corto para terminar hoje?",
    tom: "foco",
    cor: "#a86f0e",
  },
  {
    key: "registrar",
    label: "Registrar",
    curto: "registrar",
    descricao: "Anotar o resultado, o aprendizado e o próximo passo.",
    pergunta: "O que ficou de concreto depois disso?",
    tom: "feito",
    cor: "#2f7d50",
  },
];

export const CAMPOS: Record<FaseKey, keyof Tarefa> = {
  analisar: "min_analisar",
  organizar: "min_organizar",
  criar: "min_criar",
  executar: "min_executar",
  registrar: "min_registrar",
};

export type Fases = Record<FaseKey, number>;

export const PRESETS: Record<"rapida" | "media" | "profunda", Fases> = {
  rapida: { analisar: 2, organizar: 3, criar: 5, executar: 10, registrar: 2 },
  media: { analisar: 5, organizar: 5, criar: 10, executar: 20, registrar: 5 },
  profunda: { analisar: 10, organizar: 5, criar: 15, executar: 30, registrar: 5 },
};

/** Tempo sugerido quando a tarefa não tem fases preenchidas. */
export function sugestaoFases(prioridade: number, foco: number): Fases {
  if (foco === 1 || prioridade === 1) return PRESETS.profunda;
  if (prioridade === 2) return PRESETS.media;
  return PRESETS.rapida;
}

export function fasesDaTarefa(
  tarefa: Pick<
    Tarefa,
    | "prioridade"
    | "foco"
    | "min_analisar"
    | "min_organizar"
    | "min_criar"
    | "min_executar"
    | "min_registrar"
  >,
): { minutos: Fases; total: number; personalizado: boolean } {
  const armazenado: Fases = {
    analisar: Number(tarefa.min_analisar ?? 0),
    organizar: Number(tarefa.min_organizar ?? 0),
    criar: Number(tarefa.min_criar ?? 0),
    executar: Number(tarefa.min_executar ?? 0),
    registrar: Number(tarefa.min_registrar ?? 0),
  };
  const total = FASES.reduce((soma, f) => soma + armazenado[f.key], 0);
  if (total > 0) return { minutos: armazenado, total, personalizado: true };
  const minutos = sugestaoFases(tarefa.prioridade, tarefa.foco);
  return {
    minutos,
    total: FASES.reduce((soma, f) => soma + minutos[f.key], 0),
    personalizado: false,
  };
}

export function duracao(minutos: number): string {
  const m = Math.max(0, Math.round(minutos));
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto === 0 ? `${h}h` : `${h}h${String(resto).padStart(2, "0")}`;
}

export type Importancia = {
  nivel: 1 | 2 | 3;
  label: string;
  tom: "urgente" | "foco" | "neutro";
  motivo: string;
};

/** Importância explícita — para não confundir “urgente” com “importante”. */
export function importancia(tarefa: Pick<Tarefa, "prioridade" | "foco" | "vence_em">): Importancia {
  if (tarefa.foco === 1) {
    return {
      nivel: 3,
      label: "importância alta",
      tom: "urgente",
      motivo: "escolhida como prioridade do dia",
    };
  }
  if (tarefa.prioridade === 1) {
    return {
      nivel: 3,
      label: "importância alta",
      tom: "urgente",
      motivo: "prioridade 1 — sustenta o resultado",
    };
  }
  if (tarefa.prioridade === 2 || tarefa.vence_em) {
    return {
      nivel: 2,
      label: "importância média",
      tom: "foco",
      motivo: tarefa.vence_em ? "tem prazo definido" : "prioridade 2",
    };
  }
  return {
    nivel: 1,
    label: "importância leve",
    tom: "neutro",
    motivo: "pode esperar sem prejuízo",
  };
}

/** Orçamento de tempo somando as fases das tarefas escolhidas. */
export function orcamento(tarefas: Tarefa[]): {
  porFase: Fases;
  total: number;
} {
  const porFase: Fases = {
    analisar: 0,
    organizar: 0,
    criar: 0,
    executar: 0,
    registrar: 0,
  };
  let total = 0;
  for (const tarefa of tarefas) {
    const { minutos, total: t } = fasesDaTarefa(tarefa);
    for (const fase of FASES) porFase[fase.key] += minutos[fase.key];
    total += t;
  }
  return { porFase, total };
}

export const DECISOES = [
  {
    tipo: "Decisão rápida",
    tempo: "até 2 min",
    regra: "Se a escolha não muda o rumo da semana, decida agora e siga.",
    exemplo: "Responder, arquivar, agendar, dizer não.",
    tom: "feito" as const,
  },
  {
    tipo: "Decisão média",
    tempo: "10 min",
    regra: "Escreva as opções, escolha uma e registre o porquê em uma frase.",
    exemplo: "Prioridade do dia, escopo de uma entrega, próximo passo de um projeto.",
    tom: "foco" as const,
  },
  {
    tipo: "Decisão estrutural",
    tempo: "30–60 min",
    regra: "Marque uma janela, defina o critério de decisão e só então escolha.",
    exemplo: "Mudar de trabalho, iniciar um projeto, encerrar uma relação.",
    tom: "urgente" as const,
  },
];
