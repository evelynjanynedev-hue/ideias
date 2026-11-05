import Link from "next/link";
import type { ResumoGlobal } from "@/lib/queries";
import { PRATICAS } from "@/lib/presenca";
import { Ico, type IconeNome } from "./icons";

function Pill({
  href,
  icone,
  texto,
  tom,
  alerta = false,
}: {
  href: string;
  icone: IconeNome;
  texto: string;
  tom: string;
  alerta?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition hover:brightness-[0.98] ${tom} ${
        alerta ? "font-medium" : ""
      }`}
    >
      <Ico nome={icone} className="h-3 w-3" />
      <span className="tabular-nums">{texto}</span>
    </Link>
  );
}

export function TopBar({
  resumo,
  janela,
  dia,
}: {
  resumo: ResumoGlobal;
  janela: { label: string; orgao: string } | null;
  dia: string;
}) {
  const pendente = resumo.inbox + resumo.atrasadas + resumo.semAcao + resumo.pessoas;

  return (
    <div className="rail mb-4 flex items-center gap-1.5 overflow-x-auto pb-0.5">
      <span className="hidden shrink-0 pr-1 text-[11px] text-muted/70 sm:block">{dia}</span>

      {janela ? (
        <Link
          href="/janelas"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-window/30 bg-window/10 px-2.5 py-1 text-[11px] font-medium text-window"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-window/60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-window" />
          </span>
          {janela.label} · {janela.orgao}
        </Link>
      ) : null}

      <Pill
        href="/inbox"
        icone="inbox"
        texto={`inbox ${resumo.inbox}`}
        tom="border-inbox/25 bg-inbox/10 text-inbox"
        alerta={resumo.inbox > 0}
      />

      {resumo.atrasadas > 0 ? (
        <Pill
          href="/tarefas"
          icone="ampulheta"
          texto={`${resumo.atrasadas} atrasada${resumo.atrasadas === 1 ? "" : "s"}`}
          tom="border-urgent/30 bg-urgent/10 text-urgent"
          alerta
        />
      ) : (
        <Pill
          href="/tarefas"
          icone="tarefas"
          texto={`${resumo.abertas} abertas`}
          tom="border-line bg-white/60 text-muted"
        />
      )}

      <Pill
        href="/tarefas"
        icone="alvo"
        texto={`foco ${resumo.foco}/3`}
        tom="border-focus/30 bg-focus/10 text-focus"
        alerta={resumo.foco > 0}
      />

      <Pill
        href="/presenca"
        icone="ancora"
        texto={`âncoras ${resumo.ancoras}/${PRATICAS.length}`}
        tom="border-sage/30 bg-sage/10 text-sage"
        alerta={resumo.ancoras === 0}
      />

      {resumo.hoje > 0 ? (
        <Pill
          href="/tarefas"
          icone="hoje"
          texto={`${resumo.hoje} para hoje`}
          tom="border-gold/25 bg-gold/10 text-gold"
        />
      ) : null}

      <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
        {pendente === 0 ? (
          <span className="hidden items-center gap-1 rounded-full border border-done/25 bg-done/10 px-2.5 py-1 text-[11px] text-done sm:flex">
            <Ico nome="check-circulo" className="h-3 w-3" />
            em dia
          </span>
        ) : null}
        <span className="flex items-center gap-1 rounded-full border border-done/25 bg-done/10 px-2.5 py-1 text-[11px] font-medium text-done">
          <Ico nome="trofeu" className="h-3 w-3" />
          <span className="tabular-nums">{resumo.feitasHoje}</span>
          <span className="hidden sm:inline">hoje</span>
        </span>
        <Link href="/inbox" className="btn-gold h-7 px-2.5 text-[11px]">
          <Ico nome="plus" className="h-3 w-3" />
          <span className="hidden sm:inline">capturar</span>
        </Link>
      </span>
    </div>
  );
}
