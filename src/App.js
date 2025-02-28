import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './constants/routes';
import './App.css';

import HomePage from './pages/homepage/homepage';
import LoginPage from './pages/login/login';
import RegisterPage from './pages/register/register'
import AboutPage from './pages/about/about'
import AdminDashboardPage from './pages/admin_dashboard/admin_dashboard_page'
import UserDashboardPage from './pages/user_dashboard/user_dashboard'
import {
  ABOUT_ROUTE,
  ADMIN_DASHBOARD_ROUTE,
  HOMEPAGE_ROUTE,
  LOGIN_ROUTE,
  REGISTER_ROUTE,
  USER_DASHBOARD_ROUTE
} from "./constants/routes";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path={HOMEPAGE_ROUTE} element={<HomePage />} />
          <Route path={LOGIN_ROUTE} element={<LoginPage />} />
          <Route path={REGISTER_ROUTE} element={<RegisterPage />} />
          <Route path={ABOUT_ROUTE} element={<AboutPage />} />
          <Route path={ADMIN_DASHBOARD_ROUTE} element={<AdminDashboardPage />} />
          <Route path={USER_DASHBOARD_ROUTE} element={<UserDashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;