import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';


function AdminTestcasesPage() {
  const { id } = useParams(); // problemId from URL
  const [problem, setProblem] = useState(null);
  const [testcases, setTestcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    id: null,
    input: '',
    expectedOutput: '',
    isSample: false,
  });
  const [saving, setSaving] = useState(false);

  function getToken() {
    return localStorage.getItem('token');
  }

  async function loadProblemAndTestcases() {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError('Not logged in');
        return;
      }

      // Load problem details (using public API)
      const pRes = await fetch(`http://localhost:3000/api/problems/id/${id}`);
      const pData = await pRes.json().catch(() => null);
      if (pRes.ok && pData) {
        setProblem(pData);
      } else {
        setProblem(null);
      }

      // Load testcases (admin API)
      const tcRes = await fetch(
        `http://localhost:3000/api/admin/problems/${id}/testcases`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tcData = await tcRes.json().catch(() => null);

      if (tcRes.ok && Array.isArray(tcData)) {
        setTestcases(tcData);
        setError('');
      } else {
        setError(
          (tcData && (tcData.error || tcData.message)) ||
            'Could not load testcases.'
        );
      }
    } catch {
      setError('Network error while loading testcases.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProblemAndTestcases();
  }, [id]);

  function resetForm() {
    setForm({
      id: null,
      input: '',
      expectedOutput: '',
      isSample: false,
    });
  }

  function startEdit(tc) {
    setForm({
      id: tc._id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isSample: !!tc.isSample,
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const token = getToken();
    if (!token) {
      setError('Not logged in');
      setSaving(false);
      return;
    }

    const payload = {
      input: form.input,
      expectedOutput: form.expectedOutput,
      isSample: form.isSample,
    };

    const isEdit = !!form.id;
    const url = isEdit
      ? `http://localhost:3000/api/admin/testcases/${form.id}`
      : `http://localhost:3000/api/admin/problems/${id}/testcases`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        resetForm();
        await loadProblemAndTestcases();
      } else {
        setError(
          (data && (data.error || data.message)) ||
            'Save failed. Please try again.'
        );
      }
    } catch {
      setError('Network error while saving testcase.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tcId) {
    if (!window.confirm('Delete this testcase?')) return;

    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/testcases/${tcId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json().catch(() => null);

      if (res.ok) {
        await loadProblemAndTestcases();
      } else {
        setError(
          (data && (data.error || data.message)) ||
            'Delete failed. Please try again.'
        );
      }
    } catch {
      setError('Network error while deleting testcase.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-700">Loading testcases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-semibold text-slate-800 mb-2">
            Admin · Testcases
          </h1>
          {problem && (
            <p className="text-xs text-slate-500 mb-4">
              Problem: {problem.number}. {problem.title} (code: {problem.code})
            </p>
          )}

          {error && (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          )}

          <form onSubmit={handleSave} className="space-y-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Input
                </label>
                <textarea
                  value={form.input}
                  onChange={e =>
                    setForm(f => ({ ...f, input: e.target.value }))
                  }
                  rows={4}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Expected Output
                </label>
                <textarea
                  value={form.expectedOutput}
                  onChange={e =>
                    setForm(f => ({ ...f, expectedOutput: e.target.value }))
                  }
                  rows={4}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={form.isSample}
                onChange={e =>
                  setForm(f => ({ ...f, isSample: e.target.checked }))
                }
              />
              Mark as sample testcase (visible to users)
            </label>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-indigo-600 text-white px-3 py-1 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {form.id ? 'Update testcase' : 'Add testcase'}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-600 hover:underline"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <div className="border rounded-md divide-y">
            {testcases.map(tc => (
              <div
                key={tc._id}
                className="px-3 py-2 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {tc.isSample ? 'Sample' : 'Hidden'} testcase
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(tc)}
                      className="text-[11px] text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tc._id)}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-slate-500">Input</p>
                    <pre className="mt-1 bg-slate-900 text-slate-100 rounded p-2 whitespace-pre-wrap">
{tc.input}
                    </pre>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Expected Output</p>
                    <pre className="mt-1 bg-slate-900 text-slate-100 rounded p-2 whitespace-pre-wrap">
{tc.expectedOutput}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
            {testcases.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-500">
                No testcases yet for this problem.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTestcasesPage;