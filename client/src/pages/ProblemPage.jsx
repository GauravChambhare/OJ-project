import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MarkdownBlock from '../components/MarkdownBlock';
import Editor from '@monaco-editor/react';

const languageTemplates = {
  java: `public class Main {\n    public static void main(String[] args) throws Exception {\n        // your code here\n    }\n}`,
  python: `import sys\n\ndef main():\n    data = sys.stdin.read().strip()\n    print(data)\n\nif __name__ == "__main__":\n    main()`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // your code here\n    return 0;\n}`,
  javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\n// your code here\nconsole.log(input);`,
};

const SPLIT_POSITION_KEY = 'oj-problem-split-position';
const EDITOR_THEME_KEY = 'oj-editor-theme';
const DEFAULT_LEFT_WIDTH = 40; // 40% left, 60% right for more editor space
const DEFAULT_THEME = 'vs-dark';

function ProblemPage() {
  const { code } = useParams();

  // Problem state
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [problemError, setProblemError] = useState('');

  // Editor state
  const [language, setLanguage] = useState('java');
  const [codeText, setCodeText] = useState(languageTemplates.java);
  const [editorTheme, setEditorTheme] = useState(() => {
    return localStorage.getItem(EDITOR_THEME_KEY) || DEFAULT_THEME;
  });

  // Execution state
  const [mode, setMode] = useState(null);
  const [tests, setTests] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [error, setError] = useState('');

  // UI state - restore from localStorage if available
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem(SPLIT_POSITION_KEY);
    return saved ? Number(saved) : DEFAULT_LEFT_WIDTH;
  });

  // AI review functionality state 
  const [lastSubmissionId, setLastSubmissionId] = useState(null);
  const [aiReview, setAiReview] = useState('');
  const [isRequestingReview, setIsRequestingReview] = useState(false);
  const [aiReviewError, setAiReviewError] = useState('');

  // Persist split position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SPLIT_POSITION_KEY, leftWidth.toString());
  }, [leftWidth]);

  // Persist editor theme to localStorage
  useEffect(() => {
    localStorage.setItem(EDITOR_THEME_KEY, editorTheme);
  }, [editorTheme]);

  function handleLanguageChange(e) {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCodeText(languageTemplates[newLang]);
  }

  function handleThemeChange(e) {
    setEditorTheme(e.target.value);
  }


  useEffect(() => {
    async function loadProblem() {
      try {
        setLoadingProblem(true);
        const res = await fetch(
          `http://localhost:3000/api/problems/code/${code}`
        );
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          setProblem(data);
          setProblemError('');
        } else {
          setProblem(null);
          setProblemError(
            (data && (data.error || data.message)) || 'Problem not found.'
          );
        }
      } catch {
        setProblem(null);
        setProblemError('Network error while loading problem.');
      } finally {
        setLoadingProblem(false);
      }
    }

    loadProblem();
  }, [code]);

  function resetOutput() {
    setError('');
    setVerdict('');
    setStdout('');
    setStderr('');
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
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to run code.');
        return;
      }

      const response = await fetch('http://localhost:3000/api/judge/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemCode: code,
          language,
          code: codeText,
          mode: 'run',
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data) {
        setMode('run');
        setVerdict(data.verdict);
        setStdout(data.stdout);
        setStderr(data.stderr);
        setTests(Array.isArray(data.tests) ? data.tests : []);
      } else {
        setError((data && (data.error || data.message)) || 'Run failed.');
      }
    } catch {
      setError('Network error while running code.');
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
    setLastSubmissionId(null);
    setAiReview('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to submit code.');
        return;
      }

      const response = await fetch('http://localhost:3000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemCode: code,
          language,
          code: codeText,
          mode: 'submit',
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 201 && data) {
        setMode('submit');
        setVerdict(data.verdict);
        setStdout(data.stdout);
        setStderr(data.stderr);
        setTests(Array.isArray(data.tests) ? data.tests : []);
        setLastSubmissionId(data.id);
      } else {
        setError((data && (data.error || data.message)) || 'Submit failed.');
      }
    } catch {
      setError('Network error while submitting code.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAiReview() {
    if (!lastSubmissionId) {
      setAiReviewError('No submission to review');
      return;
    }

    setIsRequestingReview(true);
    setAiReviewError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAiReviewError('You must be logged in');
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/ai/review/${lastSubmissionId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (response.ok && data) {
        setAiReview(data.review);
        setAiReviewError('');
      } else {
        setAiReviewError(
          (data && (data.error || data.message)) ||
          'Failed to get AI review. Try again later.'
        );
      }
    } catch {
      setAiReviewError('Network error while requesting AI review.');
    } finally {
      setIsRequestingReview(false);
    }
  }


  function handleDividerMouseDown(e) {
    e.preventDefault();

    function onMouseMove(event) {
      const container = document.getElementById('problem-container');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newLeftPercent = ((event.clientX - rect.left) / rect.width) * 100;
      const clampedPercent = Math.min(75, Math.max(25, newLeftPercent));
      setLeftWidth(clampedPercent);
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  if (loadingProblem) {
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
          {problemError || 'Problem not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex h-[calc(100vh-48px)]" id="problem-container">
        {/* Left: problem statement pane */}
        <div
          className="w-1/2 border-r overflow-y-auto p-6"
          style={{ width: `${leftWidth}%` }}
        >
          <h1 className="text-xl font-semibold text-slate-800 mb-1">
            {problem.number}. {problem.title}
          </h1>
          <p className="text-xs text-slate-500 mb-3">
            Code: {problem.code} • Difficulty: {problem.difficulty}
          </p>

          <Link
            to={`/problems/${problem.code}/submissions`}
            className="inline-block mb-4 text-xs text-indigo-600 hover:underline"
          >
            View my submissions →
          </Link>

          <h2 className="text-sm font-semibold mb-2">Problem Statement</h2>
          {problem.statementMarkdown ? (
            <MarkdownBlock>{problem.statementMarkdown}</MarkdownBlock>
          ) : (
            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {problem.statement}
            </p>
          )}

          <h2 className="text-sm font-semibold mt-6 mb-2">
            Constraints &amp; Sample Testcases
          </h2>
          {problem.constraintsMarkdown ? (
            <MarkdownBlock>{problem.constraintsMarkdown}</MarkdownBlock>
          ) : (
            <p className="text-sm text-slate-500">(coming soon)</p>
          )}

          {problem.editorialMarkdown && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Editorial
              </h2>
              <MarkdownBlock>{problem.editorialMarkdown}</MarkdownBlock>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="w-1 bg-slate-300 hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors"
          title="Drag to resize"
        />

        {/* Right: editor + output pane */}
        <div
          className="bg-white flex flex-col"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Editor header with Language and Theme selectors */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Language
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

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Theme
                </label>
                <select
                  value={editorTheme}
                  onChange={handleThemeChange}
                  className="text-sm border border-slate-300 rounded px-3 py-1 bg-white"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="hc-black">High Contrast Dark</option>
                  <option value="hc-light">High Contrast Light</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={
                language === 'java'
                  ? 'java'
                  : language === 'cpp'
                    ? 'cpp'
                    : language === 'python'
                      ? 'python'
                      : 'javascript'
              }
              theme={editorTheme}
              value={codeText}
              onChange={value => setCodeText(value ?? '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>


          {/* Run/Submit buttons + Output section */}
          <div className="px-4 py-3 border-t border-slate-200">
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="rounded bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button
                type="button"
                disabled={isRunning || isSubmitting}
                onClick={handleSubmit}
                className="rounded bg-violet-600 text-white px-4 py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={handleAiReview}
                disabled={!lastSubmissionId || isRequestingReview || !!aiReview}
                className={
                  lastSubmissionId && !aiReview
                    ? 'rounded bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed'
                    : 'rounded bg-emerald-800/40 text-emerald-100/70 px-4 py-2 text-sm font-medium cursor-not-allowed'
                }
              >
                {isRequestingReview
                  ? 'Generating review...'
                  : aiReview
                    ? 'Reviewed ✓'
                    : 'AI review'}
              </button>

            </div>

            <p className="text-sm font-semibold text-slate-700 mb-1">Output</p>
            <div
              className={
                'bg-slate-900 text-slate-100 text-xs rounded p-3 font-mono overflow-y-auto ' +
                (error || stderr || verdict || tests.length > 0 ? 'h-64' : 'h-10')
              }
            >
              {error && <p className="text-red-400 mb-2">{error}</p>}

              {stderr && (
                <pre className="bg-red-900/50 text-red-100 rounded p-2 mb-2 whitespace-pre-wrap">
                  {stderr}
                </pre>
              )}

              {verdict && (
                <p className="mb-2">
                  <span
                    className={
                      verdict === 'Accepted'
                        ? 'text-emerald-400'
                        : verdict === 'Wrong Answer'
                          ? 'text-red-400'
                          : verdict === 'Time Limit Exceeded'
                            ? 'text-yellow-300'
                            : 'text-slate-200'
                    }
                  >
                    Verdict: {verdict}
                  </span>
                </p>
              )}

              {tests.length > 0 && mode === 'run' && (
                <div className="space-y-2">
                  {tests.map(t => (
                    <div
                      key={t.index}
                      className={
                        'border rounded p-2 ' +
                        (t.status === 'passed'
                          ? 'border-emerald-500/60 bg-emerald-900/20'
                          : 'border-red-500/60 bg-red-900/10')
                      }
                    >
                      <p
                        className={
                          t.status === 'passed'
                            ? 'text-emerald-300 mb-1 font-semibold'
                            : 'text-red-300 mb-1 font-semibold'
                        }
                      >
                        Test case {t.index} —{' '}
                        {t.status === 'passed' ? 'Passed' : 'Failed'}
                        {t.reason ? ` (${t.reason})` : ''}
                      </p>
                      <p className="text-slate-300 text-xs">
                        Input:{' '}
                        <span className="text-slate-100">{t.input}</span>
                      </p>
                      <p className="text-slate-300 text-xs">
                        Your output:{' '}
                        <span className="text-slate-100 whitespace-pre-wrap">
                          {t.actualOutput}
                        </span>
                      </p>
                      <p className="text-slate-300 text-xs">
                        Expected:{' '}
                        <span className="text-slate-100 whitespace-pre-wrap">
                          {t.expectedOutput}
                        </span>
                      </p>
                      {typeof t.timeMs === 'number' && (
                        <p className="text-slate-400 mt-1 text-xs">
                          Time: {t.timeMs} ms
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tests.length > 0 && mode === 'submit' && (
                <div className="space-y-1">
                  {tests.map(t => (
                    <p
                      key={t.index}
                      className={
                        t.status === 'passed'
                          ? 'text-emerald-300'
                          : 'text-red-300'
                      }
                    >
                      Test case {t.index} —{' '}
                      {t.status === 'passed' ? 'Passed' : 'Failed'}
                      {t.reason ? ` (${t.reason})` : ''}
                      {typeof t.timeMs === 'number' ? ` • ${t.timeMs} ms` : ''}
                    </p>
                  ))}
                </div>
              )}

              {!error &&
                !stderr &&
                !stdout &&
                !verdict &&
                tests.length === 0 && (
                  <span className="text-slate-500">
                    Run or submit your code to see output here.
                  </span>
                )}
            </div>
          </div> {/* End of output div */}

          {/* AI Review Section - inside right pane, below output */}
          {aiReview && (
            <div className="px-4 pb-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded p-4">
                <h3 className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <span>🤖</span>
                  <span>AI Code Review</span>
                </h3>
                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {aiReview}
                </div>
              </div>
            </div>
          )}

          {aiReviewError && (
            <div className="px-4 pb-3">
              <p className="text-sm text-red-600">{aiReviewError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;