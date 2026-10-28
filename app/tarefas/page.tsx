import Link from "next/link";
import { NovaTarefa } from "@/components/nova-tarefa";
import { TarefaLinha } from "@/components/tarefa-linha";
import { AREAS_DISPONIVEIS, Badge, Cabecalho, Secao, Vazio } from "@/components/ui";
import { hoje } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = { area?: string; projeto?: string };

function Grupo({
  titulo,
  tarefas,
  nomeProjeto,
  nomePessoa,
}: {
  titulo: string;
  tarefas: Awaited<ReturnType<typeof q.listarTarefasAbertas>>;
  nomeProjeto: Map<string, string>;
  nomePessoa: Map<string, string>;
}) {
  if (tarefas.length === 0) return null;
  return (
    <Secao titulo={`${titulo} · ${tarefas.length}`}>
      <div className="card p-1">
        {tarefas.map((t) => (
          <TarefaLinha
            key={t.id}
            tarefa={t}
            projetoNome={t.projeto_id ? nomeProjeto.get(t.projeto_id) : null}
            pessoaNome={t.pessoa_id ? nomePessoa.get(t.pessoa_id) : null}
          />
        ))}
      </div>
    </Secao>
  );
}

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { area, projeto } = await searchParams;
  const h = hoje();

  const [todasAbertas, feitas, projetos, pessoas] = await Promise.all([
    q.listarTarefasAbertas(),
    q.listarTarefasFeitas(30),
    q.listarProjetos(),
    q.listarPessoas(),
  ]);
  const nomeProjeto = new Map(projetos.map((p) => [p.id, p.nome]));
  const nomePessoa = new Map(pessoas.map((p) => [p.id, p.nome]));
  const projetoAtual = projeto ? projetos.find((p) => p.id === projeto) : undefined;

  const filtrar = (lista: typeof todasAbertas) =>
    lista.filter(
      (t) =>
        (!area || area === "todas" || t.area === area) &&
        (!projeto || t.projeto_id === projeto),
    );

  const abertas = filtrar(todasAbertas);
  const atrasadas = abertas.filter((t) => t.vence_em && t.vence_em < h);
  const doDia = abertas.filter((t) => t.vence_em === h);
  const proximas = abertas.filter((t) => t.vence_em && t.vence_em > h);
  const semData = abertas.filter((t) => !t.vence_em);
  const feitasFiltradas = filtrar(feitas);

  const link = (novaArea?: string) => {
    const params = new URLSearchParams();
    if (novaArea && novaArea !== "todas") params.set("area", novaArea);
    if (projeto) params.set("projeto", projeto);
    const qs = params.toString();
    return qs ? `/tarefas?${qs}` : "/tarefas";
  };

  return (
    <div>
      <Cabecalho
        eyebrow="tarefas"
        titulo="Tarefas"
        sub="Uma lista só: concluir, priorizar ou descartar."
        acao={
          <div className="flex items-center gap-2">
            <Badge tone="ouro">{todasAbertas.length} abertas</Badge>
            {feitas.length > 0 ? <Badge>{feitas.length} feitas</Badge> : null}
          </div>
        }
      />

      <NovaTarefa
        pessoas={pessoas.map((p) => ({ id: p.id, nome: p.nome }))}
        projetos={projetos.map((p) => ({ id: p.id, nome: p.nome }))}
        projetoFixo={projetoAtual?.id}
      />

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Link
          href={link("todas")}
          className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
            !area || area === "todas"
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-line text-muted hover:border-gold/25 hover:text-cream"
          }`}
        >
          todas
        </Link>
        {AREAS_DISPONIVEIS.map((a) => (
          <Link
            key={a.valor}
            href={link(a.valor)}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
              area === a.valor
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-line text-muted hover:border-gold/25 hover:text-cream"
            }`}
          >
            {a.label}
          </Link>
        ))}
        {projetoAtual ? (
          <span className="ml-1 flex items-center gap-2 rounded-full border border-lilac/30 bg-lilac/10 px-3 py-1 text-[11px] text-lilac">
            projeto: {projetoAtual.nome}
            <Link href={link(area)} className="text-lilac/70 hover:text-lilac">
              ×
            </Link>
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {abertas.length === 0 ? (
          <Vazio
            icone="tarefas"
            titulo="Nenhuma tarefa aberta neste filtro."
            texto="Ou você está em dia, ou está evitando olhar. Se for a segunda opção, comece pela menor tarefa."
          />
        ) : (
          <>
            <Grupo
              titulo="Atrasadas"
              tarefas={atrasadas}
              nomeProjeto={nomeProjeto}
              nomePessoa={nomePessoa}
            />
            <Grupo
              titulo="Hoje"
              tarefas={doDia}
              nomeProjeto={nomeProjeto}
              nomePessoa={nomePessoa}
            />
            <Grupo
              titulo="Próximas"
              tarefas={proximas}
              nomeProjeto={nomeProjeto}
              nomePessoa={nomePessoa}
            />
            <Grupo
              titulo="Sem data"
              tarefas={semData}
              nomeProjeto={nomeProjeto}
              nomePessoa={nomePessoa}
            />
          </>
        )}
      </div>

      {feitasFiltradas.length > 0 ? (
        <details className="group mt-6">
          <summary className="flex cursor-pointer items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted transition hover:text-cream">
            <span className="transition group-open:rotate-90">›</span>
            concluídas recentemente · {feitasFiltradas.length}
          </summary>
          <div className="card mt-3 p-1 opacity-80">
            {feitasFiltradas.map((t) => (
              <TarefaLinha
                key={t.id}
                tarefa={t}
                projetoNome={t.projeto_id ? nomeProjeto.get(t.projeto_id) : null}
                pessoaNome={t.pessoa_id ? nomePessoa.get(t.pessoa_id) : null}
              />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
