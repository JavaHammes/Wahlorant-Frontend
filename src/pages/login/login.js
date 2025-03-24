import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {HOMEPAGE_ROUTE, REGISTER_ROUTE, ADMIN_DASHBOARD_ROUTE, USER_DASHBOARD_ROUTE} from "../../constants/routes";
import { API_URL, LOGIN_ENDPOINT} from "../../constants/api";
import './login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.user.token);

        if (data.user && data.user.username) {
            localStorage.setItem('username', data.user.username);
        }

        if (data.user && data.user.role === 'admin') {
          navigate(ADMIN_DASHBOARD_ROUTE);
        } else {
          navigate(USER_DASHBOARD_ROUTE);
        }
      } else {
        setError(data.message || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="header">
        <div className="logo">
          <Link to={HOMEPAGE_ROUTE}>
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="nav-buttons">
          <Link to={HOMEPAGE_ROUTE} className="back-btn">Zurück</Link>
        </div>
      </header>

      <main className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Willkommen zurück</h2>
            <p>Melden Sie sich an, um fortzufahren</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Benutzername</label>
              <div className="input-container">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ihr Benutzername"
                  required
                  disabled={isLoading}
                />
                <span className="input-icon">👤</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Passwort</label>
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ihr Passwort"
                  required
                  disabled={isLoading}
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Anmeldung...' : 'Anmelden'}
            </button>
          </form>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default LoginPage;