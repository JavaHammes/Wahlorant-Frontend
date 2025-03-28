import React from 'react';
import { useNavigate } from 'react-router-dom';
import {USER_DASHBOARD_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE, ABOUT_ROUTE, VOTING_LOGIN_ROUTE} from "../../constants/routes";
import './homepage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <header className="header">
        <div className="logo">
          <h1>Wahlorant</h1>
        </div>
        <div className="auth-buttons">
          <button className="vote-btn" onClick={() => navigate(VOTING_LOGIN_ROUTE)}>Stimmen abgeben</button>
          <button className="login-btn" onClick={() => navigate(LOGIN_ROUTE)}>Anmelden</button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h2>Sicheres Wahlübermittlungs System</h2>
            <p>Moderne Lösung für demokratische Wahlen</p>
            <button className="cta-button" onClick={() => navigate(ABOUT_ROUTE)}>Mehr erfahren</button>
          </div>
        </section>

        <section className="features-section">
          <h2>Warum Wahlorant?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Verbesserte Sicherheit</h3>
              <p>Umfassende Sicherheitsmaßnahmen gewährleisten maximalen Schutz für alle Wahldaten und -prozesse.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Blitzschnelle Geschwindigkeit</h3>
              <p>Moderne Online-Lösung für effiziente und schnelle Wahlabwicklung mit garantierter Präzision.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Echtzeit-Ergebnisse</h3>
              <p>Überwachen Sie den Wahlfortschritt mit sofortigen Updates und umfassenden Analysen.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default HomePage;