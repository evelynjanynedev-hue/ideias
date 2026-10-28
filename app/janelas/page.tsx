import Link from "next/link";
import { alternarRitual, alternarTarefa } from "@/app/actions";
import { Ico } from "@/components/icons";
import { Cabecalho } from "@/components/ui";
import { janelaLabel, JANELAS, janelaAtual, restanteJanela } from "@/lib/janelas";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function JanelasPage() {
  const agora = new Date();
  const atual = janelaAtual(agora);
  const [rituais, rituaisHoje, tarefas] = await Promise.all([
    q.rituaisHoje(),
    q.contarRituaisHoje(),
    q.listarTarefasAbertas(),
  ]);
  const { feitos } = rituaisHoje;

  return (
    <div>
      <Cabecalho
        eyebrow="ritmo do dia"
        titulo="Janelas do dia"
        sub="Doze janelas, doze modos de estar. Um ritmo simbólico da medicina chinesa — não um diagnóstico."
        acao={
          <span className="chip">
            {feitos}/12 rituais · {janelaLabel(atual)}
          </span>
        }
      />

      <section className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-card border border-gold/25 bg-gold/[0.06] px-3 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-gold/30 text-gold">
            <Ico nome="janelas" className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-gold/70">
              agora · {janelaLabel(atual)}
            </p>
            <p className="text-sm font-semibold tracking-tight text-cream">
              {atual.orgao} — {atual.modoLabel}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-muted">
          faltam <span className="text-cream/80">{restanteJanela(agora)}</span> para
          a próxima janela
        </p>
        <Link href="/" className="ml-auto text-[11px] text-gold/80 hover:text-gold">
          voltar para hoje →
        </Link>
      </section>

      <div className="space-y-1.5">
        {JANELAS.map((j) => {
          const ativa = j.key === atual.key;
          const feito = rituais.has(j.key);
          const tarefasJanela = tarefas.filter((t) => t.janela === j.key);

          return (
            <article
              key={j.key}
              className={`grid grid-cols-1 gap-3 rounded-lg border p-3 transition md:grid-cols-[84px_minmax(0,1fr)_auto] md:items-start ${
                ativa
                  ? "border-gold/40 bg-gradient-to-r from-gold/[0.08] to-transparent"
                  : "border-line/50 bg-panel/25"
              }`}
            >
              <div>
                <p
                  className={`text-sm leading-tight font-semibold tracking-tight ${
                    ativa ? "text-gold" : "text-cream/80"
                  }`}
                >
                  {janelaLabel(j)}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted/70">
                  {j.modoLabel}
                </p>
                {ativa ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-gold">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-gold" />
                    agora
                  </span>
                ) : null}
              </div>

              <div>
                <h2 className="text-[13px] leading-tight font-semibold text-cream">
                  {j.orgao}
                </h2>
                <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-muted">
                  {j.significado}
                </p>
                <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-cream/75">
                  <span className="text-gold/70">prática · </span>
                  {j.acao}
                </p>

                {tarefasJanela.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {tarefasJanela.map((t) => (
                      <form key={t.id} action={alternarTarefa}>
                        <input type="hidden" name="id" value={t.id} />
                        <button
                          type="submit"
                          title="Concluir tarefa"
                          className="group flex items-center gap-1.5 rounded-full border border-line bg-white/55 px-2.5 py-1 text-[11px] text-cream/75 transition hover:border-gold/30 hover:text-cream"
                        >
                          <span className="flex h-3 w-3 items-center justify-center rounded-full border border-muted/50 text-transparent group-hover:border-gold group-hover:text-gold/70">
                            <Ico nome="check" className="h-2 w-2" strokeWidth={2.8} />
                          </span>
                          <span className="max-w-[220px] truncate">{t.titulo}</span>
                        </button>
                      </form>
                    ))}
                  </div>
                ) : null}
              </div>

              <form action={alternarRitual} className="md:pt-1">
                <input type="hidden" name="janela" value={j.key} />
                <button
                  type="submit"
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] transition ${
                    feito
                      ? "border-sage/40 bg-sage/10 text-sage"
                      : "border-line text-muted hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                      feito
                        ? "border-sage/60 bg-sage/20 text-sage"
                        : "border-muted/40 text-transparent"
                    }`}
                  >
                    <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.8} />
                  </span>
                  {feito ? "feito" : "marcar"}
                </button>
              </form>
            </article>
          );
        })}
      </div>

      <p className="mt-4 max-w-3xl px-1 text-[10px] leading-relaxed text-muted/60">
        Este mapa vem da tradição chinesa do relógio dos órgãos. Aqui ele é usado
        como ritmo simbólico e convite à pausa — não como diagnóstico nem
        substituto de cuidado médico. Seu corpo tem a última palavra.
      </p>
    </div>
  );
}
