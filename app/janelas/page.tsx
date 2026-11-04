import Link from "next/link";
import { alternarRitual, alternarTarefa } from "@/app/actions";
import { Ico } from "@/components/icons";
import { Badge, Cabecalho } from "@/components/ui";
import {
  janelaLabel,
  JANELAS,
  janelaAtual,
  restanteJanela,
  type Modo,
} from "@/lib/janelas";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

const MODO: Record<Modo, { tile: string; barra: string; fundo: string; texto: string }> = {
  revisar: { tile: "bg-review/12 text-review", barra: "bg-review/70", fundo: "bg-review/10", texto: "text-review" },
  soltar: { tile: "bg-projects/12 text-projects", barra: "bg-projects/70", fundo: "bg-projects/10", texto: "text-projects" },
  inspirar: { tile: "bg-info/12 text-info", barra: "bg-info/70", fundo: "bg-info/10", texto: "text-info" },
  eliminar: { tile: "bg-gold/12 text-gold", barra: "bg-gold/70", fundo: "bg-gold/10", texto: "text-gold" },
  nutrir: { tile: "bg-done/12 text-done", barra: "bg-done/70", fundo: "bg-done/10", texto: "text-done" },
  focar: { tile: "bg-focus/12 text-focus", barra: "bg-focus/70", fundo: "bg-focus/10", texto: "text-focus" },
  conectar: { tile: "bg-people/12 text-people", barra: "bg-people/70", fundo: "bg-people/10", texto: "text-people" },
  discernir: { tile: "bg-sprint/12 text-sprint", barra: "bg-sprint/70", fundo: "bg-sprint/10", texto: "text-sprint" },
  liberar: { tile: "bg-info/12 text-info", barra: "bg-info/70", fundo: "bg-info/10", texto: "text-info" },
  gratidao: { tile: "bg-gold/12 text-gold", barra: "bg-gold/70", fundo: "bg-gold/10", texto: "text-gold" },
  proteger: { tile: "bg-review/12 text-review", barra: "bg-review/70", fundo: "bg-review/10", texto: "text-review" },
  recolher: { tile: "bg-notes/12 text-notes", barra: "bg-notes/70", fundo: "bg-notes/10", texto: "text-notes" },
};

export default async function JanelasPage() {
  const agora = new Date();
  const atual = janelaAtual(agora);
  const [rituais, rituaisHoje, tarefas] = await Promise.all([
    q.rituaisHoje(),
    q.contarRituaisHoje(),
    q.listarTarefasAbertas(),
  ]);
  const { feitos } = rituaisHoje;
  const cronologico = [...JANELAS].sort((a, b) => a.inicio - b.inicio);

  return (
    <div>
      <Cabecalho
        eyebrow="ritmo do dia"
        titulo="Janelas do dia"
        sub="Doze janelas, doze modos de estar. Um ritmo simbólico da medicina chinesa — não um diagnóstico."
        icone="janelas"
        tom="janela"
        acao={
          <div className="flex items-center gap-1.5">
            <Badge tone="janela">{janelaLabel(atual)} agora</Badge>
            <Badge tone="feito">{feitos}/12 rituais</Badge>
          </div>
        }
      />

      <section className="card mb-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <span className="icon-tile h-8 w-8 bg-window/12 text-window">
              <Ico nome="janelas" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-window">
                agora · {janelaLabel(atual)}
              </p>
              <p className="text-sm font-semibold tracking-tight text-cream">
                {atual.orgao} — {atual.modoLabel}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted">
            faltam <span className="font-medium text-cream/80">{restanteJanela(agora)}</span> para a
            próxima janela
          </p>
          <Link href="/" className="ml-auto text-[11px] text-window hover:underline">
            voltar para hoje →
          </Link>
        </div>

        <div className="px-3 pb-3">
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
            {cronologico.map((j) => (
              <div
                key={j.key}
                title={`${janelaLabel(j)} · ${j.orgao}`}
                className={`flex-1 transition ${MODO[j.modo].barra} ${
                  j.key === atual.key
                    ? "ring-2 ring-window ring-offset-1 ring-offset-panel"
                    : "opacity-55"
                }`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-muted/60 tabular-nums">
            <span>00h</span>
            <span>06h</span>
            <span>12h</span>
            <span>18h</span>
            <span>24h</span>
          </div>
        </div>
      </section>

      <div className="space-y-1.5">
        {JANELAS.map((j) => {
          const ativa = j.key === atual.key;
          const feito = rituais.has(j.key);
          const tarefasJanela = tarefas.filter((t) => t.janela === j.key);
          const m = MODO[j.modo];

          return (
            <article
              key={j.key}
              className={`relative grid grid-cols-1 gap-3 overflow-hidden rounded-xl border p-3 transition md:grid-cols-[96px_minmax(0,1fr)_auto] md:items-start ${
                ativa
                  ? "border-window/50 bg-gradient-to-r from-window/18 to-panel/40 shadow-[0_10px_30px_-24px_rgba(154,98,52,.8)]"
                  : "border-line/50 bg-panel/30 hover:border-line"
              }`}
            >
              <span
                className={`absolute top-2 bottom-2 left-0 w-[2.5px] rounded-full ${
                  ativa ? "bg-window" : m.barra
                } ${ativa ? "" : "opacity-50"}`}
              />

              <div className="pl-1.5">
                <p
                  className={`text-sm leading-tight font-semibold tracking-tight tabular-nums ${
                    ativa ? "text-window" : "text-cream/80"
                  }`}
                >
                  {janelaLabel(j)}
                </p>
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] ${m.tile}`}
                >
                  {j.modoLabel}
                </span>
                {ativa ? (
                  <span className="mt-1 flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-window">
                    <span className="relative flex h-1 w-1">
                      <span className="absolute inset-0 animate-ping rounded-full bg-window" />
                      <span className="relative h-1 w-1 rounded-full bg-window" />
                    </span>
                    agora
                  </span>
                ) : null}
              </div>

              <div>
                <h2 className="flex items-center gap-1.5 text-[13px] leading-tight font-semibold text-cream">
                  <span className={`h-1.5 w-1.5 rounded-full ${m.barra}`} />
                  {j.orgao}
                </h2>
                <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-muted">
                  {j.significado}
                </p>
                <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-cream/75">
                  <span className={`font-medium ${m.texto}`}>prática · </span>
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
                          className="group flex items-center gap-1.5 rounded-full border border-line bg-white/55 px-2.5 py-1 text-[11px] text-cream/75 transition hover:border-done/40 hover:text-cream"
                        >
                          <span className="flex h-3 w-3 items-center justify-center rounded-full border border-muted/50 text-transparent group-hover:border-done group-hover:bg-done group-hover:text-white">
                            <Ico nome="check" className="h-2 w-2" strokeWidth={3} />
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
                      ? "border-done/40 bg-done/10 font-medium text-done"
                      : ativa
                        ? "border-window/40 bg-window/10 text-window hover:bg-window/15"
                        : "border-line text-muted hover:border-window/40 hover:text-window"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                      feito
                        ? "border-done/60 bg-done text-white"
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
        Este mapa vem da tradição chinesa do relógio dos órgãos. Aqui ele é usado como ritmo
        simbólico e convite à pausa — não como diagnóstico nem substituto de cuidado médico. Seu
        corpo tem a última palavra.
      </p>
    </div>
  );
}
