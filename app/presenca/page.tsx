import Link from "next/link";
import {
  alternarAncora,
  criarNota,
  salvarAncora,
} from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { FasesTarefa } from "@/components/fases-tarefa";
import { Ico } from "@/components/icons";
import { Pomodoro } from "@/components/pomodoro";
import { Anel, Cabecalho, Progresso, Secao } from "@/components/ui";
import { dataCurta, diaSemanaLongo, hoje } from "@/lib/format";
import {
  afirmacaoDoDia,
  indiceDoDia,
  PRATICAS,
  type Pratica,
} from "@/lib/presenca";
import { DECISOES, FASES, PRESETS, duracao, orcamento } from "@/lib/tempo";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

const TILE_PRATICA: Record<Pratica["tom"], string> = {
  janela: "bg-window/12 text-window",
  foco: "bg-focus/12 text-focus",
  feito: "bg-done/12 text-done",
  ouro: "bg-gold/12 text-gold",
  revisao: "bg-review/12 text-review",
  notas: "bg-notes/12 text-notes",
};

function CartaoPratica({
  pratica,
  feito,
  texto,
}: {
  pratica: Pratica;
  feito: boolean;
  texto: string | null;
}) {
  return (
    <article
      className={`card relative overflow-hidden p-3 ${
        feito ? "border-done/35 bg-done/[0.04]" : ""
      }`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-[2px] ${
          feito ? "bg-done/60" : "bg-line"
        }`}
      />
      <div className="flex items-start gap-2.5">
        <span
          className={`icon-tile h-8 w-8 shrink-0 ${
            feito ? "bg-done/15 text-done" : TILE_PRATICA[pratica.tom]
          }`}
        >
          <Ico
            nome={
              pratica.chave === "gratidao"
                ? "coracao"
                : pratica.chave === "perdao"
                  ? "balanca"
                  : pratica.chave === "corpo"
                    ? "mao"
                    : pratica.chave === "intencao"
                      ? "faisca"
                      : "ancora"
            }
            className="h-4 w-4"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-cream">{pratica.titulo}</p>
          <p className="text-[10px] text-muted/70">{pratica.subtitulo}</p>
        </div>
        <span
          className={`chip shrink-0 ${
            feito
              ? "border-done/30 bg-done/10 text-done"
              : "border-line/70 bg-white/45 text-muted"
          }`}
        >
          {feito ? (
            <>
              <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.8} />
              feita
            </>
          ) : (
            "pendente"
          )}
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted">{pratica.descricao}</p>

      {pratica.campo === "texto" ? (
        <>
          <form action={salvarAncora} className="mt-2">
            <input type="hidden" name="chave" value={pratica.chave} />
            <textarea
              name="texto"
              rows={3}
              defaultValue={texto ?? ""}
              placeholder={pratica.placeholder}
              className="field resize-y text-[11px] leading-relaxed"
            />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[9px] text-muted/60">
                salvar marca a prática como feita
              </span>
              <BotaoEnviar className="btn-ghost h-7 px-2 text-[10px]">
                <Ico nome="check" className="h-3 w-3" />
                salvar
              </BotaoEnviar>
            </div>
          </form>
          {feito ? (
            <form action={alternarAncora} className="mt-1">
              <input type="hidden" name="chave" value={pratica.chave} />
              <button
                type="submit"
                className="text-[9px] text-muted/60 underline-offset-2 hover:text-rose hover:underline"
              >
                desmarcar hoje
              </button>
            </form>
          ) : null}
        </>
      ) : (
        <form action={alternarAncora} className="mt-2">
          <input type="hidden" name="chave" value={pratica.chave} />
          <button
            type="submit"
            className={`btn h-7 w-full text-[10px] ${
              feito
                ? "border border-done/40 bg-done/10 text-done"
                : "border border-line/70 bg-white/55 text-cream/80 hover:border-lilac/35 hover:text-lilac"
            }`}
          >
            <Ico
              nome={feito ? "check" : "ancora"}
              className="h-3 w-3"
              strokeWidth={2.2}
            />
            {feito ? "feita hoje" : `fazer · ${pratica.minutos} min`}
          </button>
        </form>
      )}
    </article>
  );
}

function horaCurta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PresencaPage() {
  const agora = new Date();
  const afirmacao = afirmacaoDoDia(agora);

  const [ancoras, foco, tarefasHoje, abertas, pomodorosHoje] = await Promise.all([
    q.ancorasHoje(),
    q.tarefasFoco(),
    q.tarefasDeHoje(),
    q.listarTarefasAbertas(),
    q.pomodorosHoje(),
  ]);

  const porChave = new Map(ancoras.map((a) => [a.chave, a]));
  const feitas = ancoras.filter((a) => a.feito).length;
  const pct = Math.round((feitas / PRATICAS.length) * 100);
  const escolhidas = foco.length > 0 ? foco : tarefasHoje;
  const tempo = orcamento(escolhidas);
  const maiorFase = FASES.reduce(
    (maior, fase) => (tempo.porFase[fase.key] > tempo.porFase[maior.key] ? fase : maior),
    FASES[0],
  );
  const focoHoje = pomodorosHoje.filter((s) => s.tipo === "foco");
  const minutosFocoHoje = focoHoje.reduce((soma, s) => soma + s.minutos, 0);
  const sessoesHoje = pomodorosHoje.length;

  return (
    <div>
      <Cabecalho
        eyebrow={`${diaSemanaLongo(agora)} · presença`}
        titulo="Esteja presente. Ancora."
        sub="Clareza, rumo e ritmo. Antes de executar, volte ao corpo. Depois, dê a cada decisão o tempo que ela merece."
        icone="ancora"
        tom="lilas"
        acao={
          <div className="flex items-center gap-1.5">
            <span className="chip border-lilac/30 bg-lilac/10 text-lilac">
              <Ico nome="coracao" className="h-3 w-3" />
              gratidão &amp; perdão
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="relative overflow-hidden rounded-card border border-lilac/30 bg-gradient-to-br from-lilac/20 via-panel/80 to-panel/55 p-4 shadow-[var(--shadow-card)] md:p-5">
          <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-lilac/10 blur-3xl" />
          <p className="relative flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-lilac">
            <Ico nome="faisca" className="h-3 w-3" />
            afirmação de hoje · ciclo {indiceDoDia(agora) + 1}/31
          </p>
          <blockquote className="relative mt-2 text-[22px] leading-tight font-semibold tracking-tight text-cream md:text-[26px]">
            “{afirmacao.frase}”
          </blockquote>
          <p className="relative mt-3 flex items-start gap-2 rounded-xl border border-lilac/20 bg-white/50 px-3 py-2.5 text-xs leading-relaxed text-cream/80">
            <Ico nome="ancora" className="mt-0.5 h-4 w-4 shrink-0 text-lilac" />
            {afirmacao.ancora}
          </p>
          <div className="relative mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-line/60 bg-white/45 px-3 py-2">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted/70">
                pergunte-se
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-cream/80">
                {afirmacao.pergunta}
              </p>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/45 px-3 py-2">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted/70">
                faça agora
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-cream/80">
                {afirmacao.pratica}
              </p>
            </div>
          </div>
        </section>

        <section className="card flex flex-col items-center justify-center gap-2 p-4">
          <Anel valor={pct} tom="lilas" tamanho={96} espessura={8} titulo="práticas feitas hoje">
            <span className="text-center">
              <span className="block text-xl leading-none font-semibold text-lilac tabular-nums">
                {feitas}/{PRATICAS.length}
              </span>
              <span className="mt-1 block text-[9px] text-muted">práticas</span>
            </span>
          </Anel>
          <p className="text-center text-[11px] leading-relaxed text-muted">
            {feitas === 0
              ? "Comece pela presença: 1 minuto, pés no chão, uma respiração."
              : feitas === PRATICAS.length
                ? "Você ancorou o dia inteiro. Isso é ritmo, não performance."
                : `Faltam ${PRATICAS.length - feitas} para fechar a âncora de hoje.`}
          </p>
          <Progresso feitas={feitas} total={PRATICAS.length} tom="lilas" />
          <div className="mt-1 grid w-full grid-cols-3 gap-1">
            {PRATICAS.map((p) => {
              const feito = porChave.get(p.chave)?.feito === 1;
              return (
                <span
                  key={p.chave}
                  className={`rounded-md border px-1 py-1 text-center text-[8.5px] leading-tight ${
                    feito
                      ? "border-done/30 bg-done/10 text-done"
                      : "border-line/60 bg-white/40 text-muted/70"
                  }`}
                >
                  {p.titulo}
                </span>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-5">
        <Secao
          titulo="Práticas de ancoragem"
          tom="lilas"
          contagem={feitas}
          acao={
            <span className="text-[10px] text-muted/70">
              presença · respiração · corpo · gratidão · perdão · intenção
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {PRATICAS.map((pratica) => {
              const ancora = porChave.get(pratica.chave);
              return (
                <CartaoPratica
                  key={pratica.chave}
                  pratica={pratica}
                  feito={ancora?.feito === 1}
                  texto={ancora?.texto ?? null}
                />
              );
            })}
          </div>
        </Secao>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Secao
            titulo="As cinco fases de qualquer decisão"
            tom="notas"
            acao={
              <span className="text-[10px] text-muted/70">
                tempo não é uma coisa só
              </span>
            }
          >
            <div className="card divide-y divide-line/40 overflow-hidden">
              {FASES.map((fase, i) => (
                <div key={fase.key} className="flex items-start gap-3 px-3 py-2.5">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: fase.cor }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-xs font-semibold text-cream">{fase.label}</p>
                      <span className="text-[10px] text-muted/70">
                        {duracao(PRESETS.media[fase.key])} no ritmo médio
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                      {fase.descricao}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-cream/65">
                      <span className="text-muted/60">pergunta: </span>
                      {fase.pergunta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {(["rapida", "media", "profunda"] as const).map((nome) => {
                const preset = PRESETS[nome];
                const total = FASES.reduce((soma, f) => soma + preset[f.key], 0);
                return (
                  <div
                    key={nome}
                    className="rounded-lg border border-line/60 bg-white/45 px-2 py-1.5"
                  >
                    <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted/70">
                      {nome === "rapida" ? "rápida" : nome === "media" ? "média" : "profunda"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-cream/75 tabular-nums">
                      {FASES.map((f) => duracao(preset[f.key])).join(" · ")}
                    </p>
                    <p className="text-[9px] text-muted/60">total {duracao(total)}</p>
                  </div>
                );
              })}
            </div>
          </Secao>

          <Secao titulo="Quanto tempo vale cada decisão" tom="foco">
            <div className="space-y-1.5">
              {DECISOES.map((d) => (
                <div
                  key={d.tipo}
                  className="card flex items-start gap-2.5 border-l-4 border-l-focus/50 px-3 py-2.5"
                >
                  <span className="icon-tile h-8 w-8 shrink-0 bg-focus/12 text-focus">
                    <Ico nome="ampulheta" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-xs font-semibold text-cream">{d.tipo}</p>
                      <span className="chip border-focus/25 bg-focus/10 text-focus">
                        {d.tempo}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-cream/75">{d.regra}</p>
                    <p className="mt-0.5 text-[10px] text-muted/70">{d.exemplo}</p>
                  </div>
                </div>
              ))}
            </div>
          </Secao>
        </div>

        <div className="min-w-0 space-y-5">
          <Secao
            titulo="Relógio de foco"
            tom="foco"
            acao={
              <span className="text-[10px] text-muted/70">
                pomodoro por fase
              </span>
            }
          >
            <Pomodoro tarefas={abertas} sessoes={pomodorosHoje} />
          </Secao>

          <Secao
            titulo="Sessões de hoje"
            tom="feito"
            contagem={focoHoje.length}
            acao={
              <span className="text-[10px] text-muted/70">
                {duracao(minutosFocoHoje)} de foco
              </span>
            }
          >
            {sessoesHoje === 0 ? (
              <div className="card flex items-center gap-3 px-3 py-3">
                <span className="icon-tile h-8 w-8 bg-done/10 text-done/70">
                  <Ico nome="ampulheta" className="h-4 w-4" />
                </span>
                <p className="text-[11px] leading-relaxed text-muted">
                  Nenhuma sessão concluída hoje. Inicie o relógio acima e o histórico
                  aparece aqui.
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <ul className="divide-y divide-line/40">
                  {pomodorosHoje.map((s) => {
                    const fase = FASES.find((f) => f.key === s.fase);
                    const pausa = s.tipo === "pausa";
                    const cor = pausa ? "#2f7089" : (fase?.cor ?? "#8b8377");
                    const rotulo = pausa ? "pausa" : (fase?.curto ?? s.fase);
                    return (
                      <li
                        key={s.id}
                        className="flex items-center gap-2 px-3 py-2"
                      >
                        <span
                          className="shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em]"
                          style={{
                            borderColor: `${cor}44`,
                            backgroundColor: `${cor}12`,
                            color: cor,
                          }}
                        >
                          {rotulo}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs text-cream/80">
                          {s.tarefa_titulo || "tempo livre"}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted/70 tabular-nums">
                          {s.minutos} min
                        </span>
                        <span className="w-9 shrink-0 text-right text-[10px] text-muted/45 tabular-nums">
                          {horaCurta(s.concluido_em)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Secao>

          <Secao
            titulo="Tempo do dia"
            tom="janela"
            acao={
              <Link href="/tarefas" className="link-quiet text-[11px]">
                ajustar tarefas →
              </Link>
            }
          >
            <div className="card p-3">
              <div className="flex items-center gap-3">
                <Anel
                  valor={Math.min(100, (tempo.total / 240) * 100)}
                  tom="janela"
                  tamanho={54}
                  espessura={5}
                  titulo="tempo estimado do dia"
                >
                  <span className="text-[10px] font-semibold text-window tabular-nums">
                    {duracao(tempo.total)}
                  </span>
                </Anel>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted">
                    {escolhidas.length === 0
                      ? "nenhuma tarefa escolhida"
                      : `${escolhidas.length} ${escolhidas.length === 1 ? "tarefa" : "tarefas"} escolhidas`}
                  </p>
                  <p className="text-xs font-medium text-cream">
                    {tempo.total === 0
                      ? "Escolha uma prioridade para ver o orçamento."
                      : `A maior fatia é ${maiorFase.label.toLowerCase()}: ${duracao(tempo.porFase[maiorFase.key])}.`}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-panel2">
                {FASES.map((fase) => (
                  <span
                    key={fase.key}
                    className="h-full"
                    style={{
                      width: `${tempo.total > 0 ? (tempo.porFase[fase.key] / tempo.total) * 100 : 0}%`,
                      backgroundColor: fase.cor,
                    }}
                    title={`${fase.label} · ${duracao(tempo.porFase[fase.key])}`}
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                {FASES.map((fase) => (
                  <div key={fase.key} className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: fase.cor }}
                    />
                    <span className="text-muted">{fase.label}</span>
                    <span className="ml-auto text-cream/75 tabular-nums">
                      {duracao(tempo.porFase[fase.key])}
                    </span>
                  </div>
                ))}
              </div>

              {escolhidas.length > 0 ? (
                <div className="mt-3 space-y-2 border-t border-line/50 pt-2">
                  {escolhidas.slice(0, 4).map((t) => (
                    <div key={t.id}>
                      <p className="truncate text-[11px] text-cream/80">{t.titulo}</p>
                      <FasesTarefa tarefa={t} compacto />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Secao>

          <Secao titulo="Registrar o dia" tom="feito">
            <form action={criarNota} className="card p-3">
              <input type="hidden" name="tipo" value="insight" />
              <input type="hidden" name="area" value="pessoal" />
              <input type="hidden" name="tags" value="presença, diário" />
              <input
                type="hidden"
                name="titulo"
                value={`Presença · ${dataCurta(hoje())}`}
              />
              <label className="label" htmlFor="presenca-registro">
                o que ficou de concreto hoje
              </label>
              <textarea
                id="presenca-registro"
                name="corpo"
                rows={4}
                required
                className="field resize-y text-[11px] leading-relaxed"
                placeholder="O que eu analisei, organizei, criei e executei. O que aprendi. O que solto. O que levo para amanhã."
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[9px] text-muted/60">
                  fecha o ciclo · vira nota
                </span>
                <BotaoEnviar className="btn-gold h-7 px-2.5 text-[10px]">
                  <Ico nome="check-circulo" className="h-3 w-3" />
                  registrar
                </BotaoEnviar>
              </div>
            </form>
          </Secao>

          <Secao titulo="Para lembrar" tom="revisao">
            <div className="card p-3">
              <ul className="space-y-2 text-[11px] leading-relaxed text-cream/75">
                <li className="flex gap-2">
                  <Ico nome="ancora" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lilac" />
                  Presença não é parar a vida. É não se perder dentro dela.
                </li>
                <li className="flex gap-2">
                  <Ico nome="coracao" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose" />
                  Gratidão é memória do bem. Perdão é liberdade do peso.
                </li>
                <li className="flex gap-2">
                  <Ico nome="balanca" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-focus" />
                  Urgente não é importante. Dê a cada decisão o tempo que ela merece.
                </li>
                <li className="flex gap-2">
                  <Ico nome="ampulheta" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-window" />
                  O dia não é uma fila. É um ritmo: analisar, organizar, criar, executar, registrar.
                </li>
              </ul>
              <Link href="/revisao" className="link-quiet mt-3 block text-[11px]">
                fechar a semana →
              </Link>
            </div>
          </Secao>
        </div>
      </div>
    </div>
  );
}
