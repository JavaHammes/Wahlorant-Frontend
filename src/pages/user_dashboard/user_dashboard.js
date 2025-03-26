import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOMEPAGE_ROUTE } from '../../constants/routes';
import { logout } from '../../requests/authService';
import votingService from '../../requests/votingService';
import './user_dashboard.css';

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const [votings, setVotings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0
  });

  // Load data when component mounts
  useEffect(() => {
    loadVotingsData();
  }, []);

  async function loadVotingsData() {
    setIsLoading(true);
    try {
      // Get all votings from the API - using the same service as admin dashboard
      const allVotings = await votingService.getAllVotings();

      // Transform API data to match our component's expected format
      const transformedVotings = allVotings.map(voting => ({
        id: voting.id,
        name: voting.name,
        startDate: voting.startDate,
        endDate: voting.endDate,
        votingStations: voting.votingstations ? voting.votingstations.map(station => ({
          id: station.id,
          name: station.name,
          voterCount: station.voterCount || 0
        })) : [],
        voteTypes: voting.votetypes ? voting.votetypes.map(type => ({
          id: type.id,
          name: type.name,
          voteoptions: type.voteoptions ? type.voteoptions.map(option => ({
            id: typeof option === 'object' ? option.id : Math.random().toString(36).substr(2, 9),
            name: typeof option === 'object' ? option.name : option
          })) : []
        })) : []
      }));

      setVotings(transformedVotings);

      // Calculate statistics
      const now = new Date();
      const statsData = {
        total: transformedVotings.length,
        active: transformedVotings.filter(e => {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);
          return now >= start && now <= end;
        }).length,
        upcoming: transformedVotings.filter(e => {
          const start = new Date(e.startDate);
          return now < start;
        }).length,
        completed: transformedVotings.filter(e => {
          const end = new Date(e.endDate);
          return now > end;
        }).length
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error loading votings data:', error);
      // Show error message to user
      alert('Fehler beim Laden der Wahldaten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  const checkVotingStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  const handleLogout = () => {
    logout();
    navigate(HOMEPAGE_ROUTE);
  };

  const refreshData = () => {
    loadVotingsData();
  };

  return (
    <div className="user-dashboard">
      <header className="user-header">
        <div className="logo">
          <Link to={HOMEPAGE_ROUTE}>
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="user-info">
          <span className="user-greeting">Willkommen, Nutzer</span>
        </div>
        <div className="user-actions">
          <button className="refresh-btn" onClick={refreshData}>Aktualisieren</button>
          <button className="logout-btn" onClick={handleLogout}>Abmelden</button>
        </div>
      </header>

      <main className="user-container">
        <div className="dashboard-header">
          <h2>Wahlen Übersicht</h2>
        </div>

        {isLoading ? (
          <div className="loading-indicator">Daten werden geladen...</div>
        ) : (
          <div className="votings-container">
            <div className="votings-stats">
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Gesamte Wahlen</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Aktive Wahlen</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.upcoming}</div>
                <div className="stat-label">Kommende Wahlen</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Abgeschlossene</div>
              </div>
            </div>

            <h3 className="section-title">Alle Wahlen</h3>

            {votings.length === 0 ? (
              <div className="no-votings-message">
                <p>Keine Wahlen vorhanden.</p>
              </div>
            ) : (
              <div className="votings-grid">
                {votings.map(voting => {
                  const status = checkVotingStatus(voting.startDate, voting.endDate);
                  return (
                    <div
                      key={voting.id}
                      className={`voting-card ${status}`}
                    >
                      <div className="voting-header">
                        <h4 className="voting-name">{voting.name}</h4>
                        <div className={`status-badge ${status}`}>
                          {status === 'active' && 'Aktiv'}
                          {status === 'upcoming' && 'Geplant'}
                          {status === 'completed' && 'Beendet'}
                        </div>
                      </div>
                      <div className="voting-dates">
                        <div className="date-group">
                          <span className="date-label">Start:</span>
                          <span className="date-value">{formatDate(voting.startDate)}</span>
                        </div>
                        <div className="date-group">
                          <span className="date-label">Ende:</span>
                          <span className="date-value">{formatDate(voting.endDate)}</span>
                        </div>
                      </div>

                      <div className="voting-details">
                        {voting.votingStations && voting.votingStations.length > 0 && (
                          <div className="voting-stations-summary">
                            <span className="stations-count">{voting.votingStations.length} Wahllokale</span>
                            <span className="votes-count">
                              {voting.votingStations.reduce((total, station) => total + Number(station.voterCount || 0), 0)} Stimmen
                            </span>
                          </div>
                        )}

                        {voting.voteTypes && voting.voteTypes.length > 0 && (
                          <div className="vote-types-summary">
                            <span className="types-count">{voting.voteTypes.length} Wahltypen</span>
                          </div>
                        )}
                      </div>

                      <div className="voting-actions">
                        <button
                          className="view-details-btn"
                          onClick={() => alert('Diese Funktion ist noch in Entwicklung')}
                        >
                          Details anzeigen
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default UserDashboardPage;