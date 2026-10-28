import Link from "next/link";
import { criarNota, fecharRevisao, limparExemplos } from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Ico, type IconeNome } from "@/components/icons";
import { Badge, Cabecalho, Secao } from "@/components/ui";
import { dataCurta, diaSemanaLongo, hoje, tempoRelativo } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

function Indicador({ ok }: { ok: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
        ok
          ? "border-sage/40 bg-sage/10 text-sage"
          : "border-gold/40 bg-gold/10 text-gold"
      }`}
    >
      <Ico
        nome={ok ? "check" : "seta"}
        className="h-3 w-3"
        strokeWidth={ok ? 2.6 : 2}
      />
    </span>
  );
}

function Pendencia({
  href,
  icone,
  titulo,
  texto,
  n,
  ok,
}: {
  href: string;
  icone: IconeNome;
  titulo: string;
  texto: string;
  n: number;
  ok: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg border border-line/60 bg-panel/30 p-2.5 transition hover:border-gold/30 hover:bg-panel/60"
    >
      <Indicador ok={ok} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-cream">
          <Ico nome={icone} className="h-3 w-3 text-muted" />
          {titulo}
        </span>
        <span className="mt-0.5 block text-[10px] text-muted">{texto}</span>
      </span>
      <span
        className={`text-lg font-semibold tabular-nums ${ok ? "text-sage" : "text-gold"}`}
      >
        {n}
      </span>
    </Link>
  );
}

export default async function RevisaoPage() {
  const [resumo, notas, exemplos, revisoes, projetos, pessoas, atrasadas] =
    await Promise.all([
      q.resumoRevisao(),
      q.notasDaSemana(),
      q.contarExemplos(),
      q.contarRevisoes(),
      q.projetosSemProximaAcao(),
      q.pessoasParaRetomar(3),
      q.tarefasAtrasadas(),
    ]);
  const h = hoje();

  const tudoEmDia =
    resumo.inbox === 0 &&
    resumo.atrasadas === 0 &&
    resumo.projetosSemAcao === 0 &&
    resumo.pessoas === 0;

  return (
    <div>
      <Cabecalho
        eyebrow="revisão semanal"
        titulo="Revisão"
        sub="Olhar para trás com honestidade e escolher o que vem."
        acao={
          <div className="flex items-center gap-2">
            {tudoEmDia ? <Badge tone="verde">em dia</Badge> : null}
            {revisoes > 0 ? <span className="chip">{revisoes} revisões</span> : null}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Pendencia
          href="/inbox"
          icone="inbox"
          titulo="Caixa de entrada"
          texto="tudo que ainda não tem destino"
          n={resumo.inbox}
          ok={resumo.inbox === 0}
        />
        <Pendencia
          href="/tarefas"
          icone="ampulheta"
          titulo="Tarefas atrasadas"
          texto="venceram e continuam abertas"
          n={resumo.atrasadas}
          ok={resumo.atrasadas === 0}
        />
        <Pendencia
          href="/projetos"
          icone="projetos"
          titulo="Projetos sem ação"
          texto="parados por falta de um passo"
          n={resumo.projetosSemAcao}
          ok={resumo.projetosSemAcao === 0}
        />
        <Pendencia
          href="/pessoas"
          icone="pessoas"
          titulo="Pessoas para retomar"
          texto="sem contato recente ou com data vencida"
          n={resumo.pessoas}
          ok={resumo.pessoas === 0}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Secao titulo="As perguntas da semana">
            <div className="card p-3">
              <ol className="space-y-2.5 text-xs leading-relaxed text-cream/80">
                {[
                  "O que funcionou e deve continuar?",
                  "O que travou, e qual foi a causa real?",
                  "O que estou carregando que não é meu?",
                  "Qual é a única prioridade da próxima semana?",
                ].map((pergunta, i) => (
                  <li key={pergunta} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/25 text-[10px] text-gold/80">
                      {i + 1}
                    </span>
                    <span>{pergunta}</span>
                  </li>
                ))}
              </ol>

              <form
                action={criarNota}
                className="mt-4 border-t border-line/60 pt-4"
              >
                <input type="hidden" name="tipo" value="insight" />
                <input type="hidden" name="area" value="pessoal" />
                <input type="hidden" name="tags" value="revisão, semanal" />
                <input
                  type="hidden"
                  name="titulo"
                  value={`Revisão · ${dataCurta(h)}`}
                />
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
            <Secao titulo={`O que ficou da semana · ${notas.length}`}>
              <div className="space-y-1.5">
                {notas.slice(0, 5).map((n) => (
                  <article
                    key={n.id}
                    className="rounded-lg border border-line/50 bg-panel/30 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-gold/60">
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
          <Secao titulo="Fechar o ciclo">
            <div className="card p-3">
              <p className="text-sm font-semibold tracking-tight text-cream">
                {diaSemanaLongo(new Date())}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {resumo.ultima
                  ? `Última revisão fechada em ${dataCurta(resumo.ultima)}.`
                  : "Nenhuma revisão fechada ainda."}
              </p>
              <form action={fecharRevisao} className="mt-4">
                <BotaoEnviar className="btn-gold w-full text-xs">
                  <Ico nome="check" className="h-3.5 w-3.5" />
                  Marcar revisão de hoje
                </BotaoEnviar>
              </form>
              <p className="mt-2 text-[10px] leading-relaxed text-muted/60">
                Fechar não significa que tudo está resolvido. Significa que você
                olhou.
              </p>
            </div>
          </Secao>

          {resumo.projetosSemAcao > 0 ? (
            <Secao titulo="Definir próximos passos">
              <div className="space-y-1.5">
                {projetos.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href="/projetos"
                    className="flex items-center gap-2 rounded-lg border border-line/50 bg-panel/30 px-3 py-2 text-xs text-cream/80 transition hover:border-gold/30"
                  >
                    <Ico nome="projetos" className="h-3.5 w-3.5 text-muted" />
                    <span className="min-w-0 flex-1 truncate">{p.nome}</span>
                    <Ico nome="seta" className="h-3 w-3 text-gold/60" />
                  </Link>
                ))}
              </div>
            </Secao>
          ) : null}

          {resumo.pessoas > 0 ? (
            <Secao titulo="Retomar contato">
              <div className="space-y-1.5">
                {pessoas.map((p) => (
                  <Link
                    key={p.id}
                    href="/pessoas"
                    className="flex items-center gap-2 rounded-lg border border-line/50 bg-panel/30 px-3 py-2 text-xs text-cream/80 transition hover:border-gold/30"
                  >
                    <Ico nome="pessoas" className="h-3.5 w-3.5 text-muted" />
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
            <Secao titulo="Soltar ou reagendar">
              <div className="space-y-1.5">
                {atrasadas.slice(0, 4).map((t) => (
                  <Link
                    key={t.id}
                    href="/tarefas"
                    className="flex items-center gap-2 rounded-lg border border-rose/15 bg-rose/[0.04] px-3 py-2 text-xs text-cream/80 transition hover:border-rose/30"
                  >
                    <Ico nome="ampulheta" className="h-3.5 w-3.5 text-rose/70" />
                    <span className="min-w-0 flex-1 truncate">{t.titulo}</span>
                    <span className="text-[10px] text-rose/70">
                      {dataCurta(t.vence_em)}
                    </span>
                  </Link>
                ))}
              </div>
            </Secao>
          ) : null}

          {exemplos > 0 ? (
            <Secao titulo="Dados de exemplo">
              <div className="rounded-lg border border-line/60 bg-panel/30 p-3">
                <p className="text-xs leading-relaxed text-muted">
                  O app veio com exemplos para você ver o fluxo funcionando.
                  Quando quiser começar do zero com a sua vida real:
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
