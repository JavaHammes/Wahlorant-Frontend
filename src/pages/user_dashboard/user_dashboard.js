import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOMEPAGE_ROUTE, LOGIN_ROUTE } from '../../constants/routes';
import { isUser, logout } from '../../utils/auth';
import './user_dashboard.css';

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const [votings, setVotings] = useState([]);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVoting, setCurrentVoting] = useState(null);
  const [voteResults, setVoteResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const TimeToEdit = 30;

  useEffect(() => {
    const checkUserAccess = async () => {
      setIsLoading(true);
      const userStatus = await isUser();

      if (!userStatus) {
        // Redirect non-users to login
        alert('Sie haben keine Berechtigung, auf das User-Dashboard zuzugreifen.');
        logout(); // Clear any existing tokens
        navigate(LOGIN_ROUTE);
        return;
      }

      // If user, load elections data
      loadVotingsData();
      setIsLoading(false); // Set loading to false after data is loaded
    };

    checkUserAccess();
  }, [navigate]);

  const loadVotingsData = () => {
    // Sample data - would be fetched from an API in production
    const sampleVotings = [
      {
        id: 1,
        name: 'Bundestagswahl 2025',
        startDate: '2025-02-27T08:00:00',
        endDate: '2026-03-01T18:00:00',
        description: 'Bundesweite Wahl für die Zusammensetzung des deutschen Bundestags',
        candidates: ['CDU/CSU', 'SPD', 'Die Grünen', 'FDP', 'Die Linke', 'AfD', 'Sonstige']
      },
      {
        id: 2,
        name: 'Kommunalwahl München',
        startDate: '2025-03-15T08:00:00',
        endDate: '2025-03-15T18:00:00',
        description: 'Wahl des Stadtrats und der Bezirksausschüsse in München',
        candidates: ['CSU', 'SPD', 'Die Grünen', 'FDP', 'Die Linke', 'AfD', 'Freie Wähler', 'ÖDP', 'Sonstige']
      },
      {
        id: 3,
        name: 'Landtagswahl Bayern',
        startDate: '2024-10-10T08:00:00',
        endDate: '2024-10-10T18:00:00',
        description: 'Wahl des Bayerischen Landtags',
        candidates: ['CSU', 'Freie Wähler', 'Die Grünen', 'SPD', 'FDP', 'Die Linke', 'AfD', 'Sonstige']
      },
      {
        id: 4,
        name: 'Europawahl 2024',
        startDate: '2024-06-09T08:00:00',
        endDate: '2024-06-09T20:00:00',
        description: 'Wahl der Abgeordneten für das Europäische Parlament',
        candidates: ['CDU/CSU', 'SPD', 'Die Grünen', 'FDP', 'Die Linke', 'AfD', 'Sonstige']
      }
    ];

    // Sample user submissions
    const sampleSubmissions = [
      {
        votingId: 3,
        voteCount: {
          'CSU': 156,
          'Freie Wähler': 89,
          'Die Grünen': 112,
          'SPD': 78,
          'FDP': 45,
          'Die Linke': 23,
          'AfD': 67,
          'Sonstige': 14
        },
        submissionDate: '2024-10-10T10:30:00',
        votingName: 'Landtagswahl Bayern',
        editHistory: []
      }
    ];

    setVotings(sampleVotings);
    setUserSubmissions(sampleSubmissions);
  };

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

  const calculateTimeRemaining = (submissionDate) => {
    const submissionTime = new Date(submissionDate);
    const currentTime = new Date();
    const diffInMinutes = Math.floor((currentTime - submissionTime) / (1000 * 60));
    return {
      diffInMinutes,
      canEdit: diffInMinutes <= TimeToEdit,
      timeRemaining: TimeToEdit - diffInMinutes
    };
  };

  const handleLogout = () => {
    logout();
    navigate(HOMEPAGE_ROUTE);
  };

  const openVoteModal = (voting, isEdit = false) => {
    setCurrentVoting(voting);

    // Initialize vote counts for each candidate to 0
    const initialVoteCounts = {};
    voting.candidates.forEach(candidate => {
      initialVoteCounts[candidate] = 0;
    });

    if (isEdit) {
      const submission = userSubmissions.find(sub => sub.votingId === voting.id);

      // Check if the vote is still editable
      const { canEdit } = calculateTimeRemaining(submission.submissionDate);

      if (!canEdit) {
        alert('Die Bearbeitungszeit von 30 Minuten ist abgelaufen. Ihre Stimme kann nicht mehr geändert werden.');
        return;
      }

      setIsEditMode(true);
      setVoteResults(submission.voteCount || initialVoteCounts);
    } else {
      setIsEditMode(false);
      setVoteResults(initialVoteCounts);
    }

    setIsVoteModalOpen(true);
  };

  const closeVoteModal = () => {
    setIsVoteModalOpen(false);
    setCurrentVoting(null);
  };

  const handleVoteCountChange = (candidate, count) => {
    // Ensure the count is a positive number
    const numericCount = Math.max(0, parseInt(count) || 0);

    setVoteResults(prevCounts => ({
      ...prevCounts,
      [candidate]: numericCount
    }));
  };

  const handleVoteSubmit = (e) => {
    e.preventDefault();

    // Check if at least one candidate has votes
    const hasVotes = Object.values(voteResults).some(count => count > 0);

    if (!hasVotes) {
      alert('Bitte geben Sie mindestens eine Stimme ein');
      return;
    }

    const currentTime = new Date().toISOString();

    if (isEditMode) {
      // Check if vote is still within edit window
      const existingSubmission = userSubmissions.find(sub => sub.votingId === currentVoting.id);
      const { canEdit } = calculateTimeRemaining(existingSubmission.submissionDate);

      if (!canEdit) {
        alert('Die Bearbeitungszeit von 30 Minuten ist abgelaufen. Ihre Stimme kann nicht mehr geändert werden.');
        closeVoteModal();
        return;
      }

      // Update existing submission
      const updatedSubmissions = userSubmissions.map(sub =>
        sub.votingId === currentVoting.id
          ? {
              ...sub,
              voteCount: voteResults,
              submissionDate: currentTime,
              editHistory: [
                ...(sub.editHistory || []),
                {
                  previousVotes: sub.voteCount,
                  editedAt: currentTime
                }
              ]
            }
          : sub
      );
      setUserSubmissions(updatedSubmissions);

      alert('Ihre Stimmzahlen wurden erfolgreich aktualisiert. Sie können diese noch für 30 Minuten bearbeiten.');
    } else {
      const newSubmission = {
        votingId: currentVoting.id,
        voteCount: voteResults,
        submissionDate: currentTime,
        votingName: currentVoting.name,
        editHistory: []
      };
      setUserSubmissions([...userSubmissions, newSubmission]);

      alert('Ihre Stimmzahlen wurden erfolgreich übermittelt. Sie können diese noch für 30 Minuten bearbeiten oder löschen.');
    }

    closeVoteModal();
  };

  const handleDeleteSubmission = (votingId) => {
    // Check if vote is still within edit window
    const submission = userSubmissions.find(sub => sub.votingId === votingId);
    const { canEdit } = calculateTimeRemaining(submission.submissionDate);

    if (!canEdit) {
      alert('Die Bearbeitungszeit von 30 Minuten ist abgelaufen. Ihre Stimme kann nicht mehr gelöscht werden.');
      return;
    }

    if (window.confirm('Sind Sie sicher, dass Sie diese Stimmzahlen zurückziehen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      const updatedSubmissions = userSubmissions.filter(sub => sub.votingId !== votingId);
      setUserSubmissions(updatedSubmissions);
      alert('Ihre Stimmzahlen wurden erfolgreich zurückgezogen.');
    }
  };

  const hasUserVoted = (votingId) => {
    return userSubmissions.some(sub => sub.votingId === votingId);
  };

  // Calculate total votes for a submission
  const calculateTotalVotes = (voteCount) => {
    if (!voteCount) return 0;
    return Object.values(voteCount).reduce((sum, count) => sum + count, 0);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Lade Benutzer-Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <header className="user-header">
        <div className="logo">
          <Link to={HOMEPAGE_ROUTE}>
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="user-info">
          <span className="user-greeting">Willkommen, Wahllokal</span>
        </div>
        <div className="user-actions">
          <button className="logout-btn" onClick={handleLogout}>Abmelden</button>
        </div>
      </header>

      <main className="user-container">
        <div className="dashboard-header">
          <h2>Meine Wahlen</h2>
        </div>

        <div className="votings-container">
          <div className="votings-stats">
            <div className="stat-card">
              <div className="stat-value">{votings.length}</div>
              <div className="stat-label">Zugewiesene Wahlen</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {votings.filter(e => checkVotingStatus(e.startDate, e.endDate) === 'active').length}
              </div>
              <div className="stat-label">Aktive Wahlen</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{userSubmissions.length}</div>
              <div className="stat-label">Übermittelte Wahlen</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {votings.filter(e => checkVotingStatus(e.startDate, e.endDate) === 'active').length -
                 userSubmissions.filter(sub =>
                   votings.find(v => v.id === sub.votingId)?.startDate &&
                   checkVotingStatus(
                     votings.find(v => v.id === sub.votingId)?.startDate,
                     votings.find(v => v.id === sub.votingId)?.endDate
                   ) === 'active'
                 ).length}
              </div>
              <div className="stat-label">Ausstehende Wahlen</div>
            </div>
          </div>

          <h3 className="section-title">Aktuelle Wahlen</h3>

          <div className="votings-grid">
            {votings.map(voting => {
              const status = checkVotingStatus(voting.startDate, voting.endDate);
              const userVoted = hasUserVoted(voting.id);

              return (
                <div
                  key={voting.id}
                  className={`voting-card ${status} ${userVoted ? 'voted' : ''}`}
                >
                  <div className="voting-header">
                    <h4 className="voting-name">{voting.name}</h4>
                    <div className="voting-badges">
                      <div className={`status-badge ${status}`}>
                        {status === 'active' && 'Aktiv'}
                        {status === 'upcoming' && 'Geplant'}
                        {status === 'completed' && 'Beendet'}
                      </div>
                      {userVoted && (
                        <div className="voted-badge">
                          ✓ Übermittelt
                        </div>
                      )}
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
                  <p className="voting-description">{voting.description}</p>

                  <div className="voting-actions">
                    {status === 'active' && !userVoted && (
                      <button
                        className="vote-button"
                        onClick={() => openVoteModal(voting)}
                      >
                        Ergebnisse übermitteln
                      </button>
                    )}

                    {status === 'active' && userVoted && (
                      (() => {
                        const submission = userSubmissions.find(sub => sub.votingId === voting.id);
                        const { canEdit, timeRemaining } = calculateTimeRemaining(submission.submissionDate);

                        return (
                          <div className="voted-actions">
                            {canEdit ? (
                              <>
                                <button
                                  className="edit-vote-btn"
                                  onClick={() => openVoteModal(voting, true)}
                                >
                                  Ergebnisse ändern
                                </button>
                                <button
                                  className="delete-vote-btn"
                                  onClick={() => handleDeleteSubmission(voting.id)}
                                >
                                  🗑️
                                </button>
                                <div className="edit-time-info">
                                  Bearbeitung für {timeRemaining} Minuten möglich
                                </div>
                              </>
                            ) : (
                              <div className="edit-time-expired-info">
                                Bearbeitungszeitraum abgelaufen (30 Min.)
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}

                    {status === 'upcoming' && (
                      <div className="upcoming-info">
                        Übermittlung ab {formatDate(voting.startDate)} möglich
                      </div>
                    )}

                    {status === 'completed' && (
                      <div className="completed-info">
                        {userVoted
                          ? 'Ergebnisse wurden übermittelt'
                          : 'Keine Ergebnisse übermittelt'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {userSubmissions.length > 0 && (
            <>
              <h3 className="section-title">Meine abgegebenen Stimmen</h3>
              <div className="submissions-list">
                <table className="submissions-table">
                  <thead>
                    <tr>
                      <th>Wahl</th>
                      <th>Gesamtstimmen</th>
                      <th>Datum und Uhrzeit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSubmissions.map((submission, index) => {
                      const voting = votings.find(v => v.id === submission.votingId);
                      const status = voting ? checkVotingStatus(voting.startDate, voting.endDate) : 'completed';
                      const { canEdit, timeRemaining } = calculateTimeRemaining(submission.submissionDate);
                      const totalVotes = calculateTotalVotes(submission.voteCount);

                      return (
                        <tr key={index}>
                          <td>{submission.votingName}</td>
                          <td className="candidate-cell">{totalVotes} Stimmen</td>
                          <td>
                            {formatDate(submission.submissionDate)}
                            {canEdit && status === 'active' && (
                              <span className="edit-time-remaining">
                                {timeRemaining} Minuten zum Bearbeiten verbleibend
                              </span>
                            )}
                          </td>
                          <td className="status-cell">
                            {status === 'active' ? (
                              canEdit ? (
                                <span className="edit-time-available">
                                  Bearbeitung möglich
                                </span>
                              ) : (
                                <span className="edit-time-expired">
                                  Bearbeitungszeitraum abgelaufen
                                </span>
                              )
                            ) : (
                              <span className="voting-closed">
                                Wahl geschlossen
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {isVoteModalOpen && currentVoting && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {isEditMode ? 'Ergebnisse ändern' : 'Ergebnisse übermitteln'} - {currentVoting.name}
              </h3>
              <button className="close-modal" onClick={closeVoteModal}>×</button>
            </div>
            <form onSubmit={handleVoteSubmit} className="vote-form">
              <div className="form-group">
                <p className="voting-info">
                  {isEditMode ?
                    'Sie können Ihre übermittelten Ergebnisse innerhalb von 30 Minuten nach der Übermittlung ändern. Bitte geben Sie die korrekten Stimmzahlen ein.' :
                    'Bitte geben Sie die gezählten Stimmen für jede Partei ein. Sie können Ihre Übermittlung innerhalb von 30 Minuten nach der Abgabe bearbeiten oder löschen.'}
                </p>
                <div className="candidates-container">
                  {currentVoting.candidates.map((candidate, index) => (
                    <div key={index} className="candidate-option vote-count-option">
                      <label htmlFor={`candidate-${index}`}>{candidate}</label>
                      <input
                        type="number"
                        id={`candidate-${index}`}
                        name={`candidate-${index}`}
                        min="0"
                        value={voteResults[candidate] || 0}
                        onChange={(e) => handleVoteCountChange(candidate, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="vote-total">
                    <strong>Gesamtstimmen: </strong>
                    {calculateTotalVotes(voteResults)}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeVoteModal}>Abbrechen</button>
                <button type="submit" className="submit-btn">
                  {isEditMode ? 'Ergebnisse aktualisieren' : 'Ergebnisse übermitteln'}
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

export default UserDashboardPage;