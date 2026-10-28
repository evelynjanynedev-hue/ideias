import { alternarFoco, alternarTarefa, excluirTarefa } from "@/app/actions";
import { dataCurta, hoje } from "@/lib/format";
import { janelaLabel, janelaPorKey } from "@/lib/janelas";
import type { Tarefa } from "@/lib/types";
import { Ico } from "./icons";
import { AreaBadge } from "./ui";

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
  const janela = janelaPorKey(tarefa.janela);

  return (
    <div className="group flex items-start gap-2 rounded-lg border border-transparent px-2 py-2 transition hover:border-line/70 hover:bg-panel2/40">
      <form action={alternarTarefa} className="pt-0.5">
        <input type="hidden" name="id" value={tarefa.id} />
        <button
          type="submit"
          aria-label={feita ? "Reabrir tarefa" : "Concluir tarefa"}
          className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
            feita
              ? "border-sage/60 bg-sage/20 text-sage"
              : "border-muted/40 text-transparent hover:border-gold hover:text-gold/70"
          }`}
        >
          <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.4} />
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[13px] leading-relaxed ${
            feita ? "text-muted/60 line-through" : "text-cream/90"
          }`}
        >
          {tarefa.titulo}
        </p>
        {!feita ? (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <AreaBadge area={tarefa.area} />
            {janela ? (
              <span className="chip">
                <Ico nome="janelas" className="h-2.5 w-2.5" />
                {janelaLabel(janela)}
              </span>
            ) : null}
            {projetoNome ? (
              <span className="chip">
                <Ico nome="projetos" className="h-2.5 w-2.5" />
                {projetoNome}
              </span>
            ) : null}
            {pessoaNome ? (
              <span className="chip">
                <Ico nome="pessoas" className="h-2.5 w-2.5" />
                {pessoaNome}
              </span>
            ) : null}
            {tarefa.vence_em ? (
              <span
                className={`chip ${
                  atrasada
                    ? "border-rose/30 bg-rose/10 text-rose"
                    : tarefa.vence_em === hoje()
                      ? "border-gold/30 bg-gold/10 text-gold"
                      : ""
                }`}
              >
                {atrasada
                  ? `atrasada · ${dataCurta(tarefa.vence_em)}`
                  : tarefa.vence_em === hoje()
                    ? "hoje"
                    : dataCurta(tarefa.vence_em)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {!feita ? (
        <div className="flex items-center gap-0.5">
          <form action={alternarFoco}>
            <input type="hidden" name="id" value={tarefa.id} />
            <button
              type="submit"
              title={tarefa.foco ? "Remover das prioridades" : "Marcar como prioridade"}
              className={`btn-quiet ${
                tarefa.foco ? "text-gold opacity-100" : "opacity-50 hover:opacity-100"
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
              className="btn-quiet text-muted opacity-50 hover:text-rose hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <Ico nome="lixo" className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
