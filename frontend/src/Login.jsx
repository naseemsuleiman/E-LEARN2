import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  const [token, setToken] = useState('');
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password
      });

      setToken(response.data.access);
      setError('');
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>

      {token && <p>✅ Token: {token}</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

export default Login;
