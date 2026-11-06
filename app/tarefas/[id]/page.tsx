import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adiarTarefa,
  alternarFoco,
  alternarTarefa,
  atualizarTarefa,
  excluirTarefa,
  registrarResultado,
} from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { FasesTarefa, ImportanciaChip } from "@/components/fases-tarefa";
import { Ico } from "@/components/icons";
import {
  AREAS_DISPONIVEIS,
  Anel,
  AreaBadge,
  Cabecalho,
  Secao,
} from "@/components/ui";
import { dataCurta, tempoRelativo } from "@/lib/format";
import { JANELAS, janelaLabel } from "@/lib/janelas";
import { FASES, PRESETS, duracao, fasesDaTarefa } from "@/lib/tempo";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tarefa = await q.tarefaPorId(id);
  if (!tarefa) notFound();

  const [projetos, pessoas, sessoes] = await Promise.all([
    q.listarProjetos(),
    q.listarPessoas(),
    q.pomodorosDaTarefa(id),
  ]);

  const projeto = tarefa.projeto_id
    ? projetos.find((p) => p.id === tarefa.projeto_id)
    : undefined;
  const pessoa = tarefa.pessoa_id
    ? pessoas.find((p) => p.id === tarefa.pessoa_id)
    : undefined;
  const feita = tarefa.status === "feita";
  const fases = fasesDaTarefa(tarefa);
  const minutosSalvos: Record<(typeof FASES)[number]["key"], number> = {
    analisar: tarefa.min_analisar,
    organizar: tarefa.min_organizar,
    criar: tarefa.min_criar,
    executar: tarefa.min_executar,
    registrar: tarefa.min_registrar,
  };
  const sessoesFoco = sessoes.filter((s) => s.tipo === "foco");
  const minutosFoco = sessoesFoco.reduce((soma, s) => soma + s.minutos, 0);
  const pctFases = fases.total > 0 ? Math.min(100, (fases.total / 240) * 100) : 0;

  return (
    <div>
      <Cabecalho
        eyebrow={`tarefa · ${tarefa.area}`}
        titulo={tarefa.titulo}
        sub={
          feita
            ? "Concluída. O resultado fica registrado para a revisão."
            : "O próximo passo concreto, com tempo e resultado."
        }
        icone="tarefas"
        tom="ouro"
        acao={
          <Link href="/tarefas" className="btn-ghost h-8 px-3 text-xs">
            <Ico nome="seta" className="h-3.5 w-3.5 rotate-180" />
            voltar
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <section className="card p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <AreaBadge area={tarefa.area} />
              {projeto ? (
                <Link
                  href={`/tarefas?projeto=${projeto.id}`}
                  className="chip border-projects/25 bg-projects/10 text-projects"
                >
                  <Ico nome="projetos" className="h-2.5 w-2.5" />
                  {projeto.nome}
                </Link>
              ) : null}
              {pessoa ? (
                <Link
                  href="/pessoas"
                  className="chip border-people/25 bg-people/10 text-people"
                >
                  <Ico nome="pessoas" className="h-2.5 w-2.5" />
                  {pessoa.nome}
                </Link>
              ) : null}
              {tarefa.vence_em ? (
                <span className="chip border-focus/25 bg-focus/10 text-focus">
                  <Ico nome="calendario" className="h-2.5 w-2.5" />
                  {dataCurta(tarefa.vence_em)}
                </span>
              ) : null}
              <ImportanciaChip tarefa={tarefa} />
              {tarefa.foco ? (
                <span className="chip border-gold/30 bg-gold/10 text-gold">
                  <Ico nome="estrela" className="h-2.5 w-2.5" fill="currentColor" />
                  prioridade do dia
                </span>
              ) : null}
              <span
                className={`chip ${
                  feita
                    ? "border-done/30 bg-done/10 text-done"
                    : "border-line/70 bg-white/45 text-muted"
                }`}
              >
                <Ico
                  nome={feita ? "check-circulo" : "ampulheta"}
                  className="h-2.5 w-2.5"
                />
                {feita ? "feita" : "aberta"}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Anel
                valor={pctFases}
                tom="janela"
                tamanho={54}
                espessura={5}
                titulo="tempo estimado desta tarefa"
              >
                <span className="text-[10px] font-semibold text-window tabular-nums">
                  {duracao(fases.total)}
                </span>
              </Anel>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted">
                  tempo estimado · {fases.personalizado ? "definido" : "sugerido"}
                </p>
                <p className="text-xs font-medium text-cream">
                  {fases.total === 0
                    ? "Sem tempo definido. Use o relógio para começar."
                    : `A maior fatia é ${FASES.reduce(
                        (maior, fase) =>
                          fases.minutos[fase.key] > fases.minutos[maior.key]
                            ? fase
                            : maior,
                        FASES[0],
                      ).label.toLowerCase()}.`}
                </p>
              </div>
            </div>

            <FasesTarefa tarefa={tarefa} className="mt-3" />

            {tarefa.notas ? (
              <p className="mt-3 whitespace-pre-line rounded-lg border border-line/60 bg-panel2/40 px-3 py-2 text-[11px] leading-relaxed text-cream/75">
                {tarefa.notas}
              </p>
            ) : null}

            <p className="mt-3 text-[10px] text-muted/60">
              criada em {dataCurta(tarefa.criado_em.slice(0, 10))}
              {tarefa.concluido_em
                ? ` · concluída ${tempoRelativo(tarefa.concluido_em)}`
                : ""}
            </p>
          </section>

          <Secao titulo="As cinco fases" tom="janela" contagem={fases.total > 0 ? 5 : 0}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {FASES.map((fase) => (
                <div
                  key={fase.key}
                  className="rounded-xl border border-line/60 bg-white/45 px-2.5 py-2"
                >
                  <p
                    className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em]"
                    style={{ color: fase.cor }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: fase.cor }}
                    />
                    {fase.curto}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-cream tabular-nums">
                    {duracao(fases.minutos[fase.key])}
                  </p>
                  <p className="mt-1 text-[9px] leading-relaxed text-muted/70">
                    {fase.pergunta}
                  </p>
                </div>
              ))}
            </div>
          </Secao>

          <Secao titulo="Resultado" tom="feito">
            <div className="card p-3">
              {tarefa.resultado ? (
                <p className="mb-2 whitespace-pre-line rounded-lg border border-done/20 bg-done/[0.05] px-2.5 py-2 text-[11px] leading-relaxed text-cream/75">
                  {tarefa.resultado}
                </p>
              ) : (
                <p className="mb-2 text-[11px] leading-relaxed text-muted">
                  Ainda sem resultado registrado. Não basta executar: escreva o que
                  ficou de concreto.
                </p>
              )}
              <form action={registrarResultado}>
                <input type="hidden" name="id" value={tarefa.id} />
                <label className="label" htmlFor="tarefa-resultado">
                  o que ficou de concreto?
                </label>
                <textarea
                  id="tarefa-resultado"
                  name="resultado"
                  rows={3}
                  defaultValue={tarefa.resultado ?? ""}
                  placeholder="Ex.: escopo enviado, reunião feita, decisão tomada, aprendizado."
                  className="field resize-y leading-relaxed"
                />
                <div className="mt-2 flex justify-end">
                  <BotaoEnviar className="btn-ghost h-7 px-2.5 text-[11px]">
                    <Ico nome="check" className="h-3 w-3" />
                    salvar resultado
                  </BotaoEnviar>
                </div>
              </form>
            </div>
          </Secao>

          <Secao
            titulo="Histórico de foco"
            tom="foco"
            contagem={sessoesFoco.length}
            acao={
              <span className="text-[10px] text-muted/70">
                {duracao(minutosFoco)} de foco
              </span>
            }
          >
            {sessoes.length === 0 ? (
              <div className="card flex items-center gap-3 px-3 py-3">
                <span className="icon-tile h-8 w-8 bg-focus/10 text-focus/70">
                  <Ico nome="ampulheta" className="h-4 w-4" />
                </span>
                <p className="text-[11px] leading-relaxed text-muted">
                  Nenhuma sessão nesta tarefa. Abra o relógio e comece pela fase que
                  faz sentido agora.
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <ul className="divide-y divide-line/40">
                  {sessoes.map((s) => {
                    const fase = FASES.find((f) => f.key === s.fase);
                    const pausa = s.tipo === "pausa";
                    const cor = pausa ? "#2f7089" : (fase?.cor ?? "#8b8377");
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
                          {pausa ? "pausa" : (fase?.curto ?? s.fase)}
                        </span>
                        <span className="min-w-0 flex-1 text-[11px] text-muted">
                          {pausa ? "pausa entre sessões" : "sessão de foco"}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted/70 tabular-nums">
                          {s.minutos} min
                        </span>
                        <span className="w-10 shrink-0 text-right text-[9px] text-muted/45">
                          {dataCurta(s.concluido_em.slice(0, 10))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Secao>
        </div>

        <div className="min-w-0 space-y-5">
          <Secao titulo="Ações" tom="ouro">
            <div className="card space-y-1.5 p-3">
              <form action={alternarTarefa}>
                <input type="hidden" name="id" value={tarefa.id} />
                <button
                  type="submit"
                  className={`btn w-full justify-center text-xs ${
                    feita
                      ? "btn-ghost"
                      : "btn-gold"
                  }`}
                >
                  <Ico
                    nome={feita ? "revisao" : "check-circulo"}
                    className="h-3.5 w-3.5"
                  />
                  {feita ? "reabrir tarefa" : "concluir tarefa"}
                </button>
              </form>

              <Link
                href={`/presenca?tarefa=${tarefa.id}&fase=executar`}
                className="btn-ghost w-full justify-center text-xs"
              >
                <Ico nome="ampulheta" className="h-3.5 w-3.5 text-window" />
                abrir relógio de foco
              </Link>

              <form action={alternarFoco}>
                <input type="hidden" name="id" value={tarefa.id} />
                <button
                  type="submit"
                  className={`btn-ghost w-full justify-center text-xs ${
                    tarefa.foco ? "text-focus" : ""
                  }`}
                >
                  <Ico
                    nome="estrela"
                    className="h-3.5 w-3.5"
                    fill={tarefa.foco ? "currentColor" : "none"}
                  />
                  {tarefa.foco
                    ? "remover das prioridades"
                    : "marcar como prioridade"}
                </button>
              </form>

              <form action={adiarTarefa}>
                <input type="hidden" name="id" value={tarefa.id} />
                <button
                  type="submit"
                  className="btn-ghost w-full justify-center text-xs"
                >
                  <Ico nome="calendario" className="h-3.5 w-3.5 text-projects" />
                  adiar para amanhã
                </button>
              </form>

              <details className="pt-1">
                <summary className="cursor-pointer list-none text-center text-[10px] text-muted/60 transition hover:text-rose">
                  excluir tarefa
                </summary>
                <form action={excluirTarefa} className="mt-1.5">
                  <input type="hidden" name="id" value={tarefa.id} />
                  <input type="hidden" name="voltar" value="/tarefas" />
                  <button
                    type="submit"
                    className="btn-ghost w-full justify-center text-[11px] text-rose/80 hover:border-rose/30 hover:text-rose"
                  >
                    <Ico nome="lixo" className="h-3.5 w-3.5" />
                    confirmar exclusão
                  </button>
                </form>
              </details>
            </div>
          </Secao>

          <Secao titulo="Editar tarefa" tom="neutro">
            <form action={atualizarTarefa} className="card space-y-2.5 p-3">
              <input type="hidden" name="id" value={tarefa.id} />

              <div>
                <label className="label" htmlFor="editar-titulo">
                  título
                </label>
                <input
                  id="editar-titulo"
                  name="titulo"
                  defaultValue={tarefa.titulo}
                  required
                  className="field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">área</label>
                  <select
                    name="area"
                    defaultValue={tarefa.area}
                    className="field h-8 text-[11px]"
                  >
                    {AREAS_DISPONIVEIS.map((a) => (
                      <option key={a.valor} value={a.valor}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">prioridade</label>
                  <select
                    name="prioridade"
                    defaultValue={String(tarefa.prioridade)}
                    className="field h-8 text-[11px]"
                  >
                    <option value="1">alta</option>
                    <option value="2">média</option>
                    <option value="3">baixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">janela do dia</label>
                <select
                  name="janela"
                  defaultValue={tarefa.janela ?? ""}
                  className="field h-8 text-[11px]"
                >
                  <option value="">sem janela</option>
                  {JANELAS.map((j) => (
                    <option key={j.key} value={j.key}>
                      {janelaLabel(j)} · {j.orgao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">vence em</label>
                <input
                  type="date"
                  name="vence_em"
                  defaultValue={tarefa.vence_em ?? ""}
                  className="field h-8 text-[11px]"
                />
              </div>

              {projetos.length > 0 ? (
                <div>
                  <label className="label">projeto</label>
                  <select
                    name="projeto_id"
                    defaultValue={tarefa.projeto_id ?? ""}
                    className="field h-8 text-[11px]"
                  >
                    <option value="">nenhum</option>
                    {projetos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {pessoas.length > 0 ? (
                <div>
                  <label className="label">pessoa</label>
                  <select
                    name="pessoa_id"
                    defaultValue={tarefa.pessoa_id ?? ""}
                    className="field h-8 text-[11px]"
                  >
                    <option value="">ninguém</option>
                    {pessoas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="label" htmlFor="editar-notas">
                  notas
                </label>
                <textarea
                  id="editar-notas"
                  name="notas"
                  rows={3}
                  defaultValue={tarefa.notas ?? ""}
                  className="field resize-y text-[11px] leading-relaxed"
                  placeholder="Contexto, links, critérios de pronto…"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {FASES.map((fase) => (
                  <label key={fase.key} className="block">
                    <span className="mb-0.5 flex items-center gap-1 text-[10px] text-muted">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: fase.cor }}
                      />
                      {fase.label}
                    </span>
                    <span className="relative block">
                      <input
                        type="number"
                        name={`min_${fase.key}`}
                        min={0}
                        max={600}
                        step={1}
                        defaultValue={minutosSalvos[fase.key] || ""}
                        placeholder={String(PRESETS.media[fase.key])}
                        className="field h-8 pr-7 text-xs tabular-nums"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[9px] text-muted/60">
                        min
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <label className="flex items-center gap-2 text-[11px] text-muted">
                <input
                  type="checkbox"
                  name="foco"
                  defaultChecked={tarefa.foco === 1}
                  className="h-3.5 w-3.5 accent-[#96613a]"
                />
                prioridade do dia (até 3)
              </label>

              <BotaoEnviar className="btn-gold h-8 w-full justify-center text-xs">
                <Ico nome="check" className="h-3 w-3" />
                salvar alterações
              </BotaoEnviar>
            </form>
          </Secao>
        </div>
      </div>
    </div>
  );
}
