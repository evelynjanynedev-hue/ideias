import Link from "next/link";
import { criarNota, excluirNota } from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Ico } from "@/components/icons";
import { AREAS_DISPONIVEIS, AreaBadge, Cabecalho, Vazio } from "@/components/ui";
import { tempoRelativo } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

const TIPOS = [
  { valor: "todas", label: "todas" },
  { valor: "insight", label: "insights" },
  { valor: "nota", label: "notas" },
  { valor: "referencia", label: "referências" },
];

const TIPO_INFO: Record<
  string,
  { label: string; classe: string }
> = {
  insight: { label: "insight", classe: "border-gold/30 bg-gold/10 text-gold" },
  nota: { label: "nota", classe: "border-lilac/30 bg-lilac/10 text-lilac" },
  referencia: {
    label: "referência",
    classe: "border-sage/30 bg-sage/10 text-sage",
  },
};

function NovaNota() {
  return (
    <details className="group card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-medium text-cream transition hover:bg-panel2/40">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gold/10 text-gold">
          <Ico nome="plus" className="h-3 w-3" />
        </span>
        Nova nota
        <span className="ml-auto text-[10px] font-normal text-muted">
          guarde o que vale lembrar
        </span>
      </summary>

      <form action={criarNota} className="grid grid-cols-1 gap-3 border-t border-line/60 p-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Título (opcional)</label>
          <input name="titulo" className="field" placeholder="Uma frase que resume" />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select name="tipo" className="field" defaultValue="nota">
            <option value="nota">Nota</option>
            <option value="insight">Insight</option>
            <option value="referencia">Referência</option>
          </select>
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
          <label className="label">Conteúdo</label>
          <textarea
            name="corpo"
            rows={4}
            className="field resize-y leading-relaxed"
            placeholder="Escreva sem editar. Depois você organiza."
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Tags (separadas por vírgula)</label>
          <input name="tags" className="field" placeholder="ideia, referência, projeto…" />
        </div>
        <div className="flex justify-end sm:col-span-2">
          <BotaoEnviar className="btn-gold h-8 px-3 text-xs">
            <Ico nome="plus" className="h-3 w-3" />
            Salvar nota
          </BotaoEnviar>
        </div>
      </form>
    </details>
  );
}

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo = "todas" } = await searchParams;
  const notas = q.listarNotas(tipo);

  return (
    <div>
      <Cabecalho
        eyebrow="notas & insights"
        titulo="Notas"
        sub="Insights, referências e pensamentos soltos para reler e conectar."
        acao={<span className="chip">{notas.length} registros</span>}
      />

      <NovaNota />

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TIPOS.map((t) => (
          <Link
            key={t.valor}
            href={t.valor === "todas" ? "/notas" : `/notas?tipo=${t.valor}`}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
              tipo === t.valor
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-line text-muted hover:border-gold/25 hover:text-cream"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-4">
        {notas.length === 0 ? (
          <Vazio
            icone="notas"
            titulo="Nada guardado ainda."
            texto="Toda ideia que você não registra vira ruído de fundo. Capture uma agora — mesmo incompleta."
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {notas.map((n) => {
              const info = TIPO_INFO[n.tipo] ?? TIPO_INFO.nota;
              return (
                <article key={n.id} className="group card flex flex-col p-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${info.classe}`}
                    >
                      {info.label}
                    </span>
                    <AreaBadge area={n.area} />
                    <span className="ml-auto text-[10px] text-muted/60">
                      {tempoRelativo(n.criado_em)}
                    </span>
                    <form action={excluirNota}>
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        type="submit"
                        title="Excluir nota"
                        className="btn-quiet -mr-1 px-1 py-0.5 opacity-0 transition group-hover:opacity-100 hover:text-rose"
                      >
                        <Ico nome="lixo" className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>

                  {n.titulo ? (
                    <h3 className="text-sm leading-snug font-semibold tracking-tight text-cream">
                      {n.titulo}
                    </h3>
                  ) : null}
                  <p className="mt-1 line-clamp-6 whitespace-pre-wrap text-xs leading-relaxed text-cream/75">
                    {n.corpo}
                  </p>

                  {n.tags ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {n.tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-panel2 px-2 py-0.5 text-[10px] text-muted"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
