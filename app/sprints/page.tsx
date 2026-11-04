import Link from "next/link";
import {
  adicionarAoSprint,
  alternarTarefa,
  ativarSprint,
  criarSprint,
  definirPontos,
  encerrarSprint,
  excluirSprint,
  removerDoSprint,
} from "@/app/actions";
import { Ico } from "@/components/icons";
import { Anel, AreaBadge, Badge, Cabecalho, Secao, Vazio } from "@/components/ui";
import { adicionarDias, dataCurta, hoje } from "@/lib/format";
import * as q from "@/lib/queries";
import type { Sprint, Tarefa } from "@/lib/types";

export const dynamic = "force-dynamic";

const PONTOS = [0, 1, 2, 3, 5, 8, 13, 21];

function restam(fim: string): number {
  const alvo = new Date(`${fim.slice(0, 10)}T00:00:00`);
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - agora.getTime()) / 86400000);
}

function diasTexto(fim: string): { texto: string; tom: "neutro" | "ouro" | "rosa" } {
  const dias = restam(fim);
  if (dias === 0) return { texto: "termina hoje", tom: "ouro" };
  if (dias < 0) return { texto: `atrasado ${Math.abs(dias)}d`, tom: "rosa" };
  return { texto: `${dias} ${dias === 1 ? "dia" : "dias"} restantes`, tom: "neutro" };
}

function Barra({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-panel2">
      <div
        className="h-full rounded-full bg-gradient-to-r from-sprint/70 to-sprint transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function LinhaSprint({ tarefa }: { tarefa: Tarefa }) {
  const feita = tarefa.status === "feita";

  return (
    <div className="group flex items-start gap-2 rounded-lg border border-transparent px-2 py-2 transition hover:border-line/70 hover:bg-panel2/40">
      <form action={alternarTarefa} className="pt-0.5">
        <input type="hidden" name="id" value={tarefa.id} />
        <button
          type="submit"
          aria-label={feita ? "Reabrir tarefa" : "Concluir tarefa"}
          className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition ${
            feita
              ? "border-done/60 bg-done text-white"
              : "border-muted/40 text-transparent hover:border-done hover:bg-done/10 hover:text-done"
          }`}
        >
          <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.8} />
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[13px] leading-relaxed ${
            feita ? "text-muted/60 line-through decoration-done/40" : "text-cream/90"
          }`}
        >
          {tarefa.titulo}
        </p>
        {!feita ? (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <AreaBadge area={tarefa.area} />
            <span className="chip border-sprint/25 bg-sprint/10 text-sprint">
              <Ico nome="camadas" className="h-2.5 w-2.5" />
              {(tarefa.pontos ?? 0) || "–"} pt
            </span>
          </div>
        ) : (
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-done/70">
            <Ico nome="check-circulo" className="h-2.5 w-2.5" />
            concluída · {(tarefa.pontos ?? 0) || "–"} pt
          </p>
        )}
      </div>

      {!feita ? (
        <div className="flex items-center gap-1">
          <form action={definirPontos} className="flex items-center gap-1">
            <input type="hidden" name="id" value={tarefa.id} />
            <select
              name="pontos"
              defaultValue={String(tarefa.pontos ?? 0)}
              aria-label="Story points"
              className="rounded-md border border-line bg-white/70 px-1 py-0.5 text-[11px] text-muted"
            >
              {PONTOS.map((p) => (
                <option key={p} value={p}>
                  {p} pt
                </option>
              ))}
            </select>
            <button type="submit" className="btn-quiet px-1 text-[11px]" title="Salvar pontos">
              ok
            </button>
          </form>
          <form action={removerDoSprint}>
            <input type="hidden" name="id" value={tarefa.id} />
            <button
              type="submit"
              title="Devolver ao Product Backlog"
              className="btn-quiet px-1 text-muted opacity-50 hover:text-gold hover:opacity-100"
            >
              <Ico nome="seta" className="h-3.5 w-3.5 -rotate-180" />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function LinhaBacklog({ tarefa, temSprint }: { tarefa: Tarefa; temSprint: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-panel2/40">
      <span className="flex w-5 shrink-0 flex-col items-center gap-0.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tarefa.prioridade === 1
              ? "bg-urgent"
              : tarefa.prioridade === 2
                ? "bg-focus"
                : "bg-muted/40"
          }`}
          title={`prioridade ${tarefa.prioridade}`}
        />
        <span className="text-[9px] font-medium text-muted/60 tabular-nums">
          {tarefa.prioridade}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-cream/90">{tarefa.titulo}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          <AreaBadge area={tarefa.area} />
          {tarefa.vence_em ? (
            <span className="chip">{dataCurta(tarefa.vence_em)}</span>
          ) : null}
        </div>
      </div>
      <form action={adicionarAoSprint} className="flex shrink-0 items-center gap-1">
        <input type="hidden" name="id" value={tarefa.id} />
        <select
          name="pontos"
          defaultValue={String(tarefa.pontos ?? 3)}
          aria-label="Story points"
          className="rounded-md border border-line bg-white/70 px-1 py-0.5 text-[11px] text-muted"
        >
          {PONTOS.map((p) => (
            <option key={p} value={p}>
              {p} pt
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!temSprint}
          title={temSprint ? "Puxar para o sprint ativo" : "Crie um sprint primeiro"}
          className="btn-ghost h-7 px-2 text-[11px] disabled:opacity-40"
        >
          puxar
        </button>
      </form>
    </div>
  );
}

function Cerimonia({
  titulo,
  descricao,
  href,
  icone,
}: {
  titulo: string;
  descricao: string;
  href: string;
  icone: "faisca" | "hoje" | "revisao" | "notas";
}) {
  const cor = {
    faisca: "bg-sprint/12 text-sprint",
    hoje: "bg-focus/12 text-focus",
    revisao: "bg-review/12 text-review",
    notas: "bg-notes/12 text-notes",
  }[icone];

  return (
    <Link
      href={href}
      className="card card-hover flex items-start gap-2.5 p-3"
    >
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cor}`}>
        <Ico nome={icone} className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-cream">{titulo}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
          {descricao}
        </span>
      </span>
    </Link>
  );
}

function CartaoSprint({
  sprint,
  tarefas,
  progresso,
}: {
  sprint: Sprint;
  tarefas: Tarefa[];
  progresso: { total: number; feitas: number; pontosTotal: number; pontosFeitos: number };
}) {
  const abertas = tarefas.filter((t) => t.status === "aberta");
  const feitas = tarefas.filter((t) => t.status === "feita");
  const dias = diasTexto(sprint.fim);
  const pct =
    progresso.pontosTotal > 0
      ? Math.round((progresso.pontosFeitos / progresso.pontosTotal) * 100)
      : progresso.total > 0
        ? Math.round((progresso.feitas / progresso.total) * 100)
        : 0;

  return (
    <section className="card relative overflow-hidden border-sprint/25 bg-gradient-to-br from-sprint/12 via-panel/80 to-panel/60 p-4">
      <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-sprint/10 blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-sprint">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-sprint/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-sprint" />
            </span>
            sprint ativa
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-cream">
            {sprint.nome}
          </h2>
          {sprint.objetivo ? (
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-cream/85">
              <span className="font-medium text-sprint">Objetivo:</span> {sprint.objetivo}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">
              Sem objetivo definido — um sprint sem objetivo é só uma lista de tarefas.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Anel valor={pct} tom="sprint" tamanho={54} espessura={5}>
            <span className="text-[11px] font-semibold text-sprint tabular-nums">{pct}%</span>
          </Anel>
          <div className="flex flex-col items-start gap-1">
            <Badge tone={dias.tom}>{dias.texto}</Badge>
            <span className="chip">
              {dataCurta(sprint.inicio)} → {dataCurta(sprint.fim)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-sprint/80">Pontos</p>
          <p className="text-lg font-semibold text-sprint tabular-nums">
            {progresso.pontosFeitos}
            <span className="text-sm text-muted">/{progresso.pontosTotal}</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-done/80">Itens</p>
          <p className="text-lg font-semibold text-done tabular-nums">
            {progresso.feitas}
            <span className="text-sm text-muted">/{progresso.total}</span>
          </p>
        </div>
        <div className="col-span-2 self-end">
          <div className="mb-1 flex items-center justify-between text-[10px] text-muted">
            <span>progresso do sprint</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <Barra pct={pct} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-focus/20 bg-focus/[0.03] p-1">
          <p className="flex items-center justify-between px-2 pt-1.5 pb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-focus">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-focus" />a fazer
            </span>
            <span className="rounded-full bg-focus/10 px-1.5 tabular-nums">{abertas.length}</span>
          </p>
          {abertas.length === 0 ? (
            <p className="px-2 py-3 text-[11px] text-muted">
              Nada no sprint ainda. Puxe itens do backlog abaixo.
            </p>
          ) : (
            abertas.map((t) => <LinhaSprint key={t.id} tarefa={t} />)
          )}
        </div>
        <div className="rounded-lg border border-done/20 bg-done/[0.03] p-1">
          <p className="flex items-center justify-between px-2 pt-1.5 pb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-done">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-done" />feito
            </span>
            <span className="rounded-full bg-done/10 px-1.5 tabular-nums">{feitas.length}</span>
          </p>
          {feitas.length === 0 ? (
            <p className="px-2 py-3 text-[11px] text-muted">
              Ainda nada concluído neste sprint.
            </p>
          ) : (
            feitas.map((t) => <LinhaSprint key={t.id} tarefa={t} />)
          )}
        </div>
      </div>

      <details className="mt-4 rounded-lg border border-sprint/20 bg-sprint/[0.03] px-3 py-2">
        <summary className="cursor-pointer text-[11px] font-medium text-sprint/80 hover:text-sprint">
          Encerrar sprint · review + retrospectiva
        </summary>
        <form action={encerrarSprint} className="mt-3 space-y-2">
          <input type="hidden" name="id" value={sprint.id} />
          <label className="label" htmlFor="retrospectiva">
            O que funcionou, o que travou, o que muda no próximo
          </label>
          <textarea
            id="retrospectiva"
            name="retrospectiva"
            rows={3}
            className="field"
            placeholder="Ex.: o objetivo ajudou a cortar o resto. Travou na estimativa — vou puxar menos itens."
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] text-muted">
              Itens não concluídos voltam para o Product Backlog. A retrospectiva vira uma nota.
            </p>
            <button type="submit" className="btn-gold h-8 px-3 text-xs">
              Encerrar sprint
            </button>
          </div>
        </form>
      </details>
    </section>
  );
}

export default async function SprintsPage() {
  const ativa = await q.sprintAtiva();

  const [sprints, backlog, concluidas, progresso, tarefasSprint] = await Promise.all([
    q.listarSprints(),
    q.backlog(),
    q.sprintsConcluidas(),
    ativa ? q.progressoSprint(ativa.id) : Promise.resolve(null),
    ativa ? q.tarefasDoSprint(ativa.id) : Promise.resolve([]),
  ]);

  const planejadas = sprints.filter((s) => s.status === "planejada");
  const numero = sprints.length + 1;

  return (
    <div>
      <Cabecalho
        eyebrow="scrum"
        titulo="Sprints"
        sub="Product Backlog → Sprint → Review → Retrospectiva. Ciclos curtos com um objetivo claro: o que entra, o que sai e o que aprendemos."
        icone="bandeira"
        tom="sprint"
        acao={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={ativa ? "verde" : "neutro"}>
              {ativa ? "sprint ativa" : "sem sprint ativa"}
            </Badge>
            <span className="chip">{backlog.length} no backlog</span>
          </div>
        }
      />

      <div className="space-y-6">
        {ativa && progresso ? (
          <CartaoSprint sprint={ativa} tarefas={tarefasSprint} progresso={progresso} />
        ) : (
          <Secao titulo="Começar um sprint" tom="sprint">
            <form
              action={criarSprint}
              className="card space-y-3 border-sprint/20 bg-gradient-to-br from-sprint/[0.05] to-panel/80 p-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="nome">
                    Nome
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    className="field"
                    defaultValue={`Sprint ${numero}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label" htmlFor="inicio">
                      Início
                    </label>
                    <input
                      id="inicio"
                      name="inicio"
                      type="date"
                      className="field"
                      defaultValue={hoje()}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="fim">
                      Fim
                    </label>
                    <input
                      id="fim"
                      name="fim"
                      type="date"
                      className="field"
                      defaultValue={adicionarDias(7)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="objetivo">
                  Objetivo do sprint (uma frase)
                </label>
                <input
                  id="objetivo"
                  name="objetivo"
                  className="field"
                  placeholder="Ex.: deixar a captura e a revisão redondas para usar 7 dias seguidos."
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] text-muted">
                  Um sprint por vez. O que não couber fica no backlog — e isso é saudável.
                </p>
                <button type="submit" className="btn-gold h-8 px-3 text-xs">
                  <Ico nome="plus" className="h-3.5 w-3.5" />
                  Criar sprint
                </button>
              </div>
            </form>
          </Secao>
        )}

        {planejadas.length > 0 ? (
          <Secao titulo={`Planejados · ${planejadas.length}`}>
            <div className="card divide-y divide-line/60 p-1">
              {planejadas.map((s) => (
                <div key={s.id} className="flex items-center gap-2 px-2.5 py-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-sprint/50" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-cream/90">{s.nome}</p>
                    <p className="text-[10px] text-muted">
                      {dataCurta(s.inicio)} → {dataCurta(s.fim)}
                      {s.objetivo ? ` · ${s.objetivo}` : ""}
                    </p>
                  </div>
                  <form action={ativarSprint}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="btn-ghost h-7 px-2 text-[11px]">
                      ativar
                    </button>
                  </form>
                  <form action={excluirSprint}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      title="Excluir sprint"
                      className="btn-quiet px-1 text-muted hover:text-rose"
                    >
                      <Ico nome="lixo" className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </Secao>
        ) : null}

        <Secao
          titulo={`Product Backlog · ${backlog.length}`}
          tom="sprint"
          acao={
            <Link href="/tarefas" className="link-quiet text-[11px]">
              ver todas as tarefas →
            </Link>
          }
        >
          {backlog.length === 0 ? (
            <Vazio
              icone="faisca"
              titulo="Backlog vazio."
              texto="Capture ideias na caixa de entrada, processe em tarefas e priorize. O backlog é a fila do que pode entrar num sprint."
            />
          ) : (
            <div className="card divide-y divide-line/50 p-1">
              {backlog.slice(0, 12).map((t) => (
                <LinhaBacklog key={t.id} tarefa={t} temSprint={Boolean(ativa)} />
              ))}
            </div>
          )}
          {backlog.length > 12 ? (
            <p className="mt-1.5 px-1 text-[10px] text-muted">
              Mostrando os 12 primeiros por prioridade. O restante continua no backlog.
            </p>
          ) : null}
        </Secao>

        <Secao titulo="As cerimônias, no app">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Cerimonia
              titulo="Sprint Planning"
              descricao="Escolher o objetivo, puxar itens do backlog e estimar em pontos."
              href="/sprints"
              icone="faisca"
            />
            <Cerimonia
              titulo="Daily"
              descricao="A tela Hoje: janela atual, prioridades e o que pede atenção."
              href="/"
              icone="hoje"
            />
            <Cerimonia
              titulo="Sprint Review"
              descricao="Revisão semanal: o que foi entregue, o que ficou e o que vem."
              href="/revisao"
              icone="revisao"
            />
            <Cerimonia
              titulo="Retrospectiva"
              descricao="Encerrar o sprint com o que funcionou, o que travou e o que muda."
              href="/notas"
              icone="notas"
            />
          </div>
        </Secao>

        {concluidas.length > 0 ? (
          <Secao titulo="Histórico" tom="feito">
            <div className="card divide-y divide-line/60 p-1">
              {concluidas.map((s) => (
                <div key={s.id} className="px-2.5 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] text-cream/90">{s.nome}</p>
                    <span className="chip">
                      {dataCurta(s.inicio)} → {dataCurta(s.fim)}
                    </span>
                  </div>
                  {s.retrospectiva ? (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">
                      {s.retrospectiva}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted/60">
                      Sem retrospectiva registrada.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Secao>
        ) : null}
      </div>
    </div>
  );
}
