import React from 'react';
import { Link } from 'react-router-dom';
import {LOGIN_ROUTE, REGISTER_ROUTE} from "../../constants/routes";
import './aboutpage.css';

const Aboutpage = () => {
  return (
    <div className="security-page">
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
              <p>Im Jahr 2019 deckte der Chaos Computer Club (CCC) unter der Leitung von Linus Neumann kritische Sicherheitslücken im Wahlübermittlungssystem "PC-Wahl" auf, das bei Wahlen in Deutschland, einschließlich Thüringen, eingesetzt wurde. Diese Erkenntnisse haben deutlich gemacht, dass ein grundlegend neuer Ansatz für sichere Wahlsysteme notwendig ist.</p>

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

        {/* The rest of the sections will follow, each addressing one of the specific vulnerabilities listed above */}

        <section className="security-section">
          <h3>Sichere Passwort- und Datenverwaltung</h3>
          <div className="security-content">
            <div className="security-icon">🔒</div>
            <div className="security-text">
              <p>Im Gegensatz zu früheren Systemen, die Passwörter und Geheiminformationen im Klartext speicherten, setzt Wahlorant auf modernste Verfahren zur sicheren Datenspeicherung.</p>
              <ul>
                <li>Passwörter werden mit Argon2id (state-of-the-art) gehasht und gesalzen gespeichert</li>
                <li>Sensible Konfigurationsdaten werden verschlüsselt</li>
                <li>Zugriff auf kritische Informationen nur nach erfolgreicher Authentifizierung</li>
                <li>Geheime Schlüssel werden in sicheren Hardware-Modulen (HSM) aufbewahrt</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Individuelle Benutzerauthentifizierung</h3>
          <div className="security-content">
            <div className="security-icon">👤</div>
            <div className="security-text">
              <p>Wahlorant implementiert ein robustes, individuelles Authentifizierungssystem anstelle der problematischen zentralen Passwörter.</p>
              <ul>
                <li>Jedes Wahllokal erhält individuelle, starke Anmeldedaten</li>
                <li>Erzwingung komplexer Passwörter mit regelmäßiger Änderung</li>
                <li>Rollenbasierte Zugriffskontrollen mit Mindestberechtigungsprinzip</li>
                <li>Mehrstufige Authentifizierung (MFA) für administrative Zugänge</li>
                <li>Automatische Erkennung und Blockierung verdächtiger Anmeldeversuche</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Kryptografisch signierte Konfigurationen</h3>
          <div className="security-content">
            <div className="security-icon">📝</div>
            <div className="security-text">
              <p>Um die Integrität aller Systemkonfigurationen zu gewährleisten, werden sämtliche Einstellungen kryptografisch signiert und verifiziert.</p>
              <ul>
                <li>Digitale Signaturen für alle Konfigurationsdateien</li>
                <li>Kontinuierliche Integritätsprüfung durch Hash-Vergleiche</li>
                <li>Verwendung von Ed25519-Signaturen mit hoher Sicherheit</li>
                <li>Automatische Alarmierung bei erkannten Manipulationsversuchen</li>
                <li>Lückenlose Protokollierung aller Konfigurationsänderungen</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Unveränderliche, signierte Wahlergebnisse</h3>
          <div className="security-content">
            <div className="security-icon">📊</div>
            <div className="security-text">
              <p>Wahlorant gewährleistet die Integrität der Wahlergebnisse durch moderne kryptografische Verfahren und transparente Überprüfbarkeit.</p>
              <ul>
                <li>Jedes Wahlergebnis wird digital signiert und zeitgestempelt</li>
                <li>Blockchain-basierte Speicherung für Unveränderlichkeit und Nachverfolgbarkeit</li>
                <li>Möglichkeit zur öffentlichen Verifikation ohne Kompromittierung der Anonymität</li>
                <li>Mehrfache, unabhängige Bestätigungen für kritische Ergebnisse</li>
                <li>Vollständig überprüfbare Ergebniskette von der Stimmabgabe bis zur Gesamtauswertung</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Schutz vor Code-Injection</h3>
          <div className="security-content">
            <div className="security-icon">🛡️</div>
            <div className="security-text">
              <p>Unsere Architektur wurde von Grund auf so konzipiert, dass Code-Injection-Angriffe verhindert werden.</p>
              <ul>
                <li>Konsequente Eingabevalidierung und Parametrisierung aller Datenbankabfragen</li>
                <li>Content Security Policy (CSP) zur Verhinderung von XSS-Angriffen</li>
                <li>Regelmäßige statische Code-Analyse und automatisierte Sicherheitstests</li>
                <li>Strikte Trennung von Daten und Ausführungscode</li>
                <li>Sandboxing-Techniken zur Isolation kritischer Komponenten</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Open-Source-Transparenz</h3>
          <div className="security-content">
            <div className="security-icon">👁️</div>
            <div className="security-text">
              <p>Anders als frühere geschlossene Systeme setzt Wahlorant auf vollständige Transparenz durch einen Open-Source-Ansatz.</p>
              <ul>
                <li>Öffentlich einsehbarer Quellcode für unabhängige Überprüfungen</li>
                <li>Dokumentierte Sicherheitsarchitektur und Systemdesign</li>
                <li>Gemeinschaftsbasierte Schwachstellenidentifikation und -behebung</li>
                <li>Regelmäßige externe Sicherheitsaudits mit publizierten Ergebnissen</li>
                <li>Bug-Bounty-Programm zur kontinuierlichen Verbesserung</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h3>Standardisierte Kryptografie</h3>
          <div className="security-content">
            <div className="security-icon">🔐</div>
            <div className="security-text">
              <p>Statt auf selbstentwickelte Kryptolösungen zu setzen, verwendet Wahlorant ausschließlich bewährte, standardisierte Verfahren.</p>
              <ul>
                <li>Einsatz etablierter kryptografischer Bibliotheken (z.B. OpenSSL, libsodium)</li>
                <li>AES-256-GCM für symmetrische Verschlüsselung</li>
                <li>RSA-4096 und ECC für asymmetrische Kryptografie</li>
                <li>SHA-256 und SHA-3 für kryptografische Hashes</li>
                <li>TLS 1.3 für die Transportverschlüsselung</li>
                <li>Regelmäßige Aktualisierung der kryptografischen Verfahren entsprechend aktueller Empfehlungen des BSI</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="cta-section">
          <h3>Bereit, Wahlorant zu nutzen?</h3>
          <p>Registrieren Sie Ihr Wahllokal und erleben Sie ein sicheres, modernes Wahlsystem.</p>
          <div className="cta-buttons">
            <Link to={REGISTER_ROUTE} className="cta-button">Jetzt registrieren</Link>
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

export default Aboutpage;