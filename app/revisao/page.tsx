import Link from "next/link";
import { criarNota, fecharRevisao, limparExemplos } from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Ico, type IconeNome } from "@/components/icons";
import { Anel, Badge, Cabecalho, Secao, type Tom } from "@/components/ui";
import { dataCurta, diaSemanaLongo, hoje, tempoRelativo } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

function Pendencia({
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
  tom: Tom;
}) {
  const ok = n === 0;
  const cores: Record<string, string> = {
    inbox: "border-inbox/25 bg-inbox/[0.04] text-inbox",
    urgente: "border-urgent/25 bg-urgent/[0.04] text-urgent",
    projetos: "border-projects/25 bg-projects/[0.04] text-projects",
    pessoas: "border-people/25 bg-people/[0.04] text-people",
    feito: "border-done/25 bg-done/[0.04] text-done",
  };

  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 rounded-xl border p-2.5 transition hover:brightness-[0.99] ${
        ok ? cores.feito : cores[tom] ?? cores.feito
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/60">
        <Ico nome={ok ? "check-circulo" : icone} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-cream">{titulo}</span>
        <span className="mt-0.5 block truncate text-[10px] text-muted">{texto}</span>
      </span>
      <span className="text-lg font-semibold tabular-nums">{ok ? "✓" : n}</span>
    </Link>
  );
}

function Numero({
  valor,
  rotulo,
  tom,
}: {
  valor: number;
  rotulo: string;
  tom: string;
}) {
  return (
    <div className="rounded-xl border border-line/60 bg-white/45 px-2.5 py-2">
      <p className={`text-lg leading-tight font-semibold tabular-nums ${tom}`}>{valor}</p>
      <p className="text-[9px] uppercase tracking-[0.08em] text-muted">{rotulo}</p>
    </div>
  );
}

export default async function RevisaoPage() {
  const [
    resumo,
    semana,
    concluidas,
    notas,
    exemplos,
    revisoes,
    projetos,
    pessoas,
    atrasadas,
    ancoras,
  ] = await Promise.all([
    q.resumoRevisao(),
    q.resumoSemana(),
    q.tarefasConcluidasSemana(12),
    q.notasDaSemana(),
    q.contarExemplos(),
    q.contarRevisoes(),
    q.projetosSemProximaAcao(),
    q.pessoasParaRetomar(3),
    q.tarefasAtrasadas(),
    q.ancorasDaSemana(60),
  ]);
  const h = hoje();
  const gratidoes = ancoras.filter(
    (a) => a.chave === "gratidao" && (a.texto ?? "").trim().length > 0,
  );
  const perdoes = ancoras.filter(
    (a) => a.chave === "perdao" && (a.texto ?? "").trim().length > 0,
  );
  const comResultado = concluidas.filter(
    (t) => (t.resultado ?? "").trim().length > 0,
  );

  const frentes = [
    resumo.inbox,
    resumo.atrasadas,
    resumo.projetosSemAcao,
    resumo.pessoas,
  ];
  const emDia = frentes.filter((n) => n === 0).length;
  const pct = Math.round((emDia / frentes.length) * 100);
  const tudoEmDia = emDia === frentes.length;

  return (
    <div>
      <Cabecalho
        eyebrow="revisão semanal"
        titulo="Revisão"
        sub="Olhar para trás com honestidade e escolher o que vem. Fechar o ciclo, sem culpa."
        icone="revisao"
        tom="revisao"
        acao={
          <div className="flex items-center gap-1.5">
            {tudoEmDia ? <Badge tone="feito">tudo em dia</Badge> : null}
            {revisoes > 0 ? <Badge tone="revisao">{revisoes} revisões</Badge> : null}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="card relative overflow-hidden border-review/35 bg-gradient-to-br from-review/20 via-panel/75 to-panel/55 p-4">
          <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-review/10 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <Anel valor={pct} tom="revisao" tamanho={64} espessura={6}>
              <span className="text-center">
                <span className="block text-sm leading-none font-semibold text-review tabular-nums">
                  {emDia}/4
                </span>
                <span className="mt-0.5 block text-[8px] text-muted">frentes</span>
              </span>
            </Anel>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-review">
                ciclo da semana
              </p>
              <h2 className="mt-0.5 text-base font-semibold tracking-tight text-cream">
                {tudoEmDia
                  ? "Tudo olhado, nada solto."
                  : `${frentes.length - emDia} ${frentes.length - emDia === 1 ? "frente pede" : "frentes pedem"} decisão.`}
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {resumo.ultima
                  ? `Última revisão fechada em ${dataCurta(resumo.ultima)}.`
                  : "Nenhuma revisão fechada ainda."}
              </p>
            </div>
          </div>

          <div className="relative mt-3 grid grid-cols-5 gap-1.5">
            <Numero valor={semana.feitas} rotulo="feitas" tom="text-done" />
            <Numero valor={semana.notas} rotulo="notas" tom="text-notes" />
            <Numero valor={semana.rituais} rotulo="rituais" tom="text-window" />
            <Numero valor={semana.ancoras} rotulo="âncoras" tom="text-sage" />
            <Numero valor={semana.contatos} rotulo="contatos" tom="text-people" />
          </div>

          <form action={fecharRevisao} className="relative mt-3">
            <BotaoEnviar className="btn-gold w-full text-xs">
              <Ico nome="check-circulo" className="h-3.5 w-3.5" />
              Marcar revisão de hoje
            </BotaoEnviar>
          </form>
          <p className="relative mt-2 text-[10px] leading-relaxed text-muted/60">
            Fechar não significa que tudo está resolvido. Significa que você olhou.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Pendencia
            href="/inbox"
            icone="inbox"
            titulo="Caixa de entrada"
            texto="tudo que ainda não tem destino"
            n={resumo.inbox}
            tom="inbox"
          />
          <Pendencia
            href="/tarefas"
            icone="ampulheta"
            titulo="Tarefas atrasadas"
            texto="venceram e continuam abertas"
            n={resumo.atrasadas}
            tom="urgente"
          />
          <Pendencia
            href="/projetos"
            icone="projetos"
            titulo="Projetos sem ação"
            texto="parados por falta de um passo"
            n={resumo.projetosSemAcao}
            tom="projetos"
          />
          <Pendencia
            href="/pessoas"
            icone="pessoas"
            titulo="Pessoas para retomar"
            texto="sem contato recente ou data vencida"
            n={resumo.pessoas}
            tom="pessoas"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Secao
            titulo="O que já foi feito esta semana"
            tom="feito"
            contagem={semana.feitas}
            acao={
              <Link href="/tarefas" className="link-quiet text-[11px]">
                ver tarefas →
              </Link>
            }
          >
            {concluidas.length === 0 ? (
              <div className="card flex items-center gap-3 px-3 py-3">
                <span className="icon-tile h-8 w-8 bg-done/10 text-done/70">
                  <Ico nome="check-circulo" className="h-4 w-4" />
                </span>
                <p className="text-[11px] leading-relaxed text-muted">
                  Nada concluído nos últimos 7 dias. A semana ainda pode virar.
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <ul className="divide-y divide-line/40">
                  {concluidas.map((t) => (
                    <li key={t.id} className="flex items-center gap-2.5 px-3 py-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-done/15 text-done">
                        <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs text-cream/70 line-through decoration-done/30">
                          {t.titulo}
                        </span>
                        {t.resultado ? (
                          <span className="mt-0.5 block truncate text-[10px] text-done/70">
                            resultado: {t.resultado}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted/60">
                        {t.concluido_em ? dataCurta(t.concluido_em.slice(0, 10)) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Secao>

          <Secao
            titulo="Gratidão & perdão da semana"
            tom="rosa"
            contagem={gratidoes.length + perdoes.length}
            acao={
              <Link href="/presenca" className="link-quiet text-[11px]">
                praticar hoje →
              </Link>
            }
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="card border-rose/20 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-rose">
                  <Ico nome="coracao" className="h-3.5 w-3.5" />
                  gratidão
                </p>
                {gratidoes.length === 0 ? (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                    Nenhuma gratidão registrada. Nomeie três coisas concretas que sustentaram a
                    semana — uma pessoa, um corpo, um pequeno gesto.
                  </p>
                ) : (
                  <ul className="mt-1.5 space-y-1.5">
                    {gratidoes.slice(0, 4).map((a) => (
                      <li key={a.id} className="flex gap-2 text-[11px] leading-relaxed text-cream/75">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose/60" />
                        <span className="min-w-0">
                          <span className="block whitespace-pre-line">{a.texto}</span>
                          <span className="text-[9px] text-muted/50">{dataCurta(a.data)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card border-lilac/20 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-lilac">
                  <Ico nome="balanca" className="h-3.5 w-3.5" />
                  perdão e soltura
                </p>
                {perdoes.length === 0 ? (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                    Nada solto ainda. Perdoar não é concordar: é devolver o peso que não é seu e
                    parar de repetir a mesma história.
                  </p>
                ) : (
                  <ul className="mt-1.5 space-y-1.5">
                    {perdoes.slice(0, 4).map((a) => (
                      <li key={a.id} className="flex gap-2 text-[11px] leading-relaxed text-cream/75">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-lilac/60" />
                        <span className="min-w-0">
                          <span className="block whitespace-pre-line">{a.texto}</span>
                          <span className="text-[9px] text-muted/50">{dataCurta(a.data)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Secao>

          <Secao
            titulo="O que o tempo virou"
            tom="janela"
            contagem={comResultado.length}
          >
            <div className="card p-3">
              <p className="text-[11px] leading-relaxed text-muted">
                Tempo gasto só vira resultado quando é registrado. Olhe para a semana e pergunte:
                <span className="text-cream/80"> quanto tempo foi análise, quanto foi execução — e o que ficou de concreto?</span>
              </p>
              {comResultado.length === 0 ? (
                <p className="mt-2 rounded-lg border border-dashed border-line/80 px-2.5 py-2 text-[11px] text-muted/70">
                  Nenhum resultado registrado ainda. Ao concluir uma tarefa, escreva o que ficou de
                  concreto — mesmo que seja “não deu certo, aprendi isso”.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {comResultado.slice(0, 5).map((t) => (
                    <li
                      key={t.id}
                      className="rounded-lg border border-window/15 bg-window/[0.04] px-2.5 py-2"
                    >
                      <p className="text-[11px] font-medium text-cream/80">{t.titulo}</p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{t.resultado}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/presenca" className="link-quiet mt-2 block text-[10px]">
                rever as cinco fases →
              </Link>
            </div>
          </Secao>

          <Secao titulo="As perguntas da semana" tom="revisao">
            <div className="card p-3">
              <ol className="space-y-2.5 text-xs leading-relaxed text-cream/80">
                {[
                  "O que funcionou e deve continuar?",
                  "O que travou, e qual foi a causa real?",
                  "Quanto tempo foi análise e quanto foi execução?",
                  "O que estou carregando que não é meu?",
                  "Qual é a única prioridade da próxima semana?",
                ].map((pergunta, i) => (
                  <li key={pergunta} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-review/25 bg-review/[0.04] text-[10px] font-medium text-review">
                      {i + 1}
                    </span>
                    <span>{pergunta}</span>
                  </li>
                ))}
              </ol>

              <form action={criarNota} className="mt-4 border-t border-line/60 pt-4">
                <input type="hidden" name="tipo" value="insight" />
                <input type="hidden" name="area" value="pessoal" />
                <input type="hidden" name="tags" value="revisão, semanal" />
                <input type="hidden" name="titulo" value={`Revisão · ${dataCurta(h)}`} />
                <label className="label" htmlFor="revisao-corpo">
                  registrar a revisão
                </label>
                <textarea
                  id="revisao-corpo"
                  name="corpo"
                  rows={4}
                  required
                  className="field resize-y leading-relaxed"
                  placeholder="Escreva o que percebeu — sem performance. Isso vira matéria-prima da próxima semana."
                />
                <div className="mt-2 flex justify-end">
                  <BotaoEnviar className="btn-ghost text-xs">
                    <Ico nome="notas" className="h-3.5 w-3.5" />
                    Salvar como insight
                  </BotaoEnviar>
                </div>
              </form>
            </div>
          </Secao>

          {notas.length > 0 ? (
            <Secao titulo={`O que ficou da semana · ${notas.length}`} tom="notas">
              <div className="space-y-1.5">
                {notas.slice(0, 5).map((n) => (
                  <article
                    key={n.id}
                    className="rounded-xl border border-notes/15 bg-notes/[0.03] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-notes/70">
                        {n.tipo}
                      </span>
                      <span className="text-[10px] text-muted/50">
                        {tempoRelativo(n.criado_em)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-cream/75">
                      {n.titulo || n.corpo}
                    </p>
                  </article>
                ))}
                <Link href="/notas" className="link-quiet block pt-1 text-xs">
                  ver todas as notas →
                </Link>
              </div>
            </Secao>
          ) : null}
        </div>

        <div className="min-w-0 space-y-5">
          <Secao titulo="Fechar o ciclo" tom="revisao">
            <div className="card p-3">
              <p className="text-sm font-semibold tracking-tight text-cream">
                {diaSemanaLongo(new Date())}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {resumo.ultima
                  ? `Última revisão fechada em ${dataCurta(resumo.ultima)}.`
                  : "Nenhuma revisão fechada ainda."}
              </p>
              <form action={fecharRevisao} className="mt-3">
                <BotaoEnviar className="btn-ghost w-full text-xs">
                  <Ico nome="check" className="h-3.5 w-3.5" />
                  Marcar revisão de hoje
                </BotaoEnviar>
              </form>
            </div>
          </Secao>

          {resumo.projetosSemAcao > 0 ? (
            <Secao titulo="Definir próximos passos" tom="projetos">
              <div className="space-y-1.5">
                {projetos.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href="/projetos"
                    className="flex items-center gap-2 rounded-xl border border-projects/15 bg-projects/[0.03] px-3 py-2 text-xs text-cream/80 transition hover:border-projects/35"
                  >
                    <Ico nome="projetos" className="h-3.5 w-3.5 text-projects" />
                    <span className="min-w-0 flex-1 truncate">{p.nome}</span>
                    <Ico nome="seta" className="h-3 w-3 text-projects/60" />
                  </Link>
                ))}
              </div>
            </Secao>
          ) : null}

          {resumo.pessoas > 0 ? (
            <Secao titulo="Retomar contato" tom="pessoas">
              <div className="space-y-1.5">
                {pessoas.map((p) => (
                  <Link
                    key={p.id}
                    href="/pessoas"
                    className="flex items-center gap-2 rounded-xl border border-people/15 bg-people/[0.03] px-3 py-2 text-xs text-cream/80 transition hover:border-people/35"
                  >
                    <Ico nome="pessoas" className="h-3.5 w-3.5 text-people" />
                    <span className="min-w-0 flex-1 truncate">{p.nome}</span>
                    <span className="text-[10px] text-muted/60">
                      {p.proximo_passo || "sem próximo passo"}
                    </span>
                  </Link>
                ))}
              </div>
            </Secao>
          ) : null}

          {atrasadas.length > 0 ? (
            <Secao titulo="Soltar ou reagendar" tom="urgente">
              <div className="space-y-1.5">
                {atrasadas.slice(0, 4).map((t) => (
                  <Link
                    key={t.id}
                    href="/tarefas"
                    className="flex items-center gap-2 rounded-xl border border-urgent/15 bg-urgent/[0.03] px-3 py-2 text-xs text-cream/80 transition hover:border-urgent/35"
                  >
                    <Ico nome="ampulheta" className="h-3.5 w-3.5 text-urgent/70" />
                    <span className="min-w-0 flex-1 truncate">{t.titulo}</span>
                    <span className="text-[10px] text-urgent/70">
                      {dataCurta(t.vence_em)}
                    </span>
                  </Link>
                ))}
              </div>
            </Secao>
          ) : null}

          {exemplos > 0 ? (
            <Secao titulo="Dados de exemplo" tom="neutro">
              <div className="rounded-xl border border-line/60 bg-panel/30 p-3">
                <p className="text-xs leading-relaxed text-muted">
                  O app veio com exemplos para você ver o fluxo funcionando. Quando quiser começar
                  do zero com a sua vida real:
                </p>
                <form action={limparExemplos} className="mt-3">
                  <button
                    type="submit"
                    className="btn-ghost w-full text-[11px] text-rose/80 hover:border-rose/30 hover:text-rose"
                  >
                    <Ico nome="lixo" className="h-3.5 w-3.5" />
                    Remover exemplos ({exemplos} registros)
                  </button>
                </form>
              </div>
            </Secao>
          ) : null}
        </div>
      </div>
    </div>
  );
}
