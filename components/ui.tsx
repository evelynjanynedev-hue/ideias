import type { ReactNode } from "react";
import { Ico, type IconeNome } from "./icons";

export function Cabecalho({
  eyebrow,
  titulo,
  sub,
  acao,
}: {
  eyebrow?: string;
  titulo: string;
  sub?: string;
  acao?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 border-b border-line/70 pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
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
      {acao ? <div className="shrink-0">{acao}</div> : null}
    </header>
  );
}

export function Secao({
  titulo,
  acao,
  children,
  className = "",
}: {
  titulo: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {titulo}
        </h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Vazio({
  icone = "faisca",
  titulo,
  texto,
}: {
  icone?: IconeNome;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-line/80 bg-panel/40 px-5 py-8 text-center">
      <Ico nome={icone} className="mx-auto mb-2.5 h-5 w-5 text-gold/60" />
      <p className="text-sm font-medium text-cream">{titulo}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">{texto}</p>
    </div>
  );
}

const AREAS: Record<string, { label: string; classe: string }> = {
  trabalho: {
    label: "trabalho",
    classe: "border-gold/25 bg-gold/10 text-gold",
  },
  pessoal: {
    label: "pessoal",
    classe: "border-lilac/25 bg-lilac/10 text-lilac",
  },
  saude: {
    label: "saúde",
    classe: "border-sage/25 bg-sage/10 text-sage",
  },
  espiritual: {
    label: "espiritual",
    classe: "border-goldsoft/25 bg-goldsoft/10 text-goldsoft",
  },
  estudos: {
    label: "estudos",
    classe: "border-rose/25 bg-rose/10 text-rose",
  },
};

export const AREAS_DISPONIVEIS = Object.entries(AREAS).map(([valor, a]) => ({
  valor,
  label: a.label,
}));

export function AreaBadge({ area }: { area?: string | null }) {
  if (!area) return null;
  const a = AREAS[area] ?? {
    label: area,
    classe: "border-line bg-panel2 text-muted",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-5 ${a.classe}`}
    >
      {a.label}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutro",
}: {
  children: ReactNode;
  tone?: "neutro" | "ouro" | "verde" | "rosa" | "lilas";
}) {
  const tones = {
    neutro: "border-line bg-panel2/70 text-muted",
    ouro: "border-gold/25 bg-gold/10 text-gold",
    verde: "border-sage/25 bg-sage/10 text-sage",
    rosa: "border-rose/25 bg-rose/10 text-rose",
    lilas: "border-lilac/25 bg-lilac/10 text-lilac",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-5 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Progresso({ feitas, total }: { feitas: number; total: number }) {
  const pct = total > 0 ? Math.round((feitas / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-panel2">
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-muted">
        {feitas}/{total}
      </span>
    </div>
  );
}

export function Contador({ n, tom = "neutro" }: { n: number; tom?: "neutro" | "ouro" | "rosa" }) {
  const tones = {
    neutro: "text-muted",
    ouro: "text-gold",
    rosa: "text-rose",
  };
  return <span className={`text-xl font-semibold tabular-nums ${tones[tom]}`}>{n}</span>;
}
