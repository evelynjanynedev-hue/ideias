export type Modo =
  | "revisar"
  | "soltar"
  | "inspirar"
  | "eliminar"
  | "nutrir"
  | "focar"
  | "conectar"
  | "discernir"
  | "liberar"
  | "gratidao"
  | "proteger"
  | "recolher";

export type Janela = {
  key: string;
  inicio: number;
  fim: number;
  orgao: string;
  modo: Modo;
  modoLabel: string;
  significado: string;
  acao: string;
  pratica: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

export const JANELAS: Janela[] = [
  {
    key: "23-01",
    inicio: 23,
    fim: 1,
    orgao: "Vesícula Biliar",
    modo: "revisar",
    modoLabel: "Fechar o dia",
    significado:
      "Coragem, autoestima e decisão. Se o sono não vem aqui, costuma haver julgamento demais ou escolhas pendentes.",
    acao:
      "Desligue as telas e as discussões uma hora antes. Escolha as 3 prioridades de amanhã e entregue o dia.",
    pratica: "Fechar o dia e dormir",
  },
  {
    key: "01-03",
    inicio: 1,
    fim: 3,
    orgao: "Fígado",
    modo: "soltar",
    modoLabel: "Soltar",
    significado:
      "Limpeza da raiva, frustração e ressentimento. O fígado purifica o sangue — e a alma. Acordar aqui fala de sobrecarga emocional.",
    acao:
      "Se acordar, beba água, respire devagar e mentalize o que você está liberando. Não resolva nada à noite; apenas solte.",
    pratica: "Respirar e desapegar",
  },
  {
    key: "03-05",
    inicio: 3,
    fim: 5,
    orgao: "Pulmão",
    modo: "inspirar",
    modoLabel: "Inspirar",
    significado:
      "Rege o Qi e guarda a tristeza e o luto. É a hora dos mentores: acordar aqui é um chamado para expandir a consciência.",
    acao:
      "Medite, reze ou respire conscientemente. Anote insights sem julgar. Janela boa para clareza e inspiração.",
    pratica: "Meditar e capturar insights",
  },
  {
    key: "05-07",
    inicio: 5,
    fim: 7,
    orgao: "Intestino Grosso",
    modo: "eliminar",
    modoLabel: "Eliminar",
    significado:
      "A arte de deixar ir o que não serve, física e emocionalmente. Momento de desapegar do passado.",
    acao:
      "Água morna ao acordar, corpo em movimento. Aproveite para arquivar o que travou e afirmar os caminhos abertos.",
    pratica: "Eliminar e abrir caminhos",
  },
  {
    key: "07-09",
    inicio: 7,
    fim: 9,
    orgao: "Estômago",
    modo: "nutrir",
    modoLabel: "Nutrir",
    significado:
      "Capacidade de absorver a vida, digerir ideias e situações. É o alicerce da energia do dia.",
    acao:
      "Café da manhã farto e nutritivo. Organize as metas do dia antes de abrir o mundo lá fora.",
    pratica: "Comer bem e organizar o dia",
  },
  {
    key: "09-11",
    inicio: 9,
    fim: 11,
    orgao: "Baço / Pâncreas",
    modo: "focar",
    modoLabel: "Focar",
    significado:
      "Transforma alimento em energia pura. Combate a preocupação e a ansiedade quando você está centrada.",
    acao:
      "Trabalhe na tarefa mais difícil, sem interrupção. Uma coisa por vez. Confiança se constrói fazendo.",
    pratica: "Foco profundo",
  },
  {
    key: "11-13",
    inicio: 11,
    fim: 13,
    orgao: "Coração",
    modo: "conectar",
    modoLabel: "Conectar",
    significado:
      "O Imperador do corpo, que abriga o Shen — espírito e mente. Rege a alegria, o entusiasmo e o magnetismo.",
    acao:
      "Almoce com calma e cultive pensamentos alegres. Janela para conversas sinceras, conexões e presença.",
    pratica: "Almoçar com calma e conectar",
  },
  {
    key: "13-15",
    inicio: 13,
    fim: 15,
    orgao: "Intestino Delgado",
    modo: "discernir",
    modoLabel: "Discernir",
    significado:
      "Separa o puro do impuro. É a capacidade de distinguir o que serve você do que precisa ser descartado.",
    acao:
      "Analise contratos, tome decisões e resolva dilemas. Pergunte: isso é nutritivo ou só familiar?",
    pratica: "Decidir o que fica",
  },
  {
    key: "15-17",
    inicio: 15,
    fim: 17,
    orgao: "Bexiga",
    modo: "liberar",
    modoLabel: "Liberar",
    significado:
      "Canaliza fluidos e elimina toxinas. Ligada ao medo do futuro, ciúme e rancor acumulados.",
    acao:
      "Beba água, levante-se, respire. Se o cansaço aparecer aqui, o corpo pede hidratação e pausa — não mais café.",
    pratica: "Água e pausa",
  },
  {
    key: "17-19",
    inicio: 17,
    fim: 19,
    orgao: "Rins",
    modo: "gratidao",
    modoLabel: "Gratidão",
    significado:
      "Guardam a essência vital e a força de vontade. É a transição do dia para a noite.",
    acao:
      "Reduza o ritmo. Agradeça o que já existe, valorize sua energia e feche o trabalho com segurança.",
    pratica: "Gratidão e desaceleração",
  },
  {
    key: "19-21",
    inicio: 19,
    fim: 21,
    orgao: "Pericárdio",
    modo: "proteger",
    modoLabel: "Proteger",
    significado:
      "O protetor do coração. Rege os vínculos, a alegria serena e os limites que preservam sua energia.",
    acao:
      "Desligue o trabalho. Jante leve, converse com quem faz bem e proteja sua paz — sem discussões profundas.",
    pratica: "Proteger o coração",
  },
  {
    key: "21-23",
    inicio: 21,
    fim: 23,
    orgao: "Triplo Aquecedor",
    modo: "recolher",
    modoLabel: "Recolher",
    significado:
      "Regula o corpo para o sono: baixa a temperatura, a luz e a estimulação. Prepara o terreno da madrugada.",
    acao:
      "Luz baixa, sem telas, alongamento leve. Deixe o dia pronto para amanhã e recolha-se.",
    pratica: "Recolher e dormir",
  },
];

export function janelaLabel(j: Janela): string {
  return `${pad(j.inicio)}h – ${pad(j.fim)}h`;
}

export function janelaAtual(d: Date = new Date()): Janela {
  const h = d.getHours();
  return (
    JANELAS.find((j) =>
      j.inicio < j.fim ? h >= j.inicio && h < j.fim : h >= j.inicio || h < j.fim,
    ) ?? JANELAS[5]
  );
}

export function janelaPorKey(key: string | null | undefined): Janela | undefined {
  if (!key) return undefined;
  return JANELAS.find((j) => j.key === key);
}

export function proximasJanelas(n: number, d: Date = new Date()): Janela[] {
  const atual = janelaAtual(d);
  const idx = JANELAS.findIndex((j) => j.key === atual.key);
  const out: Janela[] = [];
  for (let i = 1; i <= n; i++) {
    out.push(JANELAS[(idx + i) % JANELAS.length]);
  }
  return out;
}

export function progressoJanela(d: Date = new Date()): number {
  const j = janelaAtual(d);
  const inicio = new Date(d);
  inicio.setMinutes(0, 0, 0);
  inicio.setHours(j.inicio);
  if (inicio > d) inicio.setDate(inicio.getDate() - 1);
  const duracao = (((j.fim - j.inicio + 24) % 24) || 24) * 3600000;
  const passado = d.getTime() - inicio.getTime();
  return Math.max(0, Math.min(100, Math.round((passado / duracao) * 100)));
}

export function restanteJanela(d: Date = new Date()): string {
  const j = janelaAtual(d);
  const fim = new Date(d);
  fim.setMinutes(0, 0, 0);
  fim.setHours(j.fim);
  if (fim <= d) fim.setDate(fim.getDate() + 1);
  const min = Math.round((fim.getTime() - d.getTime()) / 60000);
  if (min <= 0) return "menos de 1 min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
