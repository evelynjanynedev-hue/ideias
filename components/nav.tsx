"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ico, type IconeNome } from "./icons";

type ItemNav = { href: string; nome: string; icone: IconeNome };

const ITENS: ItemNav[] = [
  { href: "/", nome: "Hoje", icone: "hoje" },
  { href: "/inbox", nome: "Caixa de entrada", icone: "inbox" },
  { href: "/tarefas", nome: "Tarefas", icone: "tarefas" },
  { href: "/notas", nome: "Notas", icone: "notas" },
  { href: "/pessoas", nome: "Pessoas", icone: "pessoas" },
  { href: "/projetos", nome: "Projetos", icone: "projetos" },
  { href: "/janelas", nome: "Janelas do dia", icone: "janelas" },
  { href: "/revisao", nome: "Revisão", icone: "revisao" },
];

function ativo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLateral({
  inbox,
  janela,
}: {
  inbox: number;
  janela: { label: string; orgao: string } | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line/70 bg-panel/40 px-3 py-5 md:flex">
      <Link href="/" className="flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold text-[13px] font-semibold text-[#fffdf8]">
          z
        </span>
        <span className="text-[17px] leading-none font-semibold tracking-tight text-cream">
          zyra
        </span>
      </Link>
      <p className="mt-1.5 px-2 text-[10px] text-muted/70">sistema pessoal</p>

      <nav className="mt-6 space-y-0.5">
        {ITENS.map((item) => {
          const on = ativo(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${
                on
                  ? "bg-gold/10 font-medium text-gold"
                  : "text-muted hover:bg-panel2/70 hover:text-cream"
              }`}
            >
              <Ico nome={item.icone} className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.nome}</span>
              {item.href === "/inbox" && inbox > 0 ? (
                <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                  {inbox}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        {janela ? (
          <Link
            href="/janelas"
            className="block rounded-lg border border-line/80 bg-white/50 p-2.5 transition hover:border-gold/30"
          >
            <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-gold/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              agora
            </span>
            <p className="mt-1 text-xs font-medium text-cream">{janela.orgao}</p>
            <p className="text-[10px] text-muted">{janela.label}</p>
          </Link>
        ) : null}
        <p className="mt-3 px-1 text-[10px] leading-relaxed text-muted/50">
          dados só neste Mac · backup em <code>data/</code>
        </p>
      </div>
    </aside>
  );
}

export function NavInferior() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line/70 bg-paper/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {ITENS.map((item) => {
          const on = ativo(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.nome}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 ${
                on ? "text-gold" : "text-muted"
              }`}
            >
              <Ico nome={item.icone} className="h-[19px] w-[19px]" />
              <span className="text-[8.5px] leading-none">
                {item.nome.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
