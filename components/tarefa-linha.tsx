import {
  adiarTarefa,
  alternarFoco,
  alternarTarefa,
  excluirTarefa,
  registrarResultado,
} from "@/app/actions";
import { dataCurta, hoje } from "@/lib/format";
import { janelaLabel, janelaPorKey } from "@/lib/janelas";
import type { Tarefa } from "@/lib/types";
import { FasesTarefa, ImportanciaChip } from "./fases-tarefa";
import { Ico } from "./icons";
import { AreaBadge } from "./ui";

const PRIORIDADE: Record<number, { rotulo: string; cor: string }> = {
  1: { rotulo: "alta", cor: "bg-urgent" },
  2: { rotulo: "média", cor: "bg-focus" },
  3: { rotulo: "baixa", cor: "bg-muted/35" },
};

export function TarefaLinha({
  tarefa,
  projetoNome,
  pessoaNome,
}: {
  tarefa: Tarefa;
  projetoNome?: string | null;
  pessoaNome?: string | null;
}) {
  const feita = tarefa.status === "feita";
  const atrasada = !feita && !!tarefa.vence_em && tarefa.vence_em < hoje();
  const paraHoje = !feita && tarefa.vence_em === hoje();
  const janela = janelaPorKey(tarefa.janela);
  const prio = PRIORIDADE[tarefa.prioridade] ?? PRIORIDADE[2];

  const barra = feita
    ? "bg-done/50"
    : atrasada
      ? "bg-urgent"
      : tarefa.foco
        ? "bg-focus"
        : tarefa.prioridade === 1
          ? "bg-urgent/60"
          : "bg-transparent";

  return (
    <div
      className={`group relative flex items-start gap-2 rounded-lg border border-transparent px-2 py-2 pl-2.5 transition hover:border-line/70 hover:bg-panel2/40 ${
        feita ? "bg-done/[0.03]" : ""
      }`}
    >
      <span className={`absolute top-2 bottom-2 left-0 w-[2.5px] rounded-full ${barra}`} />

      <form action={alternarTarefa} className="pt-0.5">
        <input type="hidden" name="id" value={tarefa.id} />
        <button
          type="submit"
          aria-label={feita ? "Reabrir tarefa" : "Concluir tarefa"}
          title={feita ? "Reabrir tarefa" : "Concluir tarefa"}
          className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition ${
            feita
              ? "anim-pop border-done/60 bg-done text-white"
              : "border-muted/40 text-transparent hover:border-done hover:bg-done/10 hover:text-done"
          }`}
        >
          <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.8} />
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <p className="flex items-start gap-1.5">
          {!feita && tarefa.prioridade === 1 ? (
            <span
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-urgent"
              title="prioridade alta"
            />
          ) : null}
          <span
            className={`text-[13px] leading-relaxed ${
              feita ? "text-muted/60 line-through decoration-done/40" : "text-cream/90"
            }`}
          >
            {tarefa.titulo}
          </span>
        </p>

        {!feita ? (
          <>
            <div className="mt-1 flex flex-wrap items-center gap-1">
            <AreaBadge area={tarefa.area} />
            {janela ? (
              <span className="chip border-window/25 bg-window/10 text-window">
                <Ico nome="janelas" className="h-2.5 w-2.5" />
                {janelaLabel(janela)}
              </span>
            ) : null}
            {projetoNome ? (
              <span className="chip border-projects/25 bg-projects/10 text-projects">
                <Ico nome="projetos" className="h-2.5 w-2.5" />
                {projetoNome}
              </span>
            ) : null}
            {pessoaNome ? (
              <span className="chip border-people/25 bg-people/10 text-people">
                <Ico nome="pessoas" className="h-2.5 w-2.5" />
                {pessoaNome}
              </span>
            ) : null}
            {tarefa.vence_em ? (
              <span
                className={`chip ${
                  atrasada
                    ? "border-urgent/30 bg-urgent/10 font-medium text-urgent"
                    : paraHoje
                      ? "border-focus/30 bg-focus/10 font-medium text-focus"
                      : ""
                }`}
              >
                <Ico nome="calendario" className="h-2.5 w-2.5" />
                {atrasada
                  ? `atrasada · ${dataCurta(tarefa.vence_em)}`
                  : paraHoje
                    ? "hoje"
                    : dataCurta(tarefa.vence_em)}
              </span>
            ) : null}
            <ImportanciaChip tarefa={tarefa} />
            </div>
            <FasesTarefa tarefa={tarefa} compacto className="mt-1 max-w-[220px]" />
          </>
        ) : (
          <div className="mt-0.5">
            <p className="flex flex-wrap items-center gap-1 text-[10px] text-done/70">
              <Ico nome="check-circulo" className="h-2.5 w-2.5" />
              concluída
              <span className="text-muted/50">· {prio.rotulo}</span>
              <ImportanciaChip tarefa={tarefa} curto />
            </p>

            <FasesTarefa tarefa={tarefa} compacto className="mt-1 max-w-[190px]" />

            {tarefa.resultado ? (
              <p className="mt-1 rounded-md border border-done/20 bg-done/[0.05] px-2 py-1 text-[10px] leading-relaxed text-cream/70">
                <span className="font-medium text-done/80">resultado: </span>
                {tarefa.resultado}
              </p>
            ) : null}

            <details className="mt-1">
              <summary className="cursor-pointer list-none text-[9px] text-muted/60 transition hover:text-done">
                {tarefa.resultado ? "editar resultado" : "registrar resultado"}
              </summary>
              <form
                action={registrarResultado}
                className="mt-1 flex items-start gap-1.5"
              >
                <input type="hidden" name="id" value={tarefa.id} />
                <textarea
                  name="resultado"
                  rows={2}
                  defaultValue={tarefa.resultado ?? ""}
                  placeholder="O que ficou de concreto depois disso?"
                  className="field flex-1 resize-y text-[10px] leading-relaxed"
                />
                <button type="submit" className="btn-ghost h-7 px-2 text-[10px]">
                  salvar
                </button>
              </form>
            </details>
          </div>
        )}
      </div>

      {!feita ? (
        <div className="flex items-center gap-0.5">
          <form action={adiarTarefa}>
            <input type="hidden" name="id" value={tarefa.id} />
            <button
              type="submit"
              title="Adiar para amanhã"
              className="btn-quiet text-muted opacity-50 hover:text-projects hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <Ico nome="calendario" className="h-3.5 w-3.5" />
            </button>
          </form>
          <form action={alternarFoco}>
            <input type="hidden" name="id" value={tarefa.id} />
            <button
              type="submit"
              title={tarefa.foco ? "Remover das prioridades" : "Marcar como prioridade"}
              className={`btn-quiet ${
                tarefa.foco
                  ? "text-focus opacity-100"
                  : "text-muted opacity-40 hover:text-focus hover:opacity-100"
              }`}
            >
              <Ico
                nome="estrela"
                className="h-3.5 w-3.5"
                fill={tarefa.foco ? "currentColor" : "none"}
              />
            </button>
          </form>
          <form action={excluirTarefa}>
            <input type="hidden" name="id" value={tarefa.id} />
            <button
              type="submit"
              title="Excluir tarefa"
              className="btn-quiet text-muted opacity-40 hover:text-rose hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <Ico nome="lixo" className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <span className="chip shrink-0 border-done/25 bg-done/10 text-done">
          <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.8} />
          feita
        </span>
      )}
    </div>
  );
}
