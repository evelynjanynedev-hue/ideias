"use client";

import { useActionState, useEffect, useRef } from "react";
import { salvarRevisao, type EstadoRevisao } from "@/app/actions";
import { BotaoEnviar } from "./botao-enviar";
import { Ico } from "./icons";

const INICIAL: EstadoRevisao = { ok: false };

export function RevisaoForm({ titulo }: { titulo: string }) {
  const [estado, acao] = useActionState(salvarRevisao, INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form
      ref={formRef}
      action={acao}
      className="mt-4 border-t border-line/60 pt-4"
    >
      <input type="hidden" name="tipo" value="insight" />
      <input type="hidden" name="area" value="pessoal" />
      <input type="hidden" name="tags" value="revisão, semanal" />
      <input type="hidden" name="titulo" value={titulo} />
      <label className="label" htmlFor="revisao-corpo">
        registrar a revisão
      </label>
      <textarea
        id="revisao-corpo"
        name="corpo"
        rows={4}
        required
        className="field resize-y leading-relaxed"
        placeholder="Escreva o que percebeu — sem performance. Isso vira matéria-prima da próxima semana."
      />

      {estado.ok ? (
        <p className="mt-2 flex items-center gap-1.5 rounded-lg border border-done/25 bg-done/[0.06] px-2.5 py-1.5 text-[11px] text-done">
          <Ico nome="check-circulo" className="h-3.5 w-3.5" />
          Revisão salva. Ela aparece em “O que ficou da semana”.
        </p>
      ) : null}
      {estado.erro ? (
        <p className="mt-2 rounded-lg border border-urgent/25 bg-urgent/[0.06] px-2.5 py-1.5 text-[11px] text-urgent">
          {estado.erro}
        </p>
      ) : null}

      <div className="mt-2 flex justify-end">
        <BotaoEnviar className="btn-ghost text-xs">
          <Ico nome="notas" className="h-3.5 w-3.5" />
          Salvar como insight
        </BotaoEnviar>
      </div>
    </form>
  );
}
