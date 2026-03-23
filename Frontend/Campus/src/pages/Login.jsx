import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';

export default function Login({ setPage }) {
  const [inputId, setInputId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();

  const handleSignIn = async () => {
    setError('');
    setLoading(true);

    if (!inputId.trim() || !password.trim()) {
      setError('ID and password required');
      setLoading(false);
      return;
    }

    const result = await login(inputId, password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Auto route based on role (runs after auth.user updated)
    setTimeout(() => {
      const userRole = user?.role;
      if (userRole === 'admin') {
        setPage('admin-dash');
      } else if (userRole === 'maintenance') {
        setPage('dash');
      } else {
        setPage('options');
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSignIn();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
      <div className="login-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2><span className="mustard">Unified</span> Login</h2>
        <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>
          Use test creds or seeded users
        </p>
        <input
          type="text"
          placeholder="ID (e.g. vda23cs052, 5678910, id-1234)"
          value={inputId}
          onChange={e => setInputId(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: '100%', maxWidth: '300px' }}
        />
        <input
          type={inputId.toLowerCase().startsWith('vda') ? "text" : "password"}
          placeholder={inputId.toLowerCase().startsWith('vda') ? "Name" : "Password"}
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: '100%', maxWidth: '300px' }}
        />
        {error && <p style={{ color: "red", fontSize: "14px", marginTop: "10px" }}>{error}</p>}
        <button className="btn-main" onClick={handleSignIn} disabled={loading} style={{ width: '100%', maxWidth: '300px' }}>
          {loading ? 'Signing in...' : 'SIGN IN'}
        </button>
        <p onClick={() => setPage("home")} style={{marginTop: '20px', color: '#bbb', cursor: 'pointer'}}>
          ← Go Back
        </p>
      </div>
    </div>
  );
}

