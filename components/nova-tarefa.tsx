import { criarTarefa } from "@/app/actions";
import { AREAS_DISPONIVEIS } from "./ui";
import { BotaoEnviar } from "./botao-enviar";
import { Ico } from "./icons";
import { JANELAS, janelaLabel } from "@/lib/janelas";
import { FASES, PRESETS, duracao } from "@/lib/tempo";

export function NovaTarefa({
  pessoas = [],
  projetos = [],
  projetoFixo,
}: {
  pessoas?: { id: string; nome: string }[];
  projetos?: { id: string; nome: string }[];
  projetoFixo?: string;
}) {
  return (
    <details className="group card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-medium text-cream transition hover:bg-panel2/40">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gold/10 text-gold">
          <Ico nome="plus" className="h-3 w-3" />
        </span>
        Nova tarefa
        <span className="ml-auto text-[10px] font-normal text-muted">
          o próximo passo concreto
        </span>
      </summary>

      <form
        action={criarTarefa}
        className="grid grid-cols-1 gap-3 border-t border-line/60 p-3 sm:grid-cols-2"
      >
        {projetoFixo ? (
          <input type="hidden" name="projeto_id" value={projetoFixo} />
        ) : null}

        <div className="sm:col-span-2">
          <label className="label" htmlFor="nova-tarefa-titulo">
            O que precisa ser feito?
          </label>
          <input
            id="nova-tarefa-titulo"
            name="titulo"
            className="field"
            placeholder="Verbo + resultado. Ex.: Enviar escopo revisado para Ana"
            required
          />
        </div>

        <div>
          <label className="label">Área</label>
          <select name="area" className="field" defaultValue="pessoal">
            {AREAS_DISPONIVEIS.map((a) => (
              <option key={a.valor} value={a.valor}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Janela do dia</label>
          <select name="janela" className="field" defaultValue="">
            <option value="">sem janela</option>
            {JANELAS.map((j) => (
              <option key={j.key} value={j.key}>
                {janelaLabel(j)} · {j.orgao}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Vence em</label>
          <input type="date" name="vence_em" className="field" />
        </div>

        <div>
          <label className="label">Prioridade</label>
          <select name="prioridade" className="field" defaultValue="2">
            <option value="1">Alta</option>
            <option value="2">Média</option>
            <option value="3">Baixa</option>
          </select>
        </div>

        {!projetoFixo && projetos.length > 0 ? (
          <div>
            <label className="label">Projeto</label>
            <select name="projeto_id" className="field" defaultValue="">
              <option value="">nenhum</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {pessoas.length > 0 ? (
          <div>
            <label className="label">Pessoa</label>
            <select name="pessoa_id" className="field" defaultValue="">
              <option value="">ninguém</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <details className="rounded-xl border border-line/60 bg-panel2/30 px-3 py-2 sm:col-span-2">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-1.5 text-xs font-medium text-cream/85">
            <Ico nome="ampulheta" className="h-3.5 w-3.5 text-window" />
            Tempo por fase
            <span className="text-[10px] font-normal text-muted">
              opcional · se vazio, sugerimos pelo peso da tarefa
            </span>
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            {FASES.map((fase) => (
              <label key={fase.key} className="block">
                <span className="mb-0.5 flex items-center gap-1 text-[10px] text-muted">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: fase.cor }}
                  />
                  {fase.label}
                </span>
                <span className="relative block">
                  <input
                    type="number"
                    name={`min_${fase.key}`}
                    min={0}
                    max={600}
                    step={1}
                    placeholder={String(PRESETS.media[fase.key])}
                    className="field h-8 pr-7 text-xs tabular-nums"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[9px] text-muted/60">
                    min
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-[9px] leading-relaxed text-muted/70">
            Rápida {FASES.map((f) => duracao(PRESETS.rapida[f.key])).join(" · ")} ·
            média {FASES.map((f) => duracao(PRESETS.media[f.key])).join(" · ")} ·
            profunda {FASES.map((f) => duracao(PRESETS.profunda[f.key])).join(" · ")}
          </p>
        </details>

        <label className="flex items-center gap-2 text-xs text-muted sm:col-span-2">
          <input type="checkbox" name="foco" className="h-3.5 w-3.5 accent-[#96613a]" />
          Marcar como prioridade do dia (até 3)
        </label>

        <div className="flex justify-end sm:col-span-2">
          <BotaoEnviar className="btn-gold h-8 px-3 text-xs">
            <Ico nome="plus" className="h-3 w-3" />
            Criar tarefa
          </BotaoEnviar>
        </div>
      </form>
    </details>
  );
}
