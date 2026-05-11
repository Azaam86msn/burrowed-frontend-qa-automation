# burrowed-frontend-qa-automation

Frontend QA automation for [Burrowed Magazine](https://burrowed.org), built with Cypress, TypeScript, Allure reporting, Docker, and GitHub Actions.

## Tech Stack

- Cypress 15
- TypeScript
- Allure reports
- Docker Compose with WireMock
- GitHub Actions
- Optional Gemini-based AI analysis scripts

## Prerequisites

- Node.js 22 recommended
- pnpm 11
- Java 17+ for Allure CLI
- Docker, optional

## Setup

```bash
git clone https://github.com/<org>/burrowed-frontend-qa-automation.git
cd burrowed-frontend-qa-automation

pnpm install
cp .env.example .env
```

Update `.env` with local values as needed.

## Environment Variables

| Variable           | Required | Used by             | Default                                          |
| ------------------ | -------- | ------------------- | ------------------------------------------------ |
| `CYPRESS_BASE_URL` | No       | Cypress, Docker, CI | `https://burrowed.org`                           |
| `API_BASE_URL`     | No       | Cypress, Docker, CI | `https://burrowed-magazine-api.onrender.com/api` |
| `GEMINI_API_KEY`   | Optional | `pnpm ai:*` scripts | None                                             |
| `GEMINI_MODEL`     | Optional | `pnpm ai:*` scripts | `gemini-2.5-flash`                               |

Never commit `.env` or real API keys.

## Scripts

| Command                   | Description                         |
| ------------------------- | ----------------------------------- |
| `pnpm cypress:open`       | Open Cypress interactive runner     |
| `pnpm cypress:run`        | Run all Cypress specs               |
| `pnpm cypress:smoke`      | Run smoke specs                     |
| `pnpm cypress:regression` | Run regression specs                |
| `pnpm format`             | Format files with Prettier          |
| `pnpm format:check`       | Check formatting                    |
| `pnpm allure:generate`    | Generate Allure HTML report         |
| `pnpm allure:open`        | Open generated Allure report        |
| `pnpm allure:clear`       | Remove Allure output directories    |
| `pnpm docker:up`          | Run WireMock and Cypress in Docker  |
| `pnpm docker:down`        | Stop Docker containers and networks |
| `pnpm ai:analyze`         | Analyze failed Allure test results  |
| `pnpm ai:flaky`           | Detect likely flaky tests           |
| `pnpm ai:locator`         | Suggest locator fixes for failures  |
| `pnpm ai:generate`        | Generate a Cypress test draft       |

## Running Tests

```bash
pnpm cypress:smoke
pnpm cypress:regression
```

Run a single spec:

```bash
pnpm cypress run --spec cypress/e2e/regression/newsletter.cy.ts
```

Open Cypress locally:

```bash
pnpm cypress:open
```

## Docker

Run the full suite in Docker:

```bash
pnpm docker:up
pnpm docker:down
```

The root `docker-compose.yml` starts WireMock and Cypress. WireMock mappings live in `docker/wiremock/mappings/`.

## Reports

Generate and open an Allure report after a Cypress run:

```bash
pnpm allure:generate
pnpm allure:open
```

Clear report output:

```bash
pnpm allure:clear
```

Allure output is written to:

- `allure-results/`
- `allure-report/`

## CI/CD

GitHub Actions workflows are in `.github/workflows/`.

| Workflow         | Trigger                              | Purpose                                     |
| ---------------- | ------------------------------------ | ------------------------------------------- |
| `smoke.yml`      | Push and pull request                | Runs smoke tests on Chrome                  |
| `regression.yml` | Monthly schedule and manual dispatch | Runs regression tests and publishes reports |

Regression reports are published to GitHub Pages under:

```text
https://<owner>.github.io/<repo>/regression/<run_number>/
```

The regression workflow also uploads Allure artifacts, screenshots, and videos.

## GitHub Secrets

Add repository secrets under:

```text
Repository Settings -> Secrets and variables -> Actions
```

### Required For Current Workflows

| Secret          | Used by          | Purpose                         |
| --------------- | ---------------- | ------------------------------- |
| `MAIL_USERNAME` | `regression.yml` | Sender email for failure alerts |
| `MAIL_PASSWORD` | `regression.yml` | Gmail App Password              |
| `MAIL_TO`       | `regression.yml` | Failure email recipient list    |

### Recommended

These have defaults in code, but should be set in CI for explicit environment control.

| Secret             | Used by                       |
| ------------------ | ----------------------------- |
| `CYPRESS_BASE_URL` | `smoke.yml`, `regression.yml` |
| `API_BASE_URL`     | `smoke.yml`, `regression.yml` |

### Optional

| Secret           | Used by                      |
| ---------------- | ---------------------------- |
| `GEMINI_API_KEY` | Optional AI analysis scripts |

`GITHUB_TOKEN` is provided automatically by GitHub Actions for publishing reports. Do not create or commit it manually.

## Project Structure

```text
.
├── .github/workflows/       # GitHub Actions workflows
├── ai-prompts/              # Prompt templates for AI analysis scripts
├── cypress/
│   ├── e2e/                 # Smoke and regression specs
│   ├── fixtures/            # Shared test data
│   ├── page-objects/        # Cypress page objects
│   └── support/             # Commands and global support setup
├── docker/wiremock/         # WireMock mappings
├── scripts/                 # Utility scripts
├── cypress.config.ts
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Notes

- `.env` is local-only and ignored by Git.
- Cypress videos, screenshots, Allure output, pnpm store files, and AI output files are ignored.
- AI scripts require `GEMINI_API_KEY`; the main test suite does not.
