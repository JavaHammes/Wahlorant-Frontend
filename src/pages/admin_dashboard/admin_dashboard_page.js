import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOMEPAGE_ROUTE, REGISTER_ROUTE } from '../../constants/routes';
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

  useEffect(() => {
    // TODO Replace with actual Authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');

      //Redirect to Login
    }
  }, [navigate]);

  useEffect(() => {
    // TODO Add API With actual Data
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
  }, []);

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
    localStorage.removeItem('isAuthenticated');
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
    } else {
      setIsEditMode(false);
      setCurrentElection(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        description: ''
      });
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode && currentElection) {
      // Update existing election
      const updatedElections = elections.map(election =>
        election.id === currentElection.id
          ? { ...election, ...formData }
          : election
      );
      setElections(updatedElections);
    } else {
      // Add new election
      const newElection = {
        id: Date.now(), // simple id generation for demo
        ...formData
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
              <span className="icon">➕</span> Neue Wahl erstellen
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