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

const TONS: Record<Tom, { badge: string; tile: string; dot: string; bar: string; bg: string }> = {
  neutro: {
    badge: "border-line bg-panel2/70 text-muted",
    tile: "bg-panel2 text-muted",
    dot: "bg-muted/50",
    bar: "bg-muted/40",
    bg: "from-panel2/70 via-panel/80 to-panel/60",
  },
  ouro: {
    badge: "border-gold/25 bg-gold/10 text-gold",
    tile: "bg-gold/10 text-gold",
    dot: "bg-gold",
    bar: "bg-gold",
    bg: "from-gold/12 via-panel/80 to-panel/60",
  },
  foco: {
    badge: "border-focus/30 bg-focus/10 text-focus",
    tile: "bg-focus/12 text-focus",
    dot: "bg-focus",
    bar: "bg-focus",
    bg: "from-focus/14 via-panel/80 to-panel/60",
  },
  urgente: {
    badge: "border-urgent/30 bg-urgent/10 text-urgent",
    tile: "bg-urgent/10 text-urgent",
    dot: "bg-urgent",
    bar: "bg-urgent",
    bg: "from-urgent/12 via-panel/80 to-panel/60",
  },
  feito: {
    badge: "border-done/30 bg-done/10 text-done",
    tile: "bg-done/12 text-done",
    dot: "bg-done",
    bar: "bg-done",
    bg: "from-done/12 via-panel/80 to-panel/60",
  },
  inbox: {
    badge: "border-inbox/30 bg-inbox/10 text-inbox",
    tile: "bg-inbox/12 text-inbox",
    dot: "bg-inbox",
    bar: "bg-inbox",
    bg: "from-inbox/14 via-panel/80 to-panel/60",
  },
  pessoas: {
    badge: "border-people/30 bg-people/10 text-people",
    tile: "bg-people/12 text-people",
    dot: "bg-people",
    bar: "bg-people",
    bg: "from-people/12 via-panel/80 to-panel/60",
  },
  projetos: {
    badge: "border-projects/30 bg-projects/10 text-projects",
    tile: "bg-projects/12 text-projects",
    dot: "bg-projects",
    bar: "bg-projects",
    bg: "from-projects/12 via-panel/80 to-panel/60",
  },
  notas: {
    badge: "border-notes/30 bg-notes/10 text-notes",
    tile: "bg-notes/12 text-notes",
    dot: "bg-notes",
    bar: "bg-notes",
    bg: "from-notes/12 via-panel/80 to-panel/60",
  },
  sprint: {
    badge: "border-sprint/30 bg-sprint/10 text-sprint",
    tile: "bg-sprint/12 text-sprint",
    dot: "bg-sprint",
    bar: "bg-sprint",
    bg: "from-sprint/12 via-panel/80 to-panel/60",
  },
  revisao: {
    badge: "border-review/30 bg-review/10 text-review",
    tile: "bg-review/12 text-review",
    dot: "bg-review",
    bar: "bg-review",
    bg: "from-review/12 via-panel/80 to-panel/60",
  },
  janela: {
    badge: "border-window/30 bg-window/10 text-window",
    tile: "bg-window/12 text-window",
    dot: "bg-window",
    bar: "bg-window",
    bg: "from-window/12 via-panel/80 to-panel/60",
  },
  info: {
    badge: "border-info/30 bg-info/10 text-info",
    tile: "bg-info/12 text-info",
    dot: "bg-info",
    bar: "bg-info",
    bg: "from-info/12 via-panel/80 to-panel/60",
  },
  lilas: {
    badge: "border-lilac/30 bg-lilac/10 text-lilac",
    tile: "bg-lilac/12 text-lilac",
    dot: "bg-lilac",
    bar: "bg-lilac",
    bg: "from-lilac/12 via-panel/80 to-panel/60",
  },
  verde: {
    badge: "border-sage/30 bg-sage/10 text-sage",
    tile: "bg-sage/12 text-sage",
    dot: "bg-sage",
    bar: "bg-sage",
    bg: "from-sage/12 via-panel/80 to-panel/60",
  },
  rosa: {
    badge: "border-rose/30 bg-rose/10 text-rose",
    tile: "bg-rose/12 text-rose",
    dot: "bg-rose",
    bar: "bg-rose",
    bg: "from-rose/12 via-panel/80 to-panel/60",
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
      <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-white/45 blur-3xl" />
      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icone ? (
            <span className={`icon-tile mt-0.5 h-9 w-9 ${t.tile}`}>
              <Ico nome={icone} className="h-4 w-4" />
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
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
          {titulo}
          {typeof contagem === "number" ? (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${t.badge}`}>
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
      className={`card card-hover flex items-center gap-2.5 px-3 py-2.5 ${
        alerta ? "ring-1 ring-inset ring-gold/15" : ""
      }`}
    >
      <span className={`icon-tile h-8 w-8 ${t.tile}`}>
        <Ico nome={icone} className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[10px] uppercase tracking-[0.09em] text-muted">
          {rotulo}
        </span>
        <span
          className={`block text-lg leading-tight font-semibold tabular-nums ${
            alerta ? t.badge.split(" ").pop() : "text-cream"
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
