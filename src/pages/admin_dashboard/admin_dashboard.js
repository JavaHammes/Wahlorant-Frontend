import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOMEPAGE_ROUTE, REGISTER_ROUTE } from '../../constants/routes';
import { logout } from '../../utils/auth';
import './admin_dashboard.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentElection, setCurrentElection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  // State for voting stations
  const [votingStations, setVotingStations] = useState([
    { id: 1, name: '', votes: '' }
  ]);

  // Load data when component mounts
  useEffect(() => {
    loadElectionsData();
  }, []);

  const loadElectionsData = () => {
    // TODO: Replace with actual API call
    const sampleElections = [
      {
        id: 1,
        name: 'Bundestagswahl 2025',
        startDate: '2025-09-01T08:00:00',
        endDate: '2025-09-01T18:00:00',
        description: 'Bundesweite Wahl für die Zusammensetzung des deutschen Bundestags'
      },
      {
        id: 2,
        name: 'Kommunalwahl München',
        startDate: '2025-03-15T08:00:00',
        endDate: '2025-03-15T18:00:00',
        description: 'Wahl des Stadtrats und der Bezirksausschüsse in München'
      },
      {
        id: 3,
        name: 'Landtagswahl Bayern',
        startDate: '2024-10-10T08:00:00',
        endDate: '2024-10-10T18:00:00',
        description: 'Wahl des Bayerischen Landtags'
      },
      {
        id: 4,
        name: 'Europawahl 2024',
        startDate: '2024-06-09T08:00:00',
        endDate: '2024-06-09T20:00:00',
        description: 'Wahl der Abgeordneten für das Europäische Parlament'
      }
    ];

    setElections(sampleElections);
  };

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
        description: election.description
      });

      // Reset voting stations for edit mode
      setVotingStations(election.votingStations || [{ id: 1, name: '', votes: '' }]);
    } else {
      setIsEditMode(false);
      setCurrentElection(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        description: ''
      });

      // Reset voting stations for new election
      setVotingStations([{ id: 1, name: '', votes: '' }]);
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
      station.id === id ? { ...station, [field]: value } : station
    );
    setVotingStations(updatedStations);
  };

  // Add a new voting station
  const addVotingStation = () => {
    const newId = votingStations.length > 0
      ? Math.max(...votingStations.map(s => s.id)) + 1
      : 1;

    setVotingStations([
      ...votingStations,
      { id: newId, name: '', votes: '' }
    ]);
  };

  // Remove a voting station
  const removeVotingStation = (id) => {
    if (votingStations.length > 1) {
      setVotingStations(votingStations.filter(station => station.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Filter out empty voting stations
    const filteredStations = votingStations.filter(station => station.name.trim() !== '');

    if (isEditMode && currentElection) {
      // Update existing election
      const updatedElections = elections.map(election =>
        election.id === currentElection.id
          ? {
              ...election,
              ...formData,
              votingStations: filteredStations
            }
          : election
      );
      setElections(updatedElections);
    } else {
      // Add new election
      const newElection = {
        id: Date.now(), // simple id generation for demo
        ...formData,
        votingStations: filteredStations
      };
      setElections([...elections, newElection]);
    }

    closeModal();
  };

  const handleDeleteElection = (id) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Wahl löschen möchten?')) {
      const updatedElections = elections.filter(election => election.id !== id);
      setElections(updatedElections);
    }
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
              <span className="icon">👤</span> Neues Wahllokal anlegen
            </button>
          </div>
        </div>

        <div className="elections-container">
          <div className="elections-stats">
            <div className="stat-card">
              <div className="stat-value">{elections.length}</div>
              <div className="stat-label">Gesamte Wahlen</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {elections.filter(e => checkElectionStatus(e.startDate, e.endDate) === 'active').length}
              </div>
              <div className="stat-label">Aktive Wahlen</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {elections.filter(e => checkElectionStatus(e.startDate, e.endDate) === 'upcoming').length}
              </div>
              <div className="stat-label">Kommende Wahlen</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {elections.filter(e => checkElectionStatus(e.startDate, e.endDate) === 'completed').length}
              </div>
              <div className="stat-label">Abgeschlossene</div>
            </div>
          </div>

          <h3 className="section-title">Alle Wahlen</h3>

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
                  <p className="election-description">{election.description}</p>
                  {election.votingStations && election.votingStations.length > 0 && (
                    <div className="voting-stations-summary">
                      <span className="stations-count">{election.votingStations.length} Wahllokale</span>
                    </div>
                  )}
                  <div className="election-actions">
                    <button
                      className="view-results-btn"
                      onClick={() => alert('Diese Funktion ist noch in Entwicklung')}
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
        </div>
      </main>

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
              <div className="form-group">
                <label htmlFor="description">Beschreibung</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Kurze Beschreibung der Wahl"
                  rows="3"
                  required
                ></textarea>
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
                          placeholder="Stimmen"
                          value={station.votes}
                          onChange={(e) => handleStationChange(station.id, 'votes', e.target.value)}
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

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Abbrechen</button>
                <button type="submit" className="submit-btn">
                  {isEditMode ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
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