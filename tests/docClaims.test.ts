// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Docs that describe this repository. docs/agents/domain.md is excluded
// because it describes a generic layout template, not files that exist here.
const docs = [
  "AGENTS.md",
  "CONTEXT.md",
  "README.md",
  ...["docs", "docs/adr", "docs/agents"].flatMap((dir) =>
    readdirSync(dir).filter((name) => name.endsWith(".md")).map((name) => join(dir, name))),
].filter((doc) => doc !== "docs/agents/domain.md");

const trackedRoots = ["src", "scripts", "tests", "worker", "shared", "docs", ".github"];

function repoPathsCitedIn(doc: string) {
  return [...readFileSync(doc, "utf8").matchAll(/`([^`\s]+)`/g)]
    .map(([, token]) => token)
    .filter((token) => trackedRoots.includes(token.split("/")[0]) && token.includes("/"))
    .filter((token) => !token.includes("<"))
    // Dotfiles such as worker/.dev.vars are local, gitignored secrets.
    .filter((token) => !token.split("/").at(-1)!.startsWith("."));
}

function read(path: string) {
  return readFileSync(path, "utf8");
}

function captured(source: string, pattern: RegExp, label: string) {
  const value = source.match(pattern)?.[1];
  if (value === undefined) throw new Error(`Could not find ${label} in source (${pattern})`);
  // Source constants are plain integers or products such as `128 * 1024`.
  return value.split("*").reduce((product, factor) => product * Number(factor), 1);
}

const smallNumberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

function asProse(value: number) {
  return smallNumberWords[value] ?? value.toLocaleString("en-US");
}

describe("documentation claims", () => {
  it.each(docs)("%s cites only repository paths that exist", (doc) => {
    const missing = repoPathsCitedIn(doc).filter((path) => !existsSync(path));
    expect(missing, `${doc} cites missing paths`).toEqual([]);
  });

  it("states the Léi usage limits that the Worker enforces", () => {
    const wrangler = read("worker/wrangler.jsonc");
    const variable = (name: string) => captured(wrangler, new RegExp(`"${name}":\\s*"(\\d+)"`), name);
    const quota = read("worker/src/quota.ts");
    const worker = read("worker/src/index.ts");
    const tutor = read("worker/src/tutor.ts");
    const client = read("src/lib/chatClient.ts");

    const claims = [
      `${asProse(variable("CHAT_GUEST_TOTAL_LIMIT"))} guest attempts per browser ID in total`,
      `${asProse(variable("CHAT_GUEST_IP_DAILY_LIMIT"))} guest attempts per network per UTC day`,
      `${asProse(variable("CHAT_USER_DAILY_LIMIT"))} attempts per signed-in user per UTC day`,
      `${asProse(captured(quota, /user\.burst >= (\d+)/, "per-minute burst limit"))} per calendar minute`,
      `${asProse(variable("CHAT_GLOBAL_DAILY_LIMIT"))} globally per UTC day`,
      `${asProse(variable("CHAT_GLOBAL_MONTHLY_LIMIT"))} globally per UTC month`,
      `${captured(worker, /MAX_BODY_BYTES = ([\d\s*]+);/, "body limit") / 1024} KiB body limit`,
      `${asProse(captured(tutor, /max_tokens: (\d+)/, "provider token limit"))} tokens`,
      `${captured(tutor, /AbortSignal\.timeout\((\d+)\)/, "provider timeout") / 1000}-second timeout`,
      `${captured(client, /AbortSignal\.timeout\((\d+)\)/, "browser timeout") / 1000}-second browser timeout`,
    ];

    const documented = read("docs/conversation.md");
    const missing = claims.filter((claim) => !documented.includes(claim));
    expect(missing.join("\n"), "docs/conversation.md should state").toBe("");
  });
});
