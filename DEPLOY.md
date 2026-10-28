# Deploy em produção

O app é um servidor Node único com SQLite em arquivo. Para ter **link fixo** e **banco persistente**, o requisito é simples: um host que rode Docker (ou Node 22+) **com um volume montado em `/data`**.

> Importante: Vercel, Netlify e similares **não servem** para este app como está — o sistema de arquivos é efêmero e o `data/zyra.db` seria apagado a cada deploy. Use um host com disco/volume.

## Variáveis de ambiente

| Variável | Padrão | Para que serve |
|---|---|---|
| `ZYRA_DATA_DIR` | `./data` | Pasta do SQLite. Em produção: `/data` (volume). |
| `ZYRA_SEED` | ligado em dev, desligado em prod | `0` nasce com **banco zerado** (sem exemplos); `1` semeia demonstração. |
| `ZYRA_USER` | `zyra` | Usuário do HTTP Basic Auth. |
| `ZYRA_PASSWORD` | vazio (sem login) | **Defina em produção.** Ativa a proteção por senha. |
| `PORT` | `3001` | Porta do servidor (o Docker já usa 3001). |

## Opção 1 — Railway (recomendado)

Link fixo `*.up.railway.app`, volume persistente e deploy direto do GitHub.

```bash
npm i -g @railway/cli
railway login
railway init                     # cria o projeto
railway volume add -m /data      # volume persistente
railway variables \
  --set 'ZYRA_DATA_DIR=/data' \
  --set 'ZYRA_SEED=0' \
  --set 'ZYRA_USER=zyra' \
  --set 'ZYRA_PASSWORD=SUA-SENHA-FORTE'
railway up                       # build pelo Dockerfile
railway domain                   # gera o domínio fixo
```

O `railway.json` já configura o healthcheck em `/api/health` e o build pelo `Dockerfile`.

## Opção 2 — Render

O `render.yaml` já descreve o serviço e o disco.

1. New → Blueprint → selecione o repositório.
2. Defina `ZYRA_PASSWORD` no dashboard quando pedir.
3. Deploy. O link fica `https://zyra.onrender.com` (fixo).

> No Render, disco persistente exige plano **Starter** (o free não tem disco).

## Opção 3 — Fly.io

```bash
fly launch --no-deploy          # gera fly.toml
fly volumes create zyra_data --size 1
fly secrets set ZYRA_DATA_DIR=/data ZYRA_SEED=0 ZYRA_USER=zyra ZYRA_PASSWORD=SUA-SENHA
fly deploy
```

No `fly.toml`, garanta `[mounts] source = "zyra_data"` e `destination = "/data"`, e `internal_port = 3001`.

## Opção 4 — VPS / Docker Compose

```bash
cp .env.example .env      # edite a senha
docker compose up -d --build
```

O volume nomeado `zyra-data` sobrevive a reinícios e rebuilds.

Para HTTPS, coloque um proxy (Caddy, Nginx ou Traefik) na frente apontando para a porta 3001.

## Banco zerado

O primeiro boot em produção cria o schema e **não** insere os dados de exemplo. Se o volume já tiver um `zyra.db`, ele é reaproveitado — para começar do zero de novo, apague o arquivo dentro do volume:

```bash
# Railway (exemplo, via shell do serviço)
rm -f /data/zyra.db /data/zyra.db-shm /data/zyra.db-wal
```

Equivalente em Docker:

```bash
docker compose down
docker volume rm organizacao-pessoal_zyra-data
docker compose up -d
```

## Backup em produção

```bash
# Railway
railway ssh
sqlite3 /data/zyra.db ".backup '/data/backup.db'"
```

Ou baixe o arquivo e guarde fora do servidor. O banco é um arquivo só.

## Checklist antes de divulgar o link

- [ ] `ZYRA_PASSWORD` definida (sem ela, o app fica aberto).
- [ ] `ZYRA_SEED=0` para nascer sem exemplos.
- [ ] Volume montado em `/data` — confira em `/api/health`.
- [ ] HTTPS ativo (Railway/Render/Fly já entregam).
- [ ] Backup testado.
