import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// The pre-push hook writes vitest's JSON report here and this script appends a
// one-line summary to the history. Both live in the gitignored .test-history/
// folder: the record is per machine and is written after the commits it tests.
export const TEST_HISTORY_DIRECTORY = ".test-history";
export const LAST_RUN_REPORT = `${TEST_HISTORY_DIRECTORY}/last-run.json`;
export const TEST_RUN_HISTORY = `${TEST_HISTORY_DIRECTORY}/runs.jsonl`;

function firstLine(text) {
  return text.split("\n").find((line) => line.trim() !== "")?.trim() ?? "";
}

/**
 * Summarizes a vitest JSON report as one history record. Only failures are
 * listed by name: which tests failed, and on which commit, is what tells real
 * catches from flaky ones.
 */
export function testRunRecord(report, { at, commit, branch, dirty, root }) {
  const failures = report.testResults.flatMap((file) => {
    const path = relative(root, file.name);
    const failedTests = file.assertionResults
      .filter((test) => test.status === "failed")
      .map((test) => ({
        file: path,
        test: [...test.ancestorTitles, test.title].join(" > "),
        message: firstLine(test.failureMessages.join("\n")),
      }));
    // A file that fails to load has no test results, only a message.
    if (file.status === "failed" && failedTests.length === 0) {
      return [{ file: path, test: null, message: firstLine(file.message ?? "") }];
    }
    return failedTests;
  });

  return {
    at,
    commit,
    branch,
    // Tests run on the working tree, so uncommitted edits were part of the run.
    dirty,
    passed: report.numPassedTests,
    failed: report.numFailedTests,
    skipped: report.numPendingTests + (report.numTodoTests ?? 0),
    failures,
  };
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  if (!existsSync(LAST_RUN_REPORT)) {
    console.log("Sin informe de vitest: esta ejecución no se registra.");
  } else {
    const record = testRunRecord(JSON.parse(readFileSync(LAST_RUN_REPORT, "utf8")), {
      at: new Date().toISOString(),
      commit: git("rev-parse", "HEAD"),
      branch: git("rev-parse", "--abbrev-ref", "HEAD"),
      dirty: git("status", "--porcelain") !== "",
      root: process.cwd(),
    });
    appendFileSync(TEST_RUN_HISTORY, `${JSON.stringify(record)}\n`);
    console.log(
      `Ejecución registrada en ${TEST_RUN_HISTORY}: ${record.passed} pasan, ${record.failed} fallan.`,
    );
  }
}
