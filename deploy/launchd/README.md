# Rodar o Zyra 24/7 nesta máquina (launchd + túnel)

Dois serviços de usuário, ambos com `KeepAlive`: se o app ou o túnel cair, o macOS sobe de novo.

| Serviço | O que faz | Log |
|---|---|---|
| `com.zyra.app` | `next start` na porta 3001, com banco no Turso | `~/Library/Application Support/zyra/app.log` |
| `com.zyra.ltunnel` | túnel HTTPS com **URL fixa** (`https://zyra-evelyn.loca.lt`) | `~/Library/Application Support/zyra/ltunnel.log` |

## Instalação

```bash
# 1. dependências
brew install cloudflared   # opcional: alternativa ao localtunnel
npm i -g localtunnel       # comando `lt`

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
cp start-app.sh start-ltunnel.sh "$RT"/
sed -i '' "s|__USUARIO__|$HOME|g" "$RT/start-app.sh" "$RT/start-ltunnel.sh"
chmod +x "$RT"/*.sh

cp com.zyra.app.plist com.zyra.ltunnel.plist ~/Library/LaunchAgents/
sed -i '' "s|__USUARIO__|$HOME|g" ~/Library/LaunchAgents/com.zyra.*.plist

launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.zyra.app.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.zyra.ltunnel.plist
```

## Usar

```bash
cat "$HOME/Library/Application Support/zyra/url-fixa.txt"   # link fixo
launchctl list | grep zyra                                 # status
curl https://zyra-evelyn.loca.lt/api/health
```

> No primeiro acesso de cada navegador, o localtunnel mostra uma tela pedindo a **tunnel password**:
> é o IP público da máquina, visível em <https://loca.lt/mytunnelpassword>. Depois disso o navegador
> guarda um cookie e não pergunta de novo.

## Parar / remover

```bash
launchctl bootout gui/$(id -u)/com.zyra.app
launchctl bootout gui/$(id -u)/com.zyra.ltunnel
rm ~/Library/LaunchAgents/com.zyra.*.plist
```

## Limitações

- O Mac precisa estar ligado e com internet.
- O subdomínio fica reservado só enquanto o túnel está conectado. Se ele reiniciar, o script tenta
  até conseguir `zyra-evelyn` de volta (pode levar ~1 minuto com a URL temporariamente fora).
- A senha do túnel (IP público) muda se a operadora trocar o IP.
- localtunnel é gratuito e sem SLA. Para link fixo de verdade, independente da máquina, use um host
  pago (Railway/Render/Fly) — o banco no Turso continua o mesmo.
