import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert
} from "@mui/material";
import SidebarChef from '../components/layout/SidebarChef';
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const AnneauxPage = () => {
  const [anneaux, setAnneaux] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAnneau, setSelectedAnneau] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
   const [selectedFour, setSelectedFour] = useState(null);

  const fetchAnneaux = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8000/api/anneaux',
        { headers: { Authorization: `Bearer ${token}` } }
      );
     setAnneaux(response.data.anneauxParFour);
      // Si aucun four sélectionné, prendre le premier disponible
      if (!selectedFour) {
        const fours = Object.keys(response.data.anneauxParFour);
        if (fours.length > 0) setSelectedFour(fours[0]);
      }
    } catch (error) {
      console.error(error);
      setAnneaux({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnneaux();
  }, []);

  const handleShowDetails = (anneau) => {
    setSelectedAnneau({
    id: anneau.id,            
    gauche: anneau.gauche,
    droit: anneau.droit,
    chargement: anneau.chargement
  });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAnneau(null);
  };

  const formatDate = (dateString) =>
    dateString ? format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: fr }) : "-";

  const getStatusColor = (status) => {
    switch (status) {
      case "en attente": return "warning";
      case "en cuisson": return "info";
      case "sorti": return "success";
      default: return "default";
    }
  };

  const handleSaveMeasures = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/anneaux/${selectedAnneau.id}/mesures`,
        { gauche: selectedAnneau.gauche, droit: selectedAnneau.droit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
     setAnneaux(prev => {
  const four = selectedAnneau.chargement.four.num_four;

  return {
    ...prev,
    [four]: (prev[four] ?? []).map(a =>
      a.id === selectedAnneau.id ? response.data.anneau : a
    )
  };
});

      setSuccessMessage(response.data.message);
      setShowModal(false);
      fetchAnneaux();
      setTimeout(() => setSuccessMessage(""), 4000);
      console.log("Anneaux",response);
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };
  const anneauxAFour = selectedFour ? anneaux[selectedFour] || [] : [];
  if (loading) return (
    <SidebarChef>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    </SidebarChef>
  );

  return (
    <SidebarChef>
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Liste des Anneaux du Shift
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
       {Object.keys(anneaux).map(num_four => {
          const isActive = selectedFour === num_four;
          return (
            <Button
              key={num_four}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => setSelectedFour(num_four)}
               sx={{
                  borderRadius: "8px 8px 0 0",
                  backgroundColor: isActive ? "#3498db" : "transparent",
                  color: isActive ? "#fff" : "inherit",
                  "&:hover": {
                    backgroundColor: isActive ? "#2980b9" : "rgba(0,0,0,0.08)",
                  },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
            >
              Four {num_four}
            </Button>
          );
        })}
      </Box>
        {successMessage && (
          <Alert severity="success" variant="filled" sx={{ mb: 2, borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>N° Wagon</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Four</TableCell>
                <TableCell>Sortie estimée</TableCell>
                <TableCell>Anneau Gauche</TableCell>
                <TableCell>Anneau Droit</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
               {anneauxAFour.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  Aucun chargement trouvé
                </TableCell>
              </TableRow>
            ) : anneauxAFour.map(a => (
                          <TableRow key={a.id} hover>
                  
                  <TableCell>{a.chargement?.wagon?.num_wagon || 'N/A'}</TableCell>
                  <TableCell>{a.chargement?.type_wagon?.type_wagon || 'N/A'}</TableCell>
                  <TableCell>{a.chargement?.four?.num_four || 'N/A'}</TableCell>
                  <TableCell> {formatDate(a.chargement.datetime_sortieEstime)}</TableCell>
                  <TableCell>{a.gauche ?? 'Non rempli'}</TableCell>
                  <TableCell>{a.droit ?? 'Non rempli'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleShowDetails(a)}>
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* MODAL */}
        <Modal open={showModal} onClose={handleCloseModal}>
          <Box sx={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 650,
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}>
            {selectedAnneau && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Chargement #{selectedAnneau.chargement.id}
                  </Typography>
                  <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Wagon :</Typography>
                    <Typography>{selectedAnneau.chargement.wagon?.num_wagon || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Four :</Typography>
                    <Typography>{selectedAnneau.chargement.four?.num_four || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Total pièces :</Typography>
                    <Typography>{selectedAnneau.chargement.details.reduce((sum, d) => sum + d.quantite, 0)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Date chargement :</Typography>
                    <Typography>{formatDate(selectedAnneau.chargement.datetime_chargement)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Statut :</Typography>
                    <Chip label={selectedAnneau.chargement.statut} color={getStatusColor(selectedAnneau.chargement.statut)} size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Sortie estimée :</Typography>
                    <Typography>{formatDate(selectedAnneau.chargement.datetime_sortieEstime)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Matricule :</Typography>
                    <Typography>{selectedAnneau.chargement.user?.matricule || '-'}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Détails des pièces</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Famille</TableCell>
                        <TableCell align="right">Quantité</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAnneau.chargement.details.length > 0 ? (
                        selectedAnneau.chargement.details.map((detail, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{detail.famille?.nom_famille || 'N/A'}</TableCell>
                            <TableCell align="right">{detail.quantite}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} align="center">Aucune famille associée</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Anneau Gauche"
                      type="number"
                      fullWidth
                      value={selectedAnneau.gauche ?? ''}
                      onChange={e => setSelectedAnneau({ ...selectedAnneau, gauche: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Anneau Droit"
                      type="number"
                      fullWidth
                      value={selectedAnneau.droit ?? ''}
                      onChange={e => setSelectedAnneau({ ...selectedAnneau, droit: e.target.value })}
                    />
                  </Grid>
                </Grid>
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  onClick={handleCloseModal}
                  color="primary"
                >
                  Annuler
                </Button>
                <Button
                  onClick= {handleSaveMeasures}
                  color="success"
                  variant="contained"
                >
                  Valider
                </Button>
              </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </SidebarChef>
  );
};

export default AnneauxPage;
