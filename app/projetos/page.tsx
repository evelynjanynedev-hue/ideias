import Link from "next/link";
import {
  alternarTarefa,
  criarProjeto,
  definirProximaAcao,
  excluirProjeto,
  mudarStatusProjeto,
} from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Ico } from "@/components/icons";
import {
  AREAS_DISPONIVEIS,
  AreaBadge,
  Badge,
  Cabecalho,
  Progresso,
  Vazio,
} from "@/components/ui";
import type { Projeto } from "@/lib/types";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

const STATUS: Record<
  Projeto["status"],
  { label: string; tone: "verde" | "ouro" | "neutro" }
> = {
  ativo: { label: "ativo", tone: "verde" },
  pausado: { label: "pausado", tone: "neutro" },
  concluido: { label: "concluído", tone: "ouro" },
};

function NovoProjeto() {
  return (
    <details className="group card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-medium text-cream transition hover:bg-panel2/40">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gold/10 text-gold">
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

export default async function ProjetosPage() {
  const [projetos, progressoBruto] = await Promise.all([
    q.listarProjetos(),
    q.progressoProjetos(),
  ]);
  const progresso = new Map(progressoBruto.map((p) => [p.projeto_id, p]));

  // Carrega as tarefas de cada projeto antes de renderizar (sem await no JSX).
  const tarefasPorProjeto = new Map(
    await Promise.all(
      projetos.map(
        async (p) => [p.id, (await q.tarefasPorProjeto(p.id)).slice(0, 3)] as const,
      ),
    ),
  );

  const ativos = projetos.filter((p) => p.status === "ativo").length;

  return (
    <div>
      <Cabecalho
        eyebrow="projetos"
        titulo="Projetos"
        sub="Cada projeto tem um resultado claro e uma próxima ação."
        acao={
          <div className="flex items-center gap-2">
            <Badge tone="verde">{ativos} ativos</Badge>
            <span className="chip">{projetos.length} no total</span>
          </div>
        }
      />

      <NovoProjeto />

      <div className="mt-4">
        {projetos.length === 0 ? (
          <Vazio
            icone="projetos"
            titulo="Nenhum projeto ainda."
            texto="Comece pelo que já está em movimento. Um projeto é qualquer resultado que exige mais de uma ação."
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {projetos.map((p) => {
              const prog = progresso.get(p.id);
              const tarefas = tarefasPorProjeto.get(p.id) ?? [];
              const info = STATUS[p.status] ?? STATUS.ativo;

              return (
                <article key={p.id} className="group card flex flex-col p-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge tone={info.tone}>{info.label}</Badge>
                        <AreaBadge area={p.area} />
                      </div>
                      <h3 className="text-sm leading-tight font-semibold tracking-tight text-cream">
                        {p.nome}
                      </h3>
                      {p.resultado ? (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">
                          {p.resultado}
                        </p>
                      ) : null}
                    </div>
                    <form action={excluirProjeto}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        title="Excluir projeto"
                        className="btn-quiet px-1 py-0.5 opacity-0 transition group-hover:opacity-100 hover:text-rose"
                      >
                        <Ico nome="lixo" className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <Progresso
                      feitas={prog?.feitas ?? 0}
                      total={prog?.total ?? 0}
                    />
                    <Link
                      href={`/tarefas?projeto=${p.id}`}
                      className="ml-auto text-[10px] text-muted hover:text-gold"
                    >
                      abrir tarefas →
                    </Link>
                  </div>

                  <form
                    action={definirProximaAcao}
                    className="mt-2 rounded-lg border border-line/60 bg-paper/80 p-2.5"
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <label className="text-[10px] uppercase tracking-[0.16em] text-gold/70">
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
                        className="shrink-0 rounded-lg border border-line px-2 py-1 text-[10px] text-muted transition hover:border-gold/40 hover:text-gold"
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
                              className="flex h-4 w-4 items-center justify-center rounded-full border border-muted/40 text-transparent transition hover:border-gold hover:text-gold/70"
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
                                ? "bg-panel2 text-cream"
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
                      className="text-[10px] text-muted hover:text-gold"
                    >
                      + tarefa
                    </Link>
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
