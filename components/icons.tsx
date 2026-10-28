import type { ReactNode, SVGProps } from "react";

const caminhos: Record<string, ReactNode> = {
  hoje: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M5.5 5h13l2.5 8v6H3v-6l2.5-8Z" />
    </>
  ),
  tarefas: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17" />
    </>
  ),
  notas: (
    <>
      <path d="M5 3h9l5 5v13H5z" />
      <path d="M14 3v5h5M8 13h8M8 17h5" />
    </>
  ),
  pessoas: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M16 11a3 3 0 1 0-1-5.8M17.5 20c0-2.3-.8-4-2.5-5" />
    </>
  ),
  projetos: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  janelas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  revisao: (
    <>
      <path d="M4 4v6h6" />
      <path d="M20 20v-6h-6" />
      <path d="M4 10a8 8 0 0 1 14-4.5M20 14a8 8 0 0 1-14 4.5" />
    </>
  ),
  bandeira: (
    <>
      <path d="M5 21V4" />
      <path d="M5 5h13l-3 4 3 4H5" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  estrela: (
    <path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.6l6.3-.9z" />
  ),
  lixo: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  faisca: (
    <>
      <path d="m11 3 1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6z" />
      <path d="m18 15 .9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  ampulheta: (
    <>
      <path d="M7 3h10M7 21h10" />
      <path d="M8 3v3l4 4 4-4V3M8 21v-3l4-4 4 4v3" />
    </>
  ),
};

export type IconeNome = keyof typeof caminhos;

export function Ico({
  nome,
  ...props
}: { nome: IconeNome } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {caminhos[nome]}
    </svg>
  );
}
