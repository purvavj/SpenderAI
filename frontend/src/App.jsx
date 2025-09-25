import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginButton from './components/LoginButton';
import Dashboard from './components/Dashboard';
import './styles/main.css';

function App() {
  // load saved user (if any)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('spender_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // logged in if a user is present
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('spender_user'));

  // keep localStorage in sync with user state
  useEffect(() => {
    if (user) localStorage.setItem('spender_user', JSON.stringify(user));
    else localStorage.removeItem('spender_user');
  }, [user]);

  return (
    <div className="app-container">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        {!isLoggedIn ? (
          <LoginButton setUser={setUser} setIsLoggedIn={setIsLoggedIn} />
        ) : (
          <Dashboard user={user} setUser={setUser} setIsLoggedIn={setIsLoggedIn} />
        )}
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;