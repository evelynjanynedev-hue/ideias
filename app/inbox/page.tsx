import { Captura } from "@/components/captura";
import { ProcessarItem } from "@/components/processar-item";
import { Cabecalho, Badge, Vazio } from "@/components/ui";
import { tempoRelativo } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

const Destino: Record<string, { label: string; tone: "ouro" | "lilas" | "verde" | "rosa" }> = {
  tarefa: { label: "tarefa", tone: "ouro" },
  nota: { label: "nota", tone: "lilas" },
  pessoa: { label: "pessoa", tone: "verde" },
  projeto: { label: "projeto", tone: "rosa" },
};

export default function InboxPage() {
  const itens = q.listarInbox();
  const processados = q.listarProcessados(10);
  const pessoas = q.listarPessoas().map((p) => ({ id: p.id, nome: p.nome }));
  const projetos = q.listarProjetos().map((p) => ({ id: p.id, nome: p.nome }));

  return (
    <div>
      <Cabecalho
        eyebrow="caixa de entrada"
        titulo="Caixa de entrada"
        sub="Capture sem julgar. Depois dê destino: tarefa, nota, pessoa ou projeto."
        acao={
          <div className="flex items-center gap-2">
            <Badge tone={itens.length > 0 ? "ouro" : "verde"}>
              {itens.length > 0
                ? `${itens.length} ${itens.length === 1 ? "item" : "itens"}`
                : "caixa vazia"}
            </Badge>
          </div>
        }
      />

      <Captura />

      <div className="mt-5">
        {itens.length === 0 ? (
          <Vazio
            icone="inbox"
            titulo="Caixa limpa."
            texto="Nada esperando decisão. Quando algo chegar — uma ideia, um recado, um incômodo — jogue aqui em vez de guardar na cabeça."
          />
        ) : (
          <div className="space-y-2">
            {itens.map((item) => (
              <ProcessarItem
                key={item.id}
                item={item}
                pessoas={pessoas}
                projetos={projetos}
              />
            ))}
          </div>
        )}
      </div>

      {processados.length > 0 ? (
        <details className="group mt-6">
          <summary className="flex cursor-pointer items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted transition hover:text-cream">
            <span className="transition group-open:rotate-90">›</span>
            processados recentemente · {processados.length}
          </summary>
          <ul className="mt-3 space-y-1">
            {processados.map((item) => {
              const destino = item.destino_tipo ? Destino[item.destino_tipo] : undefined;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-line/40 px-3 py-2"
                >
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
