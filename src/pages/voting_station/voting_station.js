import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOMEPAGE_ROUTE } from '../../constants/routes';
import { logout } from '../../requests/authService';
import votingService from '../../requests/votingService';
import votingStationService from '../../requests/votingStationService';
import './voting_station.css';

const VotingStationWithDetails = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const [error, setError] = useState(null);
  const [votesCounts, setVotesCounts] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const stationName = localStorage.getItem('stationName') || 'Unbekanntes Wahllokal';
  const voterCount = parseInt(localStorage.getItem('voterCount') || '0', 10);
  const firstSubmitTime = localStorage.getItem('firstSubmitTime');
  const lastSubmitTime = localStorage.getItem('lastSubmitTime');

  useEffect(() => {
    fetchVotingDetails();
  }, []);

  // Initialize vote counts when voting data is loaded
  useEffect(() => {
    if (voting && voting.votetypes) {
      const initialCounts = {};

      voting.votetypes.forEach(type => {
        if (type.voteoptions) {
          // Create an object to track total votes for each vote type
          initialCounts[type.id] = {
            _total: 0,
            options: {}
          };

          type.voteoptions.forEach(option => {
            initialCounts[type.id].options[option.id] = 0;
          });
        }
      });

      setVotesCounts(initialCounts);
    }
  }, [voting]);

  const fetchVotingDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the voting ID stored during login
      const votingId = localStorage.getItem('votingId');

      if (!votingId) {
        throw new Error('Keine Wahl-ID gefunden. Bitte melden Sie sich erneut an.');
      }

      console.log(`Fetching voting details for ID: ${votingId}`);

      // Fetch the voting details
      const votingDetails = await votingService.getVotingById(votingId);

      console.log('Received voting details:', votingDetails);

      if (!votingDetails) {
        throw new Error('Keine Wahldaten gefunden.');
      }

      setVoting(votingDetails);
    } catch (error) {
      console.error('Error fetching voting details:', error);
      setError(`Fehler beim Laden der Wahldaten: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoteCountChange = (votetypeId, optionId, value) => {
    const count = parseInt(value, 10) || 0;

    setVotesCounts(prevCounts => {
      const newCounts = {
        ...prevCounts,
        [votetypeId]: {
          ...prevCounts[votetypeId],
          options: {
            ...prevCounts[votetypeId].options,
            [optionId]: count
          }
        }
      };

      // Recalculate the total for this vote type
      newCounts[votetypeId]._total = Object.values(newCounts[votetypeId].options).reduce((sum, c) => sum + c, 0);

      return newCounts;
    });
  };

  const validateVoteCounts = () => {
    const errors = {};
    let isValid = true;

    Object.entries(votesCounts).forEach(([typeId, typeData]) => {
      // Check if total votes for this type exceed voter count
      if (typeData._total > voterCount) {
        errors[typeId] = `Die Summe der Stimmen (${typeData._total}) überschreitet die Anzahl der registrierten Wähler (${voterCount})`;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateVoteCounts()) {
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    try {
      // Format data for API
      const votes = [];

      // For each vote type and its options
      Object.entries(votesCounts).forEach(([typeId, typeData]) => {
        // For each option in this type
        Object.entries(typeData.options).forEach(([optionId, count]) => {
          if (count > 0) {
            votes.push({
              count,
              voteoptionId: optionId
            });
          }
        });
      });

      // Prepare submission data
      const submissionData = {
        votes
      };

      console.log('Submitting vote counts:', submissionData);

      // Call the existing submitVotes method
      const result = await votingStationService.submitVotes(submissionData);
      console.log('Submission result:', result);

      setSubmitSuccess(true);

      // Refresh data to show updated submission times
      setTimeout(() => {
        fetchVotingDetails();
      }, 1000);

    } catch (error) {
      console.error('Error submitting votes:', error);
      setError(error.message || 'Fehler beim Übermitteln der Stimmen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(HOMEPAGE_ROUTE);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Keine';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString || 'Keine';
    }
  };

  const isVotingActive = () => {
    if (!voting) return false;

    const now = new Date();
    const startDate = new Date(voting.startDate);
    const endDate = new Date(voting.endDate);

    return now >= startDate && now <= endDate;
  };

  return (
    <div className="voting-station">
      <header className="station-header">
        <div className="logo">
          <Link to={HOMEPAGE_ROUTE}>
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="station-info">
          <span className="station-name">{stationName}</span>
        </div>
        <div className="station-actions">
          <button className="logout-btn" onClick={handleLogout}>Abmelden</button>
        </div>
      </header>

      <main className="station-container">
        <div className="station-dashboard-header">
          <h2>Wahllokal-Informationen</h2>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {submitSuccess && (
          <div className="success-message">
            <p>Stimmen wurden erfolgreich übermittelt!</p>
          </div>
        )}

        <div className="voting-details-card">
          <div className="station-details">
            <div className="station-detail-item">
              <span className="detail-label">Wahllokal:</span>
              <span className="detail-value">{stationName}</span>
            </div>
            <div className="station-detail-item">
              <span className="detail-label">Registrierte Wähler:</span>
              <span className="detail-value">{voterCount}</span>
            </div>
            {firstSubmitTime && (
              <div className="station-detail-item">
                <span className="detail-label">Erste Übermittlung:</span>
                <span className="detail-value">{formatDateTime(firstSubmitTime)}</span>
              </div>
            )}
            {lastSubmitTime && (
              <div className="station-detail-item">
                <span className="detail-label">Letzte Übermittlung:</span>
                <span className="detail-value">{formatDateTime(lastSubmitTime)}</span>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="loading-message">
            <p>Wahldaten werden geladen...</p>
          </div>
        ) : voting ? (
          <div className="voting-details-section">
            <h3>Wahldaten</h3>
            <div className="voting-info">
              <div className="voting-detail-item">
                <span className="detail-label">Name der Wahl:</span>
                <span className="detail-value">{voting.name}</span>
              </div>
              <div className="voting-detail-item">
                <span className="detail-label">Start:</span>
                <span className="detail-value">{formatDateTime(voting.startDate)}</span>
              </div>
              <div className="voting-detail-item">
                <span className="detail-label">Ende:</span>
                <span className="detail-value">{formatDateTime(voting.endDate)}</span>
              </div>
              <div className="voting-detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  {isVotingActive() ?
                    <span className="active-status">Aktiv</span> :
                    <span className="inactive-status">Inaktiv</span>
                  }
                </span>
              </div>
            </div>

            {voting.votetypes && voting.votetypes.length > 0 && (
              <div className="votetype-section">
                <h4>Stimmzählung</h4>

                {isVotingActive() ? (
                  <form onSubmit={handleSubmit} className="vote-submission-form">
                    {voting.votetypes.map(type => (
                      <div key={type.id} className="votetype-card">
                        <h5>{type.name}</h5>

                        {validationErrors[type.id] && (
                          <div className="validation-error">
                            {validationErrors[type.id]}
                          </div>
                        )}

                        <div className="vote-count-summary">
                          <span className="vote-count-label">Gezählte Stimmen:</span>
                          <span className="vote-count-total">
                            {votesCounts[type.id]?._total || 0} / {voterCount}
                          </span>
                        </div>

                        {type.voteoptions && type.voteoptions.length > 0 ? (
                          <div className="voteoptions-grid">
                            {type.voteoptions.map(option => (
                              <div key={option.id} className="voteoption-count-item">
                                <label htmlFor={`vote-${option.id}`}>{option.name}:</label>
                                <input
                                  id={`vote-${option.id}`}
                                  type="number"
                                  min="0"
                                  max={voterCount}
                                  value={votesCounts[type.id]?.options[option.id] || 0}
                                  onChange={(e) => handleVoteCountChange(type.id, option.id, e.target.value)}
                                  className="vote-count-input"
                                  disabled={submitting}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>Keine Optionen gefunden.</p>
                        )}
                      </div>
                    ))}

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting}
                      >
                        {submitting ? 'Übermittlung...' : 'Stimmen übermitteln'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="voting-inactive-message">
                    <div className="inactive-status-large">Wahl ist derzeit nicht aktiv</div>
                    <p>Die Stimmabgabe ist nur während des aktiven Wahlzeitraums möglich.</p>
                    <p>Wahlzeitraum: {formatDateTime(voting.startDate)} - {formatDateTime(voting.endDate)}</p>

                    {new Date() < new Date(voting.startDate) ? (
                      <div className="waiting-message">Die Wahl hat noch nicht begonnen.</div>
                    ) : (
                      <div className="ended-message">Die Wahl ist bereits beendet.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="no-data-message">
            <p>Keine Wahldaten verfügbar.</p>
          </div>
        )}

      </main>

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default VotingStationWithDetails;