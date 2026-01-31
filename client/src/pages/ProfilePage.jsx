import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default ProfilePage;