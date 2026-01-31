import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  const isAdmin = user?.role === 'admin'; // adjust if the user has a different admin flag , we want this for implementing crud for probelems and testcases

  return (
    <nav className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
          >
            OJ Lite
          </Link>
          <Link
            to="/problems"
            className="text-xs text-slate-200 hover:text-white"
          >
            Problems
          </Link>
          {isAdmin && (
            <Link
              to="/admin/problems"
              className="text-xs text-slate-200 hover:text-white"
            >
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-xs text-slate-200 hover:text-white"
              >
                {user.username || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs text-slate-200 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-xs text-slate-200 hover:text-white"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;