import { criarPessoa, excluirPessoa, registrarContato } from "@/app/actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Ico } from "@/components/icons";
import { AREAS_DISPONIVEIS, AreaBadge, Cabecalho, Vazio } from "@/components/ui";
import { dataCurta, diasDesde, hoje, iniciais, tempoRelativo } from "@/lib/format";
import * as q from "@/lib/queries";

export const dynamic = "force-dynamic";

function NovaPessoa() {
  return (
    <details className="group card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-medium text-cream transition hover:bg-panel2/40">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gold/10 text-gold">
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

export default async function PessoasPage() {
  const [pessoas, paraRetomar] = await Promise.all([
    q.listarPessoas(),
    q.contarPessoasParaRetomar(),
  ]);
  const h = hoje();

  return (
    <div>
      <Cabecalho
        eyebrow="crm pessoal"
        titulo="Pessoas"
        sub="Contexto, último contato e próximo passo de cada relação."
        acao={
          <div className="flex items-center gap-2">
            <span className="chip">
              {pessoas.length} {pessoas.length === 1 ? "pessoa" : "pessoas"}
            </span>
            {paraRetomar > 0 ? (
              <span className="chip border-gold/30 bg-gold/10 text-gold">
                {paraRetomar} para retomar
              </span>
            ) : null}
          </div>
        }
      />

      <NovaPessoa />

      <div className="mt-4">
        {pessoas.length === 0 ? (
          <Vazio
            icone="pessoas"
            titulo="Ninguém por aqui ainda."
            texto="Adicione as pessoas que fazem parte dos seus projetos e da sua vida."
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

            {pessoas.map((p) => {
              const ultimo = diasDesde(p.ultimo_contato);
              const vencido = !!p.proximo_em && p.proximo_em <= h;
              const esfriando = ultimo === null || ultimo >= 21;

              return (
                <div
                  key={p.id}
                  className="group grid grid-cols-1 gap-2 border-b border-line/60 px-3 py-3 last:border-0 hover:bg-panel2/20 md:grid-cols-[1.2fr_1.5fr_1.2fr_112px_96px_112px] md:items-center md:gap-3 md:py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-[11px] font-semibold text-gold">
                      {iniciais(p.nome)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-cream">{p.nome}</p>
                      <div className="mt-0.5">
                        <AreaBadge area={p.area} />
                      </div>
                    </div>
                  </div>

                  <p className="line-clamp-2 text-[11px] leading-relaxed text-muted md:line-clamp-1">
                    <span className="mr-1 md:hidden">Contexto:</span>
                    {p.contexto || "—"}
                  </p>

                  <p
                    className={`line-clamp-2 text-[11px] leading-relaxed md:line-clamp-1 ${
                      p.proximo_passo ? "text-cream/85" : "text-muted/60"
                    }`}
                  >
                    <span className="mr-1 text-muted md:hidden">Próximo:</span>
                    {p.proximo_passo || "Sem próximo passo"}
                  </p>

                  <div className="text-[11px]">
                    <span className="mr-1 text-muted md:hidden">Último:</span>
                    <span className={esfriando ? "text-rose" : "text-muted"}>
                      {p.ultimo_contato ? tempoRelativo(p.ultimo_contato) : "nenhum"}
                    </span>
                  </div>

                  <div className="text-[11px]">
                    <span className="mr-1 text-muted md:hidden">Falar em:</span>
                    <span className={vencido ? "font-medium text-gold" : "text-muted"}>
                      {p.proximo_em ? dataCurta(p.proximo_em) : "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 md:justify-end">
                    <form action={registrarContato}>
                      <input type="hidden" name="id" value={p.id} />
                      <BotaoEnviar
                        className="btn-ghost h-7 px-2 text-[10px]"
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
                        e-mail
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
