import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {HOMEPAGE_ROUTE, REGISTER_ROUTE} from "../../constants/routes";
import './login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
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

          <form className="login-form" onSubmit={handleSubmit}>
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

            <button type="submit" className="login-button">Anmelden</button>
          </form>

          <div className="signup-prompt">
          <p>Noch kein Konto? <Link to={REGISTER_ROUTE} className="signup-link">Registrieren</Link></p></div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default LoginPage;