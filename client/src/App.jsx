import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

function HomePage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Vite + React</h1>
          <p className="mt-2 text-gray-700">Home page</p>
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
    
  
    // jab status === 'ready' and profile is set, baki bad status apanne uppar handle kiya hai
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-slate-800">Profile</h1>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
      
            <p className="text-sm text-slate-700">
              <span className="font-medium">Username:</span> {profile.username}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-medium">Email:</span> {profile.email}
            </p>
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
    </Routes>
  );
}

export default App;