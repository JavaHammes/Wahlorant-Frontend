import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOMEPAGE_ROUTE, REGISTER_ROUTE } from '../../constants/routes';
import { logout } from '../../requests/authService';
import votingService from '../../requests/votingService';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './admin_dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentElection, setCurrentElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stationPasswords, setStationPasswords] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0
  });

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  // Voting stations state
  const [votingStations, setVotingStations] = useState([
    { id: 1, name: '', voterCount: 0 }
  ]);

  // Vote types state
  const [voteTypes, setVoteTypes] = useState([
    {
      id: 1,
      name: '',
      voteoptions: [
        { id: 1, name: '' }
      ]
    }
  ]);

  // Load data when component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setIsLoading(true);
    try {
      // Get all votings from the API
      const allVotings = await votingService.getAllVotings();

      // Transform API data to match our component's expected format
      const transformedElections = allVotings.map(voting => ({
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
          voteoptions: type.voteoptions ? type.voteoptions.map((option, idx) => ({
            id: typeof option === 'object' ? option.id : idx + 1,
            name: typeof option === 'string' ? option : option.name
          })) : []
        })) : []
      }));

      setElections(transformedElections);
      setStats(calculateStats(transformedElections));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Show error message to user
      alert('Fehler beim Laden der Wahldaten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  const checkElectionStatus = (startDate, endDate) => {
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

  const openModal = (isEdit = false, election = null) => {
    if (isEdit && election) {
      setIsEditMode(true);
      setCurrentElection(election);
      setFormData({
        name: election.name,
        startDate: new Date(election.startDate).toISOString().slice(0, 16),
        endDate: new Date(election.endDate).toISOString().slice(0, 16),
      });

      // Set voting stations for edit mode
      setVotingStations(
        election.votingStations && election.votingStations.length > 0
          ? election.votingStations.map(station => ({
              id: station.id,
              name: station.name,
              voterCount: station.voterCount || 0
            }))
          : [{ id: 1, name: '', voterCount: 0 }]
      );

      // Set vote types for edit mode
      setVoteTypes(
        election.voteTypes && election.voteTypes.length > 0
          ? election.voteTypes.map(type => ({
              id: type.id,
              name: type.name,
              voteoptions: type.voteoptions && type.voteoptions.length > 0
                ? type.voteoptions.map(option => ({
                    id: typeof option === 'object' ? option.id : Math.random().toString(36).substr(2, 9),
                    name: typeof option === 'object' ? option.name : option
                  }))
                : [{ id: 1, name: '' }]
            }))
          : [{
              id: 1,
              name: '',
              voteoptions: [{ id: 1, name: '' }]
            }]
      );
    } else {
      // Reset all form data for new election
      setIsEditMode(false);
      setCurrentElection(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
      });

      // Reset voting stations for new election
      setVotingStations([{ id: 1, name: '', voterCount: 0 }]);

      // Reset vote types for new election
      setVoteTypes([{
        id: 1,
        name: '',
        voteoptions: [{ id: 1, name: '' }]
      }]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle changes in voting station inputs
  const handleStationChange = (id, field, value) => {
    const updatedStations = votingStations.map(station =>
      station.id === id ? { ...station, [field]: field === 'voterCount' ? Number(value) : value } : station
    );
    setVotingStations(updatedStations);
  };

  // Add a new voting station
  const addVotingStation = () => {
    const newId = votingStations.length > 0
      ? Math.max(...votingStations.map(s => Number(s.id))) + 1
      : 1;

    setVotingStations([
      ...votingStations,
      { id: newId, name: '', voterCount: 0 }
    ]);
  };

  // Remove a voting station
  const removeVotingStation = (id) => {
    if (votingStations.length > 1) {
      setVotingStations(votingStations.filter(station => station.id !== id));
    }
  };

  // Vote Type Functions
  // Add a new vote type
  const addVoteType = () => {
    const newId = voteTypes.length > 0
      ? Math.max(...voteTypes.map(t => Number(t.id))) + 1
      : 1;

    setVoteTypes([
      ...voteTypes,
      {
        id: newId,
        name: '',
        voteoptions: [{ id: 1, name: '' }]
      }
    ]);
  };

  // Remove a vote type
  const removeVoteType = (id) => {
    if (voteTypes.length > 1) {
      setVoteTypes(voteTypes.filter(type => type.id !== id));
    }
  };

  // Handle changes in vote type name
  const handleVoteTypeChange = (id, field, value) => {
    const updatedTypes = voteTypes.map(type =>
      type.id === id ? { ...type, [field]: value } : type
    );
    setVoteTypes(updatedTypes);
  };

  // Vote Option Functions
  // Add a new vote option to a specific vote type
  const addVoteOption = (typeId) => {
    const updatedTypes = voteTypes.map(type => {
      if (type.id === typeId) {
        const newId = type.voteoptions.length > 0
          ? Math.max(...type.voteoptions.map(o => Number(o.id))) + 1
          : 1;

        return {
          ...type,
          voteoptions: [...type.voteoptions, { id: newId, name: '' }]
        };
      }
      return type;
    });

    setVoteTypes(updatedTypes);
  };

  // Remove a vote option from a specific vote type
  const removeVoteOption = (typeId, optionId) => {
    const updatedTypes = voteTypes.map(type => {
      if (type.id === typeId && type.voteoptions.length > 1) {
        return {
          ...type,
          voteoptions: type.voteoptions.filter(option => option.id !== optionId)
        };
      }
      return type;
    });

    setVoteTypes(updatedTypes);
  };

  // Handle changes in vote option name
  const handleVoteOptionChange = (typeId, optionId, value) => {
    const updatedTypes = voteTypes.map(type => {
      if (type.id === typeId) {
        return {
          ...type,
          voteoptions: type.voteoptions.map(option =>
            option.id === optionId ? { ...option, name: value } : option
          )
        };
      }
      return type;
    });

    setVoteTypes(updatedTypes);
  };

  // Prepare data for API submission
  const prepareSubmissionData = () => {
    // Filter out empty voting stations
    const filteredStations = votingStations
      .filter(station => station.name.trim() !== '')
      .map(station => ({
        name: station.name.trim(),
        voterCount: Number(station.voterCount)
      }));

    // Filter out empty vote types and options
    const filteredTypes = voteTypes
      .filter(type => type.name.trim() !== '')
      .map(type => ({
        name: type.name.trim(),
        voteoptions: type.voteoptions
          .filter(option => option.name.trim() !== '')
          .map(option => option.name.trim())
      }))
      .filter(type => type.voteoptions.length > 0);

    return {
      name: formData.name.trim(),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      votingstations: filteredStations,
      votetypes: filteredTypes
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = prepareSubmissionData();

      if (isEditMode && currentElection) {
        // Update existing election
        await votingService.updateVoting(currentElection.id, submissionData);
        alert('Wahl erfolgreich aktualisiert!');
      } else {
        // Create new election
        const newVoting = await votingService.createVoting(submissionData);

        // Extract password information from the response
        if (newVoting && newVoting.votingstations) {
          const passwordData = newVoting.votingstations.map(station => ({
            name: station.name,
            loginId: station.loginId,
            password: station.password
          }));

          setStationPasswords(passwordData);
          setShowPasswordModal(true);
        }

        alert('Neue Wahl erfolgreich erstellt!');
      }

      // Reload dashboard data to show the updated list
      await loadDashboardData();
      closeModal();
    } catch (error) {
      console.error('Error submitting election data:', error);
      alert(`Fehler beim ${isEditMode ? 'Aktualisieren' : 'Erstellen'} der Wahl: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setStationPasswords([]);
  };

  const handleDeleteElection = async (id) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Wahl löschen möchten?')) {
      try {
        await votingService.deleteVoting(id);

        const updatedElections = elections.filter(election => election.id !== id);
        setElections(updatedElections);
        setStats(calculateStats(updatedElections));

        alert('Wahl erfolgreich gelöscht!');
      } catch (error) {
        console.error('Error deleting election:', error);
        alert(`Fehler beim Löschen der Wahl: ${error.message}`);
      }
    }
  };

  const calculateStats = (elections) => {
    const now = new Date();
    return {
      total: elections.length,
      active: elections.filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        return now >= start && now <= end;
      }).length,
      upcoming: elections.filter(e => {
        const start = new Date(e.startDate);
        return now < start;
      }).length,
      completed: elections.filter(e => {
        const end = new Date(e.endDate);
        return now > end;
      }).length
    };
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

  // Function to calculate total votes for an option
  const calculateVotesForOption = (option) => {
    if (!resultsData || !resultsData.votetypes) return 0;

    // If there's a totalVotecount property, use that
    if (option.totalVotecount !== undefined) {
      return option.totalVotecount;
    }

    return 0;
  };

  const refreshData = () => {
    loadDashboardData();
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="logo">
          <Link to={HOMEPAGE_ROUTE}>
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="admin-info">
          <span className="admin-greeting">Willkommen, Administrator</span>
        </div>
        <div className="admin-actions">
          <button className="refresh-btn" onClick={refreshData}>Aktualisieren</button>
          <button className="logout-btn" onClick={handleLogout}>Abmelden</button>
        </div>
      </header>

      <main className="admin-container">
        <div className="dashboard-header">
          <h2>Wahl-Dashboard</h2>
          <div className="admin-buttons">
            <button className="create-btn" onClick={() => openModal()}>
              <span className="icon">📊</span> Neue Wahl erstellen
            </button>
            <button className="create-btn" onClick={() => navigate(REGISTER_ROUTE)}>
              <span className="icon">👤</span> Neuen Benutzer anlegen
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-indicator">Daten werden geladen...</div>
        ) : (
          <div className="elections-container">
            <div className="elections-stats">
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

            {elections.length === 0 ? (
              <div className="no-elections-message">
                <p>Keine Wahlen vorhanden. Erstellen Sie eine neue Wahl, um loszulegen.</p>
              </div>
            ) : (
              <div className="elections-grid">
                {elections.map(election => {
                  const status = checkElectionStatus(election.startDate, election.endDate);
                  return (
                    <div
                      key={election.id}
                      className={`election-card ${status}`}
                    >
                      <div className="election-header">
                        <h4 className="election-name">{election.name}</h4>
                        <div className={`status-badge ${status}`}>
                          {status === 'active' && 'Aktiv'}
                          {status === 'upcoming' && 'Geplant'}
                          {status === 'completed' && 'Beendet'}
                        </div>
                      </div>
                      <div className="election-dates">
                        <div className="date-group">
                          <span className="date-label">Start:</span>
                          <span className="date-value">{formatDate(election.startDate)}</span>
                        </div>
                        <div className="date-group">
                          <span className="date-label">Ende:</span>
                          <span className="date-value">{formatDate(election.endDate)}</span>
                        </div>
                      </div>

                      <div className="election-details">
                        {election.votingStations && election.votingStations.length > 0 && (
                          <div className="voting-stations-summary">
                            <span className="stations-count">{election.votingStations.length} Wahllokale</span>
                            <span className="votes-count">
                              {election.votingStations.reduce((total, station) => total + Number(station.voterCount || 0), 0)} Stimmen
                            </span>
                          </div>
                        )}

                        {election.voteTypes && election.voteTypes.length > 0 && (
                          <div className="vote-types-summary">
                            <span className="types-count">{election.voteTypes.length} Wahltypen</span>
                          </div>
                        )}
                      </div>

                      <div className="election-actions">
                        <button
                          className="view-results-btn"
                          onClick={() => handleViewResults(election.id)}
                        >
                          Ergebnisse anzeigen
                        </button>
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => openModal(true, election)}>
                            ✏️
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteElection(election.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Zugangsdaten für Wahllokale</h3>
              <button className="close-modal" onClick={closePasswordModal}>×</button>
            </div>
            <div className="election-form">
              <div className="password-info-note">
                <p><strong>Wichtig:</strong> Bitte notieren Sie diese Zugangsdaten. Sie werden nur einmal angezeigt! (DEV)</p>
              </div>

              <div className="password-list">
                {stationPasswords.map((station, index) => (
                  <div key={index} className="password-item">
                    <h4>{station.name}</h4>
                    <div className="password-details">
                      <div className="password-row">
                        <span className="password-label">Login-ID:</span>
                        <span className="password-value">{station.loginId}</span>
                        <button
                          className="copy-btn"
                          onClick={() => navigator.clipboard.writeText(station.loginId)}
                          title="In die Zwischenablage kopieren"
                        >
                          📋
                        </button>
                      </div>
                      <div className="password-row">
                        <span className="password-label">Passwort:</span>
                        <span className="password-value">{station.password}</span>
                        <button
                          className="copy-btn"
                          onClick={() => navigator.clipboard.writeText(station.password)}
                          title="In die Zwischenablage kopieren"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="submit-btn"
                  onClick={closePasswordModal}
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditMode ? 'Wahl bearbeiten' : 'Neue Wahl erstellen'}</h3>
              <button className="close-modal" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="election-form">
              <div className="form-group">
                <label htmlFor="name">Name der Wahl</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="z.B. Bundestagswahl 2025"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Startdatum und -zeit</label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">Enddatum und -zeit</label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Voting Stations Section */}
              <div className="voting-stations-section">
                <div className="section-header">
                  <h4>Wahllokale</h4>
                  <button
                    type="button"
                    onClick={addVotingStation}
                    className="add-station-btn"
                  >
                    + Wahllokal hinzufügen
                  </button>
                </div>

                <div className="voting-stations-list">
                  {votingStations.map((station) => (
                    <div key={station.id} className="voting-station-item">
                      <div className="station-inputs">
                        <input
                          type="text"
                          placeholder="Name des Wahllokals"
                          value={station.name}
                          onChange={(e) => handleStationChange(station.id, 'name', e.target.value)}
                          className="station-name-input"
                        />
                        <input
                          type="number"
                          placeholder="Anzahl der Wähler"
                          value={station.voterCount}
                          onChange={(e) => handleStationChange(station.id, 'voterCount', e.target.value)}
                          min="0"
                          className="station-votes-input"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVotingStation(station.id)}
                        className="remove-station-btn"
                        title="Wahllokal entfernen"
                        disabled={votingStations.length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vote Types Section */}
              <div className="vote-types-section">
                <div className="section-header">
                  <h4>Wahltypen</h4>
                  <button
                    type="button"
                    onClick={addVoteType}
                    className="add-type-btn"
                  >
                    + Wahltyp hinzufügen
                  </button>
                </div>

                <div className="vote-types-list">
                  {voteTypes.map((voteType) => (
                    <div key={voteType.id} className="vote-type-item">
                      <div className="vote-type-header">
                        <input
                          type="text"
                          placeholder="Name des Wahltyps (z.B. Erststimme)"
                          value={voteType.name}
                          onChange={(e) => handleVoteTypeChange(voteType.id, 'name', e.target.value)}
                          className="vote-type-input"
                        />
                        <button
                          type="button"
                          onClick={() => removeVoteType(voteType.id)}
                          className="remove-type-btn"
                          title="Wahltyp entfernen"
                          disabled={voteTypes.length <= 1}
                        >
                          ×
                        </button>
                      </div>

                      <div className="vote-options-container">
                        <div className="vote-options-header">
                          <h5>Wahloptionen</h5>
                          <button
                            type="button"
                            onClick={() => addVoteOption(voteType.id)}
                            className="add-option-btn"
                          >
                            + Option
                          </button>
                        </div>

                        <div className="vote-options-list">
                          {voteType.voteoptions.map((option) => (
                            <div key={option.id} className="vote-option-item">
                              <input
                                type="text"
                                placeholder="Name der Option (z.B. Kandidat A)"
                                value={option.name}
                                onChange={(e) => handleVoteOptionChange(voteType.id, option.id, e.target.value)}
                                className="vote-option-input"
                              />
                              <button
                                type="button"
                                onClick={() => removeVoteOption(voteType.id, option.id)}
                                className="remove-option-btn"
                                title="Option entfernen"
                                disabled={voteType.voteoptions.length <= 1}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={closeModal}>Abbrechen</button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Wird gespeichert...'
                  : (isEditMode ? 'Aktualisieren' : 'Erstellen')}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      {/* Debug information - remove in production */}
                      <div style={{ display: 'none' }}>
                        <p>Anzahl der Wahltypen: {resultsData.votetypes.length}</p>
                        <ul>
                          {resultsData.votetypes.map((type, idx) => (
                            <li key={idx}>{type.name} - {type.voteoptions?.length || 0} Optionen</li>
                          ))}
                        </ul>
                      </div>

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

export default AdminDashboardPage;