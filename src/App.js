import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './constants/routes';
import './App.css';

import HomePage from './pages/homepage/homepage';
import LoginPage from './pages/login/login';
import RegisterPage from './pages/register/register'
import AboutPage from './pages/about/about'
import AdminDashboardPage from './pages/admin_dashboard/admin_dashboard'
import UserDashboardPage from './pages/user_dashboard/user_dashboard'
import VotingStationPage from './pages/voting_station/voting_station'
import VotingStationLoginPage from './pages/voting_station_login/voting_station_login'

import { isAdmin, isUser, isVotingStation, logout } from './requests/authService';
import {
  ABOUT_ROUTE,
  ADMIN_DASHBOARD_ROUTE,
  HOMEPAGE_ROUTE,
  LOGIN_ROUTE,
  REGISTER_ROUTE,
  USER_DASHBOARD_ROUTE,
  VOTING_ROUTE,
  VOTING_LOGIN_ROUTE
} from "./constants/routes";

// Protected route wrapper for admin routes
const AdminRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const adminStatus = await isAdmin();
      setIsAuthorized(adminStatus);
      setIsLoading(false);

      if (!adminStatus) {
        logout();
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Überprüfe Berechtigungen...</p>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to={LOGIN_ROUTE} />;
};

// Protected route wrapper for user routes
const UserRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userStatus = await isUser();
      setIsAuthorized(userStatus);
      setIsLoading(false);

      if (!userStatus) {
        logout();
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Überprüfe Berechtigungen...</p>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to={LOGIN_ROUTE} />;
};


// Protected route wrapper for voting station routes
const VotingStationRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const stationStatus = await isVotingStation();
      setIsAuthorized(stationStatus);
      setIsLoading(false);

      if (!stationStatus) {
        logout();
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Überprüfe Wahllokal-Berechtigung...</p>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to={VOTING_LOGIN_ROUTE} />;
};


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path={HOMEPAGE_ROUTE} element={<HomePage />} />
          <Route path={LOGIN_ROUTE} element={<LoginPage />} />
          <Route path={ABOUT_ROUTE} element={<AboutPage />} />
          <Route path={VOTING_LOGIN_ROUTE} element={<VotingStationLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path={ADMIN_DASHBOARD_ROUTE}
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path={REGISTER_ROUTE}
            element={
              <AdminRoute>
                <RegisterPage />
              </AdminRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path={USER_DASHBOARD_ROUTE}
            element={
              <UserRoute>
                <UserDashboardPage />
              </UserRoute>
            }
          />

          {/* Protected Voting Station Route */}
          <Route
            path={VOTING_ROUTE}
            element={
              <VotingStationRoute>
                <VotingStationPage />
              </VotingStationRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;