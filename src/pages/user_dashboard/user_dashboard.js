import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOMEPAGE_ROUTE } from '../../constants/routes';
import { logout } from '../../requests/authService';
import votingService from '../../requests/votingService';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './user_dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

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

  const handleViewResults = async (votingId) => {
    try {
      setIsLoadingResults(true);
      const results = await votingService.getVotingResults(votingId);
      setResultsData(results);
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Fehler beim Laden der Wahlergebnisse.');
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Function to close the results modal
  const closeResultsModal = () => {
    setShowResultsModal(false);
    setResultsData(null);
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
                          className="view-results-btn"
                          onClick={() => handleViewResults(voting.id)}
                        >
                          Ergebnisse anzeigen
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

      {showResultsModal && resultsData && (
        <div className="modal-overlay">
          <div className="modal-content results-modal">
            <div className="modal-header">
              <h3>Wahlergebnisse: {resultsData.name}</h3>
              <button className="close-modal" onClick={closeResultsModal}>×</button>
            </div>

            <div className="results-container">
              {isLoadingResults ? (
                <div className="loading-indicator">Ergebnisse werden geladen...</div>
              ) : (
                <>
                  <div className="results-summary">
                    <p>Wahlzeitraum: {formatDate(resultsData.startDate)} - {formatDate(resultsData.endDate)}</p>
                    <p>Gesamtstimmen: {resultsData.votingstations?.reduce((total, station) =>
                      total + (station.voterCount || 0), 0) || 0}</p>
                  </div>

                  {resultsData.votetypes && resultsData.votetypes.length > 0 ? (
                    <div className="results-charts">
                      {resultsData.votetypes.map((voteType, index) => (
                        <div key={voteType.id || index} className="vote-type-result">
                          <h4 className="vote-type-heading">{voteType.name}</h4>
                          <div className="chart-container">
                            {voteType.voteoptions && voteType.voteoptions.length > 0 ? (
                              <Pie
                                data={{
                                  labels: voteType.voteoptions.map(option => option.name),
                                  datasets: [
                                    {
                                      data: voteType.voteoptions.map(option => option.totalVotecount || 0),
                                      backgroundColor: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8c44df', '#FF6D01'],
                                      hoverBackgroundColor: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8c44df', '#FF6D01']
                                    }
                                  ]
                                }}
                                options={{
                                  responsive: true,
                                  plugins: {
                                    legend: {
                                      position: 'right',
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function(context) {
                                          const label = context.label || '';
                                          const value = context.raw || 0;
                                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                                          return `${label}: ${value} Stimmen (${percentage})`;
                                        }
                                      }
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <p>Keine Optionen für diesen Wahltyp verfügbar.</p>
                            )}
                          </div>

                          {/* Results Table */}
                          <div className="results-table-container">
                            <table className="results-table">
                              <thead>
                                <tr>
                                  <th>Option</th>
                                  <th>Stimmen</th>
                                  <th>Prozent</th>
                                </tr>
                              </thead>
                              <tbody>
                                {voteType.voteoptions && voteType.voteoptions.map((option, optIndex) => {
                                  const votes = option.totalVotecount || 0;
                                  const totalVotes = voteType.voteoptions.reduce((sum, opt) => sum + (opt.totalVotecount || 0), 0);
                                  const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';

                                  return (
                                    <tr key={option.id || optIndex}>
                                      <td>{option.name}</td>
                                      <td>{votes}</td>
                                      <td>{percentage}%</td>
                                    </tr>
                                  );
                                })}
                                <tr className="totals-row">
                                  <td><strong>Gesamt</strong></td>
                                  <td><strong>{voteType.voteoptions ? voteType.voteoptions.reduce((sum, opt) => sum + (opt.totalVotecount || 0), 0) : 0}</strong></td>
                                  <td><strong>100%</strong></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-results">
                      <p>Keine Ergebnisse verfügbar.</p>
                    </div>
                  )}

                  {/* Voting stations information */}
                  {resultsData.votingstations && resultsData.votingstations.length > 0 && (
                    <div className="voting-stations-results">
                      <h4>Wahllokale</h4>
                      <table className="stations-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Wähler</th>
                            <th>Erste Abgabe</th>
                            <th>Letzte Abgabe</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultsData.votingstations.map((station, stationIndex) => (
                            <tr key={station.id || stationIndex}>
                              <td>{station.name}</td>
                              <td>{station.voterCount || 0}</td>
                              <td>{station.firstSubmitTime ? formatDate(station.firstSubmitTime) : 'N/A'}</td>
                              <td>{station.lastSubmitTime ? formatDate(station.lastSubmitTime) : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="submit-btn" onClick={closeResultsModal}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default UserDashboardPage;