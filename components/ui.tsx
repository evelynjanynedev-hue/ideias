import Link from "next/link";
import type { ReactNode } from "react";
import { Ico, type IconeNome } from "./icons";

/* ---------------------------------------------------------------- tons */

export type Tom =
  | "neutro"
  | "ouro"
  | "foco"
  | "urgente"
  | "feito"
  | "inbox"
  | "pessoas"
  | "projetos"
  | "notas"
  | "sprint"
  | "revisao"
  | "janela"
  | "info"
  | "lilas"
  | "verde"
  | "rosa";

type EstiloTom = {
  badge: string;
  tile: string;
  dot: string;
  bar: string;
  bg: string;
  accent: string;
  linha: string;
  texto: string;
  suave: string;
};

const TONS: Record<Tom, EstiloTom> = {
  neutro: {
    badge: "border-line bg-panel2/80 text-muted",
    tile: "bg-panel2 text-muted",
    dot: "bg-muted/50",
    bar: "bg-muted/40",
    bg: "from-panel2/80 via-panel/80 to-panel/60",
    accent: "border-l-line",
    linha: "bg-line",
    texto: "text-muted",
    suave: "bg-panel2/50",
  },
  ouro: {
    badge: "border-gold/35 bg-gold/15 text-gold",
    tile: "bg-gold/18 text-gold",
    dot: "bg-gold",
    bar: "bg-gold",
    bg: "from-gold/28 via-gold/[0.09] to-panel/45",
    accent: "border-l-gold",
    linha: "bg-gold/55",
    texto: "text-gold",
    suave: "bg-gold/[0.07]",
  },
  foco: {
    badge: "border-focus/40 bg-focus/15 text-focus",
    tile: "bg-focus/18 text-focus",
    dot: "bg-focus",
    bar: "bg-focus",
    bg: "from-focus/28 via-focus/[0.09] to-panel/45",
    accent: "border-l-focus",
    linha: "bg-focus/60",
    texto: "text-focus",
    suave: "bg-focus/[0.08]",
  },
  urgente: {
    badge: "border-urgent/40 bg-urgent/15 text-urgent",
    tile: "bg-urgent/16 text-urgent",
    dot: "bg-urgent",
    bar: "bg-urgent",
    bg: "from-urgent/28 via-urgent/[0.09] to-panel/45",
    accent: "border-l-urgent",
    linha: "bg-urgent/60",
    texto: "text-urgent",
    suave: "bg-urgent/[0.07]",
  },
  feito: {
    badge: "border-done/40 bg-done/15 text-done",
    tile: "bg-done/16 text-done",
    dot: "bg-done",
    bar: "bg-done",
    bg: "from-done/28 via-done/[0.09] to-panel/45",
    accent: "border-l-done",
    linha: "bg-done/60",
    texto: "text-done",
    suave: "bg-done/[0.07]",
  },
  inbox: {
    badge: "border-inbox/40 bg-inbox/15 text-inbox",
    tile: "bg-inbox/16 text-inbox",
    dot: "bg-inbox",
    bar: "bg-inbox",
    bg: "from-inbox/28 via-inbox/[0.09] to-panel/45",
    accent: "border-l-inbox",
    linha: "bg-inbox/60",
    texto: "text-inbox",
    suave: "bg-inbox/[0.08]",
  },
  pessoas: {
    badge: "border-people/40 bg-people/15 text-people",
    tile: "bg-people/16 text-people",
    dot: "bg-people",
    bar: "bg-people",
    bg: "from-people/28 via-people/[0.09] to-panel/45",
    accent: "border-l-people",
    linha: "bg-people/60",
    texto: "text-people",
    suave: "bg-people/[0.07]",
  },
  projetos: {
    badge: "border-projects/40 bg-projects/15 text-projects",
    tile: "bg-projects/16 text-projects",
    dot: "bg-projects",
    bar: "bg-projects",
    bg: "from-projects/28 via-projects/[0.09] to-panel/45",
    accent: "border-l-projects",
    linha: "bg-projects/60",
    texto: "text-projects",
    suave: "bg-projects/[0.07]",
  },
  notas: {
    badge: "border-notes/40 bg-notes/15 text-notes",
    tile: "bg-notes/16 text-notes",
    dot: "bg-notes",
    bar: "bg-notes",
    bg: "from-notes/28 via-notes/[0.09] to-panel/45",
    accent: "border-l-notes",
    linha: "bg-notes/60",
    texto: "text-notes",
    suave: "bg-notes/[0.07]",
  },
  sprint: {
    badge: "border-sprint/40 bg-sprint/15 text-sprint",
    tile: "bg-sprint/16 text-sprint",
    dot: "bg-sprint",
    bar: "bg-sprint",
    bg: "from-sprint/28 via-sprint/[0.09] to-panel/45",
    accent: "border-l-sprint",
    linha: "bg-sprint/60",
    texto: "text-sprint",
    suave: "bg-sprint/[0.07]",
  },
  revisao: {
    badge: "border-review/40 bg-review/15 text-review",
    tile: "bg-review/16 text-review",
    dot: "bg-review",
    bar: "bg-review",
    bg: "from-review/28 via-review/[0.09] to-panel/45",
    accent: "border-l-review",
    linha: "bg-review/60",
    texto: "text-review",
    suave: "bg-review/[0.07]",
  },
  janela: {
    badge: "border-window/40 bg-window/15 text-window",
    tile: "bg-window/16 text-window",
    dot: "bg-window",
    bar: "bg-window",
    bg: "from-window/28 via-window/[0.09] to-panel/45",
    accent: "border-l-window",
    linha: "bg-window/60",
    texto: "text-window",
    suave: "bg-window/[0.07]",
  },
  info: {
    badge: "border-info/40 bg-info/15 text-info",
    tile: "bg-info/16 text-info",
    dot: "bg-info",
    bar: "bg-info",
    bg: "from-info/28 via-info/[0.09] to-panel/45",
    accent: "border-l-info",
    linha: "bg-info/60",
    texto: "text-info",
    suave: "bg-info/[0.07]",
  },
  lilas: {
    badge: "border-lilac/40 bg-lilac/15 text-lilac",
    tile: "bg-lilac/16 text-lilac",
    dot: "bg-lilac",
    bar: "bg-lilac",
    bg: "from-lilac/28 via-lilac/[0.09] to-panel/45",
    accent: "border-l-lilac",
    linha: "bg-lilac/60",
    texto: "text-lilac",
    suave: "bg-lilac/[0.07]",
  },
  verde: {
    badge: "border-sage/40 bg-sage/15 text-sage",
    tile: "bg-sage/16 text-sage",
    dot: "bg-sage",
    bar: "bg-sage",
    bg: "from-sage/28 via-sage/[0.09] to-panel/45",
    accent: "border-l-sage",
    linha: "bg-sage/60",
    texto: "text-sage",
    suave: "bg-sage/[0.07]",
  },
  rosa: {
    badge: "border-rose/40 bg-rose/15 text-rose",
    tile: "bg-rose/16 text-rose",
    dot: "bg-rose",
    bar: "bg-rose",
    bg: "from-rose/28 via-rose/[0.09] to-panel/45",
    accent: "border-l-rose",
    linha: "bg-rose/60",
    texto: "text-rose",
    suave: "bg-rose/[0.07]",
  },
};

const HEX: Record<Tom, string> = {
  neutro: "#8d8577",
  ouro: "#9a6234",
  foco: "#9a6a16",
  urgente: "#b0463f",
  feito: "#3f7a56",
  inbox: "#b0552e",
  pessoas: "#2c736d",
  projetos: "#3a6398",
  notas: "#6f5c9e",
  sprint: "#5457a3",
  revisao: "#9c4c61",
  janela: "#9a6234",
  info: "#3f7288",
  lilas: "#7865a8",
  verde: "#4f7d5e",
  rosa: "#b0505f",
};

/* ------------------------------------------------------------ cabeçalho */

export function Cabecalho({
  eyebrow,
  titulo,
  sub,
  acao,
  icone,
  tom = "ouro",
}: {
  eyebrow?: string;
  titulo: string;
  sub?: string;
  acao?: ReactNode;
  icone?: IconeNome;
  tom?: Tom;
}) {
  const t = TONS[tom];
  return (
    <header
      className={`anim-rise relative mb-5 overflow-hidden rounded-card border border-line/80 bg-gradient-to-br ${t.bg} px-4 py-4 md:px-5`}
    >
      <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
      <span className={`pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] ${t.linha}`} />
      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icone ? (
            <span className={`icon-tile mt-0.5 h-10 w-10 shadow-sm ${t.tile}`}>
              <Ico nome={icone} className="h-[18px] w-[18px]" />
            </span>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-cream md:text-[26px]">
              {titulo}
            </h1>
            {sub ? (
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">{sub}</p>
            ) : null}
          </div>
        </div>
        {acao ? <div className="shrink-0">{acao}</div> : null}
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- seção */

export function Secao({
  titulo,
  acao,
  children,
  className = "",
  tom = "neutro",
  contagem,
}: {
  titulo: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
  tom?: Tom;
  contagem?: number;
}) {
  const t = TONS[tom];
  return (
    <section className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2
          className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${t.texto}`}
        >
          <span className={`h-2 w-2 rounded-full ring-2 ring-white/70 ${t.dot}`} />
          {titulo}
          {typeof contagem === "number" ? (
            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] tabular-nums ${t.badge}`}>
              {contagem}
            </span>
          ) : null}
        </h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

/* --------------------------------------------------------------- vazio */

export function Vazio({
  icone = "faisca",
  titulo,
  texto,
  tom = "ouro",
  acao,
}: {
  icone?: IconeNome;
  titulo: string;
  texto: string;
  tom?: Tom;
  acao?: ReactNode;
}) {
  const t = TONS[tom];
  return (
    <div className="rounded-card border border-dashed border-line/90 bg-panel/45 px-5 py-8 text-center">
      <span className={`icon-tile mx-auto mb-3 h-10 w-10 rounded-xl ${t.tile}`}>
        <Ico nome={icone} className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-cream">{titulo}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">{texto}</p>
      {acao ? <div className="mt-3 flex justify-center">{acao}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------- áreas */

const AREAS: Record<string, { label: string; tom: Tom }> = {
  trabalho: { label: "trabalho", tom: "ouro" },
  pessoal: { label: "pessoal", tom: "notas" },
  saude: { label: "saúde", tom: "feito" },
  espiritual: { label: "espiritual", tom: "sprint" },
  estudos: { label: "estudos", tom: "info" },
};

export const AREAS_DISPONIVEIS = Object.entries(AREAS).map(([valor, a]) => ({
  valor,
  label: a.label,
}));

export function tomArea(area?: string | null): Tom {
  return AREAS[area ?? ""]?.tom ?? "neutro";
}

export function AreaBadge({ area }: { area?: string | null }) {
  if (!area) return null;
  const a = AREAS[area];
  const t = TONS[a?.tom ?? "neutro"];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-5 ${t.badge}`}
    >
      {a?.label ?? area}
    </span>
  );
}

/* -------------------------------------------------------------- badges */

export function Badge({
  children,
  tone = "neutro",
}: {
  children: ReactNode;
  tone?: Tom;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-5 ${TONS[tone].badge}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ progresso */

export function Progresso({
  feitas,
  total,
  tom = "ouro",
  mostrarPct = true,
}: {
  feitas: number;
  total: number;
  tom?: Tom;
  mostrarPct?: boolean;
}) {
  const pct = total > 0 ? Math.round((feitas / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-panel2">
        <div
          className={`h-full rounded-full ${TONS[tom].bar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-muted tabular-nums">
        {feitas}/{total}
        {mostrarPct ? <span className="ml-1 text-muted/60">· {pct}%</span> : null}
      </span>
    </div>
  );
}

export function Anel({
  valor,
  tamanho = 58,
  espessura = 5,
  tom = "ouro",
  children,
  titulo,
}: {
  valor: number;
  tamanho?: number;
  espessura?: number;
  tom?: Tom;
  children?: ReactNode;
  titulo?: string;
}) {
  const pct = Math.max(0, Math.min(100, valor));
  const raio = (tamanho - espessura) / 2;
  const circ = 2 * Math.PI * raio;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: tamanho, height: tamanho }}
      title={titulo}
    >
      <svg width={tamanho} height={tamanho} className="-rotate-90" aria-hidden="true">
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="#eae2d3"
          strokeWidth={espessura}
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={HEX[tom]}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">{children}</span>
    </span>
  );
}

/* ----------------------------------------------------------------- kpi */

export function Kpi({
  href,
  icone,
  rotulo,
  valor,
  detalhe,
  tom = "neutro",
  alerta = false,
}: {
  href: string;
  icone: IconeNome;
  rotulo: string;
  valor: number | string;
  detalhe?: string;
  tom?: Tom;
  alerta?: boolean;
}) {
  const t = TONS[tom];
  return (
    <Link
      href={href}
      className={`card card-hover relative flex items-center gap-2.5 overflow-hidden border-l-4 px-3 py-2.5 ${t.accent} bg-gradient-to-br ${t.bg} ${
        alerta ? "shadow-[0_10px_26px_-22px_rgba(63,52,38,0.65)]" : ""
      }`}
    >
      <span className={`icon-tile h-9 w-9 shadow-sm ${t.tile}`}>
        <Ico nome={icone} className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className={`block truncate text-[10px] font-medium uppercase tracking-[0.09em] ${t.texto}`}>
          {rotulo}
        </span>
        <span
          className={`block text-lg leading-tight font-semibold tabular-nums ${
            alerta ? t.texto : "text-cream"
          }`}
        >
          {valor}
        </span>
        {detalhe ? (
          <span className="block truncate text-[10px] text-muted/70">{detalhe}</span>
        ) : null}
      </span>
    </Link>
  );
}

export function Contador({ n, tom = "neutro" }: { n: number; tom?: Tom }) {
  const t = TONS[tom];
  return (
    <span className={`text-xl font-semibold tabular-nums ${t.badge.split(" ").pop()}`}>
      {n}
    </span>
  );
}

export { TONS as TONS_UI };
