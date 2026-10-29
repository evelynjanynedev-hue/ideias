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
  local sha; sha=$(curl -fsS -m 20 -H "Authorization: Bearer $token" \
    "https://api.github.com/repos/$REPO/contents/url.json" 2>/dev/null | jq -r '.sha // empty')
  local conteudo; conteudo=$(printf '{"url":"%s","atualizado":"%s"}\n' "$url" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" | base64 | tr -d '\n')
  local corpo="{\"message\":\"túnel: $url\",\"content\":\"$conteudo\""
  [ -n "$sha" ] && corpo="$corpo,\"sha\":\"$sha\""
  corpo="$corpo}"
  curl -fsS -m 30 -X PUT -H "Authorization: Bearer $token" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO/contents/url.json" \
    -d "$corpo" >/dev/null && echo "url.json atualizado: $url"
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
echo "$(date '+%F %T') túnel: $URL"
publicar_url "$URL"

# Vigia tolerante: só reinicia depois de 4 minutos seguidos sem resposta.
# Um 530 isolado do Cloudflare não deve trocar a URL e matar a aba aberta.
falhas=0
while kill -0 "$PID" 2>/dev/null; do
  sleep 60
  A=$(curl -s -m 15 -o /dev/null -w '%{http_code}' "$URL/api/health")
  B=200
  [ "$A" = "200" ] || { sleep 5; B=$(curl -s -m 15 -o /dev/null -w '%{http_code}' "$URL/api/health"); }

  if [ "$A" = "200" ] || [ "$B" = "200" ]; then
    if [ "$falhas" -gt 0 ]; then echo "$(date '+%F %T') voltou ao normal"; fi
    falhas=0
  else
    falhas=$((falhas + 1))
    echo "$(date '+%F %T') health=$A/$B ($falhas/4)"
    if [ "$falhas" -ge 4 ]; then
      echo "$(date '+%F %T') túnel sem responder há ~4 min; reiniciando"
      kill -9 "$PID" 2>/dev/null
      break
    fi
  fi
done

wait "$PID" 2>/dev/null
