"use client";

import { useRef } from "react";
import { capturar } from "@/app/actions";
import { BotaoEnviar } from "./botao-enviar";
import { Ico } from "./icons";

export function Captura({
  compacta = false,
  placeholder = "O que chegou agora? Uma ideia, um insight, um recado, uma pessoa, um link…",
}: {
  compacta?: boolean;
  placeholder?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await capturar(fd);
        formRef.current?.reset();
        formRef.current?.querySelector("textarea")?.focus();
      }}
      className="card p-3 md:p-4"
    >
      <textarea
        name="texto"
        required
        rows={compacta ? 2 : 3}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        className="w-full resize-none bg-transparent px-1 py-1 text-[15px] leading-relaxed text-cream placeholder:text-muted/50 outline-none"
      />
      <div className="mt-2 flex items-center gap-2 border-t border-line/60 pt-2.5">
        <Ico nome="inbox" className="ml-1 h-4 w-4 shrink-0 text-muted/60" />
        <input
          name="fonte"
          placeholder="de onde veio? (opcional)"
          className="min-w-0 flex-1 bg-transparent px-1 text-xs text-muted placeholder:text-muted/40 outline-none"
        />
        <span className="hidden text-[10px] text-muted/40 sm:block">⌘ + ↵</span>
        <BotaoEnviar className="btn-gold px-4 py-1.5 text-xs">
          <Ico nome="plus" className="h-3.5 w-3.5" />
          Capturar
        </BotaoEnviar>
      </div>
    </form>
  );
}
