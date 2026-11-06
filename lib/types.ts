export type Item = {
  id: string;
  texto: string;
  fonte: string | null;
  status: "inbox" | "processado" | "arquivado";
  destino_tipo: string | null;
  destino_id: string | null;
  demo: number;
  criado_em: string;
};

export type Tarefa = {
  id: string;
  titulo: string;
  notas: string | null;
  status: "aberta" | "feita";
  prioridade: number;
  foco: number;
  area: string;
  projeto_id: string | null;
  pessoa_id: string | null;
  janela: string | null;
  vence_em: string | null;
  sprint_id: string | null;
  pontos: number;
  min_analisar: number;
  min_organizar: number;
  min_criar: number;
  min_executar: number;
  min_registrar: number;
  resultado: string | null;
  criado_em: string;
  concluido_em: string | null;
  demo: number;
};

export type Ancora = {
  id: string;
  data: string;
  chave: string;
  texto: string | null;
  feito: number;
  criado_em: string;
};

export type Pomodoro = {
  id: string;
  tarefa_id: string | null;
  fase: string;
  tipo: "foco" | "pausa";
  minutos: number;
  iniciado_em: string;
  concluido_em: string;
  demo: number;
  tarefa_titulo?: string | null;
};

export type Nota = {
  id: string;
  titulo: string | null;
  corpo: string;
  tipo: "nota" | "insight" | "referencia";
  area: string | null;
  tags: string | null;
  pessoa_id: string | null;
  projeto_id: string | null;
  criado_em: string;
  demo: number;
};

export type Pessoa = {
  id: string;
  nome: string;
  contexto: string | null;
  area: string | null;
  email: string | null;
  telefone: string | null;
  ultimo_contato: string | null;
  proximo_passo: string | null;
  proximo_em: string | null;
  notas: string | null;
  criado_em: string;
  demo: number;
};

export type Projeto = {
  id: string;
  nome: string;
  resultado: string | null;
  area: string;
  status: "ativo" | "pausado" | "concluido";
  proxima_acao: string | null;
  criado_em: string;
  demo: number;
};

export type Ritual = {
  id: string;
  data: string;
  janela: string;
  feito: number;
  nota: string | null;
};

export type ProgressoProjeto = {
  projeto_id: string;
  total: number;
  feitas: number;
};

export type Sprint = {
  id: string;
  nome: string;
  objetivo: string | null;
  inicio: string;
  fim: string;
  status: "planejada" | "ativa" | "concluida";
  retrospectiva: string | null;
  criado_em: string;
  demo: number;
};

export type ProgressoSprint = {
  total: number;
  feitas: number;
  pontosTotal: number;
  pontosFeitos: number;
};
