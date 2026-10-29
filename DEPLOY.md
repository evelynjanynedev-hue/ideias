# Deploy em produção

Duas formas de rodar o Zyra com **link fixo** e **banco persistente**:

| Caminho | Banco | Ideal para |
|---|---|---|
| **Vercel + Turso** | libSQL remoto (Turso) | Grátis, link fixo `*.vercel.app`, zero manutenção |
| **Docker + volume** | arquivo SQLite em `/data` | VPS, Railway, Render, Fly.io |

O banco é sempre libSQL/SQLite — muda só onde o arquivo mora.

---

## Opção 1 — Vercel + Turso (recomendado, grátis)

### 1. Criar o banco no Turso

```bash
brew install tursodatabase/tap/turso
turso auth login
turso db create zyra --location iad    # iad = us-east, mesma região padrão da Vercel
turso db show zyra --url               # copie a URL libsql://...
turso db tokens create zyra            # copie o token
```

> `turso db create` já cria o banco **zerado**. O app cria as tabelas no primeiro acesso.

### 2. Publicar na Vercel

```bash
npm i -g vercel
vercel login
vercel link

# Variáveis de produção
vercel env add ZYRA_DB_URL production          # libsql://zyra-....turso.io
vercel env add ZYRA_DB_AUTH_TOKEN production   # token do Turso
vercel env add ZYRA_SEED production            # 0
vercel env add ZYRA_USER production            # zyra
vercel env add ZYRA_PASSWORD production        # senha forte

vercel --prod
```

O link final é fixo: `https://<projeto>.vercel.app`.

### 3. Conferir

```bash
curl https://SEU-LINK.vercel.app/api/health
# {"ok":true,"banco":"remoto (libSQL)","tarefas":0,...}
```

Abra o link: o navegador pede usuário (`zyra`) e a senha definida. O app começa vazio.

---

## Opção 1b — Esta máquina + link permanente (sem conta em PaaS)

Quando não dá para criar conta em PaaS (verificação por e-mail, cartão etc.), o app roda **aqui** e o endereço fixo é uma página no GitHub Pages que redireciona para o túnel ativo. O banco continua no Turso.

```
https://evelynjanynedev-hue.github.io/zyra-app/   (fixo, não muda)
        └─► https://algo-algo.trycloudflare.com   (túnel, muda ao reconectar)
                └─► localhost:3001 ──► Turso
```

Como funciona:

1. `deploy/link-permanente/index.html` (repo público `zyra-app`) lê o `url.json` pela API do GitHub.
2. Antes de redirecionar, chama `<túnel>/api/health` — se o túnel estiver morto, espera e tenta de novo.
3. `deploy/launchd/start-tunnel.sh` sobe o `cloudflared` e publica a URL nova no `url.json`.

```bash
brew install cloudflared

ZYRA_DB_URL=libsql://zyra-....turso.io \
ZYRA_DB_AUTH_TOKEN=... \
ZYRA_PASSWORD=SUA-SENHA \
./scripts/publicar.sh --build        # URL temporária, para testar
```

Para deixar tudo sozinho (inclusive depois de reiniciar o Mac), instale os dois serviços de `deploy/launchd/` — instruções em [`deploy/launchd/README.md`](deploy/launchd/README.md).

Prós: grátis, sem conta em PaaS, endereço fixo, dados persistentes no Turso.
Contras: o Mac precisa estar ligado e com internet; o túnel rápido do Cloudflare não tem SLA. Para independência total da máquina, use a Opção 1 (Vercel), 2 (Docker em VPS) ou Railway/Render/Fly.

---

## Opção 2 — Docker com volume

Para VPS, Railway, Render ou Fly.io. Nesse modo o banco é um arquivo dentro do volume.

```bash
cp .env.example .env      # edite a senha
docker compose up -d --build
```

O volume nomeado `zyra-data` sobrevive a reinícios e rebuilds. Para HTTPS, coloque um proxy (Caddy, Nginx ou Traefik) na frente da porta 3001.

### Railway

```bash
npm i -g @railway/cli
railway login
railway init
railway volume add -m /data
railway variables \
  --set 'ZYRA_DATA_DIR=/data' \
  --set 'ZYRA_SEED=0' \
  --set 'ZYRA_USER=zyra' \
  --set 'ZYRA_PASSWORD=SUA-SENHA-FORTE'
railway up
railway domain
```

### Render

O `render.yaml` já descreve serviço + disco. New → Blueprint → selecione o repositório → defina `ZYRA_PASSWORD`. Disco persistente exige plano **Starter**.

### Fly.io

```bash
fly launch --no-deploy
fly volumes create zyra_data --size 1
fly secrets set ZYRA_DATA_DIR=/data ZYRA_SEED=0 ZYRA_USER=zyra ZYRA_PASSWORD=SUA-SENHA
fly deploy
```

Garanta no `fly.toml`: `[mounts] source = "zyra_data"`, `destination = "/data"` e `internal_port = 3001`.

---

## Variáveis de ambiente

| Variável | Padrão | Para que serve |
|---|---|---|
| `ZYRA_DB_URL` | — | URL do banco remoto (`libsql://...`). Também aceita `TURSO_DATABASE_URL`. |
| `ZYRA_DB_AUTH_TOKEN` | — | Token do Turso. Também aceita `TURSO_AUTH_TOKEN`. |
| `ZYRA_DATA_DIR` | `./data` | Pasta do SQLite local (quando não há `ZYRA_DB_URL`). |
| `ZYRA_SEED` | `0` em produção | `0` = **banco zerado**; `1` = dados de exemplo. |
| `ZYRA_USER` | `zyra` | Usuário do HTTP Basic Auth. |
| `ZYRA_PASSWORD` | vazio (sem login) | **Defina em produção.** Ativa a proteção por senha. |
| `PORT` | `3001` | Porta do servidor (Docker). |

---

## Banco zerado

- **Turso**: `turso db create` nasce vazio. Para zerar de novo: `turso db shell zyra` e rode os `DROP TABLE`s, ou apague e recrie o banco.
- **Docker**: apague o arquivo dentro do volume

```bash
docker compose down
docker volume rm organizacao-pessoal_zyra-data
docker compose up -d
```

O app nunca semeia exemplos em produção (`NODE_ENV=production` ou `ZYRA_SEED=0`).

---

## Backup

**Turso**

```bash
turso db dump zyra > backups/zyra-$(date +%Y%m%d).sql
```

**Docker / arquivo**

```bash
docker compose exec zyra node -e "0"   # garante o container de pé
sqlite3 data/zyra.db ".backup 'backups/zyra.db'"
```

---

## Checklist antes de divulgar o link

- [ ] `ZYRA_PASSWORD` definida (sem ela o app fica aberto).
- [ ] `ZYRA_SEED=0` — banco zerado, sem exemplos.
- [ ] `/api/health` responde `ok: true` com `tarefas: 0`.
- [ ] HTTPS ativo (Vercel/Turso e Railway/Render/Fly já entregam).
- [ ] Backup testado.
