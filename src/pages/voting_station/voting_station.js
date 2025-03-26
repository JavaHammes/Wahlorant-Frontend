import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HOMEPAGE_ROUTE } from '../../constants/routes';
import { logout } from '../../requests/authService';
import votingService from '../../requests/votingService';
import './voting_station.css';

const VotingStationPage = () => {
  const navigate = useNavigate();
  const { stationId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [station, setStation] = useState(null);
  const [voting, setVoting] = useState(null);
  const [voteData, setVoteData] = useState({});
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadStationData();
  }, [stationId]);

  async function loadStationData() {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, you would fetch the station and its assigned voting
      // For this demo, we'll simulate loading data

      // Simulated API response
      const stationData = {
        id: stationId || 'station-123',
        name: 'Wahllokal Berlin-Mitte',
        address: 'Unter den Linden 1, 10117 Berlin',
        voterCount: 1200
      };

      const votingData = {
        id: 'voting-456',
        name: 'Bundestagswahl 2025',
        startDate: new Date('2025-09-26T08:00:00'),
        endDate: new Date('2025-09-26T18:00:00'),
        votetypes: [
          {
            id: 'votetype-1',
            name: 'Erststimme',
            votingId: 'voting-456',
            voteoptions: [
              { id: 'option-1', name: 'Alexander Müller (CDU)', votetypeId: 'votetype-1' },
              { id: 'option-2', name: 'Britta Schmidt (SPD)', votetypeId: 'votetype-1' },
              { id: 'option-3', name: 'Christian Wagner (Grüne)', votetypeId: 'votetype-1' },
              { id: 'option-4', name: 'Daniela Krause (FDP)', votetypeId: 'votetype-1' },
              { id: 'option-5', name: 'Erik Hoffmann (Linke)', votetypeId: 'votetype-1' }
            ]
          },
          {
            id: 'votetype-2',
            name: 'Zweitstimme',
            votingId: 'voting-456',
            voteoptions: [
              { id: 'option-6', name: 'CDU/CSU', votetypeId: 'votetype-2' },
              { id: 'option-7', name: 'SPD', votetypeId: 'votetype-2' },
              { id: 'option-8', name: 'Bündnis 90/Die Grünen', votetypeId: 'votetype-2' },
              { id: 'option-9', name: 'FDP', votetypeId: 'votetype-2' },
              { id: 'option-10', name: 'Die Linke', votetypeId: 'votetype-2' },
              { id: 'option-11', name: 'AfD', votetypeId: 'votetype-2' },
              { id: 'option-12', name: 'Sonstige', votetypeId: 'votetype-2' }
            ]
          }
        ]
      };

      setStation(stationData);
      setVoting(votingData);

      // Initialize vote data structure
      const initialVoteData = {};
      votingData.votetypes.forEach(type => {
        type.voteoptions.forEach(option => {
          initialVoteData[option.id] = 0;
        });
      });

      setVoteData(initialVoteData);
    } catch (error) {
      console.error('Error loading station data:', error);
      setError('Fehler beim Laden der Wahllokal-Daten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleVoteChange = (optionId, value) => {
    // Ensure value is a non-negative integer
    const votes = Math.max(0, parseInt(value) || 0);

    setVoteData(prevData => ({
      ...prevData,
      [optionId]: votes
    }));
  };

  const validateVoteCounts = () => {
    // Group vote counts by vote type
    const votesByType = {};

    voting.votetypes.forEach(type => {
      votesByType[type.id] = {
        total: 0,
        options: type.voteoptions.map(option => ({
          id: option.id,
          votes: voteData[option.id] || 0
        }))
      };

      // Calculate total votes for this type
      votesByType[type.id].total = votesByType[type.id].options.reduce(
        (sum, option) => sum + option.votes, 0
      );
    });

    // For this demo, we'll ensure all vote types have the same total
    // In a real implementation, validation logic might be more complex
    const typeTotals = Object.values(votesByType).map(type => type.total);

    if (typeTotals.length > 1) {
      const firstTotal = typeTotals[0];
      const allEqual = typeTotals.every(total => total === firstTotal);

      if (!allEqual) {
        return {
          valid: false,
          message: 'Die Gesamtzahl der Stimmen muss für alle Wahltypen gleich sein.'
        };
      }
    }

    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate vote counts
    const validation = validateVoteCounts();
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // In a real implementation, you would submit to an API
      console.log('Submitting vote data:', voteData);

      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      setSubmitSuccess(true);

      // After a delay, reset the form
      setTimeout(() => {
        setSubmitSuccess(false);

        // Reset vote counts
        const resetVoteData = {};
        Object.keys(voteData).forEach(key => {
          resetVoteData[key] = 0;
        });
        setVoteData(resetVoteData);
      }, 3000);
    } catch (error) {
      console.error('Error submitting votes:', error);
      setError('Fehler beim Übermitteln der Stimmen. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalVotes = (typeId) => {
    if (!voting) return 0;

    const type = voting.votetypes.find(t => t.id === typeId);
    if (!type) return 0;

    return type.voteoptions.reduce((total, option) => {
      return total + (voteData[option.id] || 0);
    }, 0);
  };

  const handleLogout = () => {
    logout();
    navigate(HOMEPAGE_ROUTE);
  };

  const formatDateTime = (date) => {
    if (!date) return '';

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return date instanceof Date
      ? date.toLocaleDateString('de-DE', options)
      : new Date(date).toLocaleDateString('de-DE', options);
  };

  if (isLoading) {
    return (
      <div className="voting-station">
        <header className="station-header">
          <div className="logo">
            <Link to={HOMEPAGE_ROUTE}>
              <h1>Wahlorant</h1>
            </Link>
          </div>
          <div className="loading-message">Daten werden geladen...</div>
        </header>
      </div>
    );
  }

  return (
    <div className="voting-station">
      <header className="station-header">
        <div className="logo">
          <Link to={HOMEPAGE_ROUTE}>
            <h1>Wahlorant</h1>
          </Link>
        </div>
        <div className="station-info">
          <span className="station-name">{station.name}</span>
        </div>
        <div className="station-actions">
          <button className="logout-btn" onClick={handleLogout}>Abmelden</button>
        </div>
      </header>

      <main className="station-container">
        <div className="station-dashboard-header">
          <h2>Stimmenabgabe</h2>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {submitSuccess && (
          <div className="success-message">
            <p>Die Stimmen wurden erfolgreich übermittelt!</p>
          </div>
        )}

        <div className="voting-details-card">
          <div className="voting-details-header">
            <h3>{voting.name}</h3>
            <div className="voting-date">
              <span className="date-label">Wahltag:</span>
              <span className="date-value">{formatDateTime(voting.startDate)} - {formatDateTime(voting.endDate).split(' ').slice(-2).join(' ')}</span>
            </div>
          </div>

          <div className="station-details">
            <div className="station-detail-item">
              <span className="detail-label">Wahllokal:</span>
              <span className="detail-value">{station.name}</span>
            </div>
            <div className="station-detail-item">
              <span className="detail-label">Adresse:</span>
              <span className="detail-value">{station.address}</span>
            </div>
            <div className="station-detail-item">
              <span className="detail-label">Registrierte Wähler:</span>
              <span className="detail-value">{station.voterCount}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="vote-submission-form">
          {voting.votetypes.map((voteType) => (
            <div key={voteType.id} className="vote-type-section">
              <div className="vote-type-header">
                <h4>{voteType.name}</h4>
                <div className="vote-count-summary">
                  <span className="vote-count-label">Gesamtstimmen:</span>
                  <span className="vote-count-value">{calculateTotalVotes(voteType.id)}</span>
                </div>
              </div>

              <div className="vote-options">
                {voteType.voteoptions.map((option) => (
                  <div key={option.id} className="vote-option-row">
                    <div className="vote-option-name">{option.name}</div>
                    <div className="vote-option-input-container">
                      <input
                        type="number"
                        min="0"
                        value={voteData[option.id] || 0}
                        onChange={(e) => handleVoteChange(option.id, e.target.value)}
                        className="vote-count-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wird übermittelt...' : 'Stimmen übermitteln'}
            </button>
          </div>
        </form>
      </main>

      <footer className="footer">
        <p>© 2025 Wahlorant | Studentenprojekt</p>
      </footer>
    </div>
  );
};

export default VotingStationPage;