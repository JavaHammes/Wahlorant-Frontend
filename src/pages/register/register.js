import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {LOGIN_ROUTE} from "../../constants/routes";

import './register.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration attempt:', { username, email, password, confirmPassword });
  };

  return (
    <div className="register-page">
      <header className="header">
        <div className="logo">
          <Link to="/">
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="nav-buttons">
          <Link to="/" className="back-btn">Zurück</Link>
        </div>
      </header>

      <main className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>Registrieren</h2>
            <p>Erstellen Sie ein neues Konto</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Name des Wahllokals</label>
              <div className="input-container">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Name des Wahllokals"
                  required
                />
                <span className="input-icon">👤</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ihre Email-Adresse"
                  required
                />
                <span className="input-icon">✉️</span>
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
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            <button type="submit" className="register-button">Registrieren</button>
          </form>

          <div className="login-prompt">
            <p>Bereits ein Konto? <Link to={LOGIN_ROUTE} className="login-link">Anmelden</Link></p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default RegisterPage;