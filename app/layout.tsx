import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavInferior, NavLateral } from "@/components/nav";
import { contarInbox } from "@/lib/queries";
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
  themeColor: "#f7f3ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const janela = janelaAtual();

  return (
    <html lang="pt-BR">
      <body className="font-sans text-cream antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px]">
          <NavLateral
            inbox={contarInbox()}
            janela={{ label: janelaLabel(janela), orgao: janela.orgao }}
          />
          <main className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-6 md:px-8 md:pb-12 md:pt-6">
            {children}
          </main>
        </div>
        <NavInferior />
      </body>
    </html>
  );
}
