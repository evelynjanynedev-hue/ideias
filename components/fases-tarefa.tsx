import { FASES, duracao, fasesDaTarefa, importancia } from "@/lib/tempo";
import type { Tarefa } from "@/lib/types";
import { Ico } from "./icons";

type TarefaFases = Pick<
  Tarefa,
  | "prioridade"
  | "foco"
  | "vence_em"
  | "min_analisar"
  | "min_organizar"
  | "min_criar"
  | "min_executar"
  | "min_registrar"
>;

/**
 * Barra segmentada com o tempo de cada fase. O desenho mostra, de relance,
 * onde a decisão realmente gasta o dia — análise, organização, criação,
 * execução e registro.
 */
export function FasesTarefa({
  tarefa,
  compacto = false,
  className = "",
}: {
  tarefa: TarefaFases;
  compacto?: boolean;
  className?: string;
}) {
  const { minutos, total, personalizado } = fasesDaTarefa(tarefa);

  if (total <= 0) return null;

  return (
    <div className={`min-w-0 ${className}`}>
      <div
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-panel2/90"
        title={`${personalizado ? "tempo definido" : "tempo sugerido"} · total ${duracao(total)}`}
      >
        {FASES.map((fase) => {
          const fatia = (minutos[fase.key] / total) * 100;
          return (
            <span
              key={fase.key}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${fatia}%`, backgroundColor: fase.cor }}
              title={`${fase.label} · ${duracao(minutos[fase.key])}`}
            />
          );
        })}
      </div>

      {compacto ? (
        <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted/70">
          <span className="tabular-nums">{duracao(total)}</span>
          <span>·</span>
          <span>{personalizado ? "definido" : "sugerido"}</span>
        </div>
      ) : (
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {FASES.map((fase) => (
            <span
              key={fase.key}
              className="inline-flex items-center gap-1 rounded-full border border-line/60 bg-white/45 px-1.5 py-0.5 text-[9px] text-muted"
              title={fase.pergunta}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: fase.cor }}
              />
              {fase.curto}
              <span className="font-medium text-cream/75 tabular-nums">
                {duracao(minutos[fase.key])}
              </span>
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-[9px] text-muted/70">
            <Ico nome="ampulheta" className="h-2.5 w-2.5" />
            <span className="tabular-nums">{duracao(total)}</span>
            <span>{personalizado ? "definido" : "sugerido"}</span>
          </span>
        </div>
      )}
    </div>
  );
}

const CORES_IMPORTANCIA = {
  urgente: "border-urgent/30 bg-urgent/10 text-urgent",
  foco: "border-focus/30 bg-focus/10 text-focus",
  neutro: "border-line/70 bg-white/45 text-muted",
} as const;

/** Importância explícita: alta, média ou leve — com o motivo no title. */
export function ImportanciaChip({
  tarefa,
  curto = false,
}: {
  tarefa: Pick<Tarefa, "prioridade" | "foco" | "vence_em">;
  curto?: boolean;
}) {
  const i = importancia(tarefa);
  const rotulo = curto
    ? i.nivel === 3
      ? "alta"
      : i.nivel === 2
        ? "média"
        : "leve"
    : i.label;

  return (
    <span
      className={`chip ${CORES_IMPORTANCIA[i.tom]}`}
      title={`${i.label} — ${i.motivo}`}
    >
      <Ico nome="balanca" className="h-2.5 w-2.5" />
      {rotulo}
    </span>
  );
}
