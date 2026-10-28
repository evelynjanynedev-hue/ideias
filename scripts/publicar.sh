#!/usr/bin/env bash
# Publica o Zyra nesta máquina com um link HTTPS público, sem conta em nuvem.
#
#   ZYRA_DB_URL=libsql://... ZYRA_DB_AUTH_TOKEN=... ZYRA_PASSWORD=... ./scripts/publicar.sh
#
# Requisitos: Node 22+, `npm run build` feito (ou rode com --build) e cloudflared.
# O banco fica no Turso, então os dados sobrevivem a reinícios e ao fechar o túnel.
# A URL do túnel muda quando ele reinicia; o link atual fica em $ZYRA_RUNTIME/url.txt.

set -euo pipefail

PORTA="${PORT:-3001}"
RT="${ZYRA_RUNTIME:-$HOME/Library/Application Support/zyra}"
mkdir -p "$RT"

# Sem variáveis no ambiente? Usa o arquivo de credenciais do serviço.
if [ -z "${ZYRA_DB_URL:-}" ] && [ -f "$RT/zyra.env" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$RT/zyra.env"
  set +a
fi

if [ "${1:-}" = "--build" ]; then
  npm run build
fi

if [ ! -f ".next/BUILD_ID" ]; then
  echo "Build ausente: rode 'npm run build' (ou ./scripts/publicar.sh --build)." >&2
  exit 1
fi

if [ -z "${ZYRA_DB_URL:-}" ]; then
  echo "Defina ZYRA_DB_URL (Turso) — sem isso o banco fica local e não persiste fora da máquina." >&2
  exit 1
fi

if ! command -v cloudflared >/dev/null; then
  echo "cloudflared não encontrado: brew install cloudflared" >&2
  exit 1
fi

export ZYRA_SEED="${ZYRA_SEED:-0}"
export NODE_ENV=production

echo "→ subindo o app na porta $PORTA"
node ./node_modules/next/dist/bin/next start -p "$PORTA" > "$RT/app.log" 2>&1 &
APP_PID=$!

limpar() {
  kill "$APP_PID" "${TUNNEL_PID:-}" 2>/dev/null || true
}
trap limpar EXIT INT TERM

for _ in $(seq 1 30); do
  if curl -fsS -m 2 "http://localhost:$PORTA/api/health" >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "→ abrindo túnel HTTPS"
: > "$RT/tunnel.log"
cloudflared tunnel --url "http://localhost:$PORTA" --no-autoupdate >> "$RT/tunnel.log" 2>&1 &
TUNNEL_PID=$!

for _ in $(seq 1 60); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$RT/tunnel.log" | head -1 || true)
  if [ -n "${URL:-}" ]; then
    printf '%s\n' "$URL" > "$RT/url.txt"
    break
  fi
  sleep 2
done

if [ -z "${URL:-}" ]; then
  echo "O túnel não devolveu URL. Veja $RT/tunnel.log" >&2
  exit 1
fi

echo
echo "Zyra no ar: $URL"
echo "login: ${ZYRA_USER:-zyra} / senha definida em ZYRA_PASSWORD"
echo "health: $URL/api/health"
echo
echo "Ctrl+C encerra. Para manter vivo após fechar o terminal, instale o serviço (launchd)."

wait "$TUNNEL_PID"
