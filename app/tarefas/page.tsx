import Link from "next/link";
import { NovaTarefa } from "@/components/nova-tarefa";
import { TarefaLinha } from "@/components/tarefa-linha";
import {
  AREAS_DISPONIVEIS,
  Badge,
  Cabecalho,
  Kpi,
  Secao,
  TONS_UI,
  Vazio,
  tomArea,
  type Tom,
} from "@/components/ui";
import { Ico } from "@/components/icons";
import { hoje } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = { area?: string; projeto?: string };

function Grupo({
  titulo,
  tom,
  tarefas,
  nomeProjeto,
  nomePessoa,
}: {
  titulo: string;
  tom: Tom;
  tarefas: Awaited<ReturnType<typeof q.listarTarefasAbertas>>;
  nomeProjeto: Map<string, string>;
  nomePessoa: Map<string, string>;
}) {
  if (tarefas.length === 0) return null;
  return (
    <Secao titulo={titulo} tom={tom} contagem={tarefas.length}>
      <div className="card overflow-hidden p-1">
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
  const foco = abertas.filter((t) => t.foco === 1);
  const feitasFiltradas = filtrar(feitas);

  const porArea = new Map<string, number>();
  for (const t of todasAbertas) {
    porArea.set(t.area, (porArea.get(t.area) ?? 0) + 1);
  }

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
        sub="Uma lista só: concluir, priorizar, adiar ou descartar. O que importa fica no topo."
        icone="tarefas"
        tom="ouro"
        acao={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="ouro">{todasAbertas.length} abertas</Badge>
            {atrasadas.length > 0 ? (
              <Badge tone="urgente">{atrasadas.length} atrasadas</Badge>
            ) : null}
            <Badge tone="feito">{feitas.length} feitas</Badge>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Kpi
          href={link(area)}
          icone="ampulheta"
          rotulo="Atrasadas"
          valor={atrasadas.length}
          detalhe="reagende ou solte"
          tom="urgente"
          alerta={atrasadas.length > 0}
        />
        <Kpi
          href={link(area)}
          icone="hoje"
          rotulo="Vencem hoje"
          valor={doDia.length}
          detalhe="para fechar o dia"
          tom="foco"
          alerta={doDia.length > 0}
        />
        <Kpi
          href={link(area)}
          icone="alvo"
          rotulo="Prioridades"
          valor={`${foco.length}/3`}
          detalhe="escolhidas"
          tom="foco"
        />
        <Kpi
          href={link(area)}
          icone="trofeu"
          rotulo="Feitas (30d)"
          valor={feitas.length}
          detalhe="o que já saiu"
          tom="feito"
        />
      </div>

      <NovaTarefa
        pessoas={pessoas.map((p) => ({ id: p.id, nome: p.nome }))}
        projetos={projetos.map((p) => ({ id: p.id, nome: p.nome }))}
        projetoFixo={projetoAtual?.id}
      />

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Link
          href={link("todas")}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition ${
            !area || area === "todas"
              ? "border-gold/40 bg-gold/10 font-medium text-gold"
              : "border-line bg-white/50 text-muted hover:border-gold/25 hover:text-cream"
          }`}
        >
          todas
          <span className="tabular-nums opacity-70">{todasAbertas.length}</span>
        </Link>
        {AREAS_DISPONIVEIS.map((a) => {
          const tom = tomArea(a.valor);
          const on = area === a.valor;
          return (
            <Link
              key={a.valor}
              href={link(a.valor)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition ${
                on
                  ? `${TONS_UI[tom].badge} font-medium`
                  : "border-line bg-white/50 text-muted hover:border-gold/25 hover:text-cream"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${TONS_UI[tom].dot}`} />
              {a.label}
              <span className="tabular-nums opacity-70">{porArea.get(a.valor) ?? 0}</span>
            </Link>
          );
        })}
        {projetoAtual ? (
          <span className="ml-1 flex items-center gap-2 rounded-full border border-projects/30 bg-projects/10 px-3 py-1 text-[11px] text-projects">
            <Ico nome="projetos" className="h-3 w-3" />
            {projetoAtual.nome}
            <Link href={link(area)} className="text-projects/70 hover:text-projects">
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
            tom="ouro"
            acao={
              <Link href="/inbox" className="btn-ghost h-7 px-2.5 text-[11px]">
                <Ico nome="plus" className="h-3 w-3" />
                capturar algo
              </Link>
            }
          />
        ) : (
          <>
            <Grupo
              titulo="Atrasadas"
              tom="urgente"
              tarefas={atrasadas}
              nomeProjeto={nomeProjeto}
              nomePessoa={nomePessoa}
            />
            <Grupo
              titulo="Hoje"
              tom="foco"
              tarefas={doDia}
              nomeProjeto={nomeProjeto}
              nomePessoa={nomePessoa}
            />
            <Grupo
              titulo="Próximas"
              tom="projetos"
              tarefas={proximas}
              nomeProjeto={nomeProjeto}
              nomePessoa={nomePessoa}
            />
            <Grupo
              titulo="Sem data"
              tom="neutro"
              tarefas={semData}
              nomeProjeto={nomeProjeto}
              nomePessoa={nomePessoa}
            />
          </>
        )}
      </div>

      {feitasFiltradas.length > 0 ? (
        <details className="group mt-6">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-done/25 bg-done/[0.05] px-3 py-2.5 text-[11px] font-medium text-done transition hover:border-done/40">
            <Ico nome="check-circulo" className="h-3.5 w-3.5" />
            concluídas recentemente
            <span className="rounded-full bg-done/15 px-1.5 py-0.5 text-[10px] tabular-nums">
              {feitasFiltradas.length}
            </span>
            <span className="ml-auto text-[10px] font-normal text-muted/60 group-open:hidden">
              abrir
            </span>
          </summary>
          <div className="card mt-2 overflow-hidden p-1">
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
