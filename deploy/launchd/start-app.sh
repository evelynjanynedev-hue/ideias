#!/bin/bash
# Zyra — servidor de produção (Next.js) com banco remoto no Turso.
# Mantido vivo pelo launchd (com.zyra.app). Reinicia sozinho se cair.
#
# As credenciais ficam em ~/Library/Application Support/zyra/zyra.env:
#   ZYRA_DB_URL=libsql://...
#   ZYRA_DB_AUTH_TOKEN=...
#   ZYRA_SEED=0
#   ZYRA_USER=zyra
#   ZYRA_PASSWORD=...

set -a
source "$HOME/Library/Application Support/zyra/zyra.env"
set +a

export NODE_ENV=production
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "__USUARIO__/Desktop/apps zyra/organizacao pessoal" || exit 1

exec /opt/homebrew/bin/node ./node_modules/next/dist/bin/next start -p 3001
