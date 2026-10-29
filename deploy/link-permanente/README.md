# Link permanente (GitHub Pages + Cloudflare Tunnel)

O endereço fixo é `https://evelynjanynedev-hue.github.io/zyra-app/`. Ele não muda nunca.

Essa página não hospeda o app: ela descobre qual é o túnel ativo e redireciona.

```
https://evelynjanynedev-hue.github.io/zyra-app/   (fixo, público)
        │  lê url.json
        ▼
https://algo-algo.trycloudflare.com               (muda a cada reconexão)
        │
        ▼
localhost:3001 (Next.js) ──► Turso (dados)
```

## Como funciona

1. `index.html` busca `url.json` pelo **API do GitHub** (o `raw.githubusercontent.com` fica em cache
   por 5 min e devolveria um túnel morto).
2. Antes de redirecionar, chama `GET <túnel>/api/health` e confere se o app responde de verdade.
   Se não responder, tenta de novo por até ~40s — o tempo de um túnel reaparecer.
3. O `start-tunnel.sh` publica a URL nova em `url.json` sempre que o túnel sobe.

Para o passo 2 funcionar entre origens diferentes, `/api/health` responde com
`Access-Control-Allow-Origin: *`.

## Publicar

O conteúdo desta pasta vive no repositório público `zyra-app` (só a página; nenhum código do app
nem credencial). GitHub Pages serve a branch `main`, raiz.

```bash
git clone https://github.com/evelynjanynedev-hue/zyra-app
cp index.html <repo>/
cd <repo> && git add -A && git commit -m "página" && git push
```

## Limitações

- O Mac precisa estar ligado e com internet (o app roda nele).
- O endereço na barra muda para `*.trycloudflare.com` depois do redirecionamento — o link para
  guardar/compartilhar é sempre o do GitHub Pages.
- `url.json` é atualizado via API do GitHub; sem token válido em
  `~/Library/Application Support/zyra/github.token`, o link continua apontando para o túnel antigo.
