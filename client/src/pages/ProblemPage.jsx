import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ProblemPage() {

    const languageTemplates = { // this will be the default text that will appear on editor text window for each langauge
      java: 'public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}\n',
      python: 'name = input().strip()\nprint(name)\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // your code here\n    return 0;\n}\n',
      javascript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim();\nconsole.log(input);\n',
    };
  
    const { code } = useParams(); // e.g. "SUM2"
    const [problem, setProblem] = useState(null);
    const [problemLoading, setProblemLoading] = useState(true);
    const [problemError, setProblemError] = useState('');
    const [language, setLanguage] = useState('java');
    const [codeText, setCodeText] = useState(languageTemplates.java);
    const [loading, setLoading] = useState(false);
    const [verdict, setVerdict] = useState('');
    const [stdout, setStdout] = useState('');
    const [stderr, setStderr] = useState('');
    const [error, setError] = useState('');
    const [submissions, setSubmissions] = useState([]);
  
    function handleLanguageChange(e) {
      const newLang = e.target.value;
      setLanguage(newLang);
      setCodeText(languageTemplates[newLang] || '');
    }  
    
    async function loadProblem() {
      try {
        setProblemLoading(true);
        const res = await fetch(`http://localhost:3000/api/problems/${code}`);
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          setProblem(data);
          setProblemError('');
        } else {
          setProblemError(
            (data && (data.error || data.message)) || 'Could not load problem.'
          );
        }
      } catch (err) {
        setProblemError('Network error while loading problem.');
      } finally {
        setProblemLoading(false);
      }
    }
  
      async function loadSubmissions() {
        try {
          const token = localStorage.getItem('token');
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
        } catch (err) {
          // silent
        }
      }
  
      async function handleRun(e) {
        e.preventDefault();
        setError('');
        setVerdict('');
        setStdout('');
        setStderr('');
        setLoading(true);
  
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('You must be logged in to run code.');
            setLoading(false);
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
            }),
          });
  
          const data = await response.json().catch(() => null);
  
          if (response.status === 201 && data) {
            setVerdict(data.verdict || '');
            setStdout(data.stdout || '');
            setStderr(data.stderr || '');
            await loadSubmissions();
          } else {
            const msg =
              (data && (data.error || data.message)) ||
              'Run failed. Please try again.';
            setError(msg);
          }
        } catch (err) {
          setError('Network error while submitting code.');
        } finally {
          setLoading(false);
        }
      }
  
  
      useEffect(() => {
        loadProblem();
        loadSubmissions();
      }, [code]
    );
  
  
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
            {problemError || 'Problem not found.'}
          </p>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-slate-100 py-8">
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            {problem.number}. {problem.title}
          </h1>
          <p className="text-xs text-slate-500 mb-1">
            Code: {problem.code} · Difficulty: {problem.difficulty}
          </p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {problem.statement}
          </p>
  
          <form onSubmit={handleRun} className="space-y-4">
            <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Code Editor
                </label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="text-sm border border-slate-300 rounded px-3 py-1 bg-white">
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              <textarea
                value={codeText}
                onChange={e => setCodeText(e.target.value)}
                onKeyDown={e => { //added to implement functionality of pressing tab and enter instead of it removing cursor out of text box
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const newValue = codeText.substring(0, start) + '  ' + codeText.substring(end);
                    setCodeText(newValue);
                    // Set cursor position after the inserted spaces
                    setTimeout(() => {
                      e.target.selectionStart = e.target.selectionEnd = start + 2;
                    }, 0);
                  }
                }}
                rows={12}
                className="w-full font-mono text-sm rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : 'Run Code'}
            </button>
          </form>
  
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
  
          {(verdict || stdout || stderr) && (
            <div className="mt-4 space-y-2">
              {verdict && (
                <p className="text-sm">
                  <span className="font-semibold">Verdict:</span> {verdict}
                </p>
              )}
              {stdout && (
                <div>
                  <p className="text-sm font-semibold text-slate-700">Stdout:</p>
                  <pre className="mt-1 bg-slate-900 text-slate-100 text-xs rounded p-2 whitespace-pre-wrap font-mono"> {stdout}
                  </pre>
                </div>
              )}
              {stderr && (
                <div>
                  <p className="text-sm font-semibold text-slate-700">Stderr:</p>
                  <pre className="mt-1 bg-red-900 text-red-50 text-xs rounded p-2 whitespace-pre-wrap font-mono"> {stderr}
                  </pre>
                </div>
              )}
            </div>
          )}
  
          {submissions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                My recent submissions
              </h2>
              <div className="border rounded-md divide-y">
                {submissions.map(sub => (
                  <div
                    key={sub.id}
                    className="px-3 py-2 flex items-center justify-between text-xs"
                  >
                    <span>{new Date(sub.createdAt).toLocaleString()}</span>
                    <span className="font-mono">{sub.language}</span>
                    <span>{sub.verdict}</span>
                    {sub.timeMs != null && (
                      <span>{sub.timeMs} ms</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
}

export default ProblemPage;
