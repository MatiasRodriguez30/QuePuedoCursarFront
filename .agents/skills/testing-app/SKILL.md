---
name: testing-qpc-resilience
description: Run real-backend browser resilience and cache-isolation checks for QuePuedoCursarFront.
---

# Environment

- Read `src/lib/api.js` for the API URL resolution; set `VITE_API_URL=http://localhost:8000` for both dev and production builds.
- Use the installed Node version (`$HOME/.nvm/versions/node/v24.19.0/bin` in this environment), `npm ci`, and `npm run dev -- --host 0.0.0.0`.
- When the remote API is asleep, run the sibling QuePuedoCursarBack repo using a Python venv, its requirements.txt, and `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- Register disposable local accounts through the UI; prepare one with approved progress and one with no progress. If admin coverage is needed, grant ADMIN only in the disposable local database.
- Use two distinct real careers, one with a unique subject, for plan-isolation checks.

# Adversarial flow

- Hold a real `/estados` response at CDP Fetch response stage for less than the GET timeout, then logout/login as the second user before releasing it. Repeat holding `/carreras`.
- Verify both visible progress and `qpc_cache_1_estados_<userId>` after the delayed response settles; a basic sequential logout/login alone does not exercise the stale-response race.
- Delay career-specific requests and rapidly change the header selector (`aria-label="Carrera actual"`). Verify old requests abort and only the selected plan remains.
- Pausing the local backend process with SIGSTOP tests latency, not definitive rejection. Always SIGCONT in cleanup. For rollback tests, fail a single PUT at request stage instead; for timeout tests retain the request long enough to exercise the write timeout.
- Log only request path, method, timestamps and response status, never credentials or auth headers.

# Production service worker

- Build with the local API URL and use `npm run preview -- --host 0.0.0.0`; service-worker registration is production-only.
- Navigate to `/?reset=disposable-test-token` and inspect Application → Cache Storage. Expect the navigation under `/`, not under the query URL; static assets and manifest are legitimate additional entries.
- In CDP-controlled browsers, a service worker may remain “trying to install” or a navigation may hang because the worker is waiting for the debugger. Inspect the service_worker target and call `Runtime.runIfWaitingForDebugger` on that target; verify it activates before attributing the stall to application code. Repeat if Chrome restarts the worker.
- To distinguish fresh HTML from a cached copy, modify only generated `dist/index.html` with a temporary title marker after rebuilding, navigate normally, then restore the generated file and refresh. Never commit this marker.

## Devin Secrets Needed

None for disposable local-backend testing. Do not assume local QA credentials exist in other environments.
