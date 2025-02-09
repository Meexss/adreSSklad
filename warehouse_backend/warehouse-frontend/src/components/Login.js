import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { login } from './auth';
import Layout from './Layout';

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
    <Layout>
    <div className="login-container">
      <h2 className="login-title">Войти в систему</h2>
      <form className="login-form" onSubmit={(e) => handleSubmit(e, username, password)}>
        <div className="form-group">
          <label>Имя пользователя</label>
          <input
            className="input-field"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите имя пользователя"
          />
        </div>
        <div className="form-group">
          <label>Пароль</label>
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="submit-button">Войти</button>
      </form>
    </div>
  </Layout>
  );
};

export default Login;
