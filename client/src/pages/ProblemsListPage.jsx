import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ProblemsListPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProblems() {
      try {
        const res = await fetch('http://localhost:3000/api/problems');
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
    loadProblems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-700">Loading problems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-4">
          Problems
        </h1>
        <div className="border rounded-md divide-y">
          {problems.map(p => (
            <div
              key={p.code}
              className="px-3 py-2 flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium">
                  {p.number}. {p.title}
                </p>
                <p className="text-xs text-slate-500">
                  Code: {p.code} · Difficulty: {p.difficulty}
                </p>
              </div>
              <Link
                to={`/problems/${p.code}`}
                className="text-xs text-indigo-600 hover:underline"
              >
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProblemsListPage;