"use client";

import { useState } from "react";

/**
 * Descrição de projeto que abre no lugar.
 * O cartão mostra duas linhas; o texto completo (objetivo, plano, referências)
 * fica a um clique — sem sair da página.
 */
export function DescricaoExpansivel({
  texto,
  limite = 160,
}: {
  texto: string;
  limite?: number;
}) {
  const [aberto, setAberto] = useState(false);
  const longo = texto.length > limite || texto.includes("\n");

  return (
    <div className="mt-1">
      <p
        className={`whitespace-pre-line text-[11px] leading-relaxed text-muted ${
          aberto ? "" : "line-clamp-2"
        }`}
      >
        {texto}
      </p>
      {longo ? (
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="mt-1 text-[10px] font-medium text-gold/80 transition hover:text-gold"
        >
          {aberto ? "ver menos" : "ver descrição completa"}
        </button>
      ) : null}
    </div>
  );
}
