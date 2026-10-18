// @vitest-environment node
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { resolve } from "node:path";
import { FEEDBACK_IP_HOURLY_LIMIT, feedbackIssue } from "../shared/feedback";

let mf: Miniflare;
const github = vi.fn();
beforeEach(() => {
  github.mockReset();
  github.mockImplementation(async () => Response.json({ number: 1 }, { status: 201 }));
  mf = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    scriptPath: resolve("worker/dist/index.js"),
    compatibilityDate: "2026-09-23",
    durableObjects: { CHAT_QUOTA: { className: "ChatQuota", useSQLite: true } },
    bindings: {
      ALLOWED_ORIGIN: "https://haoly.app",
      OPENROUTER_API_KEY: "test-key",
      FEEDBACK_REPO: "owner/feedback",
      FEEDBACK_GITHUB_TOKEN: "github-token",
    },
    outboundService: async (request) => {
      expect(request.url).toBe("https://api.github.com/repos/owner/feedback/issues");
      expect(request.headers.get("Authorization")).toBe("Bearer github-token");
      return (await github(await request.json())) as Response;
    },
  }));
});
afterEach(async () => {
  await mf.dispose();
});

const submit = (body: unknown, origin = "https://haoly.app", ip = "203.0.113.9") =>
  mf.dispatchFetch("https://lei.example/feedback", {
    method: "POST",
    headers: { Origin: origin, "CF-Connecting-IP": ip, "Content-Type": "application/json", "User-Agent": "Test" },
    body: JSON.stringify(body),
  });
const report = { kind: "bug", message: "Cards stop @here\nafter 200", locale: "es", context: "/study/es/" };

it("files learner feedback as a GitHub issue without exposing the token", async () => {
  const response = await submit(report);
  expect(response.status).toBe(204);
  expect(github).toHaveBeenCalledWith(feedbackIssue({ ...report, kind: "bug", locale: "es" }, "Test"));
  expect(github.mock.calls[0][0].title).toBe("[Bug] Cards stop @​here");
});

it("rejects feedback from other origins and malformed reports", async () => {
  expect((await submit(report, "https://evil.example")).status).toBe(403);
  expect((await submit({ ...report, message: " " })).status).toBe(400);
  expect((await submit({ ...report, extra: 1 })).status).toBe(400);
  expect(github).not.toHaveBeenCalled();
});

it("limits each network to a few reports per hour", async () => {
  for (let i = 0; i < FEEDBACK_IP_HOURLY_LIMIT; i++)
    expect((await submit(report)).status).toBe(204);
  expect((await submit(report)).status).toBe(429);
  expect((await submit(report, undefined, "198.51.100.4")).status).toBe(204);
});

it("reports unavailable when GitHub refuses the issue", async () => {
  github.mockImplementation(async () => new Response(null, { status: 401 }));
  expect((await submit(report)).status).toBe(503);
});
