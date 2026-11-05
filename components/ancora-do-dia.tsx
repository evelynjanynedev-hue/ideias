import Link from "next/link";
import { alternarAncora } from "@/app/actions";
import { PRATICAS, type Afirmacao } from "@/lib/presenca";
import type { Ancora } from "@/lib/types";
import { Anel } from "./ui";
import { Ico } from "./icons";

/**
 * O ritual que abre o dia: a mesma frase para a mesma data, o convite
 * explícito de estar presente e ancorar, e o pulso das práticas de hoje.
 */
export function AncoraDoDia({
  afirmacao,
  ancoras,
}: {
  afirmacao: Afirmacao;
  ancoras: Pick<Ancora, "chave" | "feito">[];
}) {
  const feitas = new Set(ancoras.filter((a) => a.feito).map((a) => a.chave));
  const total = PRATICAS.length;
  const pct = Math.round((feitas.size / total) * 100);
  const presencaFeita = feitas.has("presenca");

  return (
    <section className="anim-rise relative mb-5 overflow-hidden rounded-card border border-lilac/30 bg-gradient-to-br from-lilac/18 via-panel/80 to-panel/55 p-4 shadow-[var(--shadow-card)] md:p-5">
      <div className="pointer-events-none absolute -top-24 -right-16 h-52 w-52 rounded-full bg-lilac/10 blur-3xl" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-lilac/60" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-lilac">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-lilac/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-lilac" />
            </span>
            presença do dia · esteja presente. ancore.
          </p>

          <blockquote className="mt-2 max-w-2xl text-[17px] leading-snug font-medium tracking-tight text-cream md:text-[19px]">
            “{afirmacao.frase}”
          </blockquote>

          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-cream/75">
            <Ico nome="ancora" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lilac" />
            {afirmacao.ancora}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <div className="rounded-lg border border-line/60 bg-white/45 px-2.5 py-2">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted/70">
                pergunta de ancoragem
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-cream/80">
                {afirmacao.pergunta}
              </p>
            </div>
            <div className="rounded-lg border border-line/60 bg-white/45 px-2.5 py-2">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted/70">
                prática de hoje
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-cream/80">
                {afirmacao.pratica}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 md:w-[176px]">
          <Anel valor={pct} tom="lilas" tamanho={68} espessura={6} titulo="práticas de ancoragem de hoje">
            <span className="text-center">
              <span className="block text-sm leading-none font-semibold text-lilac tabular-nums">
                {feitas.size}/{total}
              </span>
              <span className="mt-0.5 block text-[8px] text-muted">âncoras</span>
            </span>
          </Anel>

          <div className="flex flex-wrap justify-center gap-1">
            {PRATICAS.map((p) => {
              const feito = feitas.has(p.chave);
              return (
                <span
                  key={p.chave}
                  title={`${p.titulo} · ${feito ? "feita" : "pendente"}`}
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-[8px] font-medium ${
                    feito
                      ? "border-done/40 bg-done/15 text-done"
                      : "border-line/70 bg-white/50 text-muted/60"
                  }`}
                >
                  {feito ? <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.8} /> : "·"}
                </span>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-1.5">
            <form action={alternarAncora}>
              <input type="hidden" name="chave" value="presenca" />
              <button
                type="submit"
                className={`btn w-full text-[11px] ${
                  presencaFeita
                    ? "border border-done/40 bg-done/10 text-done"
                    : "border border-lilac/35 bg-lilac/10 text-lilac hover:bg-lilac/15"
                }`}
              >
                <Ico
                  nome={presencaFeita ? "check" : "ancora"}
                  className="h-3 w-3"
                  strokeWidth={2.2}
                />
                {presencaFeita ? "presente hoje" : "estou presente"}
              </button>
            </form>
            <Link
              href="/presenca"
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-line/70 bg-white/55 px-2 py-1.5 text-[11px] font-medium text-cream/80 transition hover:border-lilac/35 hover:text-lilac"
            >
              práticas do dia
              <Ico nome="seta" className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
