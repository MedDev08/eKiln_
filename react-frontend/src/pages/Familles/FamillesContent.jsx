import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Modal,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

const FamillesContent = () => {
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [newFamille, setNewFamille] = useState({
    nom_famille: '',
    valeur_trieur: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch familles data
  const fetchFamilles = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8000/api/familles', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Trier les familles par ID décroissant pour avoir les plus récentes en premier
    const sortedFamilles = response.data.sort((a, b) => b.id_famille - a.id_famille);
    setFamilles(sortedFamilles);
  } catch (err) {
    setError("Erreur lors du chargement des familles");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchFamilles();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFamille(prev => ({
      ...prev,
      [name]: name === 'valeur_trieur' ? parseFloat(value) || 0 : value
    }));
  };

  // Submit new famille
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!newFamille.nom_famille.trim()) {
        throw new Error("Le nom de la famille est requis");
      }

      if (editingId) {
        // Update existing famille
        await axios.put(`http://localhost:8000/api/familles/${editingId}`, newFamille, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage("Famille mise à jour avec succès");
      } else {
        // Create new famille
        await axios.post('http://localhost:8000/api/familles', newFamille, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage("Famille ajoutée avec succès");
      }

      fetchFamilles();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de l'opération");
    } finally {
      setLoading(false);
    }
  };

  // Delete famille
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette famille ?")) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/familles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage("Famille supprimée avec succès");
      fetchFamilles();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // Edit famille
  const handleEdit = (famille) => {
    setNewFamille({
      nom_famille: famille.nom_famille,
      valeur_trieur: famille.valeur_trieur
    });
    setEditingId(famille.id_famille);
    setOpenModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewFamille({ nom_famille: '', valeur_trieur: '' });
    setEditingId(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Familles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
        >
          Ajouter une famille
        </Button>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Familles Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="familles table">
            <TableHead>
              <TableRow>
                <TableCell>Nom de la famille</TableCell>
                <TableCell align="right">Valeur trieur</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {familles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Aucune famille disponible
                  </TableCell>
                </TableRow>
              ) : (
                familles.map((famille) => (
                  <TableRow key={famille.id_famille}>
                    <TableCell>{famille.nom_famille}</TableCell>
                    <TableCell align="right">{famille.valeur_trieur}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Modifier">
                        <IconButton onClick={() => handleEdit(famille)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton onClick={() => handleDelete(famille.id_famille)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
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
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">
              {editingId ? 'Modifier la famille' : 'Ajouter une nouvelle famille'}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <TextField
              label="Nom de la famille"
              name="nom_famille"
              value={newFamille.nom_famille}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Valeur trieur"
              name="valeur_trieur"
              type="number"
              value={newFamille.valeur_trieur}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ step: "0.01" }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {editingId ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default FamillesContent;