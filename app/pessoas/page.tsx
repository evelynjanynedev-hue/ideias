import Link from "next/link";
import { criarPessoa, excluirPessoa, registrarContato } from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Ico } from "@/components/icons";
import {
  AREAS_DISPONIVEIS,
  AreaBadge,
  Badge,
  Cabecalho,
  Kpi,
  TONS_UI,
  Vazio,
  tomArea,
} from "@/components/ui";
import { dataCurta, diasDesde, hoje, iniciais, tempoRelativo } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

const FILTROS = [
  { valor: "todos", label: "todas" },
  { valor: "retomar", label: "para retomar" },
  { valor: "esfriando", label: "esfriando" },
];

function NovaPessoa() {
  return (
    <details className="group card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-medium text-cream transition hover:bg-panel2/40">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-people/10 text-people">
          <Ico nome="plus" className="h-3 w-3" />
        </span>
        Nova pessoa
        <span className="ml-auto text-[10px] font-normal text-muted">
          nome, contexto e próximo passo
        </span>
      </summary>
      <form
        action={criarPessoa}
        className="grid grid-cols-1 gap-3 border-t border-line/60 p-3 sm:grid-cols-2"
      >
        <div>
          <label className="label">Nome</label>
          <input name="nome" className="field" placeholder="Como você chama" required />
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
        <div className="sm:col-span-2">
          <label className="label">Contexto</label>
          <textarea
            name="contexto"
            rows={2}
            className="field resize-y"
            placeholder="Quem é, como se conheceram, o que importa saber"
          />
        </div>
        <div>
          <label className="label">Próximo passo</label>
          <input
            name="proximo_passo"
            className="field"
            placeholder="Enviar proposta, marcar café…"
          />
        </div>
        <div>
          <label className="label">Falar em</label>
          <input type="date" name="proximo_em" className="field" />
        </div>
        <div>
          <label className="label">E-mail</label>
          <input type="email" name="email" className="field" placeholder="opcional" />
        </div>
        <div>
          <label className="label">Telefone</label>
          <input name="telefone" className="field" placeholder="opcional" />
        </div>
        <div className="flex justify-end sm:col-span-2">
          <BotaoEnviar className="btn-gold h-8 px-3 text-xs">
            <Ico nome="plus" className="h-3 w-3" />
            Adicionar
          </BotaoEnviar>
        </div>
      </form>
    </details>
  );
}

export default async function PessoasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro = "todos" } = await searchParams;
  const pessoas = await q.listarPessoas();
  const h = hoje();

  const avaliar = (p: (typeof pessoas)[number]) => {
    const ultimo = diasDesde(p.ultimo_contato);
    const vencido = !!p.proximo_em && p.proximo_em <= h;
    const esfriando = ultimo === null || ultimo >= 21;
    return { ultimo, vencido, esfriando };
  };

  const paraRetomar = pessoas.filter((p) => {
    const a = avaliar(p);
    return a.vencido || a.esfriando;
  }).length;
  const esfriando = pessoas.filter((p) => avaliar(p).esfriando).length;
  const recentes = pessoas.filter((p) => {
    const d = diasDesde(p.ultimo_contato);
    return d !== null && d <= 7;
  }).length;

  const lista =
    filtro === "retomar"
      ? pessoas.filter((p) => {
          const a = avaliar(p);
          return a.vencido || a.esfriando;
        })
      : filtro === "esfriando"
        ? pessoas.filter((p) => avaliar(p).esfriando)
        : pessoas;

  return (
    <div>
      <Cabecalho
        eyebrow="crm pessoal"
        titulo="Pessoas"
        sub="Contexto, último contato e próximo passo de cada relação — para não deixar nada esfriar."
        icone="pessoas"
        tom="pessoas"
        acao={
          <div className="flex items-center gap-1.5">
            <Badge tone="pessoas">
              {pessoas.length} {pessoas.length === 1 ? "pessoa" : "pessoas"}
            </Badge>
            {paraRetomar > 0 ? (
              <Badge tone="urgente">{paraRetomar} para retomar</Badge>
            ) : (
              <Badge tone="feito">em dia</Badge>
            )}
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Kpi
          href="/pessoas"
          icone="pessoas"
          rotulo="Rede"
          valor={pessoas.length}
          detalhe="pessoas no radar"
          tom="pessoas"
        />
        <Kpi
          href="/pessoas?filtro=retomar"
          icone="alvo"
          rotulo="Para retomar"
          valor={paraRetomar}
          detalhe="data vencida ou 21+ dias"
          tom="urgente"
          alerta={paraRetomar > 0}
        />
        <Kpi
          href="/pessoas?filtro=esfriando"
          icone="ampulheta"
          rotulo="Esfriando"
          valor={esfriando}
          detalhe="sem contato recente"
          tom="foco"
          alerta={esfriando > 0}
        />
        <Kpi
          href="/pessoas"
          icone="check-circulo"
          rotulo="Contato (7d)"
          valor={recentes}
          detalhe="relações ativas"
          tom="feito"
        />
      </div>

      <NovaPessoa />

      <div className="mt-4 flex flex-wrap gap-1.5">
        {FILTROS.map((f) => {
          const on = filtro === f.valor;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todos" ? "/pessoas" : `/pessoas?filtro=${f.valor}`}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                on
                  ? "border-people/40 bg-people/10 font-medium text-people"
                  : "border-line bg-white/50 text-muted hover:border-people/25 hover:text-cream"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        {lista.length === 0 ? (
          <Vazio
            icone="pessoas"
            titulo="Ninguém por aqui ainda."
            texto="Adicione as pessoas que fazem parte dos seus projetos e da sua vida."
            tom="pessoas"
          />
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="hidden border-b border-line bg-panel2/40 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-muted md:grid md:grid-cols-[1.2fr_1.5fr_1.2fr_112px_96px_112px] md:gap-3">
              <span>Pessoa</span>
              <span>Contexto</span>
              <span>Próximo passo</span>
              <span>Último contato</span>
              <span>Falar em</span>
              <span className="text-right">Ações</span>
            </div>

            {lista.map((p) => {
              const { ultimo, vencido, esfriando: frio } = avaliar(p);
              const tom = tomArea(p.area);

              return (
                <div
                  key={p.id}
                  className={`group relative grid grid-cols-1 gap-2 border-b border-line/60 px-3 py-3 last:border-0 hover:bg-panel2/20 md:grid-cols-[1.2fr_1.5fr_1.2fr_112px_96px_112px] md:items-center md:gap-3 md:py-2.5 ${
                    vencido ? "bg-urgent/[0.025]" : frio ? "bg-focus/[0.02]" : ""
                  }`}
                >
                  {vencido ? (
                    <span className="absolute top-2 bottom-2 left-0 w-[2.5px] rounded-full bg-urgent" />
                  ) : frio ? (
                    <span className="absolute top-2 bottom-2 left-0 w-[2.5px] rounded-full bg-focus/70" />
                  ) : null}

                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${TONS_UI[tom].tile}`}
                    >
                      {iniciais(p.nome)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-cream">{p.nome}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <AreaBadge area={p.area} />
                        {vencido ? <Badge tone="urgente">falar</Badge> : null}
                      </div>
                    </div>
                  </div>

                  <p className="line-clamp-2 text-[11px] leading-relaxed text-muted md:line-clamp-1">
                    <span className="mr-1 md:hidden">Contexto:</span>
                    {p.contexto || "—"}
                  </p>

                  <p
                    className={`line-clamp-2 text-[11px] leading-relaxed md:line-clamp-1 ${
                      p.proximo_passo ? "font-medium text-cream/85" : "text-muted/60"
                    }`}
                  >
                    <span className="mr-1 text-muted md:hidden">Próximo:</span>
                    {p.proximo_passo || "Sem próximo passo"}
                  </p>

                  <div className="text-[11px]">
                    <span className="mr-1 text-muted md:hidden">Último:</span>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        frio ? "font-medium text-urgent" : "text-muted"
                      }`}
                    >
                      <Ico nome="janelas" className="h-3 w-3 opacity-60" />
                      {p.ultimo_contato ? tempoRelativo(p.ultimo_contato) : "nenhum"}
                    </span>
                  </div>

                  <div className="text-[11px]">
                    <span className="mr-1 text-muted md:hidden">Falar em:</span>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        vencido ? "font-medium text-urgent" : "text-muted"
                      }`}
                    >
                      <Ico nome="calendario" className="h-3 w-3 opacity-60" />
                      {p.proximo_em ? dataCurta(p.proximo_em) : "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 md:justify-end">
                    <form action={registrarContato}>
                      <input type="hidden" name="id" value={p.id} />
                      <BotaoEnviar
                        className="btn h-7 border border-done/30 bg-done/10 px-2 text-[10px] text-done hover:bg-done/15"
                        pendente="salvando…"
                      >
                        <Ico nome="check" className="h-3 w-3" />
                        Contato
                      </BotaoEnviar>
                    </form>
                    {p.email ? (
                      <a
                        href={`mailto:${p.email}`}
                        className="btn-quiet h-7 px-1.5 text-[10px]"
                        title={p.email}
                      >
                        <Ico nome="email" className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    <form action={excluirPessoa}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        title="Excluir pessoa"
                        className="btn-quiet h-7 px-1.5 opacity-0 transition group-hover:opacity-100 hover:text-rose"
                      >
                        <Ico nome="lixo" className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
