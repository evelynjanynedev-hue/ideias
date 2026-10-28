import Link from "next/link";
import { alternarRitual } from "./actions";
import { Captura } from "@/components/captura";
import { Ico, type IconeNome } from "@/components/icons";
import { TarefaLinha } from "@/components/tarefa-linha";
import { Cabecalho, Secao } from "@/components/ui";
import { NOME } from "@/lib/config";
import { diaSemanaLongo, saudacao } from "@/lib/format";
import {
  janelaAtual,
  janelaLabel,
  JANELAS,
  proximasJanelas,
  restanteJanela,
} from "@/lib/janelas";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

function Stat({
  href,
  icone,
  rotulo,
  valor,
  alerta = false,
}: {
  href: string;
  icone: IconeNome;
  rotulo: string;
  valor: number;
  alerta?: boolean;
}) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-2.5 px-3 py-2.5 transition hover:border-gold/30"
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
          alerta ? "bg-gold/10 text-gold" : "bg-panel2 text-muted"
        }`}
      >
        <Ico nome={icone} className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[10px] uppercase tracking-[0.08em] text-muted">
          {rotulo}
        </span>
        <span
          className={`block text-lg leading-tight font-semibold tabular-nums ${
            alerta ? "text-gold" : "text-cream"
          }`}
        >
          {valor}
        </span>
      </span>
    </Link>
  );
}

function Alerta({
  href,
  icone,
  titulo,
  texto,
  n,
  tom = "ouro",
}: {
  href: string;
  icone: IconeNome;
  titulo: string;
  texto: string;
  n: number;
  tom?: "ouro" | "rosa";
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg border border-line/60 bg-panel/50 px-2.5 py-2 transition hover:border-gold/30 hover:bg-panel"
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
          tom === "rosa" ? "bg-rose/10 text-rose" : "bg-gold/10 text-gold"
        }`}
      >
        <Ico nome={icone} className="h-3 w-3" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-cream">{titulo}</span>
        <span className="block truncate text-[10px] text-muted">{texto}</span>
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          tom === "rosa" ? "text-rose" : "text-gold"
        }`}
      >
        {n}
      </span>
    </Link>
  );
}

export default async function HojePage() {
  const agora = new Date();
  const janela = janelaAtual(agora);
  const proximas = proximasJanelas(3, agora);
  const proxima = proximas[0];

  const [
    rituais,
    rituaisHoje,
    foco,
    atrasadas,
    tarefasHoje,
    abertas,
    inbox,
    pessoas,
    semAcao,
    tarefasJanela,
    projetos,
    todasPessoas,
  ] = await Promise.all([
    q.rituaisHoje(),
    q.contarRituaisHoje(),
    q.tarefasFoco(),
    q.tarefasAtrasadas(),
    q.tarefasDeHoje(),
    q.listarTarefasAbertas(),
    q.contarInbox(),
    q.pessoasParaRetomar(3),
    q.projetosSemProximaAcao(),
    q.tarefasDaJanela(janela.key),
    q.listarProjetos(),
    q.listarPessoas(),
  ]);

  const ritualFeito = rituais.has(janela.key);
  const { feitos: rituaisFeitos } = rituaisHoje;

  const nomeProjeto = new Map(projetos.map((p) => [p.id, p.nome]));
  const nomePessoa = new Map(todasPessoas.map((p) => [p.id, p.nome]));
  const projetosAtivos = projetos.filter((p) => p.status === "ativo").length;

  const pedeAtencao =
    inbox + atrasadas.length + pessoas.length + semAcao.length + tarefasHoje.length;

  return (
    <div>
      <Cabecalho
        eyebrow={diaSemanaLongo(agora)}
        titulo={`${saudacao(agora)}, ${NOME}.`}
        sub="Seu dia em uma tela: prioridades, janela atual e o que pede atenção."
        acao={
          <Link href="/inbox" className="btn-gold h-8 px-3 text-xs">
            <Ico nome="plus" className="h-3.5 w-3.5" />
            Capturar
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Stat href="/tarefas" icone="tarefas" rotulo="Tarefas abertas" valor={abertas.length} />
        <Stat
          href="/inbox"
          icone="inbox"
          rotulo="Para processar"
          valor={inbox}
          alerta={inbox > 0}
        />
        <Stat href="/pessoas" icone="pessoas" rotulo="Pessoas" valor={todasPessoas.length} />
        <Stat
          href="/projetos"
          icone="projetos"
          rotulo="Projetos ativos"
          valor={projetosAtivos}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <section className="card border-gold/25 bg-gradient-to-b from-gold/[0.05] to-panel/85 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                  Janela atual · {janelaLabel(janela)}
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <h2 className="text-lg font-semibold tracking-tight text-cream">
                    {janela.orgao}
                  </h2>
                  <span className="text-xs text-gold">{janela.modoLabel}</span>
                </div>
              </div>

              <form action={alternarRitual} className="shrink-0">
                <input type="hidden" name="janela" value={janela.key} />
                <button
                  type="submit"
                  className={`btn h-7 px-2.5 text-[11px] ${
                    ritualFeito
                      ? "border border-sage/40 bg-sage/10 text-sage"
                      : "border border-line bg-white/60 text-muted hover:border-gold/35 hover:text-gold"
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
            </div>

            <div className="mt-3 rounded-lg border border-line/60 bg-paper/70 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                Fazer agora
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-cream/90">{janela.acao}</p>
            </div>

            <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
              {janela.significado}
            </p>

            {tarefasJanela.length > 0 ? (
              <div className="mt-3 border-t border-line/60 pt-1">
                <p className="px-1 pt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                  Tarefas desta janela
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

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2.5 text-[10px] text-muted">
              <span>
                Faltam <span className="text-cream/80">{restanteJanela(agora)}</span> para{" "}
                <span className="text-gold/80">{proxima.orgao}</span>
              </span>
              <Link href="/janelas" className="link-quiet">
                ver o dia inteiro →
              </Link>
            </div>
          </section>

          <Secao
            titulo="Prioridades do dia"
            acao={
              <Link href="/tarefas" className="link-quiet text-[11px]">
                todas as tarefas →
              </Link>
            }
          >
            {foco.length === 0 ? (
              <div className="card flex flex-wrap items-center gap-3 px-3 py-3">
                <p className="min-w-0 flex-1 text-xs text-muted">
                  Nenhuma prioridade escolhida. Marque até 3 tarefas com a estrela.
                </p>
                <Link href="/tarefas" className="btn-ghost h-7 px-2.5 text-[11px]">
                  Escolher
                </Link>
              </div>
            ) : (
              <div className="card p-1">
                {foco.slice(0, 3).map((t) => (
                  <TarefaLinha
                    key={t.id}
                    tarefa={t}
                    projetoNome={t.projeto_id ? nomeProjeto.get(t.projeto_id) : null}
                    pessoaNome={t.pessoa_id ? nomePessoa.get(t.pessoa_id) : null}
                  />
                ))}
              </div>
            )}
          </Secao>

          <Secao titulo="Captura rápida">
            <Captura compacta />
          </Secao>
        </div>

        <aside className="min-w-0 space-y-5">
          <Secao titulo="Pede atenção">
            {pedeAtencao === 0 ? (
              <div className="rounded-card border border-sage/20 bg-sage/[0.06] px-3 py-3">
                <p className="text-xs font-medium text-sage">Nada pedindo atenção.</p>
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
                  />
                ) : null}
                {atrasadas.length > 0 ? (
                  <Alerta
                    href="/tarefas"
                    icone="ampulheta"
                    titulo="Tarefas atrasadas"
                    texto="venceram e continuam abertas"
                    n={atrasadas.length}
                    tom="rosa"
                  />
                ) : null}
                {tarefasHoje.length > 0 ? (
                  <Alerta
                    href="/tarefas"
                    icone="hoje"
                    titulo="Vencem hoje"
                    texto="compromissos do dia"
                    n={tarefasHoje.length}
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
                  />
                ) : null}
                {semAcao.length > 0 ? (
                  <Alerta
                    href="/projetos"
                    icone="projetos"
                    titulo="Projetos sem próxima ação"
                    texto="decisão adiada"
                    n={semAcao.length}
                    tom="rosa"
                  />
                ) : null}
              </div>
            )}
          </Secao>

          <Secao
            titulo={`Ritmo de hoje · ${rituaisFeitos}/12`}
            acao={
              <Link href="/janelas" className="link-quiet text-[11px]">
                detalhes →
              </Link>
            }
          >
            <div className="grid grid-cols-3 gap-1">
              {JANELAS.map((j) => {
                const feito = rituais.has(j.key);
                return (
                  <form key={j.key} action={alternarRitual}>
                    <input type="hidden" name="janela" value={j.key} />
                    <button
                      type="submit"
                      title={`${j.orgao} — ${j.pratica}`}
                      className={`w-full rounded-md border px-1.5 py-1 text-left transition ${
                        feito
                          ? "border-gold/35 bg-gold/10"
                          : "border-line/60 bg-panel/40 hover:border-gold/25"
                      }`}
                    >
                      <span className="flex items-center gap-1 text-[9px] text-gold/75">
                        {feito ? (
                          <Ico
                            nome="check"
                            className="h-2.5 w-2.5 text-sage"
                            strokeWidth={2.6}
                          />
                        ) : (
                          <span className="h-1 w-1 rounded-full bg-muted/50" />
                        )}
                        {janelaLabel(j)}
                      </span>
                      <span className="mt-0.5 block truncate text-[9px] text-muted">
                        {j.orgao}
                      </span>
                    </button>
                  </form>
                );
              })}
            </div>
          </Secao>

          <Secao titulo="A seguir">
            <div className="space-y-1">
              {proximas.map((j) => (
                <div
                  key={j.key}
                  className="flex items-center gap-2.5 rounded-lg border border-line/50 bg-panel/40 px-2.5 py-2"
                >
                  <span className="w-[62px] shrink-0 text-[10px] text-gold/75">
                    {janelaLabel(j)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-cream/90">{j.orgao}</p>
                  </div>
                  <span className="text-[10px] text-muted">{j.modoLabel}</span>
                </div>
              ))}
            </div>
          </Secao>
        </aside>
      </div>
    </div>
  );
}
