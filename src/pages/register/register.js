import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOMEPAGE_ROUTE, ADMIN_DASHBOARD_ROUTE } from "../../constants/routes";
import { API_URL, CREATE_USER_ENDPOINT } from '../../constants/api';
import userService from '../../requests/userService';
import './register.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setIsLoading(false);
      return;
    }

    try {
      await userService.registerUser({
        username,
        password,
        role
      });

      setSuccess('Registrierung erfolgreich!');

      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setRole('member');

    } catch (err) {
      setError(err.message || 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <header className="header">
        <div className="logo">
          <Link to={HOMEPAGE_ROUTE}>
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="nav-buttons">
          <Link to={ADMIN_DASHBOARD_ROUTE} className="back-btn">Zurück</Link>
        </div>
      </header>

      <main className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>Registrieren</h2>
            <p>Erstellen Sie ein neues Konto</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Passwort bestätigen</label>
              <div className="input-container">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  required
                  disabled={isLoading}
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Rolle</label>
              <div className="input-container">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                  className="role-select"
                >
                  <option value="member">Mitglied</option>
                  <option value="watcher">Aufsicht</option>
                  <option value="admin">Administrator</option>
                </select>
                <span className="input-icon">🔑</span>
              </div>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Wird verarbeitet...' : 'Registrieren'}
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

export default RegisterPage;