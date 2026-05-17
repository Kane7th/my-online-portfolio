# VPS Cursor Agent Runbook — MySmartRental 2.0 staging CORS

**Paste this entire file into a new Cursor chat on the VPS**, or open it from the portfolio repo after `git pull`.

---

## Mission (read first)

Enable the **GitHub Pages portfolio** to call:

`GET https://staging.mysmartrental.com/api/health`

from browser origin `https://kane7th.github.io` without CORS errors.

When working, the portfolio **MySmartRental 2.0** project card shows a green status line:

- `Staging: API + DB online` (if JSON includes `database: "connected"` or similar)
- or `Staging: API online` (if API responds but DB field is missing/other)

**You are NOT deploying the portfolio on the VPS.** You only fix CORS + proxy for the **staging Next.js app**.

---

## Critical: correct product vs wrong product

| | **MySmartRental 2.0 (TARGET)** | **MySmartRental v1 (DO NOT USE)** |
|---|--------------------------------|-----------------------------------|
| **URL** | `https://staging.mysmartrental.com` | `https://mysmartrental.com` |
| **Stack** | Next.js (App Router), TypeScript, PostgreSQL | React + **Flask** API |
| **nginx** | `server_name staging.mysmartrental.com` | `server_name mysmartrental.com` (or similar) |
| **Repo clues** | `app/` directory, `next.config.*`, `package.json` with `"next"` | `flask`, `app.py`, `requirements.txt`, no Next.js |
| **Health URL** | `/api/health` on **staging** host | May not exist or different shape |
| **Portfolio** | Flagship 2026, links to staging | “MySmartRental.com (2025)” archive card only |

**If you edit nginx or PM2 for `mysmartrental.com` or a Flask app, you are on the wrong system. Stop and re-run discovery.**

### Verified layout on this VPS (do not assume PM2 :3000 for staging)

CORS was applied successfully with this topology (May 2026):

| Item | Value |
|------|--------|
| **Staging app** | MySmartRental 2.0 — **Docker Compose** (`mysmartrental`), repo `/opt/mysmartrental` |
| **Compose file** | `/opt/mysmartrental/infra/compose.yml` |
| **Host upstream** | `127.0.0.1:8080` (Caddy in compose → Next.js `web:3000`) |
| **nginx vhost** | `/etc/nginx/sites-available/staging.mysmartrental.com` |
| **Health route (source)** | `/opt/mysmartrental/apps/web/src/app/api/health/route.ts` |
| **PM2 on host** | `projectchateau`, `uptwn-api` only — **neither is staging** |
| **Production** | `mysmartrental.com` → `127.0.0.1:3000` (PM2 `projectchateau`) — leave unchanged |
| **Health JSON** | `{"ok":true,"db":"reachable"}` |
| **CORS fix applied** | nginx `location = /api/health` → `proxy_pass http://127.0.0.1:8080` + `Access-Control-Allow-Origin: https://kane7th.github.io` |

**Proof staging is Next.js:** response headers include `Vary: rsc`, `next-router-state-tree`, etc.

Other apps on the same VPS (ignore for this task unless they share a broken global nginx snippet):

- Uptwn Ldn — often raw IP or separate vhost
- Seven Scripts — Tebex, not on this VPS
- SokoCredit — GitHub only

---

## Phase 0 — Discovery (run all commands, record output)

Run as a user that can read nginx and PM2 (often with `sudo` where noted).

### 0.1 Confirm hostname and TLS

```bash
curl -sI https://staging.mysmartrental.com/ | head -20
```

**Expect:** `HTTP/2 200` or `301`/`302` to app, `server: nginx` (or behind Cloudflare).

```bash
curl -sI https://mysmartrental.com/ | head -10
```

Note this is the **old** site — do not use it for CORS work.

### 0.2 Find nginx vhost for staging only

```bash
sudo nginx -T 2>/dev/null | grep -n "server_name.*mysmartrental" 
```

**Look for exactly:**

`server_name staging.mysmartrental.com;`

**Also list enabled sites:**

```bash
ls -la /etc/nginx/sites-enabled/
grep -r "staging.mysmartrental" /etc/nginx/sites-available/ /etc/nginx/sites-enabled/ 2>/dev/null
```

**Record the file path** you will edit, e.g.:

`/etc/nginx/sites-available/staging.mysmartrental.com`

### 0.3 Health endpoint today (before changes)

```bash
curl -sS https://staging.mysmartrental.com/api/health
curl -sSI https://staging.mysmartrental.com/api/health -H "Origin: https://kane7th.github.io"
```

**Record:**

- HTTP status (200 vs 404 vs 502)
- JSON body (if any)
- Whether `Access-Control-Allow-Origin` is **missing** (expected before fix) or wrong origin

**Acceptable JSON examples** (portfolio accepts any of these for “DB ok”):

```json
{ "status": "ok", "database": "connected" }
{ "db": "ok" }
{ "ok": true }
```

### 0.4 Which process serves staging?

```bash
pm2 list
pm2 jlist 2>/dev/null | head -c 4000
sudo ss -tlnp | grep -E ':(3000|3001|3002|8080|8000)\s'
```

**Identify the Node/Next process** tied to staging (names often contain `mysmartrental`, `staging`, `msr`, `next`).

**Verify it is Next.js** (pick one that works):

```bash
PM2_NAME="<name-from-pm2-list>"
pm2 describe "$PM2_NAME" | grep -E 'exec cwd|script path|interpreter'
# cd into exec cwd from output, then:
ls -la app/api/health 2>/dev/null || ls -la src/app/api/health 2>/dev/null
cat package.json | grep -E '"next"|"name"|"version"' | head -5
```

**Must see:** `"next"` in `package.json` and an `app/` (or `src/app/`) directory.

**Red flags (wrong app):**

- `app.py`, `wsgi.py`, `gunicorn`, `flask` in PM2 script
- cwd under a folder named `mysmartrental-legacy`, `v1`, `old`, `flask-api`
- Only Python listening on port, no Node

### 0.5 Map nginx `proxy_pass` port to PM2

Inside the **staging** server block:

```bash
sudo grep -A30 "server_name staging.mysmartrental.com" /etc/nginx/sites-enabled/* 2>/dev/null | grep -E 'proxy_pass|listen|location'
```

**Record `proxy_pass` port** (e.g. `http://127.0.0.1:3000`).

Confirm something is listening:

```bash
curl -sS http://127.0.0.1:3000/api/health
# If 3000 fails, try the port from proxy_pass:
curl -sS http://127.0.0.1:<PORT>/api/health
```

### 0.6 Cloudflare?

If `curl -sI https://staging.mysmartrental.com/` shows `cf-ray` or `server: cloudflare`, CORS may need **either** nginx on origin **or** a Cloudflare Transform Rule. Prefer fixing origin first; test again from browser.

---

## Phase 1 — Decide implementation path

| Path | When to use |
|------|-------------|
| **A. nginx `location = /api/health`** | Fastest; health route already works on localhost; you can reload nginx without rebuilding Next |
| **B. Next.js `app/api/health/route.ts`** | Route missing or wrong; you have the MySmartRental **2.0** repo on VPS and can `npm run build` |
| **C. Both** | Only if nginx strips app headers; watch for **duplicate** `Access-Control-Allow-Origin` |

**Default: try A first.** Use reference file from portfolio repo:

`vps-config/mysmartrental/nginx-health-cors.conf`

---

## Phase 2 — Implement Option A (nginx)

### 2.1 Backup

```bash
STAGING_CONF="/etc/nginx/sites-available/staging.mysmartrental.com"   # adjust if different
sudo cp -a "$STAGING_CONF" "${STAGING_CONF}.bak.$(date +%Y%m%d%H%M%S)"
```

### 2.2 Edit the **staging** server block only

Open `$STAGING_CONF`. Inside `server { ... server_name staging.mysmartrental.com ... }`:

1. Check if `location = /api/health` or `location /api/` already exists.
2. If a generic `location /` catches everything, add a **more specific** `location = /api/health` **above** `location /`.
3. Paste/adapt from `nginx-health-cors.conf`.
4. Set `proxy_pass http://127.0.0.1:<PORT>;` to the **staging Next.js** port from Phase 0.5 — **not** Flask, **not** production mysmartrental.com port.

### 2.3 Do not break other locations

- Do not remove SSL certs, `location /`, certbot includes, or upstream for main app.
- Do not edit `mysmartrental.com` server block.

### 2.4 Test and reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

If `nginx -t` fails, restore backup and fix syntax.

---

## Phase 3 — Implement Option B (Next.js route) — if needed

Work **only** in the MySmartRental **2.0** project directory found in Phase 0.4.

### 3.1 Confirm route file

```bash
cd /path/to/mysmartrental-2.0-staging   # use real path
find . -path '*/api/health/*' -name '*.ts' 2>/dev/null
```

If missing, create `app/api/health/route.ts` using portfolio reference:

`vps-config/mysmartrental/route.health.ts.example`

**Merge** with existing DB check logic (Prisma, `pg`, Drizzle, etc.) — do not ship a fake always-connected DB if the project already has a real check.

### 3.2 CORS in route (if not using nginx CORS)

The example file exports `OPTIONS` and adds headers on `GET`. Allowed origins must include:

- `https://kane7th.github.io`

### 3.3 Build and restart **staging PM2 process only**

```bash
git status
git branch
# Confirm this is the staging/2.0 repo, not v1

npm ci   # or npm install
npm run build
pm2 restart <STAGING_PM2_NAME> --update-env
pm2 logs <STAGING_PM2_NAME> --lines 50
```

**Do not** `pm2 restart all` unless you understand every other app on the server.

---

## Phase 4 — Verification (must all pass)

### 4.1 CORS headers from outside

From VPS or your PC:

```bash
curl -sSI "https://staging.mysmartrental.com/api/health" \
  -H "Origin: https://kane7th.github.io" | grep -iE 'HTTP/|access-control|content-type'
```

**Required:**

```
HTTP/2 200
access-control-allow-origin: https://kane7th.github.io
```

(Header name may be mixed case.)

### 4.2 OPTIONS preflight

```bash
curl -sSI -X OPTIONS "https://staging.mysmartrental.com/api/health" \
  -H "Origin: https://kane7th.github.io" \
  -H "Access-Control-Request-Method: GET" | grep -iE 'HTTP/|access-control'
```

**Expect:** `204` or `200` with `access-control-allow-origin`.

### 4.3 JSON body

```bash
curl -sS "https://staging.mysmartrental.com/api/health" | jq .
```

**Expect:** valid JSON, not HTML error page. Status code 200 (or 503 with JSON if DB down — portfolio still shows “API online”).

### 4.4 Wrong host must not be “fixed” by mistake

```bash
curl -sSI "https://mysmartrental.com/api/health" -H "Origin: https://kane7th.github.io" | head -5
```

Portfolio does **not** call this URL. No work required here.

### 4.5 Browser / portfolio end-to-end

1. Open: `https://kane7th.github.io/my-online-portfolio/`
2. Scroll to **Highlighted Projects** → **MySmartRental 2.0** (expanded).
3. Find line with id `projectHealthStatus` — should be **visible**, not hidden.
4. DevTools → Network → filter `health` → request to `staging.mysmartrental.com` → **Status 200**, no CORS error in Console.

**Portfolio fetch code (for reference):**

- URL: `https://staging.mysmartrental.com/api/health`
- Mode: `cors`
- Success: shows `#projectHealthStatus`; failure: `hidden` (no error shown to user)

---

## Phase 5 — Troubleshooting

| Symptom | Likely cause | Action |
|---------|----------------|--------|
| 502 on `/api/health` | Wrong `proxy_pass` port | Match PM2 listen port; `ss -tlnp` |
| 404 on `/api/health` | Route missing in Next | Option B: add `app/api/health/route.ts`, rebuild |
| CORS still blocked in browser | No `Allow-Origin` on response | Fix nginx or route; check duplicate headers |
| Two `Access-Control-Allow-Origin` values | nginx + Next both set CORS | Remove one layer |
| Works with curl, fails in browser | Cloudflare | Add Transform Rule or disable proxy for `/api/health` test |
| Connected to Flask app | Wrong upstream | Re-run Phase 0; fix staging vhost only |
| PM2 restart breaks other sites | Restarted all apps | Restart only staging process name |

### Duplicate header check

```bash
curl -sSI "https://staging.mysmartrental.com/api/health" \
  -H "Origin: https://kane7th.github.io" 2>&1 | grep -i access-control-allow-origin
```

**Exactly one** line with value `https://kane7th.github.io`.

---

## Phase 6 — Report back (agent completion template)

When done, reply with:

1. **Staging nginx file path** edited  
2. **PM2 process name** and **port** for MySmartRental 2.0  
3. **Repo path** on disk and proof it is Next.js (`package.json` line with `"next"`)  
4. **curl** output snippet showing `access-control-allow-origin: https://kane7th.github.io`  
5. **Sample** `/api/health` JSON body  
6. Confirmation you did **not** change `mysmartrental.com` / Flask v1  
7. Screenshot or confirmation that portfolio card shows staging status line  

---

## Reference files (portfolio repo)

Clone or copy from: `https://github.com/Kane7th/my-online-portfolio`

| File | Purpose |
|------|---------|
| `vps-config/mysmartrental/nginx-health-cors.conf` | nginx snippet |
| `vps-config/mysmartrental/route.health.ts.example` | Next.js route template |
| `vps-config/mysmartrental/next.config.headers.example.js` | Optional global headers (prefer route or nginx) |
| `vps-config/mysmartrental/APPLY-ON-VPS.txt` | Short checklist |

---

## Cursor agent system prompt (copy into VPS chat)

```
You are on a production Ubuntu VPS. Task: enable CORS on https://staging.mysmartrental.com/api/health for origin https://kane7th.github.io so a GitHub Pages portfolio can read JSON.

RULES:
- ONLY modify MySmartRental 2.0 on staging.mysmartrental.com (Next.js).
- DO NOT touch mysmartrental.com, Flask, or unrelated PM2 apps.
- Follow vps-config/mysmartrental/VPS-AGENT-RUNBOOK.md phases 0-6.
- Run discovery commands before editing files.
- Prefer nginx location = /api/health if the app already responds on localhost.
- After changes: curl with Origin header must show Access-Control-Allow-Origin: https://kane7th.github.io
- Document PM2 name, port, nginx path, and proof of Next.js vs Flask.
```

---

## Rollback

```bash
sudo cp -a /etc/nginx/sites-available/staging.mysmartrental.com.bak.<timestamp> \
  /etc/nginx/sites-available/staging.mysmartrental.com
sudo nginx -t && sudo systemctl reload nginx
```

If you deployed a bad Next route: `git checkout -- app/api/health/route.ts`, rebuild, `pm2 restart <STAGING_ONLY>`.
