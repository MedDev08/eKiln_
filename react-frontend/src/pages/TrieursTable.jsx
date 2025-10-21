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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import SidebarChef from '../components/layout/SidebarChef';
// Component: TrieursTable
const TrieursTable = () => {
  const [trieurs, setTrieurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [familles, setFamilles] = useState([]); // Nouvel état pour les familles
  const [selectedFamilles, setSelectedFamilles] = useState([]); // Familles sélectionnées
  const [submitting, setSubmitting] = useState(false);
  const [newTrieur, setNewTrieur] = useState({
    matricule: '',
    nom: '',
    prenom: '',
  });
  const handleToggleActive = async (userId, isCurrentlyActive) => {
  try {
    const token = localStorage.getItem('token');
    await axios.patch(`http://localhost:8000/api/users/${userId}/toggle-active`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTrieurs(); // Recharger la liste
  } catch (err) {
    console.error('Erreur:', err);
    alert("Erreur lors de la modification du statut");
  }
};

const handleDelete = async (userId) => {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer ce trieur ?")) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTrieurs(); // Recharger la liste
    } catch (err) {
      console.error('Erreur:', err);
      alert("Erreur lors de la suppression");
    }
  }
};

  // Charger les familles disponibles
  const fetchFamilles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/familles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilles(response.data || []);
    } catch (err) {
      console.error('Erreur:', err.response?.data || err.message);
    }
  };

  // Fonction pour charger les trieurs
  // Dans la fonction fetchTrieurs
const fetchTrieurs = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8000/api/trieurs/actifs', {
      headers: { Authorization: `Bearer ${token}` },
      params: { with_polyvalences: true } // Ajout de ce paramètre
    });
    setTrieurs(response.data || []);
  } catch (err) {
    console.error('Erreur:', err.response?.data || err.message);
    setError("Erreur lors du chargement des trieurs");
    setTrieurs([]);
  } finally {
    setLoading(false);
  }
};

  // Chargement initial
  useEffect(() => {
    fetchTrieurs();
    fetchFamilles();
  }, []);

  // Fonction de filtrage
  const filteredTrieurs = trieurs.filter(trieur => 
    trieur.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trieur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trieur.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour ajouter un trieur
  const handleAddTrieur = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Créer l'utilisateur (trieur)
      const userResponse = await axios.post('http://localhost:8000/api/users', {
        matricule: newTrieur.matricule,
        nom: newTrieur.nom,
        prenom: newTrieur.prenom,
        role: 'trieur',
        password: '' // ou générez un mot de passe aléatoire
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      const userId = userResponse.data.id_user;
  
      // 2. Ajouter les polyvalences si des familles sont sélectionnées
      if (selectedFamilles.length > 0) {
        await Promise.all(selectedFamilles.map(familleId => 
          axios.post('http://localhost:8000/api/polyvalences', {
            id_famille: familleId,
            id_user: userId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
      }
  
      // Rafraîchir la liste
      await fetchTrieurs();
      setOpenModal(false);
      setNewTrieur({ matricule: '', nom: '', prenom: '' });
      setSelectedFamilles([]);
    } catch (err) {
      console.error('Erreur détaillée:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      alert(`Erreur: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFamilleChange = (event) => {
    const { value } = event.target;
    setSelectedFamilles(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

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
            Ajouter un trieur
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
            <Typography variant="h6" sx={{ mb: 2 }}>Nouveau trieur</Typography>
            
            <Stack spacing={2}>
              <TextField
                label="Matricule"
                name="matricule"
                value={newTrieur.matricule}
                onChange={(e) => setNewTrieur({...newTrieur, matricule: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Nom"
                name="nom"
                value={newTrieur.nom}
                onChange={(e) => setNewTrieur({...newTrieur, nom: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Prénom"
                name="prenom"
                value={newTrieur.prenom}
                onChange={(e) => setNewTrieur({...newTrieur, prenom: e.target.value})}
                fullWidth
                required
              />
              
              <FormControl fullWidth>
                <InputLabel id="familles-label">Familles (polyvalence)</InputLabel>
                <Select
                  labelId="familles-label"
                  id="familles-select"
                  multiple
                  value={selectedFamilles}
                  onChange={handleFamilleChange}
                  input={<OutlinedInput label="Familles (polyvalence)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={familles.find(f => f.id_famille === value)?.nom_famille || value} />
                      ))}
                    </Box>
                  )}
                >
                  {familles.map((famille) => (
                    <MenuItem
                      key={famille.id_famille}
                      value={famille.id_famille}
                    >
                      <Checkbox checked={selectedFamilles.indexOf(famille.id_famille) > -1} />
                      <ListItemText primary={famille.nom_famille} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <LoadingButton
                variant="contained"
                onClick={handleAddTrieur}
                loading={submitting}
                loadingPosition="start"
                startIcon={<SaveIcon />}
              >
                Enregistrer
              </LoadingButton>
            </Stack>
          </Box>
        </Modal>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matricule</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Polyvalences</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
<TableBody>
  {filteredTrieurs.length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} align="center">
        {trieurs.length === 0 ? 'Aucun trieur disponible' : 'Aucun trieur trouvé avec ce critère'}
      </TableCell>
    </TableRow>
  ) : (
    filteredTrieurs.map((trieur) => (
      <TableRow key={trieur.id_user}>
        <TableCell>{trieur.matricule.toUpperCase()}</TableCell>
        <TableCell>{trieur.nom.toUpperCase()}</TableCell>
        <TableCell>{trieur.prenom.toUpperCase()}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {trieur.polyvalences?.map(poly => (
              <Chip 
                key={poly.id_polyvalence} 
                label={poly.famille?.nom_famille || 'Inconnue'} 
                size="small"
                color="primary"
              />
            ))}
            {(!trieur.polyvalences || trieur.polyvalences.length === 0) && (
              <Typography variant="caption" color="text.secondary">
                Aucune polyvalence
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell>
    <Chip
      label={trieur.is_active ? 'Actif' : 'Inactif'}
      color={trieur.is_active ? 'success' : 'default'}
    />
  </TableCell>
  <TableCell>
    <IconButton 
      color={trieur.is_active ? "warning" : "success"}
      onClick={() => handleToggleActive(trieur.id_user, trieur.is_active)}
    >
      {trieur.is_active ? <BlockIcon /> : <CheckCircleIcon />}
    </IconButton>
    <IconButton 
      color="error"
      onClick={() => handleDelete(trieur.id_user)}
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
export default TrieursTable;