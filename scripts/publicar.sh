#!/usr/bin/env bash
# Publica o Zyra nesta máquina com um link HTTPS público, sem conta em nuvem.
#
#   ./scripts/publicar.sh                 # túnel Cloudflare (URL temporária)
#   ./scripts/publicar.sh --fixo zyra-ana # localtunnel (URL fixa: zyra-ana.loca.lt)
#   ./scripts/publicar.sh --build --fixo zyra-ana
#
# Requisitos: Node 22+, build feito (ou --build), e cloudflared OU localtunnel (`lt`).
# O banco fica no Turso, então os dados sobrevivem a reinícios e ao fechar o túnel.
# A URL atual fica salva em $ZYRA_RUNTIME/url.txt (ou url-fixa.txt no modo --fixo).

set -euo pipefail

PORTA="${PORT:-3001}"
RT="${ZYRA_RUNTIME:-$HOME/Library/Application Support/zyra}"
SUBDOMINIO=""
FAZER_BUILD=0

while [ $# -gt 0 ]; do
  case "$1" in
    --build) FAZER_BUILD=1; shift ;;
    --fixo) SUBDOMINIO="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "Opção desconhecida: $1" >&2; exit 1 ;;
  esac
done

mkdir -p "$RT"

# Sem variáveis no ambiente? Usa o arquivo de credenciais do serviço.
if [ -z "${ZYRA_DB_URL:-}" ] && [ -f "$RT/zyra.env" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$RT/zyra.env"
  set +a
fi

if [ "$FAZER_BUILD" = "1" ]; then
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

if [ -n "$SUBDOMINIO" ]; then
  command -v lt >/dev/null || { echo "localtunnel não encontrado: npm i -g localtunnel" >&2; exit 1; }
else
  command -v cloudflared >/dev/null || { echo "cloudflared não encontrado: brew install cloudflared" >&2; exit 1; }
fi

export ZYRA_SEED="${ZYRA_SEED:-0}"
export NODE_ENV=production

echo "→ subindo o app na porta $PORTA"
node ./node_modules/next/dist/bin/next start -p "$PORTA" > "$RT/app.log" 2>&1 &
APP_PID=$!

TUNNEL_PID=""
limpar() {
  kill "$APP_PID" ${TUNNEL_PID:+"$TUNNEL_PID"} 2>/dev/null || true
}
trap limpar EXIT INT TERM

for _ in $(seq 1 30); do
  if curl -fsS -m 2 "http://localhost:$PORTA/api/health" >/dev/null 2>&1; then break; fi
  sleep 1
done

if [ -n "$SUBDOMINIO" ]; then
  FIXO="https://$SUBDOMINIO.loca.lt"
  echo "→ abrindo túnel fixo ($FIXO)"

  while :; do
    : > "$RT/tunnel.log"
    lt --port "$PORTA" --subdomain "$SUBDOMINIO" >> "$RT/tunnel.log" 2>&1 &
    TUNNEL_PID=$!

    URL=""
    for _ in $(seq 1 20); do
      URL=$(grep -oE 'https://[a-z0-9.-]+\.loca\.lt' "$RT/tunnel.log" | head -1 || true)
      [ -n "$URL" ] && break
      kill -0 "$TUNNEL_PID" 2>/dev/null || break
      sleep 1
    done

    if [ "$URL" = "$FIXO" ]; then
      printf '%s\n' "$FIXO" > "$RT/url-fixa.txt"
      break
    fi

    echo "  subdomínio ocupado (veio ${URL:-vazio}), tentando de novo em 8s"
    kill "$TUNNEL_PID" 2>/dev/null || true
    wait "$TUNNEL_PID" 2>/dev/null || true
    TUNNEL_PID=""
    sleep 8
  done
else
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
fi

if [ -z "${URL:-}" ]; then
  echo "O túnel não devolveu URL. Veja $RT/tunnel.log" >&2
  exit 1
fi

echo
echo "Zyra no ar: $URL"
echo "login: ${ZYRA_USER:-zyra} / senha definida em ZYRA_PASSWORD"
echo "health: $URL/api/health"
if [ -n "$SUBDOMINIO" ]; then
  echo
  echo "No primeiro acesso de cada navegador o localtunnel pede a 'tunnel password':"
  echo "  $(curl -fsS -m 10 https://loca.lt/mytunnelpassword 2>/dev/null || echo 'veja https://loca.lt/mytunnelpassword')"
fi
echo
echo "Ctrl+C encerra. Para manter vivo após fechar o terminal, instale o serviço (launchd)."

wait "$TUNNEL_PID"
