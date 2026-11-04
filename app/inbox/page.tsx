import { Captura } from "@/components/captura";
import { ProcessarItem } from "@/components/processar-item";
import { Badge, Cabecalho, Vazio } from "@/components/ui";
import { Ico } from "@/components/icons";
import { tempoRelativo } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

const Destino: Record<string, { label: string; tone: "ouro" | "notas" | "pessoas" | "projetos" }> = {
  tarefa: { label: "tarefa", tone: "ouro" },
  nota: { label: "nota", tone: "notas" },
  pessoa: { label: "pessoa", tone: "pessoas" },
  projeto: { label: "projeto", tone: "projetos" },
};

export default async function InboxPage() {
  const [itens, processados, listaPessoas, listaProjetos] = await Promise.all([
    q.listarInbox(),
    q.listarProcessados(10),
    q.listarPessoas(),
    q.listarProjetos(),
  ]);
  const pessoas = listaPessoas.map((p) => ({ id: p.id, nome: p.nome }));
  const projetos = listaProjetos.map((p) => ({ id: p.id, nome: p.nome }));

  return (
    <div>
      <Cabecalho
        eyebrow="caixa de entrada"
        titulo="Caixa de entrada"
        sub="Capture sem julgar. Depois dê destino: tarefa, nota, pessoa ou projeto."
        icone="inbox"
        tom="inbox"
        acao={
          <div className="flex items-center gap-2">
            <Badge tone={itens.length > 0 ? "inbox" : "feito"}>
              {itens.length > 0
                ? `${itens.length} ${itens.length === 1 ? "item" : "itens"} esperando`
                : "caixa limpa"}
            </Badge>
            {processados.length > 0 ? (
              <Badge tone="feito">{processados.length} processados</Badge>
            ) : null}
          </div>
        }
      />

      <div className="relative">
        <span className="absolute -top-1.5 -left-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-inbox text-white shadow-sm">
          <Ico nome="plus" className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <Captura />
      </div>

      <div className="mt-5">
        {itens.length === 0 ? (
          <Vazio
            icone="inbox"
            titulo="Caixa limpa."
            texto="Nada esperando decisão. Quando algo chegar — uma ideia, um recado, um incômodo — jogue aqui em vez de guardar na cabeça."
            tom="feito"
          />
        ) : (
          <div className="space-y-2">
            {itens.map((item, i) => (
              <div
                key={item.id}
                className="anim-rise"
                style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
              >
                <ProcessarItem item={item} pessoas={pessoas} projetos={projetos} />
              </div>
            ))}
          </div>
        )}
      </div>

      {processados.length > 0 ? (
        <details className="group mt-6">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-done/25 bg-done/[0.05] px-3 py-2.5 text-[11px] font-medium text-done transition hover:border-done/40">
            <Ico nome="check-circulo" className="h-3.5 w-3.5" />
            processados recentemente
            <span className="rounded-full bg-done/15 px-1.5 py-0.5 text-[10px] tabular-nums">
              {processados.length}
            </span>
            <span className="ml-auto text-[10px] font-normal text-muted/60 group-open:hidden">
              abrir
            </span>
          </summary>
          <ul className="mt-2 space-y-1">
            {processados.map((item) => {
              const destino = item.destino_tipo ? Destino[item.destino_tipo] : undefined;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-line/40 bg-panel/40 px-3 py-2"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-done/15 text-done">
                    <Ico nome="check" className="h-2.5 w-2.5" strokeWidth={2.8} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-muted">
                    {item.texto}
                  </span>
                  {destino ? <Badge tone={destino.tone}>{destino.label}</Badge> : null}
                  <span className="shrink-0 text-[10px] text-muted/50">
                    {tempoRelativo(item.criado_em)}
                  </span>
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
