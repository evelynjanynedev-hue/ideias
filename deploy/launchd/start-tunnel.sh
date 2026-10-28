#!/bin/bash
# Zyra — túnel HTTPS público (Cloudflare quick tunnel, sem conta).
# Mantido vivo pelo launchd (com.zyra.tunnel).
# A URL muda quando este processo reinicia: ela fica salva em url.txt.

RT="$HOME/Library/Application Support/zyra"
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="__USUARIO__"

: > "$RT/tunnel.log"

/opt/homebrew/bin/cloudflared tunnel --url http://localhost:3001 --no-autoupdate \
  >> "$RT/tunnel.log" 2>&1 &
TUNNEL_PID=$!

# Registra a URL assim que aparecer.
(
  for _ in $(seq 1 60); do
    URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$RT/tunnel.log" | head -1)
    if [ -n "$URL" ]; then
      printf '%s\n' "$URL" > "$RT/url.txt"
      echo "$(date '+%Y-%m-%d %H:%M:%S') $URL" >> "$RT/urls-historico.txt"
      /usr/bin/osascript -e "display notification \"$URL\" with title \"Zyra no ar\"" 2>/dev/null
      break
    fi
    sleep 2
  done
) &

wait $TUNNEL_PID
