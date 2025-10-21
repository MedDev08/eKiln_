import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import PeopleIcon from '@mui/icons-material/People';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import SidebarChef from '../components/layout/SidebarChef';

const EnfourneurTable = () => {
  const [enfourneurs, setEnfourneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [newEnfourneur, setNewEnfourneur] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fonction pour charger les enfourneurs (définie en dehors du useEffect)
  const fetchEnfourneurs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/enfourneurs/actifs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEnfourneurs(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des enfourneurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, isCurrentlyActive) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/users/${userId}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEnfourneurs(); // Maintenant cette fonction est définie
    } catch (err) {
      console.error('Erreur:', err);
      alert("Erreur lors de la modification du statut");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enfourneur ?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchEnfourneurs(); // Maintenant cette fonction est définie
      } catch (err) {
        console.error('Erreur:', err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  // Fonction pour ajouter un enfourneur
  const handleAddEnfourneur = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/users', {
        ...newEnfourneur,
        role: 'enfourneur'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEnfourneurs(); // Maintenant cette fonction est définie
      setOpenModal(false);
      setNewEnfourneur({ matricule: '', nom: '', prenom: '', password: '' });
    } catch (err) {
      console.error('Erreur:', err.response?.data || err.message);
      alert("Erreur lors de l'ajout de l'enfourneur");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEnfourneurs(); // Utilisation de la fonction définie
  }, []);

  // Fonction de filtrage
  const filteredEnfourneurs = enfourneurs.filter(enfourneur => 
    enfourneur.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enfourneur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enfourneur.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Typography>Chargement en cours...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <SidebarChef>
    <TableContainer component={Paper}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Rechercher par matricule, nom ou prénom"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '40%' }}
          />
          <Button 
            variant="contained" 
            onClick={() => setOpenModal(true)}
            startIcon={<PeopleIcon />}
          >
            Ajouter un enfourneur
          </Button>
        </Box>

        {/* Modal d'ajout */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Nouvel enfourneur</Typography>
            
            <Stack spacing={2}>
              <TextField
                label="Matricule"
                name="matricule"
                value={newEnfourneur.matricule}
                onChange={(e) => setNewEnfourneur({...newEnfourneur, matricule: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Nom"
                name="nom"
                value={newEnfourneur.nom}
                onChange={(e) => setNewEnfourneur({...newEnfourneur, nom: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Prénom"
                name="prenom"
                value={newEnfourneur.prenom}
                onChange={(e) => setNewEnfourneur({...newEnfourneur, prenom: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Mot de passe (optionnel)"
                type="password"
                name="password"
                value={newEnfourneur.password}
                onChange={(e) => setNewEnfourneur({...newEnfourneur, password: e.target.value})}
                fullWidth
              />
              
              <LoadingButton
                variant="contained"
                onClick={handleAddEnfourneur}
                loading={submitting}
                loadingPosition="start"
                startIcon={<SaveIcon />}
              >
                Enregistrer
              </LoadingButton>
            </Stack>
          </Box>
        </Modal>

        <Table sx={{ minWidth: 650 }} aria-label="enfourneurs table">
          <TableHead>
            <TableRow>
              <TableCell>Matricule</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEnfourneurs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Aucun enfourneur trouvé</TableCell>
              </TableRow>
            ) : (
              filteredEnfourneurs.map((enfourneur) => (
                <TableRow key={enfourneur.id_user}>
                  <TableCell>{enfourneur.matricule.toUpperCase()}</TableCell>
                  <TableCell>{enfourneur.nom.toUpperCase()}</TableCell>
                  <TableCell>{enfourneur.prenom.toUpperCase()}</TableCell>
                  <TableCell>
                    <Chip
                      label={enfourneur.is_active ? 'Actif' : 'Inactif'}
                      color={enfourneur.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color={enfourneur.is_active ? "warning" : "success"}
                      onClick={() => handleToggleActive(enfourneur.id_user, enfourneur.is_active)}
                    >
                      {enfourneur.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDelete(enfourneur.id_user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </TableContainer>
  </SidebarChef>
  );
};
export default EnfourneurTable;