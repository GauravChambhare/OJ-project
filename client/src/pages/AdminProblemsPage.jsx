import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


function AdminProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    id: null,
    number: '',
    code: '',
    title: '',
    difficulty: 'Easy',
    statement: '',
  });
  const [saving, setSaving] = useState(false);

  function getToken() {
    return localStorage.getItem('token');
  }

  async function loadProblems() {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError('Not logged in');
        setProblems([]);
        return;
      }

      const res = await fetch('http://localhost:3000/api/admin/problems', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => null);

      if (res.ok && Array.isArray(data)) {
        setProblems(data);
        setError('');
      } else {
        setError(
          (data && (data.error || data.message)) ||
            'Could not load problems.'
        );
      }
    } catch {
      setError('Network error while loading problems.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProblems();
  }, []);

  function resetForm() {
    setForm({
      id: null,
      number: '',
      code: '',
      title: '',
      difficulty: 'Easy',
      statement: '',
    });
  }

  function startEdit(p) {
    setForm({
      id: p._id,
      number: p.number,
      code: p.code,
      title: p.title,
      difficulty: p.difficulty,
      statement: p.statement,
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
      number: Number(form.number),
      code: form.code,
      title: form.title,
      difficulty: form.difficulty,
      statement: form.statement,
    };

    const isEdit = !!form.id;
    const url = isEdit
      ? `http://localhost:3000/api/admin/problems/${form.id}`
      : 'http://localhost:3000/api/admin/problems';
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
        await loadProblems();
      } else {
        setError(
          (data && (data.error || data.message)) ||
            'Save failed. Please try again.'
        );
      }
    } catch {
      setError('Network error while saving problem.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this problem and all its testcases?')) return;

    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/problems/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json().catch(() => null);

      if (res.ok) {
        await loadProblems();
      } else {
        setError(
          (data && (data.error || data.message)) ||
            'Delete failed. Please try again.'
        );
      }
    } catch {
      setError('Network error while deleting problem.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-700">Loading admin problems...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-semibold text-slate-800 mb-4">
            Admin · Problems
          </h1>

          {error && (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          )}

          <form onSubmit={handleSave} className="space-y-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Number
                </label>
                <input
                  type="number"
                  value={form.number}
                  onChange={e =>
                    setForm(f => ({ ...f, number: e.target.value }))
                  }
                  required
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e =>
                    setForm(f => ({ ...f, code: e.target.value }))
                  }
                  required
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e =>
                    setForm(f => ({ ...f, title: e.target.value }))
                  }
                  required
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={form.difficulty}
                  onChange={e =>
                    setForm(f => ({ ...f, difficulty: e.target.value }))
                  }
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Statement
              </label>
              <textarea
                value={form.statement}
                onChange={e =>
                  setForm(f => ({ ...f, statement: e.target.value }))
                }
                rows={4}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-indigo-600 text-white px-3 py-1 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {form.id ? 'Update problem' : 'Create problem'}
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
            {problems.map(p => (
              <div
                key={p._id}
                className="px-3 py-2 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-medium">
                    {p.number}. {p.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Code: {p.code} · Difficulty: {p.difficulty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-[11px] text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                        onClick={() => startEdit(p)}
                        className="text-[11px] text-indigo-600 hover:underline"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(p._id)}
                        className="text-[11px] text-red-600 hover:underline"
                    >
                        Delete
                    </button>
                    <Link
                        to={`/admin/problems/${p._id}/testcases`}
                        className="text-[11px] text-slate-700 hover:underline"
                    >
                        Testcases
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProblemsPage;
