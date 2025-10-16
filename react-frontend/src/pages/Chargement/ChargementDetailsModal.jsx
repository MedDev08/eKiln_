import React from 'react';
import axios from 'axios';

const ChargementDetailsModal = ({ chargementId, onClose }) => {
  const [details, setDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/chargements/${chargementId}/popup-details`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            withCredentials: true,
          }
        );
        
        if (response.data.success) {
          setDetails(response.data);
        } else {
          setError(response.data.message || 'Erreur lors du chargement des détails');
        }
      } catch (err) {
        setError('Erreur de connexion au serveur');
        console.error('Erreur API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [chargementId]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        
        <h2>Détails du chargement</h2>
        
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i> Chargement...
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : details ? (
          <div className="details-container">
            <div className="detail-row">
              <span className="detail-label">Wagon:</span>
              <span>{details.data.wagon_num} ({details.data.wagon_type})</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Four:</span>
              <span>{details.data.four_num}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Enfourneur:</span>
              <span>{details.data.enfourneur}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Statut:</span>
              <span>{details.data.statut}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date chargement:</span>
              <span>{new Date(details.data.date_chargement).toLocaleString()}</span>
            </div>
            
            <h3>Pièces chargées</h3>
            <table className="pieces-table">
              <thead>
                <tr>
                  <th>Famille</th>
                  <th>Quantité</th>
                </tr>
              </thead>
              <tbody>
                {details.data.pieces.map((piece, index) => (
                  <tr key={index}>
                    <td>{piece.famille}</td>
                    <td>{piece.quantite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          width: 80%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }
        
        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .details-container {
          margin-top: 20px;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        
        .detail-label {
          font-weight: bold;
          width: 150px;
        }
        
        .pieces-table {
          width: 100%;
          margin-top: 15px;
          border-collapse: collapse;
        }
        
        .pieces-table th, .pieces-table td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
        
        .pieces-table th {
          background-color: #f5f5f5;
        }
        
        .error-message {
          color: #e53935;
          padding: 10px;
        }
        
        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default ChargementDetailsModal;