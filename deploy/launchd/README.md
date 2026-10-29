# Rodar o Zyra 24/7 nesta máquina (launchd + túnel)

Dois serviços de usuário, ambos com `KeepAlive`: se o app ou o túnel cair, o macOS sobe de novo.

| Serviço | O que faz | Log |
|---|---|---|
| `com.zyra.app` | `next start` na porta 3001, com banco no Turso | `~/Library/Application Support/zyra/app.log` |
| `com.zyra.tunnel` | túnel HTTPS do Cloudflare e atualização do link permanente | `~/Library/Application Support/zyra/tunnel-plist.log` |

O endereço fixo (`https://evelynjanynedev-hue.github.io/zyra-app/`) vem da página em
`deploy/link-permanente/`, publicada no repositório público `zyra-app`.

## Instalação

```bash
# 1. dependências
brew install cloudflared
npm i -g localtunnel   # opcional, só para o modo --fixo do scripts/publicar.sh

# 2. credenciais (nunca vão para o git)
RT="$HOME/Library/Application Support/zyra"
mkdir -p "$RT"
cat > "$RT/zyra.env" <<'ENV'
ZYRA_DB_URL=libsql://zyra-....turso.io
ZYRA_DB_AUTH_TOKEN=...
ZYRA_SEED=0
ZYRA_USER=zyra
ZYRA_PASSWORD=troque-esta-senha
ENV
chmod 600 "$RT/zyra.env"

# token do GitHub (repo zyra-app) usado para publicar a URL do túnel em url.json
printf '%s' 'gho_...' > "$RT/github.token" && chmod 600 "$RT/github.token"

# 3. scripts e serviços (troque __USUARIO__ pelo seu usuário do macOS)
cp start-app.sh start-tunnel.sh "$RT"/
sed -i '' "s|__USUARIO__|$HOME|g" "$RT/start-app.sh" "$RT/start-tunnel.sh"
chmod +x "$RT"/*.sh

cp com.zyra.app.plist com.zyra.tunnel.plist ~/Library/LaunchAgents/
sed -i '' "s|__USUARIO__|$HOME|g" ~/Library/LaunchAgents/com.zyra.*.plist

launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.zyra.app.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.zyra.tunnel.plist
```

## Usar

```bash
cat "$HOME/Library/Application Support/zyra/url-fixa.txt"   # link permanente
launchctl list | grep zyra                                 # status
curl https://evelynjanynedev-hue.github.io/zyra-app/       # página do link
```

## Parar / remover

```bash
launchctl bootout gui/$(id -u)/com.zyra.app
launchctl bootout gui/$(id -u)/com.zyra.tunnel
rm ~/Library/LaunchAgents/com.zyra.*.plist
```

## Limitações

- O Mac precisa estar ligado e com internet.
- O túnel do Cloudflare (`trycloudflare.com`) muda de URL ao reiniciar; o `start-tunnel.sh`
  publica a nova em `url.json` e a página fixa passa a apontar para ela (~10–20s).
- Túnel rápido do Cloudflare é gratuito e sem SLA. Para independência total da máquina, use um host
  pago (Railway/Render/Fly) — o banco no Turso continua o mesmo.
