"use client";

import { useFormStatus } from "react-dom";

export function BotaoEnviar({
  children,
  className = "btn-gold",
  pendente = "Salvando…",
}: {
  children: React.ReactNode;
  className?: string;
  pendente?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendente : children}
    </button>
  );
}
