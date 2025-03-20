import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {ADMIN_DASHBOARD_ROUTE, HOMEPAGE_ROUTE} from "../../constants/routes";

import './register.css';

const RegisterPage = () => {
  const [stationName, setStationName] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration attempt:', {
      stationName,
      email,
      address: {
        street,
        houseNumber,
        postalCode,
        city
      }
    });
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
            <p>Erstellen Sie ein neues Wahllokal</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  id="stationName"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="Name des Wahllokals"
                  required
                />
                <span className="input-icon">🏢</span>
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                <span className="input-icon">✉️</span>
              </div>
            </div>

            <div className="address-section">
              <h3>Adresse des Wahllokals</h3>

              <div className="address-row">
                <div className="form-group street-group">
                  <div className="input-container">
                    <input
                      type="text"
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Straße"
                      required
                    />
                    <span className="input-icon">🗺️</span>
                  </div>
                </div>

                <div className="form-group house-number-group">
                  <div className="input-container">
                    <input
                      type="text"
                      id="houseNumber"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      placeholder="Hausnummer"
                      required
                    />
                    <span className="input-icon">🏠</span>
                  </div>
                </div>
              </div>

              <div className="address-row">
                <div className="form-group postal-code-group">
                  <div className="input-container">
                    <input
                      type="text"
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="PLZ"
                      pattern="[0-9]{5}"
                      maxLength="5"
                      required
                    />
                    <span className="input-icon">📮</span>
                  </div>
                </div>

                <div className="form-group city-group">
                  <div className="input-container">
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Stadt"
                      required
                    />
                    <span className="input-icon">🏙️</span>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="register-button">Wahllokal registrieren</button>
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