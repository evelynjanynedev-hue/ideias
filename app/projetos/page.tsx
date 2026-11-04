import Link from "next/link";
import {
  alternarTarefa,
  atualizarResultado,
  criarProjeto,
  definirProximaAcao,
  excluirProjeto,
  mudarStatusProjeto,
} from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { DescricaoExpansivel } from "@/components/descricao-expansivel";
import { Ico } from "@/components/icons";
import {
  AREAS_DISPONIVEIS,
  Anel,
  AreaBadge,
  Badge,
  Cabecalho,
  Kpi,
  Vazio,
  type Tom,
} from "@/components/ui";
import type { Projeto } from "@/lib/types";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

const STATUS: Record<Projeto["status"], { label: string; tone: Tom; barra: string }> = {
  ativo: { label: "ativo", tone: "feito", barra: "bg-done" },
  pausado: { label: "pausado", tone: "neutro", barra: "bg-muted/40" },
  concluido: { label: "concluído", tone: "ouro", barra: "bg-gold" },
};

const FILTROS = [
  { valor: "todos", label: "todos" },
  { valor: "ativo", label: "ativos" },
  { valor: "pausado", label: "pausados" },
  { valor: "concluido", label: "concluídos" },
];

function NovoProjeto() {
  return (
    <details className="group card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-medium text-cream transition hover:bg-panel2/40">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-projects/10 text-projects">
          <Ico nome="plus" className="h-3 w-3" />
        </span>
        Novo projeto
        <span className="ml-auto text-[10px] font-normal text-muted">
          um resultado, não uma pasta
        </span>
      </summary>
      <form
        action={criarProjeto}
        className="grid grid-cols-1 gap-3 border-t border-line/60 p-3 sm:grid-cols-2"
      >
        <div>
          <label className="label">Nome</label>
          <input name="nome" className="field" placeholder="O que você está construindo" required />
        </div>
        <div>
          <label className="label">Área</label>
          <select name="area" className="field" defaultValue="trabalho">
            {AREAS_DISPONIVEIS.map((a) => (
              <option key={a.valor} value={a.valor}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Resultado esperado</label>
          <textarea
            name="resultado"
            rows={2}
            className="field resize-y"
            placeholder="Como você saberá que terminou?"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Próxima ação</label>
          <input
            name="proxima_acao"
            className="field"
            placeholder="O menor próximo passo concreto"
          />
        </div>
        <div className="flex justify-end sm:col-span-2">
          <BotaoEnviar className="btn-gold h-8 px-3 text-xs">
            <Ico nome="plus" className="h-3 w-3" />
            Criar projeto
          </BotaoEnviar>
        </div>
      </form>
    </details>
  );
}

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "todos" } = await searchParams;
  const [todosProjetos, progressoBruto] = await Promise.all([
    q.listarProjetos(),
    q.progressoProjetos(),
  ]);
  const progresso = new Map(progressoBruto.map((p) => [p.projeto_id, p]));

  // Carrega as tarefas de cada projeto antes de renderizar (sem await no JSX).
  const tarefasPorProjeto = new Map(
    await Promise.all(
      todosProjetos.map(
        async (p) => [p.id, (await q.tarefasPorProjeto(p.id)).slice(0, 3)] as const,
      ),
    ),
  );

  const projetos =
    status === "todos" ? todosProjetos : todosProjetos.filter((p) => p.status === status);

  const ativos = todosProjetos.filter((p) => p.status === "ativo").length;
  const pausados = todosProjetos.filter((p) => p.status === "pausado").length;
  const concluidos = todosProjetos.filter((p) => p.status === "concluido").length;
  const semAcao = todosProjetos.filter(
    (p) => p.status === "ativo" && !p.proxima_acao?.trim(),
  ).length;

  return (
    <div>
      <Cabecalho
        eyebrow="projetos"
        titulo="Projetos"
        sub="Cada projeto tem um resultado claro e uma próxima ação. Sem próximo passo, é só uma pasta."
        icone="projetos"
        tom="projetos"
        acao={
          <div className="flex items-center gap-1.5">
            <Badge tone="feito">{ativos} ativos</Badge>
            <Badge>{todosProjetos.length} no total</Badge>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Kpi
          href="/projetos?status=ativo"
          icone="play"
          rotulo="Ativos"
          valor={ativos}
          detalhe="em movimento"
          tom="feito"
        />
        <Kpi
          href="/projetos"
          icone="alvo"
          rotulo="Sem próxima ação"
          valor={semAcao}
          detalhe={semAcao > 0 ? "decisão adiada" : "todos com passo"}
          tom="urgente"
          alerta={semAcao > 0}
        />
        <Kpi
          href="/projetos?status=pausado"
          icone="pausa"
          rotulo="Pausados"
          valor={pausados}
          detalhe="esperando"
          tom="neutro"
        />
        <Kpi
          href="/projetos?status=concluido"
          icone="trofeu"
          rotulo="Concluídos"
          valor={concluidos}
          detalhe="resultado entregue"
          tom="ouro"
        />
      </div>

      <NovoProjeto />

      <div className="mt-4 flex flex-wrap gap-1.5">
        {FILTROS.map((f) => {
          const on = status === f.valor;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todos" ? "/projetos" : `/projetos?status=${f.valor}`}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                on
                  ? "border-projects/40 bg-projects/10 font-medium text-projects"
                  : "border-line bg-white/50 text-muted hover:border-projects/25 hover:text-cream"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        {projetos.length === 0 ? (
          <Vazio
            icone="projetos"
            titulo="Nenhum projeto neste filtro."
            texto="Comece pelo que já está em movimento. Um projeto é qualquer resultado que exige mais de uma ação."
            tom="projetos"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {projetos.map((p) => {
              const prog = progresso.get(p.id);
              const tarefas = tarefasPorProjeto.get(p.id) ?? [];
              const info = STATUS[p.status] ?? STATUS.ativo;
              const pct =
                prog && prog.total > 0 ? Math.round((prog.feitas / prog.total) * 100) : 0;
              const semPasso = p.status === "ativo" && !p.proxima_acao?.trim();

              return (
                <article
                  key={p.id}
                  className="card card-hover group flex flex-col overflow-hidden"
                >
                  <div className={`h-1 w-full ${info.barra}`} />
                  <div className="flex flex-1 flex-col p-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge tone={info.tone}>{info.label}</Badge>
                          <AreaBadge area={p.area} />
                          {semPasso ? <Badge tone="urgente">sem próxima ação</Badge> : null}
                        </div>
                        <h3 className="text-sm leading-tight font-semibold tracking-tight text-cream">
                          {p.nome}
                        </h3>
                        {p.resultado ? <DescricaoExpansivel texto={p.resultado} /> : null}
                        <details className="mt-1">
                          <summary className="cursor-pointer list-none text-[10px] text-muted/70 transition hover:text-projects">
                            {p.resultado ? "editar descrição" : "adicionar descrição"}
                          </summary>
                          <form action={atualizarResultado} className="mt-1.5 space-y-1.5">
                            <input type="hidden" name="id" value={p.id} />
                            <textarea
                              name="resultado"
                              rows={5}
                              defaultValue={p.resultado ?? ""}
                              placeholder="Objetivo, plano, referências… o que você precisa lembrar quando abrir este projeto."
                              className="field resize-y text-xs"
                            />
                            <button type="submit" className="btn-ghost h-7 px-2 text-[11px]">
                              salvar descrição
                            </button>
                          </form>
                        </details>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Anel valor={pct} tom={info.tone} tamanho={44} espessura={4}>
                          <span className="text-[10px] font-semibold text-cream tabular-nums">
                            {pct}%
                          </span>
                        </Anel>
                        <form action={excluirProjeto}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            title="Excluir projeto"
                            className="btn-quiet px-1 py-0.5 text-muted opacity-0 transition group-hover:opacity-100 hover:text-rose"
                          >
                            <Ico nome="lixo" className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted">
                      <span className="flex items-center gap-1">
                        <Ico nome="camadas" className="h-3 w-3" />
                        {prog?.feitas ?? 0}/{prog?.total ?? 0} tarefas
                      </span>
                      <span className="h-1 w-1 rounded-full bg-muted/30" />
                      <Link
                        href={`/tarefas?projeto=${p.id}`}
                        className="ml-auto text-muted hover:text-projects"
                      >
                        abrir tarefas →
                      </Link>
                    </div>

                    <form
                      action={definirProximaAcao}
                      className={`mt-2 rounded-xl border p-2.5 ${
                        semPasso
                          ? "border-urgent/35 bg-urgent/[0.08]"
                          : "border-projects/30 bg-projects/[0.08]"
                      }`}
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <label
                        className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.14em] ${
                          semPasso ? "text-urgent" : "text-projects"
                        }`}
                      >
                        <Ico nome="alvo" className="h-3 w-3" />
                        próxima ação
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          name="proxima_acao"
                          defaultValue={p.proxima_acao ?? ""}
                          placeholder="Definir o próximo passo…"
                          className="min-w-0 flex-1 bg-transparent text-sm text-cream placeholder:text-muted/50 outline-none"
                        />
                        <button
                          type="submit"
                          className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] transition ${
                            semPasso
                              ? "border-urgent/30 text-urgent hover:bg-urgent/10"
                              : "border-line text-muted hover:border-projects/40 hover:text-projects"
                          }`}
                        >
                          salvar
                        </button>
                      </div>
                    </form>

                    {tarefas.length > 0 ? (
                      <ul className="mt-2 space-y-0.5">
                        {tarefas.map((t) => (
                          <li key={t.id} className="flex items-start gap-2 px-1 py-1">
                            <form action={alternarTarefa} className="pt-0.5">
                              <input type="hidden" name="id" value={t.id} />
                              <button
                                type="submit"
                                aria-label="Concluir tarefa"
                                className="flex h-4 w-4 items-center justify-center rounded-full border border-muted/40 text-transparent transition hover:border-done hover:bg-done/10 hover:text-done"
                              >
                                <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.6} />
                              </button>
                            </form>
                            <span className="line-clamp-1 text-xs text-cream/75">
                              {t.titulo}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-line/50 pt-3">
                      <div className="flex items-center gap-1">
                        {(["ativo", "pausado", "concluido"] as const).map((s) => (
                          <form key={s} action={mudarStatusProjeto}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="status" value={s} />
                            <button
                              type="submit"
                              disabled={p.status === s}
                              className={`rounded-full px-2 py-0.5 text-[10px] transition ${
                                p.status === s
                                  ? STATUS[s].tone === "feito"
                                    ? "bg-done/12 text-done"
                                    : STATUS[s].tone === "ouro"
                                      ? "bg-gold/12 text-gold"
                                      : "bg-panel2 text-cream"
                                  : "text-muted/60 hover:text-cream"
                              }`}
                            >
                              {STATUS[s].label}
                            </button>
                          </form>
                        ))}
                      </div>
                      <Link
                        href={`/tarefas?projeto=${p.id}`}
                        className="flex items-center gap-1 text-[10px] text-muted hover:text-projects"
                      >
                        <Ico nome="plus" className="h-3 w-3" />
                        tarefa
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
