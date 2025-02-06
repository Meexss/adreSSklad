import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { login } from './auth';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirectToHome, setRedirectToHome] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, message, access_token } = await login(username, password);
    
    if (success) {
      console.log("успешное принятие данных")
      setIsAuthenticated(true);
      setRedirectToHome(true);
    } else {
      setError(message);
    }
  };

  if (redirectToHome) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h2>Войти в систему</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Имя пользователя</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div>{error}</div>}
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default Login;
