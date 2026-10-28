# Rodar o Zyra 24/7 nesta máquina (launchd + Cloudflare Tunnel)

Dois serviços de usuário, ambos com `KeepAlive`: se o app ou o túnel cair, o macOS sobe de novo.

| Serviço | O que faz | Log |
|---|---|---|
| `com.zyra.app` | `next start` na porta 3001, com banco no Turso | `~/Library/Application Support/zyra/app.log` |
| `com.zyra.tunnel` | túnel HTTPS público (`cloudflared`) | `~/Library/Application Support/zyra/tunnel.log` |

## Instalação

```bash
# 1. dependências
brew install cloudflared

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
cat "$HOME/Library/Application Support/zyra/url.txt"   # link atual
launchctl list | grep zyra                           # status
```

## Parar / remover

```bash
launchctl bootout gui/$(id -u)/com.zyra.app
launchctl bootout gui/$(id -u)/com.zyra.tunnel
rm ~/Library/LaunchAgents/com.zyra.*.plist
```

## Limitações

- O Mac precisa estar ligado e com internet.
- Túnel rápido do Cloudflare não tem SLA e **muda de URL** quando reinicia (o `url.txt` acompanha). Para link fixo, use um túnel nomeado com domínio próprio ou um host pago (Railway/Render/Fly).
- O banco é remoto (Turso): derrubar o app ou o túnel não perde dados.
