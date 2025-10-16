import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import UserFormModal from "../../components/UserFormModal.jsx";
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

Modal.setAppElement('#root');

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  
  useEffect(() => {
    if (role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [role, navigate]);
  
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get('http://localhost:8000/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data);
      applyFilters(res.data, roleFilter);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Impossible de charger la liste des utilisateurs. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = (usersList, filter) => {
    let filtered = usersList.filter(user => user.role.toLowerCase() !== 'admin');
    
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.role.toLowerCase() === filter);
    }
    
    setFilteredUsers(filtered);
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    applyFilters(users, roleFilter);
  }, [roleFilter, users]);
  
  const handleDelete = async (id_user, nom, prenom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${prenom} ${nom} ?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/users/${id_user}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchUsers();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };
  
  const handleToggle = async (id_user, is_active, nom, prenom) => {
    const action = is_active ? 'désactiver' : 'activer';
    if (window.confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur ${prenom} ${nom} ?`)) {
      try {
        await axios.patch(`http://localhost:8000/api/users/${id_user}/toggle`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchUsers();
      } catch (err) {
        console.error('Erreur lors du changement de statut:', err);
        alert(`Erreur lors de la tentative de ${action} l'utilisateur`);
      }
    }
  };
  
  const getRoleClassName = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'enfourneur':
        return 'role-enfourneur';
      case 'trieur':
        return 'role-trieur';
      case "chef d'equipe":
        return 'role-chef-equipe';
      default:
        return '';
    }
  };
  
  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h2>Gestion des utilisateurs</h2>
        <div className="filter-controls">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-filter"
          >
            <option value="all">Tous les rôles</option>
            <option value="enfourneur">Enfourneurs</option>
            <option value="trieur">trieurs</option>
            <option value="chef d'equipe">chef d'equipes</option>
          </select>
          <button 
            className="add-user-btn"
            onClick={() => { setSelectedUser(null); setModalOpen(true); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Ajouter utilisateur
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="loader">
          <div className="loader-spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="no-users-message">
          Aucun utilisateur trouvé {roleFilter !== 'all' ? `avec le rôle ${roleFilter}` : '(les administrateurs ne sont pas affichés)'}
        </div>
      )}
      
      {!loading && !error && filteredUsers.length > 0 && (
        <table className="users-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Matricule</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id_user}>
                <td>{u.nom}</td>
                <td>{u.prenom}</td>
                <td>{u.matricule}</td>
                <td>
                  <span className={`user-role ${getRoleClassName(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`user-status ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-edit" 
                      onClick={() => { setSelectedUser(u); setModalOpen(true); }}
                    >
                      Modifier
                    </button>
                    <button 
                      className="btn btn-delete" 
                      onClick={() => handleDelete(u.id_user, u.nom, u.prenom)}
                    >
                      Supprimer
                    </button>
                    <button 
                      className={`btn ${u.is_active ? 'btn-toggle-active' : 'btn-toggle-inactive'}`} 
                      onClick={() => handleToggle(u.id_user, u.is_active, u.nom, u.prenom)}
                    >
                      {u.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <UserFormModal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        user={selectedUser}
        onSuccess={() => { setModalOpen(false); fetchUsers(); }}
      />
    </div>
  );
}

export default UserManagement;