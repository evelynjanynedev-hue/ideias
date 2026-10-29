#!/bin/bash
# Zyra — link fixo via localtunnel (subdomínio fixo: zyra-evelyn.loca.lt).
# Mantido vivo pelo launchd (com.zyra.ltunnel).
#
# O localtunnel só entrega o subdomínio pedido se ele estiver livre; se estiver
# ocupado, devolve um aleatório. Este script tenta de novo até conseguir o fixo.

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="__USUARIO__"

RT="$HOME/Library/Application Support/zyra"
LOG="$RT/lt-attempt.log"
FIXO="https://zyra-evelyn.loca.lt"

# Espera o app responder antes de abrir o túnel.
for _ in $(seq 1 30); do
  curl -fsS -m 2 http://127.0.0.1:3001/api/health >/dev/null 2>&1 && break
  sleep 1
done

while true; do
  : > "$LOG"
  /opt/homebrew/bin/lt --port 3001 --subdomain zyra-evelyn >> "$LOG" 2>&1 &
  PID=$!

  URL=""
  for _ in $(seq 1 20); do
    URL=$(grep -oE 'https://[a-z0-9.-]+\.loca\.lt' "$LOG" | head -1)
    [ -n "$URL" ] && break
    kill -0 "$PID" 2>/dev/null || break
    sleep 1
  done

  if [ "$URL" = "$FIXO" ]; then
    printf '%s\n' "$FIXO" > "$RT/url-fixa.txt"
    echo "$(date '+%Y-%m-%d %H:%M:%S') conectado em $FIXO (pid $PID)"
    wait "$PID"
    echo "$(date '+%Y-%m-%d %H:%M:%S') túnel caiu; reconectando"
  else
    echo "$(date '+%Y-%m-%d %H:%M:%S') subdomínio ocupado (veio ${URL:-vazio}); tentando de novo"
    kill "$PID" 2>/dev/null
    wait "$PID" 2>/dev/null
  fi

  sleep 8
done
