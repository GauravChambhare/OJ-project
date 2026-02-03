// client/src/components/Navbar.jsx
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
    } else {
      setUser(null);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  // Safely check admin status - handle both isAdmin boolean and role string
  const isAdmin = user?.isAdmin === true || user?.role === 'admin';

  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-semibold">
          OJ Lite
        </Link>
        <Link to="/problems">Problems</Link>

        {isAdmin && (
          <Link to="/admin/problems" className="text-red-600">
            Admin
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/profile" className="text-sm text-slate-800">
              {user.username || user.email}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm">
              Login
            </Link>
            <Link to="/signup" className="text-sm">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
