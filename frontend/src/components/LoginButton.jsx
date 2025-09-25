import React from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import '../styles/LoginPage.css';

function LoginButton({ setUser, setIsLoggedIn }) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Login Success:', tokenResponse);
      try {
        // First, use the access token to get user info from Google
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        console.log('User Info:', userInfoResponse.data);

        // Send the access token to our backend
        const backendResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/google`,
          {
            token: tokenResponse.access_token,
            user_info: userInfoResponse.data,
          }
        );

        console.log('Backend Response:', backendResponse.data);

        // Set user data and login state
        setUser(backendResponse.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to log in. Check console.');
      }
    },
    onError: () => {
      alert('Login failed. Try again.');
    },
  });

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Spender AI</h1>
        <p>Track your spending smarter</p>
        <button onClick={() => login()} className="google-btn">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginButton;