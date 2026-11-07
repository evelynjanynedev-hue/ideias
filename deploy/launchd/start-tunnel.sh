#!/bin/bash
# Zyra — túnel HTTPS público (Cloudflare quick tunnel) + publicação do endereço
# atual no link permanente https://evelynjanynedev-hue.github.io/zyra-app/
#
# Mantido vivo pelo launchd (com.zyra.tunnel).
# Usa HTTP/2 em vez de QUIC: conexões QUIC caem com mais frequência em rede
# doméstica/NAT, e cada queda derrubava a aba aberta (o túnel muda de URL).

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="__USUARIO__"

RT="$HOME/Library/Application Support/zyra"
LOG="$RT/tunnel.log"
TOKEN_FILE="$RT/github.token"
REPO="evelynjanynedev-hue/zyra-app"
FIXO="https://evelynjanynedev-hue.github.io/zyra-app/"

publicar_url() {
  local url="$1"
  [ -f "$TOKEN_FILE" ] || { echo "sem token do GitHub; url.json não atualizado"; return 1; }
  local token; token=$(cat "$TOKEN_FILE")
  local tentativa
  for tentativa in 1 2 3; do
    local sha; sha=$(curl -fsS -m 20 -H "Authorization: Bearer $token" \
      "https://api.github.com/repos/$REPO/contents/url.json" 2>/dev/null | jq -r '.sha // empty')
    local conteudo; conteudo=$(printf '{"url":"%s","atualizado":"%s"}\n' "$url" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" | base64 | tr -d '\n')
    local corpo="{\"message\":\"túnel: $url\",\"content\":\"$conteudo\""
    [ -n "$sha" ] && corpo="$corpo,\"sha\":\"$sha\""
    corpo="$corpo}"
    if curl -fsS -m 30 -X PUT -H "Authorization: Bearer $token" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$REPO/contents/url.json" \
      -d "$corpo" >/dev/null 2>&1; then
      echo "url.json atualizado: $url"
      return 0
    fi
    echo "$(date '+%F %T') falha ao publicar url.json (tentativa $tentativa/3)"
    sleep 5
  done
  return 1
}

# Espera o app local responder.
for _ in $(seq 1 30); do
  curl -fsS -m 2 http://127.0.0.1:3001/api/health >/dev/null 2>&1 && break
  sleep 1
done

: > "$LOG"
/opt/homebrew/bin/cloudflared tunnel --url http://localhost:3001 \
  --protocol http2 --no-autoupdate >> "$LOG" 2>&1 &
PID=$!

URL=""
for _ in $(seq 1 60); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1)
  [ -n "$URL" ] && break
  kill -0 "$PID" 2>/dev/null || break
  sleep 2
done

if [ -z "$URL" ]; then
  echo "$(date '+%F %T') túnel não subiu"
  kill -9 "$PID" 2>/dev/null
  exit 1
fi

printf '%s\n' "$FIXO" > "$RT/url-fixa.txt"
printf '%s\n' "$URL" > "$RT/url.txt"
echo "$(date '+%F %T') túnel: $URL"
publicar_url "$URL"

# Vigia: olha a conexão real do cloudflared com a borda, não o health público.
# Testar a própria URL pública daqui de dentro dá falso negativo (hairpin NAT/DNS)
# e reiniciava um túnel que estava funcionando — trocando a URL e derrubando a aba.
METRICS_PORT=$(grep -oE 'Starting metrics server on 127\.0\.0\.1:[0-9]+' "$LOG" \
  | tail -1 | grep -oE '[0-9]+$')
falhas=0
while kill -0 "$PID" 2>/dev/null; do
  sleep 60
  CONEXOES=""
  if [ -n "$METRICS_PORT" ]; then
    CONEXOES=$(curl -s -m 10 "http://127.0.0.1:$METRICS_PORT/metrics" \
      | awk '/^cloudflared_tunnel_ha_connections/ {print $2; exit}')
  fi
  APP=$(curl -s -m 5 -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/api/health)

  # Túnel vivo = processo vivo + conexão registrada (quando a métrica existe).
  if [ -n "$CONEXOES" ] && [ "${CONEXOES%.*}" -ge 1 ] 2>/dev/null; then
    if [ "$falhas" -gt 0 ]; then echo "$(date '+%F %T') conexão restabelecida"; fi
    falhas=0
  elif [ -z "$CONEXOES" ] && [ "$APP" = "200" ]; then
    # Métrica indisponível, mas processo e app locais de pé: não mexe.
    falhas=0
  else
    falhas=$((falhas + 1))
    echo "$(date '+%F %T') conexoes=${CONEXOES:-?} app=$APP ($falhas/5)"
    if [ "$falhas" -ge 5 ]; then
      echo "$(date '+%F %T') sem conexão com a borda há ~5 min; reiniciando"
      kill -9 "$PID" 2>/dev/null
      break
    fi
  fi
done

wait "$PID" 2>/dev/null
