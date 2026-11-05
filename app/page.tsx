import Link from "next/link";
import { alternarRitual } from "./actions";
import { AncoraDoDia } from "@/components/ancora-do-dia";
import { Captura } from "@/components/captura";
import { FasesTarefa } from "@/components/fases-tarefa";
import { Ico, type IconeNome } from "@/components/icons";
import { TarefaLinha } from "@/components/tarefa-linha";
import { Anel, Cabecalho, Kpi, Secao } from "@/components/ui";
import { NOME } from "@/lib/config";
import { diaSemanaLongo, saudacao, tempoRelativo } from "@/lib/format";
import { afirmacaoDoDia } from "@/lib/presenca";
import { FASES, duracao, orcamento } from "@/lib/tempo";
import {
  janelaAtual,
  janelaLabel,
  JANELAS,
  proximasJanelas,
  progressoJanela,
  restanteJanela,
} from "@/lib/janelas";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

function Alerta({
  href,
  icone,
  titulo,
  texto,
  n,
  tom,
}: {
  href: string;
  icone: IconeNome;
  titulo: string;
  texto: string;
  n: number;
  tom: "urgente" | "foco" | "inbox" | "pessoas" | "projetos";
}) {
  const cores = {
    urgente: "border-urgent/25 bg-urgent/[0.05] text-urgent",
    foco: "border-focus/25 bg-focus/[0.05] text-focus",
    inbox: "border-inbox/25 bg-inbox/[0.05] text-inbox",
    pessoas: "border-people/25 bg-people/[0.05] text-people",
    projetos: "border-projects/25 bg-projects/[0.05] text-projects",
  }[tom];

  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition hover:brightness-[0.99] ${cores}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/60">
        <Ico nome={icone} className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-cream">{titulo}</span>
        <span className="block truncate text-[10px] text-muted">{texto}</span>
      </span>
      <span className="text-sm font-semibold tabular-nums">{n}</span>
      <Ico
        nome="seta"
        className="h-3 w-3 opacity-0 transition group-hover:opacity-70"
      />
    </Link>
  );
}

export default async function HojePage() {
  const agora = new Date();
  const janela = janelaAtual(agora);
  const proximas = proximasJanelas(3, agora);
  const proxima = proximas[0];
  const pctJanela = progressoJanela(agora);

  const [
    rituais,
    rituaisHoje,
    foco,
    atrasadas,
    tarefasHoje,
    inbox,
    pessoas,
    semAcao,
    tarefasJanela,
    projetos,
    todasPessoas,
    sprint,
    feitasHoje,
    ancoras,
  ] = await Promise.all([
    q.rituaisHoje(),
    q.contarRituaisHoje(),
    q.tarefasFoco(),
    q.tarefasAtrasadas(),
    q.tarefasDeHoje(),
    q.contarInbox(),
    q.pessoasParaRetomar(3),
    q.projetosSemProximaAcao(),
    q.tarefasDaJanela(janela.key),
    q.listarProjetos(),
    q.listarPessoas(),
    q.sprintAtiva(),
    q.tarefasFeitasHoje(),
    q.ancorasHoje(),
  ]);

  const progressoSprint = sprint ? await q.progressoSprint(sprint.id) : null;

  const ritualFeito = rituais.has(janela.key);
  const { feitos: rituaisFeitos } = rituaisHoje;

  const nomeProjeto = new Map(projetos.map((p) => [p.id, p.nome]));
  const nomePessoa = new Map(todasPessoas.map((p) => [p.id, p.nome]));
  const projetosAtivos = projetos.filter((p) => p.status === "ativo").length;

  const afirmacao = afirmacaoDoDia(agora);
  const tempo = orcamento(foco.length > 0 ? foco : tarefasHoje);
  const maiorFase = FASES.reduce(
    (maior, fase) => (tempo.porFase[fase.key] > tempo.porFase[maior.key] ? fase : maior),
    FASES[0],
  );

  const pedeAtencao =
    inbox + atrasadas.length + pessoas.length + semAcao.length + tarefasHoje.length;
  const pctSprint =
    progressoSprint && progressoSprint.pontosTotal > 0
      ? Math.round((progressoSprint.pontosFeitos / progressoSprint.pontosTotal) * 100)
      : progressoSprint && progressoSprint.total > 0
        ? Math.round((progressoSprint.feitas / progressoSprint.total) * 100)
        : 0;

  return (
    <div>
      <Cabecalho
        eyebrow={diaSemanaLongo(agora)}
        titulo={`${saudacao(agora)}, ${NOME}.`}
        sub="Seu dia em uma tela: o que importa agora, o que já foi feito e o que pede decisão."
        icone="sol"
        tom="foco"
        acao={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-done/25 bg-done/10 px-3 py-1.5 text-[11px] font-medium text-done sm:flex">
              <Ico nome="trofeu" className="h-3.5 w-3.5" />
              {feitasHoje.length} feitas hoje
            </span>
            <Link href="/inbox" className="btn-gold h-8 px-3 text-xs">
              <Ico nome="plus" className="h-3.5 w-3.5" />
              Capturar
            </Link>
          </div>
        }
      />

      <AncoraDoDia afirmacao={afirmacao} ancoras={ancoras} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Janela atual */}
        <section className="anim-rise relative overflow-hidden rounded-card border border-window/35 bg-gradient-to-br from-window/20 via-panel/75 to-panel/55 p-4 shadow-[var(--shadow-card)]">
          <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-window/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-window">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-window/60" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-window" />
                </span>
                janela atual · {janelaLabel(janela)}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-cream">
                  {janela.orgao}
                </h2>
                <span className="rounded-full border border-window/30 bg-window/10 px-2 py-0.5 text-[10px] font-medium text-window">
                  {janela.modoLabel}
                </span>
              </div>
            </div>

            <Anel valor={pctJanela} tom="janela" tamanho={58} titulo="tempo da janela">
              <span className="text-center">
                <span className="block text-[11px] leading-none font-semibold text-window tabular-nums">
                  {pctJanela}%
                </span>
                <span className="mt-0.5 block text-[8px] text-muted">da janela</span>
              </span>
            </Anel>
          </div>

          <div className="relative mt-3 rounded-xl border border-window/20 bg-white/55 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-window/80">
              Fazer agora
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-cream/90">{janela.acao}</p>
          </div>

          <p className="relative mt-2.5 text-[11px] leading-relaxed text-muted">
            {janela.significado}
          </p>

          {tarefasJanela.length > 0 ? (
            <div className="relative mt-3 border-t border-window/15 pt-1">
              <p className="px-1 pt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                Tarefas desta janela · {tarefasJanela.length}
              </p>
              {tarefasJanela.slice(0, 4).map((t) => (
                <TarefaLinha
                  key={t.id}
                  tarefa={t}
                  projetoNome={t.projeto_id ? nomeProjeto.get(t.projeto_id) : null}
                  pessoaNome={t.pessoa_id ? nomePessoa.get(t.pessoa_id) : null}
                />
              ))}
            </div>
          ) : null}

          <div className="relative mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-window/15 pt-2.5 text-[10px] text-muted">
            <span>
              Faltam <span className="font-medium text-cream/85">{restanteJanela(agora)}</span>{" "}
              para <span className="font-medium text-window">{proxima.orgao}</span>
            </span>
            <div className="flex items-center gap-2">
              <form action={alternarRitual}>
                <input type="hidden" name="janela" value={janela.key} />
                <button
                  type="submit"
                  className={`btn h-7 px-2.5 text-[11px] ${
                    ritualFeito
                      ? "border border-done/40 bg-done/10 text-done"
                      : "border border-window/30 bg-white/60 text-window hover:bg-white"
                  }`}
                >
                  <Ico
                    nome={ritualFeito ? "check" : "janelas"}
                    className="h-3 w-3"
                    strokeWidth={2.2}
                  />
                  {ritualFeito ? "Ritual feito" : "Marcar ritual"}
                </button>
              </form>
              <Link href="/janelas" className="link-quiet">
                o dia inteiro →
              </Link>
            </div>
          </div>
        </section>

        {/* Pulso */}
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi
            href="/tarefas"
            icone="alvo"
            rotulo="Prioridades"
            valor={`${foco.length}/3`}
            detalhe="o que importa hoje"
            tom="foco"
            alerta={foco.length > 0}
          />
          <Kpi
            href="/tarefas"
            icone="hoje"
            rotulo="Vencem hoje"
            valor={tarefasHoje.length}
            detalhe="compromissos do dia"
            tom="ouro"
            alerta={tarefasHoje.length > 0}
          />
          <Kpi
            href="/tarefas"
            icone="ampulheta"
            rotulo="Atrasadas"
            valor={atrasadas.length}
            detalhe={atrasadas.length > 0 ? "reagende ou solte" : "nada vencido"}
            tom="urgente"
            alerta={atrasadas.length > 0}
          />
          <Kpi
            href="/inbox"
            icone="inbox"
            rotulo="Para processar"
            valor={inbox}
            detalhe={inbox > 0 ? "dê um destino" : "caixa limpa"}
            tom="inbox"
            alerta={inbox > 0}
          />
          <div className="col-span-2 flex items-center gap-2.5 rounded-card border border-window/25 bg-gradient-to-br from-window/[0.07] to-panel/70 px-3 py-2.5">
            <Anel valor={rituaisFeitos * 8.333} tom="feito" tamanho={40} espessura={4}>
              <span className="text-[9px] font-semibold text-done tabular-nums">
                {rituaisFeitos}
              </span>
            </Anel>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.09em] text-muted">Ritmo de hoje</p>
              <p className="text-xs font-medium text-cream">
                {rituaisFeitos}/12 rituais · {projetosAtivos} projetos ativos
              </p>
            </div>
            <Link href="/janelas" className="text-[10px] text-window hover:underline">
              ver →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Secao
            titulo="Prioridades do dia"
            tom="foco"
            contagem={foco.length}
            acao={
              <Link href="/tarefas" className="link-quiet text-[11px]">
                todas as tarefas →
              </Link>
            }
          >
            <div className="card overflow-hidden border-focus/25 bg-focus/[0.04] p-1">
              {foco.length === 0 ? (
                <div className="flex flex-wrap items-center gap-3 px-3 py-4">
                  <span className="icon-tile h-9 w-9 bg-focus/12 text-focus">
                    <Ico nome="alvo" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-cream">Nenhuma prioridade escolhida.</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      Marque até 3 tarefas com a estrela. O resto pode esperar.
                    </p>
                  </div>
                  <Link href="/tarefas" className="btn-ghost h-7 px-2.5 text-[11px]">
                    Escolher
                  </Link>
                </div>
              ) : (
                foco.slice(0, 3).map((t, i) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1.5 border-b border-line/50 px-1 py-0.5 last:border-0"
                  >
                    <span
                      className={`ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        i === 0
                          ? "bg-focus text-white"
                          : "border border-focus/25 bg-focus/10 text-focus"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <TarefaLinha
                        tarefa={t}
                        projetoNome={t.projeto_id ? nomeProjeto.get(t.projeto_id) : null}
                        pessoaNome={t.pessoa_id ? nomePessoa.get(t.pessoa_id) : null}
                      />
                    </div>
                  </div>
                ))
              )}
              {foco.length > 0 && foco.length < 3
                ? Array.from({ length: 3 - foco.length }).map((_, i) => (
                    <Link
                      key={`vazio-${i}`}
                      href="/tarefas"
                      className="mx-2 my-1 flex items-center gap-2 rounded-lg border border-dashed border-line/80 px-2.5 py-2 text-[11px] text-muted/70 transition hover:border-focus/30 hover:text-focus"
                    >
                      <Ico nome="plus" className="h-3 w-3" />
                      escolher a {foco.length + i + 1}ª prioridade
                    </Link>
                  ))
                : null}
            </div>
          </Secao>

          <Secao
            titulo="Concluídas hoje"
            tom="feito"
            contagem={feitasHoje.length}
            acao={
              <Link href="/tarefas" className="link-quiet text-[11px]">
                histórico →
              </Link>
            }
          >
            {feitasHoje.length === 0 ? (
              <div className="card flex items-center gap-3 border-done/25 bg-done/[0.05] px-3 py-3">
                <span className="icon-tile h-8 w-8 bg-done/10 text-done/70">
                  <Ico nome="check-circulo" className="h-4 w-4" />
                </span>
                <p className="text-[11px] leading-relaxed text-muted">
                  Nada concluído ainda hoje. A primeira tarefa pequena muda o tom do dia.
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-done/15 bg-done/[0.05] px-3 py-2">
                  <Ico nome="chama" className="h-3.5 w-3.5 text-done" />
                  <p className="text-[11px] font-medium text-done">
                    {feitasHoje.length === 1
                      ? "1 coisa saiu do lugar."
                      : `${feitasHoje.length} coisas saíram do lugar.`}
                  </p>
                  <span className="ml-auto text-[10px] text-muted/70">continua</span>
                </div>
                <ul className="divide-y divide-line/40">
                  {feitasHoje.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center gap-2.5 px-3 py-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-done/15 text-done">
                        <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.6} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-cream/70 line-through decoration-done/30">
                        {t.titulo}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted/60">
                        {tempoRelativo(t.concluido_em)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Secao>

          <Secao titulo="Captura rápida" tom="inbox">
            <Captura compacta />
          </Secao>
        </div>

        <aside className="min-w-0 space-y-5">
          <Secao
            titulo="Tempo & fases"
            tom="janela"
            acao={
              <Link href="/presenca" className="link-quiet text-[11px]">
                guia →
              </Link>
            }
          >
            <div className="card p-3">
              <div className="flex items-center gap-2.5">
                <span className="icon-tile h-8 w-8 bg-window/12 text-window">
                  <Ico nome="ampulheta" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.09em] text-muted">
                    orçamento de hoje
                  </p>
                  <p className="text-sm font-semibold text-cream tabular-nums">
                    {duracao(tempo.total)}
                    <span className="ml-1.5 text-[10px] font-normal text-muted">
                      {tempo.total > 0
                        ? `· maior fatia em ${maiorFase.label.toLowerCase()}`
                        : "· escolha uma prioridade"}
                    </span>
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

              {(foco.length > 0 ? foco : tarefasHoje).length > 0 ? (
                <div className="mt-2.5 space-y-2 border-t border-line/50 pt-2">
                  {(foco.length > 0 ? foco : tarefasHoje).slice(0, 3).map((t) => (
                    <div key={t.id}>
                      <p className="truncate text-[11px] text-cream/80">{t.titulo}</p>
                      <FasesTarefa tarefa={t} compacto />
                    </div>
                  ))}
                </div>
              ) : null}

              <p className="mt-2 border-t border-line/50 pt-2 text-[10px] leading-relaxed text-muted/70">
                Analisar, organizar, criar, executar e registrar. Cada fase tem seu tempo — e a
                decisão de quanto vale é sua.
              </p>
            </div>
          </Secao>

          <Secao titulo="Pede atenção" tom={pedeAtencao > 0 ? "urgente" : "feito"}>
            {pedeAtencao === 0 ? (
              <div className="rounded-card border border-done/25 bg-done/[0.06] px-3 py-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-done">
                  <Ico nome="check-circulo" className="h-3.5 w-3.5" />
                  Nada pedindo atenção.
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Caixa vazia, nada atrasado, ninguém esperando.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {inbox > 0 ? (
                  <Alerta
                    href="/inbox"
                    icone="inbox"
                    titulo="Para processar"
                    texto="itens sem destino"
                    n={inbox}
                    tom="inbox"
                  />
                ) : null}
                {atrasadas.length > 0 ? (
                  <Alerta
                    href="/tarefas"
                    icone="ampulheta"
                    titulo="Tarefas atrasadas"
                    texto="venceram e continuam abertas"
                    n={atrasadas.length}
                    tom="urgente"
                  />
                ) : null}
                {tarefasHoje.length > 0 ? (
                  <Alerta
                    href="/tarefas"
                    icone="hoje"
                    titulo="Vencem hoje"
                    texto="compromissos do dia"
                    n={tarefasHoje.length}
                    tom="foco"
                  />
                ) : null}
                {pessoas.length > 0 ? (
                  <Alerta
                    href="/pessoas"
                    icone="pessoas"
                    titulo="Pessoas para retomar"
                    texto={pessoas
                      .slice(0, 2)
                      .map((p) => p.nome)
                      .join(", ")}
                    n={pessoas.length}
                    tom="pessoas"
                  />
                ) : null}
                {semAcao.length > 0 ? (
                  <Alerta
                    href="/projetos"
                    icone="projetos"
                    titulo="Projetos sem próxima ação"
                    texto="decisão adiada"
                    n={semAcao.length}
                    tom="projetos"
                  />
                ) : null}
              </div>
            )}
          </Secao>

          {sprint ? (
            <Secao
              titulo="Sprint atual"
              tom="sprint"
              acao={
                <Link href="/sprints" className="link-quiet text-[11px]">
                  abrir →
                </Link>
              }
            >
              <Link
                href="/sprints"
                className="card card-hover block overflow-hidden p-3"
              >
                <div className="flex items-center gap-3">
                  <Anel valor={pctSprint} tom="sprint" tamanho={48} espessura={5}>
                    <span className="text-[10px] font-semibold text-sprint tabular-nums">
                      {pctSprint}%
                    </span>
                  </Anel>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-cream">{sprint.nome}</p>
                    {sprint.objetivo ? (
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">
                        {sprint.objetivo}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-line/50 pt-2 text-[10px] text-muted">
                  <span>
                    {progressoSprint?.feitas ?? 0}/{progressoSprint?.total ?? 0} itens
                  </span>
                  <span className="text-sprint">
                    {progressoSprint?.pontosFeitos ?? 0}/{progressoSprint?.pontosTotal ?? 0} pt
                  </span>
                </div>
              </Link>
            </Secao>
          ) : null}

          <Secao
            titulo={`Ritmo de hoje · ${rituaisFeitos}/12`}
            tom="janela"
            acao={
              <Link href="/janelas" className="link-quiet text-[11px]">
                detalhes →
              </Link>
            }
          >
            <div className="grid grid-cols-3 gap-1">
              {JANELAS.map((j) => {
                const feito = rituais.has(j.key);
                const atual = j.key === janela.key;
                return (
                  <form key={j.key} action={alternarRitual}>
                    <input type="hidden" name="janela" value={j.key} />
                    <button
                      type="submit"
                      title={`${j.orgao} — ${j.pratica}`}
                      className={`w-full rounded-lg border px-1.5 py-1.5 text-left transition ${
                        feito
                          ? "border-done/30 bg-done/10"
                          : atual
                            ? "border-window/40 bg-window/10"
                            : "border-line/60 bg-panel/40 hover:border-window/25"
                      }`}
                    >
                      <span
                        className={`flex items-center gap-1 text-[9px] tabular-nums ${
                          atual ? "text-window" : "text-muted/80"
                        }`}
                      >
                        {feito ? (
                          <Ico
                            nome="check"
                            className="h-2.5 w-2.5 text-done"
                            strokeWidth={2.8}
                          />
                        ) : atual ? (
                          <span className="h-1 w-1 animate-pulse rounded-full bg-window" />
                        ) : (
                          <span className="h-1 w-1 rounded-full bg-muted/40" />
                        )}
                        {janelaLabel(j)}
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-[9px] ${
                          feito ? "text-done/80" : "text-muted"
                        }`}
                      >
                        {j.orgao}
                      </span>
                    </button>
                  </form>
                );
              })}
            </div>
          </Secao>

          <Secao titulo="A seguir" tom="info">
            <div className="space-y-1">
              {proximas.map((j) => (
                <div
                  key={j.key}
                  className="flex items-center gap-2.5 rounded-lg border border-line/50 bg-panel/40 px-2.5 py-2"
                >
                  <span className="w-[64px] shrink-0 text-[10px] font-medium text-window tabular-nums">
                    {janelaLabel(j)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-cream/90">{j.orgao}</p>
                  </div>
                  <span className="rounded-full bg-panel2/80 px-1.5 py-0.5 text-[9px] text-muted">
                    {j.modoLabel}
                  </span>
                </div>
              ))}
            </div>
          </Secao>
        </aside>
      </div>
    </div>
  );
}
