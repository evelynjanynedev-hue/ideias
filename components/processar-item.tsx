"use client";

import { useState } from "react";
import {
  arquivarItem,
  excluirItem,
  processarItem,
} from "@/app/actions";
import { JANELAS, janelaLabel } from "@/lib/janelas";
import { tempoRelativo } from "@/lib/format";
import type { Item } from "@/lib/types";
import { AREAS_DISPONIVEIS } from "./ui";
import { BotaoEnviar } from "./botao-enviar";
import { Ico, type IconeNome } from "./icons";

type Tipo = "tarefa" | "nota" | "pessoa" | "projeto";

const opcoes: { tipo: Tipo; nome: string; icone: IconeNome }[] = [
  { tipo: "tarefa", nome: "Tarefa", icone: "tarefas" },
  { tipo: "nota", nome: "Nota", icone: "notas" },
  { tipo: "pessoa", nome: "Pessoa", icone: "pessoas" },
  { tipo: "projeto", nome: "Projeto", icone: "projetos" },
];

function truncar(texto: string, n = 90) {
  const limpo = texto.replace(/\s+/g, " ").trim();
  return limpo.length > n ? `${limpo.slice(0, n).trim()}…` : limpo;
}

export function ProcessarItem({
  item,
  pessoas,
  projetos,
}: {
  item: Item;
  pessoas: { id: string; nome: string }[];
  projetos: { id: string; nome: string }[];
}) {
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const tituloSugerido = truncar(item.texto);

  return (
    <article className="card p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-cream/90">
            {item.texto}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            {item.fonte ? (
              <span className="chip">
                <Ico nome="seta" className="h-3 w-3" />
                {item.fonte}
              </span>
            ) : null}
            <span>{tempoRelativo(item.criado_em)}</span>
          </div>
        </div>
        <form action={arquivarItem}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="btn-quiet"
            title="Arquivar sem processar"
            aria-label="Arquivar"
          >
            <Ico nome="x" className="h-4 w-4" />
          </button>
        </form>
      </div>

      {tipo ? (
        <form
          action={async (fd) => {
            await processarItem(fd);
            setTipo(null);
          }}
          className="mt-4 border-t border-line/70 pt-4"
        >
          <input type="hidden" name="item_id" value={item.id} />
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="tipo" value={tipo} />

          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold/80">
              <Ico
                nome={opcoes.find((o) => o.tipo === tipo)!.icone}
                className="h-3.5 w-3.5"
              />
              nova {tipo}
            </span>
            <button
              type="button"
              onClick={() => setTipo(null)}
              className="text-[11px] text-muted hover:text-cream"
            >
              cancelar
            </button>
          </div>

          {tipo === "tarefa" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor={`titulo-${item.id}`}>
                  Ação concreta
                </label>
                <input
                  id={`titulo-${item.id}`}
                  name="titulo"
                  defaultValue={tituloSugerido}
                  className="field"
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
              {projetos.length > 0 ? (
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
              <label className="flex items-center gap-2 text-xs text-muted sm:col-span-2">
                <input
                  type="checkbox"
                  name="foco"
                  className="h-3.5 w-3.5 accent-[#96613a]"
                />
                Marcar como prioridade do dia (até 3)
              </label>
            </div>
          ) : null}

          {tipo === "nota" ? (
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Tipo</label>
                  <select name="nota_tipo" className="field" defaultValue="nota">
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
              </div>
              <div>
                <label className="label">Título</label>
                <input name="titulo" defaultValue={tituloSugerido} className="field" />
              </div>
              <div>
                <label className="label">Conteúdo</label>
                <textarea
                  name="corpo"
                  defaultValue={item.texto}
                  rows={5}
                  className="field resize-y leading-relaxed"
                  required
                />
              </div>
              <div>
                <label className="label">Tags (separadas por vírgula)</label>
                <input name="tags" className="field" placeholder="ideia, trabalho…" />
              </div>
            </div>
          ) : null}

          {tipo === "pessoa" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Nome</label>
                <input
                  name="nome"
                  defaultValue={tituloSugerido}
                  className="field"
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
              <div className="sm:col-span-2">
                <label className="label">Contexto</label>
                <textarea
                  name="contexto"
                  defaultValue={item.texto}
                  rows={2}
                  className="field resize-y"
                />
              </div>
              <div>
                <label className="label">Próximo passo</label>
                <input
                  name="proximo_passo"
                  className="field"
                  placeholder="o que combinaram?"
                />
              </div>
              <div>
                <label className="label">Falar em</label>
                <input type="date" name="proximo_em" className="field" />
              </div>
            </div>
          ) : null}

          {tipo === "projeto" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Nome</label>
                <input
                  name="nome"
                  defaultValue={tituloSugerido}
                  className="field"
                  required
                />
              </div>
              <div>
                <label className="label">Área</label>
                <select name="area" className="field" defaultValue="trabalho">
                  {AREAS_DISPONIVEIS.map((a) => (
                    <option key={a.valor} value={a.valor}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Resultado esperado</label>
                <textarea
                  name="resultado"
                  defaultValue={item.texto}
                  rows={2}
                  className="field resize-y"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Próxima ação</label>
                <input
                  name="proxima_acao"
                  className="field"
                  placeholder="qual o próximo passo concreto?"
                />
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="submit"
              formAction={excluirItem}
              className="btn-danger text-[11px]"
            >
              <Ico nome="lixo" className="h-3.5 w-3.5" />
              descartar
            </button>
            <BotaoEnviar>
              Criar {tipo}
              <Ico nome="seta" className="h-3.5 w-3.5" />
            </BotaoEnviar>
          </div>
        </form>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opcoes.map((o) => (
            <button
              key={o.tipo}
              type="button"
              onClick={() => setTipo(o.tipo)}
              className="btn-ghost px-2.5 py-1 text-[11px]"
            >
              <Ico nome={o.icone} className="h-3.5 w-3.5" />
              {o.nome}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
