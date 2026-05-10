# burrowed-frontend-qa-automation

Production-grade frontend QA automation for [Burrowed Magazine](https://burrowed.org) — built with **Cypress 15**, **TypeScript**, **Allure reporting**, **Docker**, and **GitHub Actions CI/CD**.

---

## Table of Contents

1. [Project structure](#project-structure)
2. [Local setup](#local-setup)
3. [Running tests](#running-tests)
4. [Docker](#docker)
5. [CI/CD — GitHub Actions](#cicd--github-actions)
6. [Allure reports](#allure-reports)
7. [AI-assisted analysis](#ai-assisted-analysis)
8. [GitHub secrets reference](#github-secrets-reference)
9. [reCAPTCHA strategy](#recaptcha-strategy)
10. [Best practices & future-proofing](#best-practices--future-proofing)

---

## Project structure

```
burrowed-frontend-qa-automation/
├── .github/
│   └── workflows/
│       ├── smoke.yml          # Quality gate — runs on every push & PR
│       └── regression.yml     # Full suite — monthly schedule + manual dispatch
├── ai-prompts/
│   ├── analyze-failure.md     # Prompt: root-cause analysis of failing tests
│   ├── detect-flaky.md        # Prompt: identify flaky tests from results
│   ├── generate-test.md       # Prompt: generate new Cypress test from spec
│   └── suggest-locator-fix.md # Prompt: suggest stable selector alternatives
├── cypress/
│   ├── e2e/
│   │   ├── regression/        # Full coverage suite (run monthly or on demand)
│   │   └── smoke/             # Fast sanity checks (run on every push)
│   ├── fixtures/
│   │   └── testData.json      # Shared test data (names, emails, file buffers)
│   ├── page-objects/          # Page Object Model classes
│   └── support/
│       ├── commands.ts        # Custom Cypress commands (stubs, intercepts)
│       └── e2e.ts             # Global support file (Allure + exception handling)
├── docker/
│   ├── docker-compose.yml     # WireMock-only (for local API stubbing)
│   └── wiremock/mappings/     # WireMock stub definitions
├── scripts/
│   └── ai-analyze.mjs         # AI failure/flaky/locator analysis via Gemini
├── cypress.config.ts
├── docker-compose.yml         # Full suite in Docker (root-level, single command)
├── package.json
└── tsconfig.json
```

---

## Local setup

**Prerequisites:** Node.js 20+, pnpm 10+, Java 17+ (for Allure CLI), Docker (optional)

```bash
# 1. Clone the repository
git clone https://github.com/<org>/burrowed-frontend-qa-automation.git
cd burrowed-frontend-qa-automation

# 2. Install dependencies
pnpm install

# 3. Create your local environment file
cp .env.example .env   # then fill in your values
```

**.env values:**
| Variable | Default | Description |
|---|---|---|
| `CYPRESS_BASE_URL` | `https://burrowed.org` | Target site URL |
| `API_BASE_URL` | `https://burrowed-magazine-api.onrender.com/api` | Backend API base |
| `GEMINI_API_KEY` | — | Gemini API key for AI analysis scripts |

> **Never commit `.env`** — it is in `.gitignore`.

---

## Running tests

```bash
# Open Cypress interactive runner
pnpm cypress:open

# Run smoke suite (fast — ~2 min)
pnpm cypress:smoke

# Run full regression suite
pnpm cypress:regression

# Run a single spec
pnpm cypress run --spec cypress/e2e/regression/newsletter.cy.ts
```

---

## Docker

Run the complete test suite in a fully containerised environment:

```bash
# Start WireMock + Cypress — exit when tests finish
pnpm docker:up

# Clean up containers and networks
pnpm docker:down
```

Under the hood this runs `docker compose up --exit-code-from cypress` using the root-level `docker-compose.yml`. The Cypress exit code propagates, so CI pipelines can use this too.

**WireMock only** (for running Cypress locally while stubbing the API):

```bash
pnpm docker:wm
# WireMock is now available at http://localhost:8080
# Run tests as normal: pnpm cypress:run
```

**Notes:**
- `node_modules` lives in a named Docker volume (`cypress_node_modules`) so the container install doesn't overwrite your host's copy. If you see stale dependency issues, prune the volume:
  ```bash
  docker volume rm burrowed-frontend-qa-automation_cypress_node_modules
  ```
- Allure results, videos, and screenshots are written back to your host filesystem via the bind mount, so you can run `pnpm allure:generate` locally after the container exits.

---

## CI/CD — GitHub Actions

### Smoke — quality gate (`smoke.yml`)

| Trigger | Branches |
|---|---|
| `push` | all branches |
| `pull_request` | all branches |

- Runs the smoke suite on Chrome.
- Uploads Allure results, videos, and failure screenshots as artifacts (7-day retention).
- Uses `concurrency` to cancel stale runs when new commits arrive on the same branch.

**Enforce as a required check:** Repository Settings → Branches → Branch protection rules → `main` → ✅ Require status checks → search for `Smoke Tests (Chrome)`.

### Regression — scheduled & manual (`regression.yml`)

| Trigger | When |
|---|---|
| Schedule | 1st of every month at 06:00 UTC |
| `workflow_dispatch` | Manual, with optional spec glob and browser override |

- Runs the full regression suite.
- Publishes Allure HTML report to **GitHub Pages** under `/regression/<run_number>/`.
- Uploads report and raw results as 30-day artifacts.
- Sends an **HTML email** on failure (see secrets setup below).

**Manual dispatch:** Actions tab → "🧪 Regression Suite — Scheduled & Manual" → Run workflow → optionally override spec glob or browser.

---

## Allure reports

### Generate locally

```bash
# After any cypress run:
pnpm allure:generate   # → allure-report/
pnpm allure:open       # opens browser

# Wipe both directories
pnpm allure:clear
```

> **Java required:** `allure-commandline` wraps the Allure CLI jar. Install Java 17+ (Temurin recommended) and ensure `java` is on your PATH.

### Published reports (GitHub Pages)

After each regression run, reports are available at:

```
https://<org>.github.io/burrowed-frontend-qa-automation/regression/<run_number>/
```

Each run gets its own directory — history is preserved indefinitely.

**One-time setup:** Repository Settings → Pages → Source: "Deploy from a branch" → Branch: `gh-pages` / Folder: `/ (root)`. The `peaceiris/actions-gh-pages` action creates the `gh-pages` branch on the first run automatically.

---

## AI-assisted analysis

Four prompt templates live in `ai-prompts/` and the `scripts/ai-analyze.mjs` script feeds them to Gemini 1.5 Flash along with relevant test data.

```bash
# After a failing run:
pnpm ai:analyze    # Root-cause analysis of every failed test

# After several runs (for flaky detection):
pnpm ai:flaky      # Identifies tests with inconsistent pass/fail history

# When a locator breaks:
pnpm ai:locator    # Suggests stable selector alternatives for broken selectors

# To add coverage:
pnpm ai:generate   # Generates a new Cypress test based on project patterns
```

Each run prints the analysis to stdout and saves it as `ai-analysis-<mode>-<timestamp>.md`.

**Add to `.gitignore`** to avoid committing AI outputs:
```
ai-analysis-*.md
```

### Using AI analysis in CI

Add a step after the regression run to auto-analyze failures and upload the report:

```yaml
- name: "🤖 AI failure analysis"
  if: failure()
  run: pnpm ai:analyze
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

- name: "📤 Upload AI analysis"
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: ai-analysis-${{ github.run_number }}
    path: ai-analysis-*.md
    retention-days: 30
```

---

## GitHub secrets reference

Go to: Repository → Settings → Secrets and variables → Actions → New repository secret.

| Secret | Required for | Description |
|---|---|---|
| `CYPRESS_BASE_URL` | both workflows | Target URL, e.g. `https://burrowed.org` |
| `API_BASE_URL` | both workflows | Backend API, e.g. `https://burrowed-magazine-api.onrender.com/api` |
| `MAIL_USERNAME` | regression | Gmail address used to send failure emails |
| `MAIL_PASSWORD` | regression | Gmail **App Password** — not your account password. Generate at: Google Account → Security → App passwords → "Mail" → "Other" |
| `MAIL_TO` | regression | Recipient(s), comma-separated, e.g. `lead@example.com,qa@example.com` |
| `GEMINI_API_KEY` | optional AI steps | Only needed if you add the AI analysis step to CI |

---

## reCAPTCHA strategy

Burrowed currently runs on production only (no staging). reCAPTCHA cannot be bypassed in this environment. The test suite handles this in three ways:

1. **Happy-path tests use `cy.intercept`** to stub the API response directly, bypassing the network entirely. The test validates UI state without triggering reCAPTCHA.
2. **The `stubRecaptcha` custom command** is implemented and ready. It replaces `grecaptcha.execute` with a function returning a fake token. This works only once a staging environment (with backend reCAPTCHA validation disabled) is available.
3. **Submission tests are marked "staging only"** via `TODO` comments — they test the API payload shape via the intercept handler rather than the full submission flow.

**When you get a staging environment:**
- Set `CYPRESS_BASE_URL` (in `.env` or CI secret) to the staging URL.
- Add `CAPTCHA_DISABLED=true` flag to your test env config.
- In `commands.ts`, wrap `stubRecaptcha` with an env check so it only runs when `Cypress.env('captchaDisabled')` is true.
- Uncomment the `TODO` lines in `newsletter.cy.ts`, `submit.cy.ts`, and `collaborate.cy.ts`.

---

## Best practices & future-proofing

### Use `data-testid` attributes consistently

Many selectors currently target CSS classes or structural paths that will break on styling changes. The `TODO` comments in page objects and tests flag every place that needs a `data-testid`. Discuss with the dev team to add them during feature development — it's a one-line change per element with significant reliability payoff.

```tsx
// Dev side (React/Next.js)
<button data-testid="hero-read-latest-issue">Read Latest Issue</button>

// Test side
cy.get('[data-testid="hero-read-latest-issue"]').click();
```

### Test data management

- **Current:** `testData.json` is committed and shared. This works for static data.
- **As the suite grows:** Move environment-specific data (URLs, emails, API keys) into `.env` and read them via `Cypress.env()`. Keep only structural test data (names, bios, file buffers) in `testData.json`.
- **For parallel CI runs:** Use unique email addresses per run (e.g. `jane.${Date.now()}@mailinator.com`) to avoid data collisions on staging.

### Branching strategy

```
main                 ← stable, protected; smoke gate required to merge
├── qa/feature-xyz   ← new test coverage for app feature xyz
├── qa/fix-flaky     ← flaky test investigation branch
└── qa/chore-refactor← selector improvements, data-testid adoption
```

Keep QA branches separate from app feature branches. PRs into `main` trigger the smoke gate automatically. Regression runs are independent of branching.

### Managing suite growth

- **Smoke suite:** Keep it under 5 minutes. Only include tests that verify the site is up and basic navigation works. Move anything requiring data entry or API calls to regression.
- **Regression suite:** Organise by page/feature. Each file is self-contained with its own `beforeEach` setup. Use `describe.skip` to quarantine known-broken tests rather than deleting them.
- **Tagging (future):** Cypress 15+ supports `@tag` in test titles. Consider `[P1]`, `[P2]`, `[API]` tags and run subsets via `--grep` in manual dispatch.
- **Parallelisation:** The project has a `projectId` configured (`czm3dt`) for Cypress Cloud. Once enabled, parallel spec distribution can cut regression run time significantly.

### Keeping selectors healthy

Run `pnpm ai:locator` after any test failures caused by selector changes. The script sends the failed test details and the `suggest-locator-fix.md` prompt to Gemini, which will propose `data-testid`-based alternatives or more resilient attribute selectors.
