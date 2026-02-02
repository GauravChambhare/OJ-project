import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const languageTemplates = {
  java: `public class Main {
    public static void main(String[] args) throws Exception {
        // your code here
    }
}
`,
  python: `import sys


def main():
    data = sys.stdin.read().strip()
    # your code here
    print(data)


if __name__ == "__main__":
    main()
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;


int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // your code here

    return 0;
}
`,
  javascript: `const fs = require("fs");


const input = fs.readFileSync(0, "utf8").trim();

// your code here
console.log(input);
`,
};

function ProblemPage() {
  const { code } = useParams();

  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [problemError, setProblemError] = useState("");

  const [language, setLanguage] = useState("java");
  const [codeText, setCodeText] = useState(languageTemplates.java);
  const [mode, setMode] = useState(null); // 'run' | 'submit' | null
  const [tests, setTests] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [verdict, setVerdict] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [error, setError] = useState("");
  const [editorHeight, setEditorHeight] = useState(340);
  const [submissions, setSubmissions] = useState([]);

  function handleLanguageChange(e) {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCodeText(languageTemplates[newLang] || "");
  }

  async function loadProblem() {
    try {
      setProblemLoading(true);
      setProblemError("");

      const res = await fetch(`http://localhost:3000/api/problems/${code}`);
      const data = await res.json().catch(() => null);

      if (res.ok && data) {
        setProblem(data);
      } else {
        setProblemError(
          (data && (data.error || data.message)) || "Could not load problem."
        );
      }
    } catch {
      setProblemError("Network error while loading problem.");
    } finally {
      setProblemLoading(false);
    }
  }

  async function loadSubmissions() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `http://localhost:3000/api/submissions?problemCode=${encodeURIComponent(
          code
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);
      if (response.ok && Array.isArray(data)) {
        setSubmissions(data);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadProblem();
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function resetOutput() {
    setError("");
    setVerdict("");
    setStdout("");
    setStderr("");
    setTests([]);
    setMode(null);
  }

  async function handleRun(e) {
    e.preventDefault();
    resetOutput();
    setMode(null);
    setIsRunning(true);
    setIsSubmitting(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to run code.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/judge/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemCode: code,
          language,
          code: codeText,
          mode: "run",
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data) {
        setMode("run");
        setVerdict(data.verdict || "");
        setStdout(data.stdout || "");
        setStderr(data.stderr || "");
        setTests(Array.isArray(data.tests) ? data.tests : []);
      } else {
        const msg =
          (data && (data.error || data.message)) ||
          "Run failed. Please try again.";
        setError(msg);
      }
    } catch {
      setError("Network error while running code.");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetOutput();
    setMode(null);

    setIsSubmitting(true);
    setIsRunning(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to submit code.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemCode: code,
          language,
          code: codeText,
          mode: "submit",
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 201 && data) {
        setMode("submit");
        setVerdict(data.verdict || "");
        setStdout(data.stdout || "");
        setStderr(data.stderr || "");
        setTests(Array.isArray(data.tests) ? data.tests : []);
        await loadSubmissions();
      } else {
        const msg =
          (data && (data.error || data.message)) ||
          "Submit failed. Please try again.";
        setError(msg);
      }
    } catch {
      setError("Network error while submitting code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (problemLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-700">Loading problem...</p>
      </div>
    );
  }

  if (problemError || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-red-600">
          {problemError || "Problem not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] py-4">
        <div className="bg-white shadow rounded-lg h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800 mb-1">
                {problem.number}. {problem.title}
              </h1>
              <p className="text-xs text-slate-500 mb-1">
                Code: {problem.code} • Difficulty: {problem.difficulty}
              </p>
            </div>
            <a
              href={`/problems/${problem.code}/submissions`}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              View my submissions →
            </a>
          </div>

          {/* Main content: two columns */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left column */}
            <div className="w-[40%] border-r border-slate-200 overflow-y-auto px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Problem Statement
              </h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">
                {problem.statement}
              </p>

              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Constraints & Sample Testcases
              </h2>
              <p className="text-xs text-slate-500">(work in progress)</p>
            </div>

            {/* Right column */}
            <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
              {/* Language selector */}
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Code editor
                </label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="text-sm border border-slate-300 rounded px-3 py-1 bg-white"
                >
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              {/* Editor */}
              <div
                className="overflow-hidden"
                style={{ height: `${editorHeight}px` }}
              >
                <textarea
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const start = e.target.selectionStart;
                      const end = e.target.selectionEnd;
                      const newValue =
                        codeText.substring(0, start) +
                        "  " +
                        codeText.substring(end);
                      setCodeText(newValue);
                      setTimeout(() => {
                        e.target.selectionStart = e.target.selectionEnd =
                          start + 2;
                      }, 0);
                    }
                  }}
                  rows={18}
                  className="w-full h-full font-mono text-sm rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Resize handle */}
              <div
                className="h-2 cursor-row-resize bg-slate-200 hover:bg-slate-300 rounded mb-2"
                onMouseDown={(e) => {
                  const startY = e.clientY;
                  const startHeight = editorHeight;

                  function onMove(ev) {
                    const delta = ev.clientY - startY;
                    const next = Math.min(
                      600,
                      Math.max(160, startHeight + delta)
                    );
                    setEditorHeight(next);
                  }

                  function onUp() {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  }

                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              />

              {/* Buttons + output */}
              <form
                onSubmit={handleRun}
                className="mt-3 pt-3 border-t border-slate-200"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="submit"
                    disabled={isRunning || isSubmitting}
                    className="rounded bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isRunning ? "Running..." : "Run"}
                  </button>

                  <button
                    type="button"
                    disabled={isRunning || isSubmitting}
                    onClick={handleSubmit}
                    className="rounded bg-violet-600 text-white px-4 py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>

                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="rounded bg-emerald-800/40 text-emerald-100/70 px-4 py-2 text-sm font-medium cursor-not-allowed"
                  >
                    AI review
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Output
                </p>
                <div className="bg-slate-900 text-slate-100 text-xs rounded p-3 whitespace-pre-wrap font-mono h-52 overflow-y-auto">
                  {error && <p className="text-red-400 mb-1">{error}</p>}

                  {stderr && (
                    <pre className="bg-red-900/50 text-red-100 rounded p-2 mb-2 whitespace-pre-wrap">
                      {stderr}
                    </pre>
                  )}

                  {verdict && (
                    <p
                      className={`mb-2 ${
                        verdict === "Accepted"
                          ? "text-green-400"
                          : "text-yellow-300"
                      }`}
                    >
                      Verdict: {verdict}
                    </p>
                  )}

                  {tests.length > 0 && mode === "run" && (
                    <div className="space-y-3">
                      {tests.map((t) => (
                        <div
                          key={t.index}
                          className={`border rounded p-2 ${
                            t.status === "passed"
                              ? "border-emerald-500/60 bg-emerald-900/20"
                              : "border-red-500/60 bg-red-900/10"
                          }`}
                        >
                          <p
                            className={`mb-1 ${
                              t.status === "passed"
                                ? "text-emerald-300"
                                : "text-red-300"
                            }`}
                          >
                            Test case {t.index} —{" "}
                            {t.status === "passed" ? "Passed" : "Failed"}
                            {t.reason ? ` (${t.reason})` : ""}
                          </p>
                          <p className="text-slate-300">
                            Input:{" "}
                            <span className="text-slate-100">{t.input}</span>
                          </p>
                          <p className="text-slate-300">
                            Your output:{" "}
                            <span className="text-slate-100 whitespace-pre-wrap">
                              {t.actualOutput}
                            </span>
                          </p>
                          <p className="text-slate-300">
                            Expected:{" "}
                            <span className="text-slate-100 whitespace-pre-wrap">
                              {t.expectedOutput}
                            </span>
                          </p>
                          {typeof t.timeMs === "number" && (
                            <p className="text-slate-400 mt-1">
                              Time: {t.timeMs} ms
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {tests.length > 0 && mode === "submit" && (
                    <div className="space-y-1">
                      {tests.map((t) => (
                        <p
                          key={t.index}
                          className={`${
                            t.status === "passed"
                              ? "text-emerald-300"
                              : "text-red-300"
                          }`}
                        >
                          Test case {t.index} —{" "}
                          {t.status === "passed" ? "Passed" : "Failed"}
                          {t.reason ? ` (${t.reason})` : ""}
                          {typeof t.timeMs === "number"
                            ? ` • ${t.timeMs} ms`
                            : ""}
                        </p>
                      ))}
                    </div>
                  )}

                  {!error &&
                    !stderr &&
                    !stdout &&
                    !verdict &&
                    tests.length === 0 && (
                      <p className="text-slate-500">
                        Run or submit your code to see output here.
                      </p>
                    )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;