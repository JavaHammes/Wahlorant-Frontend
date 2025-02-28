import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/homepage/homepage';
import LoginPage from './pages/login/login';
import RegisterPage from './pages/register/register'
import AboutPage from './pages/aboutpage/aboutpage'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anmelden" element={<LoginPage />} />
          <Route path="/registrieren" element={<RegisterPage />} />
          <Route path="/ueber" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;