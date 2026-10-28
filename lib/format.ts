export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function hoje(): string {
  return isoDate(new Date());
}

export function agoraISO(): string {
  return new Date().toISOString();
}

export function adicionarDias(dias: number, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return isoDate(d);
}

export function diaSemanaLongo(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

export function dataCurta(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(y, m - 1, d));
}

export function saudacao(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function tempoRelativo(iso: string | null): string {
  if (!iso) return "nunca";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  return `há ${meses} ${meses === 1 ? "mês" : "meses"}`;
}

export function diasDesde(iso: string | null): number | null {
  if (!iso) return null;
  const alvo = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const hojeD = new Date();
  hojeD.setHours(0, 0, 0, 0);
  return Math.floor((hojeD.getTime() - alvo.getTime()) / 86400000);
}

export function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function minutosRestantes(d: Date = new Date()): number {
  return Math.max(0, 24 * 60 - (d.getHours() * 60 + d.getMinutes()));
}
