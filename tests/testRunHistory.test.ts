// @vitest-environment node
import { testRunRecord } from "../scripts/record_test_run.mjs";

const run = { at: "2026-10-17T20:00:00.000Z", commit: "abc123", branch: "main", dirty: false };
const meta = { ...run, root: "/repo" };

function result(title: string, status: string, failureMessages: string[] = [], ancestorTitles = ["Suite"]) {
  return { ancestorTitles, title, status, failureMessages };
}

describe("test run history", () => {
  it("records counts and names each failing test with the first line of its message", () => {
    const report = {
      numPassedTests: 1,
      numFailedTests: 1,
      numPendingTests: 1,
      numTodoTests: 1,
      testResults: [
        {
          name: "/repo/tests/study.test.ts",
          status: "failed",
          message: "",
          assertionResults: [
            result("keeps the queue", "passed"),
            result("advances", "failed", ["\nAssertionError: expected 2 to be 3\n    at study.test.ts:10"], ["Study", "queue"]),
            result("later", "skipped"),
            result("someday", "todo"),
          ],
        },
      ],
    };

    expect(testRunRecord(report, meta)).toEqual({
      ...run,
      passed: 1,
      failed: 1,
      skipped: 2,
      failures: [
        { file: "tests/study.test.ts", test: "Study > queue > advances", message: "AssertionError: expected 2 to be 3" },
      ],
    });
  });

  it("records a test file that fails to load as a failure without a test name", () => {
    const report = {
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      testResults: [
        {
          name: "/repo/tests/broken.test.ts",
          status: "failed",
          message: "Failed to load url ../src/missing (resolved id: ../src/missing)",
          assertionResults: [],
        },
      ],
    };

    expect(testRunRecord(report, meta).failures).toEqual([
      { file: "tests/broken.test.ts", test: null, message: "Failed to load url ../src/missing (resolved id: ../src/missing)" },
    ]);
  });
});
