import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavInferior, NavLateral } from "@/components/nav";
import { TopBar } from "@/components/topbar";
import { resumoGlobal } from "@/lib/queries";
import { janelaAtual, janelaLabel } from "@/lib/janelas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zyra — sistema pessoal",
  description:
    "Capture ideias, pessoas e informações. Organize em ações e execute no ritmo do seu dia.",
  applicationName: "Zyra",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Zyra",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f2e8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const agora = new Date();
  const janela = janelaAtual(agora);
  const resumo = await resumoGlobal();
  const dia = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
    .format(agora)
    .replace(".", "");

  return (
    <html lang="pt-BR">
      <body className="font-sans text-cream antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-[1340px]">
          <NavLateral
            resumo={resumo}
            janela={{
              label: janelaLabel(janela),
              orgao: janela.orgao,
              modoLabel: janela.modoLabel,
            }}
          />
          <main className="min-w-0 flex-1 px-4 pb-28 pt-3 sm:px-6 md:px-8 md:pb-12 md:pt-5">
            <TopBar
              resumo={resumo}
              janela={{ label: janelaLabel(janela), orgao: janela.orgao }}
              dia={dia}
            />
            {children}
          </main>
        </div>
        <NavInferior resumo={resumo} />
      </body>
    </html>
  );
}
