"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ResumoGlobal } from "@/lib/queries";
import { PRATICAS } from "@/lib/presenca";
import { Ico, type IconeNome } from "./icons";

type TomNav =
  | "foco"
  | "inbox"
  | "ouro"
  | "sprint"
  | "notas"
  | "pessoas"
  | "projetos"
  | "janela"
  | "presenca"
  | "revisao";

type ItemNav = {
  href: string;
  nome: string;
  curto: string;
  icone: IconeNome;
  tom: TomNav;
  grupo: "fluxo" | "contexto" | "ritmo";
};

const ITENS: ItemNav[] = [
  { href: "/", nome: "Hoje", curto: "Hoje", icone: "hoje", tom: "foco", grupo: "fluxo" },
  {
    href: "/inbox",
    nome: "Caixa de entrada",
    curto: "Inbox",
    icone: "inbox",
    tom: "inbox",
    grupo: "fluxo",
  },
  { href: "/tarefas", nome: "Tarefas", curto: "Tarefas", icone: "tarefas", tom: "ouro", grupo: "fluxo" },
  {
    href: "/sprints",
    nome: "Sprints",
    curto: "Sprints",
    icone: "bandeira",
    tom: "sprint",
    grupo: "contexto",
  },
  {
    href: "/projetos",
    nome: "Projetos",
    curto: "Projetos",
    icone: "projetos",
    tom: "projetos",
    grupo: "contexto",
  },
  {
    href: "/pessoas",
    nome: "Pessoas",
    curto: "Pessoas",
    icone: "pessoas",
    tom: "pessoas",
    grupo: "contexto",
  },
  { href: "/notas", nome: "Notas", curto: "Notas", icone: "notas", tom: "notas", grupo: "contexto" },
  {
    href: "/janelas",
    nome: "Janelas do dia",
    curto: "Janelas",
    icone: "janelas",
    tom: "janela",
    grupo: "ritmo",
  },
  {
    href: "/presenca",
    nome: "Presença",
    curto: "Presença",
    icone: "ancora",
    tom: "presenca",
    grupo: "ritmo",
  },
  {
    href: "/revisao",
    nome: "Revisão",
    curto: "Revisão",
    icone: "revisao",
    tom: "revisao",
    grupo: "ritmo",
  },
];

const ATIVO: Record<TomNav, string> = {
  foco: "bg-focus/16 text-focus",
  inbox: "bg-inbox/16 text-inbox",
  ouro: "bg-gold/16 text-gold",
  sprint: "bg-sprint/16 text-sprint",
  notas: "bg-notes/16 text-notes",
  pessoas: "bg-people/16 text-people",
  projetos: "bg-projects/16 text-projects",
  janela: "bg-window/16 text-window",
  presenca: "bg-sage/16 text-sage",
  revisao: "bg-review/16 text-review",
};

const TILE: Record<TomNav, string> = {
  foco: "bg-focus/16 text-focus",
  inbox: "bg-inbox/16 text-inbox",
  ouro: "bg-gold/16 text-gold",
  sprint: "bg-sprint/16 text-sprint",
  notas: "bg-notes/16 text-notes",
  pessoas: "bg-people/16 text-people",
  projetos: "bg-projects/16 text-projects",
  janela: "bg-window/16 text-window",
  presenca: "bg-sage/16 text-sage",
  revisao: "bg-review/16 text-review",
};

const TILE_FORTE: Record<TomNav, string> = {
  foco: "bg-focus text-white shadow-sm",
  inbox: "bg-inbox text-white shadow-sm",
  ouro: "bg-gold text-white shadow-sm",
  sprint: "bg-sprint text-white shadow-sm",
  notas: "bg-notes text-white shadow-sm",
  pessoas: "bg-people text-white shadow-sm",
  projetos: "bg-projects text-white shadow-sm",
  janela: "bg-window text-white shadow-sm",
  presenca: "bg-sage text-white shadow-sm",
  revisao: "bg-review text-white shadow-sm",
};

const BARRA: Record<TomNav, string> = {
  foco: "bg-focus",
  inbox: "bg-inbox",
  ouro: "bg-gold",
  sprint: "bg-sprint",
  notas: "bg-notes",
  pessoas: "bg-people",
  projetos: "bg-projects",
  janela: "bg-window",
  presenca: "bg-sage",
  revisao: "bg-review",
};

const BADGE: Record<TomNav, string> = {
  foco: "bg-focus/15 text-focus",
  inbox: "bg-inbox/15 text-inbox",
  ouro: "bg-gold/15 text-gold",
  sprint: "bg-sprint/15 text-sprint",
  notas: "bg-notes/15 text-notes",
  pessoas: "bg-people/15 text-people",
  projetos: "bg-projects/15 text-projects",
  janela: "bg-window/15 text-window",
  presenca: "bg-sage/15 text-sage",
  revisao: "bg-review/15 text-review",
};

function ativo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function contagem(item: ItemNav, r: ResumoGlobal): { texto: string; urgente: boolean } | null {
  switch (item.href) {
    case "/":
      return r.foco > 0 ? { texto: `${r.foco}/3`, urgente: false } : null;
    case "/inbox":
      return r.inbox > 0 ? { texto: String(r.inbox), urgente: true } : null;
    case "/tarefas":
      if (r.atrasadas > 0) return { texto: String(r.atrasadas), urgente: true };
      return r.abertas > 0 ? { texto: String(r.abertas), urgente: false } : null;
    case "/sprints":
      return r.backlog > 0 ? { texto: String(r.backlog), urgente: false } : null;
    case "/projetos":
      return r.semAcao > 0 ? { texto: String(r.semAcao), urgente: true } : null;
    case "/pessoas":
      return r.pessoas > 0 ? { texto: String(r.pessoas), urgente: false } : null;
    case "/janelas":
      return { texto: `${r.rituais}/12`, urgente: false };
    case "/presenca":
      return {
        texto: `${r.ancoras}/${PRATICAS.length}`,
        urgente: r.ancoras === 0,
      };
    case "/revisao":
      return r.revisouHoje > 0 ? null : { texto: "•", urgente: true };
    default:
      return null;
  }
}

function LinkNav({
  item,
  resumo,
  pathname,
  onClick,
  compacto = false,
}: {
  item: ItemNav;
  resumo: ResumoGlobal;
  pathname: string;
  onClick?: () => void;
  compacto?: boolean;
}) {
  const on = ativo(pathname, item.href);
  const badge = contagem(item, resumo);

  if (compacto) {
    return (
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={on ? "page" : undefined}
        className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition ${
          on ? ATIVO[item.tom] : "text-muted"
        }`}
      >
        <span className="relative">
          <Ico nome={item.icone} className="h-[19px] w-[19px]" />
          {badge?.urgente ? (
            <span className="absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full bg-urgent" />
          ) : null}
        </span>
        <span className="text-[8.5px] leading-none font-medium">{item.curto}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={on ? "page" : undefined}
      className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${
        on ? `${ATIVO[item.tom]} font-medium` : "text-muted hover:bg-panel2/70 hover:text-cream"
      }`}
    >
      {on ? (
        <span
          className={`absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full ${BARRA[item.tom]}`}
        />
      ) : null}
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition ${
          on ? TILE_FORTE[item.tom] : "bg-panel2/60 text-muted group-hover:text-cream"
        }`}
      >
        <Ico nome={item.icone} className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1 truncate">{item.nome}</span>
      {badge ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
            badge.urgente ? "bg-urgent/15 text-urgent" : BADGE[item.tom]
          }`}
        >
          {badge.texto}
        </span>
      ) : null}
    </Link>
  );
}

export function NavLateral({
  resumo,
  janela,
}: {
  resumo: ResumoGlobal;
  janela: { label: string; orgao: string; modoLabel: string } | null;
}) {
  const pathname = usePathname();
  const grupos: { titulo: string; itens: ItemNav[] }[] = [
    { titulo: "Fluxo", itens: ITENS.filter((i) => i.grupo === "fluxo") },
    { titulo: "Contexto", itens: ITENS.filter((i) => i.grupo === "contexto") },
    { titulo: "Ritmo", itens: ITENS.filter((i) => i.grupo === "ritmo") },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-line/70 bg-panel/55 px-3 py-5 backdrop-blur-sm md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#b07a3f] to-[#8a5228] text-[14px] font-semibold text-[#fffdf8] shadow-sm">
          z
        </span>
        <span>
          <span className="block text-[17px] leading-none font-semibold tracking-tight text-cream">
            zyra
          </span>
          <span className="mt-0.5 block text-[10px] text-muted/70">sistema pessoal</span>
        </span>
      </Link>

      <nav className="mt-6 space-y-4">
        {grupos.map((g) => (
          <div key={g.titulo}>
            <p className="mb-1 px-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted/50">
              {g.titulo}
            </p>
            <div className="space-y-0.5">
              {g.itens.map((item) => (
                <LinkNav
                  key={item.href}
                  item={item}
                  resumo={resumo}
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-4">
        {janela ? (
          <Link
            href="/janelas"
            className="group block overflow-hidden rounded-xl border border-window/35 bg-gradient-to-br from-window/18 to-panel/60 p-3 transition hover:border-window/40"
          >
            <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-window">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-window/60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-window" />
              </span>
              agora · {janela.label}
            </span>
            <p className="mt-1 text-xs font-semibold text-cream">{janela.orgao}</p>
            <p className="text-[10px] text-muted">{janela.modoLabel}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/60">
                <div
                  className="h-full rounded-full bg-window/70"
                  style={{ width: `${Math.round((resumo.rituais / 12) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-muted tabular-nums">{resumo.rituais}/12</span>
            </div>
          </Link>
        ) : null}

        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg border border-line/70 bg-white/40 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted/70">hoje</p>
            <p className="text-xs font-semibold text-done tabular-nums">
              {resumo.feitasHoje} feitas
            </p>
          </div>
          <div className="rounded-lg border border-line/70 bg-white/40 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted/70">semana</p>
            <p className="text-xs font-semibold text-gold tabular-nums">
              {resumo.feitasSemana} feitas
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function NavInferior({ resumo }: { resumo: ResumoGlobal }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  const principais = ITENS.filter((i) =>
    ["/", "/inbox", "/tarefas", "/projetos"].includes(i.href),
  );
  const resto = ITENS.filter((i) => !principais.includes(i));

  return (
    <>
      {aberto ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-panel px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              tudo que importa
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {resto.map((item) => {
                const on = ativo(pathname, item.href);
                const badge = contagem(item, resumo);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setAberto(false)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
                      on
                        ? `${ATIVO[item.tom]} border-line/70`
                        : "border-line/70 bg-white/40 text-cream"
                    }`}
                  >
                    <span
                      className={`icon-tile h-7 w-7 ${on ? TILE_FORTE[item.tom] : TILE[item.tom]}`}
                    >
                      <Ico nome={item.icone} className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 text-xs font-medium">{item.nome}</span>
                    {badge ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                          badge.urgente ? "bg-urgent/15 text-urgent" : BADGE[item.tom]
                        }`}
                      >
                        {badge.texto}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="btn-ghost mt-3 w-full text-xs"
            >
              fechar
            </button>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
          {principais.map((item) => (
            <LinkNav
              key={item.href}
              item={item}
              resumo={resumo}
              pathname={pathname}
              compacto
            />
          ))}
          <button
            type="button"
            onClick={() => setAberto(true)}
            aria-expanded={aberto}
            aria-label="Abrir todas as seções"
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition ${
              aberto ? "text-gold" : "text-muted"
            }`}
          >
            <Ico nome="mais" className="h-[19px] w-[19px]" />
            <span className="text-[8.5px] leading-none font-medium">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
