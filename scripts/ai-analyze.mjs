#!/usr/bin/env node
/**
 * scripts/ai-analyze.mjs
 *
 * Reads Allure results from a completed Cypress run, finds failures (or all
 * results for flaky detection), and sends them to Gemini along with the
 * appropriate prompt template from ai-prompts/.
 *
 * USAGE (via package.json scripts):
 *   pnpm ai:analyze     — post-failure analysis  (analyze-failure.md)
 *   pnpm ai:flaky       — flaky test detection    (detect-flaky.md)
 *   pnpm ai:locator     — locator fix suggestions (suggest-locator-fix.md)
 *   pnpm ai:generate    — generate a new test     (generate-test.md)
 *
 * Or directly:
 *   node scripts/ai-analyze.mjs --mode analyze-failure
 *
 * REQUIRES:
 *   GEMINI_API_KEY set in .env (local) or as a GitHub Actions secret (CI).
 *
 * OUTPUT:
 *   Prints the AI analysis to stdout AND writes a Markdown file:
 *   ai-analysis-<mode>-<timestamp>.md
 *   (Add this pattern to .gitignore if you don't want to commit analyses.)
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ─── Load .env (no external deps) ────────────────────────────────────────────
function loadDotEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const raw = match[2].trim();
    // Strip surrounding quotes if present
    const value = raw.replace(/^(["'])(.*)\1$/, "$2");
    if (!process.env[key]) process.env[key] = value;
  }
}
loadDotEnv();

// ─── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const modeIdx = args.indexOf("--mode");
const mode = modeIdx !== -1 ? args[modeIdx + 1] : "analyze-failure";

const VALID_MODES = [
  "analyze-failure",
  "detect-flaky",
  "generate-test",
  "suggest-locator-fix",
];

if (!VALID_MODES.includes(mode)) {
  console.error(`❌  Unknown mode: "${mode}"`);
  console.error(`    Valid modes: ${VALID_MODES.join(", ")}`);
  process.exit(1);
}

// ─── Load prompt template ─────────────────────────────────────────────────────
const promptPath = join(ROOT, "ai-prompts", `${mode}.md`);
if (!existsSync(promptPath)) {
  console.error(`❌  Prompt template not found: ${promptPath}`);
  process.exit(1);
}
const promptTemplate = readFileSync(promptPath, "utf-8");

// ─── Read Allure results ──────────────────────────────────────────────────────
const RESULTS_DIR = join(ROOT, "allure-results");

function parseResultFiles() {
  if (!existsSync(RESULTS_DIR)) {
    return [];
  }
  return readdirSync(RESULTS_DIR)
    .filter((f) => f.endsWith("-result.json"))
    .flatMap((file) => {
      try {
        return [JSON.parse(readFileSync(join(RESULTS_DIR, file), "utf-8"))];
      } catch {
        return [];
      }
    });
}

function collectFailures(results) {
  return results
    .filter((r) => r.status === "failed" || r.status === "broken")
    .map((r) => ({
      name: r.name ?? "Unknown",
      fullName: r.fullName ?? "",
      status: r.status,
      message: r.statusDetails?.message ?? "",
      trace: (r.statusDetails?.trace ?? "").split("\n").slice(0, 15).join("\n"),
      steps: (r.steps ?? []).map((s) => ({ name: s.name, status: s.status })),
      suite: r.labels?.find((l) => l.name === "suite")?.value ?? "",
    }));
}

function collectAllForFlaky(results) {
  // A test is potentially flaky if it has retries with mixed statuses,
  // or if the same test name appears in both passed and failed results.
  const byName = {};
  for (const r of results) {
    const key = r.fullName ?? r.name;
    if (!byName[key]) byName[key] = [];
    byName[key].push(r.status);
  }
  return Object.entries(byName).map(([name, statuses]) => ({
    name,
    statuses,
    likelyFlaky:
      statuses.length > 1 &&
      statuses.includes("passed") &&
      (statuses.includes("failed") || statuses.includes("broken")),
  }));
}

// ─── Build the full prompt ────────────────────────────────────────────────────
function buildPrompt() {
  const results = parseResultFiles();

  if (mode === "analyze-failure" || mode === "suggest-locator-fix") {
    if (results.length === 0) {
      console.log(
        "ℹ️   allure-results/ is empty. Run `pnpm cypress:run` first."
      );
      process.exit(0);
    }
    const failures = collectFailures(results);
    if (failures.length === 0) {
      console.log("✅  No failures found in allure-results/. Nothing to analyze.");
      process.exit(0);
    }
    console.log(`🔍  Found ${failures.length} failure(s) to analyze.\n`);
    const context =
      `\n\n---\n## Test Failures (${failures.length})\n\n` +
      "```json\n" +
      JSON.stringify(failures, null, 2) +
      "\n```";
    return promptTemplate + context;
  }

  if (mode === "detect-flaky") {
    if (results.length === 0) {
      console.log(
        "ℹ️   allure-results/ is empty. Run `pnpm cypress:run` first."
      );
      process.exit(0);
    }
    const summary = collectAllForFlaky(results);
    const context =
      `\n\n---\n## Test Results Summary (${results.length} results, ${summary.length} unique tests)\n\n` +
      "```json\n" +
      JSON.stringify(summary, null, 2) +
      "\n```";
    return promptTemplate + context;
  }

  if (mode === "generate-test") {
    // For test generation, inject the project structure as context.
    const fixtures = existsSync(join(ROOT, "cypress/fixtures/testData.json"))
      ? readFileSync(join(ROOT, "cypress/fixtures/testData.json"), "utf-8")
      : "{}";
    const context =
      "\n\n---\n## Project Context\n\n" +
      "### testData.json\n```json\n" +
      fixtures +
      "\n```\n\n" +
      "### Target site\nhttps://burrowed.org (Next.js, production only, reCAPTCHA enabled)\n";
    return promptTemplate + context;
  }

  return promptTemplate;
}

// ─── Gemini API call ──────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌  GEMINI_API_KEY is not set.");
  console.error(
    "    Add it to your .env file or set it as an environment variable."
  );
  process.exit(1);
}

const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,      // Lower = more deterministic, better for code/analysis
      maxOutputTokens: 4096,
    },
  };

  const res = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API returned ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n🤖  Burrowed AI Analyzer`);
  console.log(`    mode: ${mode}`);
  console.log(`    model: gemini-1.5-flash\n`);

  const prompt = buildPrompt();
  console.log("⏳  Sending to Gemini...\n");

  let analysis;
  try {
    analysis = await callGemini(prompt);
  } catch (err) {
    console.error(`❌  ${err.message}`);
    process.exit(1);
  }

  // Print to terminal
  console.log("═".repeat(72));
  console.log(analysis);
  console.log("═".repeat(72));

  // Write to file for CI artifact consumption
  const timestamp = Date.now();
  const outPath = join(ROOT, `ai-analysis-${mode}-${timestamp}.md`);
  writeFileSync(
    outPath,
    `# AI Analysis — ${mode}\n_Generated: ${new Date(timestamp).toISOString()}_\n\n${analysis}\n`
  );
  console.log(`\n✅  Analysis saved → ${outPath}`);
  console.log(
    `    Tip: add 'ai-analysis-*.md' to .gitignore to exclude these files.\n`
  );
})();
