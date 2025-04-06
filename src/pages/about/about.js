import React from 'react';
import { Link } from 'react-router-dom';
import {HOMEPAGE_ROUTE, LOGIN_ROUTE} from "../../constants/routes";
import './about.css';

const About = () => {
  return (
    <div className="security-page">
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

      <main className="security-container">
        <div className="security-hero">
          <h2>Unsere Sicherheitsmaßnahmen</h2>
          <p>Bei Wahlorant steht Sicherheit an erster Stelle. Erfahren Sie, wie wir Ihre Daten und den demokratischen Prozess schützen.</p>
        </div>

        <section className="security-section highlight-section">
          <h3>Warum wir Wahlorant entwickelt haben</h3>
          <div className="security-content">
            <div className="security-icon">🚨</div>
            <div className="security-text">
              <p>Im Jahr 2019 deckte der Chaos Computer Club (CCC) unter der Leitung von Linus Neumann kritische Sicherheitslücken im Wahlübermittlungssystem "PC-Wahl" auf. Diese Erkenntnisse haben deutlich gemacht, dass ein grundlegend neuer Ansatz für sichere Wahlsysteme notwendig ist.</p>

              <div className="issues-container">
                <h4>Kritische Sicherheitsprobleme des alten Systems:</h4>
                <ul>
                  <li><strong>Passwörter und Geheimnisse im Klartext</strong> - Sensible Daten wurden unverschlüsselt gespeichert</li>
                  <li><strong>Keine individuellen Passwörter</strong> - Schwache, zentrale Passwörter ohne Benutzertrennung</li>
                  <li><strong>Konfigurationen nicht signiert</strong> - Manipulationen an Systemeinstellungen konnten unbemerkt bleiben</li>
                  <li><strong>Ergebnisse nicht signiert</strong> - Keine kryptografische Sicherung der übermittelten Wahlergebnisse</li>
                  <li><strong>Anfälligkeit für Code-Injection</strong> - Möglichkeit, schädlichen Code einzuschleusen</li>
                  <li><strong>Closed Source Software</strong> - Keine Möglichkeit für unabhängige Sicherheitsüberprüfungen</li>
                  <li><strong>Problematische kryptografische Implementierung</strong> - Eigenentwickelte, nicht standardisierte Verschlüsselungsmethoden</li>
                </ul>
              </div>

              <p className="quote">"Die Sicherheit demokratischer Prozesse darf keine optionale Funktion sein. Mit Wahlorant entwickeln wir ein System, das die grundlegenden Schwachstellen bestehender Lösungen gezielt adressiert und moderne Sicherheitsstandards konsequent umsetzt."</p>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Sichere Passwort- und Datenverwaltung</h3>
          <div className="security-content">
            <div className="security-icon">🔒</div>
            <div className="security-text">
              <p>Moderne Verschlüsselungsverfahren zum Schutz aller sensiblen Daten und Passwörter im System.</p>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Individuelle Benutzerauthentifizierung</h3>
          <div className="security-content">
            <div className="security-icon">👤</div>
            <div className="security-text">
              <p>Robustes Authentifizierungssystem mit individuellen Zugängen und mehrstufiger Verifizierung.</p>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Kryptografisch signierte Konfigurationen</h3>
          <div className="security-content">
            <div className="security-icon">📝</div>
            <div className="security-text">
              <p>Kryptografische Sicherung aller Systemkonfigurationen gegen unbefugte Änderungen.</p>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Unveränderliche, signierte Wahlergebnisse</h3>
          <div className="security-content">
            <div className="security-icon">📊</div>
            <div className="security-text">
              <p>Integritätsschutz für Wahlergebnisse durch moderne kryptografische Verfahren.</p>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Schutz vor Code-Injection</h3>
          <div className="security-content">
            <div className="security-icon">🛡️</div>
            <div className="security-text">
              <p>Implementierung effektiver Schutzmaßnahmen gegen Code-Injection-Angriffe und andere Schwachstellen.</p>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Open-Source-Transparenz</h3>
          <div className="security-content">
            <div className="security-icon">👁️</div>
            <div className="security-text">
              <p>Vollständige Transparenz durch öffentlich einsehbaren Quellcode und unabhängige Sicherheitsüberprüfungen.</p>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Standardisierte Kryptografie</h3>
          <div className="security-content">
            <div className="security-icon">🔐</div>
            <div className="security-text">
              <p>Einsatz bewährter, standardisierter kryptografischer Verfahren statt Eigenentwicklungen.</p>
            </div>
          </div>
        </section>

        <div className="cta-section">
          <h3>Bereit, Wahlorant zu nutzen?</h3>
          <p>Registrieren Sie Ihr Wahllokal und erleben Sie ein sicheres, modernes Wahlsystem.</p>
          <div className="cta-buttons">
            <Link to={LOGIN_ROUTE} className="secondary-button">Anmelden</Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default About;