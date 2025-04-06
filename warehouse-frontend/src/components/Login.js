import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check for admin/admin credentials
      if (username === 'admin' && password === 'admin') {
        // Create admin user if it doesn't exist
        try {
          await authAPI.register({
            username: 'admin',
            password: 'admin',
            role: 'admin'
          });
        } catch (error) {
          // Ignore error if user already exists
        }
        
        // Login with admin credentials
        const response = await authAPI.login({ username, password });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/dashboard');
        } else {
          setError('Invalid response from server');
        }
      } else {
        // Try normal login
        const response = await authAPI.login({ username, password });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/dashboard');
        } else {
          setError('Invalid response from server');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
            disabled={loading}
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login; 