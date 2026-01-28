import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';

function HomePage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Vite + React</h1>
          <p className="mt-2 text-gray-700">Home page</p>
          <p className="mt-4">
            <a href="/problems/SUM2" className="text-sm text-indigo-600 hover:underline" > Go to dummy problem </a> 
            {/* link for a dummy problem */}
          </p>
        </div>
      </div>
    );
  }
  
  
// loginpage ka logic
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 200 && data && data.token) {
        // store token + user
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // redirect to profile
        navigate('/profile');
      } else {
        const message =
          (data && (data.error || data.message)) ||
          'Login failed. Please try again.';
        setError(message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-4">
          Login
        </h1>
  
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
  
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
  
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault(); // prevent full page reload
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 201) {
        setSuccess('User created, please login');
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        const message =
          (data && (data.error || data.message)) ||
          'Signup failed. Please try again.';
        setError(message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-4">
          Signup
        </h1>
  
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
  
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Signup'}
          </button>
        </form>
  
        {success && (
          <p className="mt-3 text-sm text-green-600">{success}</p>
        )}
  
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );  
}

function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [status, setStatus] = useState('loading'); // 'loading' | 'unauth' | 'ready' | 'error' ye sab states set karsakte hai
    const [error, setError] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('unauth'); //If there is no token, we will set unauth and return.
        return;
      }
  
      async function fetchProfile() {
        try {
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
  
          if (response.status === 200) {
            const data = await response.json();
            setProfile(data);
            setStatus('ready');
          } else if (response.status === 401 || response.status === 403) {
            // token invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setStatus('unauth');
          } else {
            const data = await response.json().catch(() => null);
            const message =
              (data && (data.error || data.message)) ||
              'Could not load profile.';
            setError(message);
            setStatus('error');
          }
        } catch (err) {
          setError('Network error while loading profile.');
          setStatus('error');
        }
      }
  
      fetchProfile();
    }, []);
  
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <div className="w-full max-w-md bg-white shadow rounded-lg p-6 text-center">
                <h1 className="text-2xl font-semibold text-slate-800 mb-2">Profile</h1>
                <p className="text-sm text-slate-600">Loading...</p>
              </div>
            </div>
        );
          
    }
  
    if (status === 'unauth') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <div className="w-full max-w-md bg-white shadow rounded-lg p-6 text-center">
                <h1 className="text-2xl font-semibold text-slate-800 mb-2">Profile</h1>
                <p className="text-sm text-slate-600">Not logged in</p>
              </div>
            </div>
        );          
    }
  
    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <div className="w-full max-w-md bg-white shadow rounded-lg p-6 text-center">
                <h1 className="text-2xl font-semibold text-slate-800 mb-2">Profile</h1>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
        );
          
    }

    function handleLogout() {   // ye logout karta hai by emptying localStorage.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }

      async function handlePasswordReset(e) { // function to handle pasword reset logic
        e.preventDefault();
        setResetMessage('');
        setResetLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
          setResetMessage('You are not logged in.');
          setResetLoading(false);
          return;
        }

        if (oldPassword === newPassword) {
          setResetMessage('New password must be different from old password.');
          return;
        }
      
        if (newPassword.length < 8) {
          setResetMessage('New password must be at least 8 characters long.');
          return;
        }

        try {
          const response = await fetch('http://localhost:3000/api/auth/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              oldPassword,
              newPassword,
            }),
          });
    
          const data = await response.json().catch(() => null);
    
          if (response.status === 200) {
            setResetMessage('Password updated successfully. Please login again.');
            setOldPassword('');
            setNewPassword('');
            // optional: log out user after success
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            const msg =
              (data && (data.error || data.message)) ||
              'Could not update password.';
            setResetMessage(msg);
          }
        } catch (err) {
          setResetMessage('Network error while updating password.');
        } finally {
          setResetLoading(false);
        }
      }
    
    
  
    // jab status === 'ready' and profile is set, baki bad status apanne uppar handle kiya hai
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-full max-w-md bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-800">Profile</h1>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
    
          <div>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Username:</span> {profile.username}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-medium">Email:</span> {profile.email}
            </p>
          </div>
    
          <div className="border-t pt-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">
              Change Password
            </h2>
    
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
    
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  New password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
    
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full rounded bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
    
            {resetMessage && (
              <p className="mt-2 text-xs text-slate-700">{resetMessage}</p>
            )}
          </div>
        </div>
      </div>
    );         
}

// problem page ka logic

function ProblemPage() {

  const { code } = useParams(); // e.g. "SUM2"

  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [problemError, setProblemError] = useState('');

  const [codeText, setCodeText] = useState(
    'public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}\n'
  );
  const [language] = useState('java');
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);

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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Code (Java)
          </label>
          <textarea
            value={codeText}
            onChange={e => setCodeText(e.target.value)}
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
              <p className="text-xs font-semibold text-slate-700">Stdout:</p>
              <pre className="mt-1 bg-slate-900 text-slate-100 text-xs rounded p-2 whitespace-pre-wrap"> {stdout}
              </pre>
            </div>
          )}
          {stderr && (
            <div>
              <p className="text-xs font-semibold text-slate-700">Stderr:</p>
              <pre className="mt-1 bg-red-900 text-red-100 text-xs rounded p-2 whitespace-pre-wrap"> {stderr}
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



function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/problems/:code" element={<ProblemPage />} />
    </Routes>
  );
}

export default App;