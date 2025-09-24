import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginButton from './components/LoginButton';
import Dashboard from './components/Dashboard';
import './styles/main.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app-container">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        {!isLoggedIn ? (
          <LoginButton setUser={setUser} setIsLoggedIn={setIsLoggedIn} />
        ) : (
          <Dashboard user={user} setIsLoggedIn={setIsLoggedIn} />
        )}
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;