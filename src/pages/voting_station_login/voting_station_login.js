import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HOMEPAGE_ROUTE,
  LOGIN_ROUTE,
  VOTING_ROUTE
} from "../../constants/routes";

import votingStationService from "../../requests/votingStationService";

import './voting_station_login.css';

const VotingStationLoginPage = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await votingStationService.login(loginId, password);

      // Navigate to the submission page after successful login
      navigate(VOTING_ROUTE);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="votingstation-login-page">
      <header className="vs-header">
        <div className="vs-logo">
          <Link to={HOMEPAGE_ROUTE}>
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="vs-nav-buttons">
          <Link to={HOMEPAGE_ROUTE} className="vs-back-btn">Startseite</Link>
        </div>
      </header>

      <main className="vs-login-container">
        <div className="vs-login-card">
          <div className="vs-login-header">
            <h2>Wahllokal Anmeldung</h2>
            <p>Melden Sie sich mit Ihrer Wahllokal-ID an</p>
          </div>

          {error && (
            <div className="vs-error-message">
              {error}
            </div>
          )}

          <form className="vs-login-form" onSubmit={handleSubmit}>
            <div className="vs-form-group">
              <label htmlFor="loginId">Wahllokal-ID</label>
              <div className="vs-input-container">
                <input
                  type="text"
                  id="loginId"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Ihre Wahllokal-ID eingeben"
                  required
                  disabled={isLoading}
                />
                <span className="vs-input-icon">🏢</span>
              </div>
            </div>

            <div className="vs-form-group">
              <label htmlFor="password">Passwort</label>
              <div className="vs-input-container">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ihr Passwort"
                  required
                  disabled={isLoading}
                />
                <span className="vs-input-icon">🔑</span>
              </div>
            </div>

            <button
              type="submit"
              className="vs-login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Anmeldung...' : 'Zum Wahlsystem'}
            </button>
          </form>

          <div className="vs-info-box">
            <p>Diese Anmeldung ist nur für offizielle Wahllokale. Falls Sie ein Administrator sind, bitte nutzen Sie die <Link to={LOGIN_ROUTE} className="vs-admin-link">Administrator-Anmeldung</Link>.</p>
          </div>
        </div>
      </main>

      <footer className="vs-footer">
        <p>© 2025 Wahlorant Wahlsystem | Alle Rechte vorbehalten</p>
      </footer>
    </div>
  );
};

export default VotingStationLoginPage;