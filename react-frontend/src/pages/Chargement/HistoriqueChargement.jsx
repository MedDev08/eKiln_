import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  TextField,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Modal,
  CircularProgress,
  Autocomplete,
  Select,
  Alert,
  MenuItem, Dialog,          
  DialogTitle,      
  DialogContent,   
  DialogActions,    
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterAlt as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  DateRange as DateRangeIcon,
  Edit as EditIcon ,
  Warning as WarningIcon 
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import SidebarChef from '../../components/layout/SidebarChef';

const HistoriqueChargement = () => {
  const [chargements, setChargements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedChargement, setSelectedChargement] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [familles, setFamilles] = useState([]);
  const [fours, setFours] = useState([]);
  const [wagons, setWagons] = useState([]);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const [chargementToDelete, setChargementToDelete] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false); // pour l'édition
  // null = tri par défaut, 'desc' = décroissant, 'asc' = croissant
  const [piecesSortOrder, setPiecesSortOrder] = useState(null);
  const [filters, setFilters] = useState({
    datetime_chargement: '',
    wagon: '',
    date: '',
    four: '',
    pieces: '',
    statut: '',
    datetime_sortieEstime: '', // 
    matricule: '',
    shift: ''
  });
  const [editFormData, setEditFormData] = useState({
    wagon_id: "",
    four_id: "",
    datetime_chargement: "",
    statut: "",
    familles: [] // [{ id_famille, quantite }]
  });
  // Ouvrir le formulaire avec les données existantes
  const handleEdit = (chargement) => {
    setEditFormData({
      wagon_id: chargement.wagon?.id_wagon || "",
      four_id: chargement.four?.id_four || "",
      datetime_chargement: chargement.datetime_chargement?.slice(0, 10) || "",
      statut: chargement.statut || "",
      familles: chargement.details.map(d => ({
        id_famille: d.famille?.id_famille,
        nom_famille: d.famille?.nom_famille,
        quantite: d.quantite
      }))
    });
  setSelectedChargement(chargement);
  setShowEditModal(true);
  setEditError('');
  setEditSuccess(false);
};
// const handleDelete = async (id) => {
//   if (!window.confirm("Voulez-vous vraiment supprimer ce chargement ?")) return;

//   try {
//     const token = localStorage.getItem("token");
//     const response =await axios.delete(`http://localhost:8000/api/chargements/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     // Supprime le chargement du tableau local
//     setChargements(prev => prev.filter(c => c.id !== id));
//     // Afficher le message renvoyé par Laravel
//     const message = response.data?.message || "Chargement supprimé avec succès ✅";
//     alert(message);
//   } catch (err) {
//     console.error(err);
//    const message = err.response?.data?.message || "Erreur lors de la suppression du chargement.";
//     alert(message);
//   }
// };
// // Gérer la saisie
// const handleEditChange = (e) => {
//   setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
// };
const fetchInitialData = async () => {
  try {
    const token = localStorage.getItem("token");
    const [famillesRes, foursRes, wagonsRes] = await Promise.all([
      axios.get("http://localhost:8000/api/familles", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:8000/api/fours", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:8000/api/wagons1", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    setFamilles(famillesRes.data);
    setFours(foursRes.data);
    setWagons(wagonsRes.data.data);
  } catch (err) {
    console.error("Erreur fetchInitialData :", err);
  }
};
useEffect(() => {
  fetchInitialData();
}, []);

const handleEditSubmit = async (e) => {
  e.preventDefault();
  setLoading(prev => ({ ...prev, submit: true }));
  setEditError('');
  setEditSuccess(false);
  setLoadingSubmit(true);

  try {
    const token = localStorage.getItem("token");
    const payload = {
      id_wagon: editFormData.wagon_id,
      id_four: editFormData.four_id,
      datetime_chargement: editFormData.datetime_chargement,
      statut: editFormData.statut,
     familles: editFormData.familles.map(f => ({
        id_famille: f.id_famille,
        quantite: f.quantite
      }))
    };
    const response = await axios.put(
      `http://localhost:8000/api/chargements/${selectedChargement.id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Mettre à jour le chargement sélectionné (modal détails)
  setSelectedChargement(response.data.data);
   console.log("reponse:",response.data.data);
   console.log("Total pièces :", response.data.data.details.reduce((sum, d) => sum + d.quantite, 0));
  const successMsg = response.data.message || "Chargement mis à jour avec succès ✅";
  setEditSuccess(successMsg);
  setEditError(""); // reset erreur
  console.log("message :", successMsg);

    // Mettre à jour le tableau principal
    setChargements(prev =>
      prev.map(c =>
        c.id === selectedChargement.id ? response.data.data : c
      )
    );
    setShowEditModal(false);
    fetchHistorique();
  } catch (err) {
    console.error(err);
    // récupère le message renvoyé par Laravel
    const message = err.response?.data?.message || "Impossible de mettre à jour ce chargement.";
    console.log("message :", message);
    setEditError(message);
  } finally {
    setLoading(prev => ({ ...prev, submit: false }));
    setLoadingSubmit(false);
  }
};
useEffect(() => {
  if (editError) {
    const timer = setTimeout(() => setEditError(''), 5000); // 3 secondes
    return () => clearTimeout(timer);
  }
}, [editError]);

useEffect(() => {
  if (editSuccess) {
    const timer = setTimeout(() => setEditSuccess(false), 5000); // 3 secondes
    return () => clearTimeout(timer);
  }
}, [editSuccess]);

const handleFilterChange = (field, value) => {
  setFilters((prev) => ({ ...prev, [field]: value }));
   if ((field === 'datetime_chargement' || field === 'datetime_sortieEstime') && value) {
    setDateFrom('');
    setDateTo('');
  }
};
 const fetchHistorique = async (sortOptions = {}) => {
  try {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    const params = {
      page: page + 1,
      per_page: rowsPerPage,
      search: searchTerm,
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
      ...(filters.wagon && { wagon: filters.wagon }),
      ...(filters.four && { four: filters.four }),
      ...(filters.pieces && { pieces: filters.pieces }), 
      ...(filters.statut && { statut: filters.statut }),
      ...(filters.datetime_sortieEstime && { datetime_sortieEstime: filters.datetime_sortieEstime }),
      ...(filters.datetime_chargement && { datetime_chargement: filters.datetime_chargement }),
      ...(filters.matricule && { matricule: filters.matricule }),
      ...(filters.shift && { shift: filters.shift }),
      ...sortOptions, // tri dynamique ici
    };

    const response = await axios.get('http://localhost:8000/api/chargements/historique', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });

    setChargements(response.data.data.data);
    setTotal(response.data.total);
  } catch (error) {
    console.error('Erreur:', error);
    setError("Erreur lors du chargement de l'historique");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchHistorique();
  }, [page, rowsPerPage, searchTerm, dateFrom, dateTo , filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const handleViewDetails = (chargement) => {
    setSelectedChargement(chargement);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en attente': return 'warning';
      case 'en cuisson': return 'info';
      case 'prêt à sortir': return 'success';
      case 'sorti': return 'default';
      default: return 'primary';
    }
  };

  return (
  <SidebarChef>
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Historique des Chargements
      </Typography>
      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par wagon, four ou statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />
              }}
            />
          </Grid> */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {/* <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 2 }}
            >
              Filtres
            </Button> */}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchHistorique}
            >
              Actualiser
            </Button>
          </Grid>
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Date de début"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={dateFrom}
                     onChange={(e) => {
                      setDateFrom(e.target.value);
                      if (e.target.value) {
                        setFilters((prev) => ({
                          ...prev,
                          datetime_chargement: '',
                          datetime_sortieEstime: ''
                        }));
                      }
                    }}
                    InputProps={{
                      startAdornment: <DateRangeIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Date de fin"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={dateTo}
                   onChange={(e) => {
                      setDateTo(e.target.value);
                      if (e.target.value) {
                        setFilters((prev) => ({
                          ...prev,
                          datetime_chargement: '',
                          datetime_sortieEstime: ''
                        }));
                      }
                    }}
                    InputProps={{
                      startAdornment: <DateRangeIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="text"
                    onClick={handleResetFilters}
                    startIcon={<CloseIcon />}
                  >
                    Réinitialiser
                  </Button>
                </Grid>
              </Grid>
            </Grid>
        </Grid>
      </Paper>
      {/* Tableau */}
        {editSuccess && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
              {editSuccess}
            </Alert>
          </Box>
        )}
      <Paper sx={{ overflow: 'hidden' }}>
          <>
            <TableContainer>
              <Table>
               <TableHead>
                    <TableRow>
                      <TableCell>
                    Date Chargement
                    <TextField
                      variant="standard"
                      type="date"
                      value={filters.datetime_chargement || ''}
                       onChange={(e) => handleFilterChange('datetime_chargement', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                  </TableCell>
                 <TableCell>
                    Shift
                    <select
                      value={filters.shift}
                      onChange={(event) => handleFilterChange('shift', event.target.value)}
                      style={{
                        width: 65,
                        height: 25,
                        backgroundColor: 'inherit', // prend la couleur de fond du <TableCell>
                        border: 'none',             // retire la bordure native
                        fontFamily: 'inherit',      // police du tableau
                        fontSize: 'inherit',        // taille de texte du tableau
                        color: 'inherit',           // couleur du texte
                        padding: '0 4px',           // ajuster le padding
                      }}
                    >
                      <option value="">Filtrer...</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                 </TableCell>
                      <TableCell>
                        Wagon
                        <TextField
                          variant="standard"
                          value={filters.wagon}
                          onChange={(e) => handleFilterChange('wagon', e.target.value)}
                          placeholder="Filtrer..."
                        />
                      </TableCell>
                      <TableCell>
                        Four
                        <TextField
                          variant="standard"
                          value={filters.four}
                          onChange={(e) => handleFilterChange('four', e.target.value)}
                          placeholder="Filtrer..."
                        />
                      </TableCell>
                      <TableCell>
                        Pièces
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {/* TextField pour filtrer */}
                          <TextField
                            variant="standard"
                            value={filters.pieces}
                            onChange={(e) => handleFilterChange('pieces', e.target.value)}
                            placeholder="Filtrer..."
                            sx={{ width: 60 }}
                          />
                          {/* Bouton tri cyclique */}
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                              let nextOrder;
                              if (piecesSortOrder === null) nextOrder = 'desc';
                              else if (piecesSortOrder === 'desc') nextOrder = 'asc';
                              else nextOrder = null; // retour au tri par défaut

                              setPiecesSortOrder(nextOrder);

                              if (nextOrder) {
                                fetchHistorique({ sort_field: 'total_pieces', sort_order: nextOrder });
                              } else {
                                fetchHistorique(); // tri par défaut
                              }
                            }}
                            sx={{ minWidth: '30px', padding: 0 }}
                          >
                            {piecesSortOrder === null ? '⇅' : piecesSortOrder === 'desc' ? '▲': '▼'}
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>
                        Statut
                        <TextField
                          variant="standard"
                          value={filters.statut}
                          onChange={(e) => handleFilterChange('statut', e.target.value)}
                          placeholder="Filtrer..."
                        />
                      </TableCell>
                      <TableCell>
                    Date sortie estimée
                    <TextField
                      variant="standard"
                      type="date"
                      value={filters.datetime_sortieEstime || ''}
                      onChange={(e) => handleFilterChange('datetime_sortieEstime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                      <TableCell>
                        Matricule
                        <TextField
                          variant="standard"
                          value={filters.matricule}
                          onChange={(e) => handleFilterChange('matricule', e.target.value)}
                          placeholder="Filtrer..."
                        />
                      </TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>
                  ) : (
                <TableBody>
                  {chargements.map((chargement) => (
                    <TableRow key={chargement.id}>
                      <TableCell>{formatDate(chargement.datetime_chargement)}</TableCell>
                      <TableCell>{chargement.shift || '-'}</TableCell>
                      <TableCell>{chargement.wagon?.num_wagon || 'N/A'}</TableCell>
                      <TableCell>{chargement.four?.num_four || 'N/A'}</TableCell>
                      <TableCell>
                        {chargement.details.reduce((sum, detail) => sum + detail.quantite, 0)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={chargement.statut} 
                          color={getStatusColor(chargement.statut)}
                          size="small"
                        />
                      </TableCell>
                       <TableCell>
                        {chargement.datetime_sortieEstime
                          ? formatDate(chargement.datetime_sortieEstime)
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {chargement.user?.matricule || "-"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Voir détails">
                        <IconButton onClick={() => handleViewDetails(chargement)} color="primary" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton color="secondary" 
                         size="small"
                        onClick={() => handleEdit(chargement)}>
                        <EditIcon />
                      </IconButton>
                      </Tooltip>
                      </Box>
                    </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
        )}
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
      </Paper>
            {/* Modal d'édition */}
                <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
              <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, bgcolor: "background.paper", boxShadow: 24, p: 4, borderRadius: 2 }}>
                 {editError && (
                    <Box sx={{ mb: 2 }}>
                      <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                        {editError}
                      </Alert>
                    </Box>
                  )}
                <Typography variant="h6" gutterBottom>Modifier le chargement #{selectedChargement?.id}</Typography>
                <form onSubmit={handleEditSubmit}>
          
                  {/* Wagon */}
                  <Autocomplete
                    options={wagons}
                    getOptionLabel={w => `${w.num_wagon} - Statut: ${w.statut}`}
                    value={wagons.find(w => w.id_wagon === editFormData.wagon_id) || null}
                    onChange={(e, newValue) => setEditFormData({...editFormData, wagon_id: newValue ? newValue.id_wagon : ''})}
                    renderInput={(params) => <TextField {...params} label="Wagon" required margin="normal" />}
                  />

                  {/* Four */}
                  <Select
                    fullWidth
                    value={editFormData.four_id || ''}
                    onChange={(e) => setEditFormData({...editFormData, four_id: e.target.value})}
                    margin="normal"
                  >
                    {fours.map(four => (
                      <MenuItem key={four.id_four} value={four.id_four}>
                        {four.num_four} - Cadence: {four.cadence}
                      </MenuItem>
                    ))}
                  </Select>
                 {/* Familles */}
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Familles et quantités</Typography>
                  <Box sx={{ mt: 1 }}> {/* juste un petit espace */}
                  {editFormData.familles.map((famille, index) => (
                    <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 1 }}>
                      {/* Autocomplete pour la famille */}
                      <Grid item>
                        <Autocomplete
                          freeSolo
                          options={familles.map(f => f.nom_famille)}
                          value={famille.nom_famille || ''}
                          onChange={(e, newValue) => {
                            const newFamilles = [...editFormData.familles];
                            const selected = familles.find(f => f.nom_famille === newValue);
                            newFamilles[index] = {
                              ...newFamilles[index],
                              id_famille: selected ? selected.id_famille : '',
                              nom_famille: newValue
                            };
                            setEditFormData({ ...editFormData, familles: newFamilles });
                          }}
                          onInputChange={(e, newInputValue) => {
                            const newFamilles = [...editFormData.familles];
                            newFamilles[index] = { ...newFamilles[index], nom_famille: newInputValue };
                            setEditFormData({ ...editFormData, familles: newFamilles });
                          }}
                          renderInput={(params) => <TextField {...params} label="Famille" />}
                          sx={{ width: '250px' }} // largeur fixe
                        />
                      </Grid>

                      {/* Quantité */}
                      <Grid item>
                        <TextField
                          type="number"
                          value={famille.quantite}
                           onFocus={() => {
                            if (famille.quantite === 0 || famille.quantite === '0') {
                              const newFamilles = [...editFormData.familles];
                              newFamilles[index].quantite = '';
                              setEditFormData({ ...editFormData, familles: newFamilles });
                            }
                          }}
                          onBlur={() => {
                            if (famille.quantite === '' || famille.quantite === null) {
                              const newFamilles = [...editFormData.familles];
                              newFamilles[index].quantite = 0;
                              setEditFormData({ ...editFormData, familles: newFamilles });
                            }
                          }}
                           onChange={(e) => {
                             let value = e.target.value;
                            // Supprimer le "0" au début si l’utilisateur tape un autre chiffre
                            if (value.length > 1 && value.startsWith("0")) {
                              value = value.replace(/^0+/, "");
                            }
                            const newFamilles = [...editFormData.familles];
                            newFamilles[index].quantite = value === "" ? "" : parseInt(value);
                            setEditFormData({ ...editFormData, familles: newFamilles });
                          }}
                          sx={{ width: '50%' }} // largeur fixe
                        />
                      </Grid>

                      {/* Supprimer */}
                      <Grid item>
                        <IconButton color="error" onClick={() => setConfirmDeleteIndex(index)}>
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  </Box>
                  {/* Dialog confirmation suppression */}
                  <Dialog
                    open={confirmDeleteIndex !== null}
                    onClose={() => setConfirmDeleteIndex(null)}
                  >
                    <DialogTitle>Confirmer la suppression</DialogTitle>
                    <DialogContent>
                      <Typography>
                        Êtes-vous sûr de vouloir supprimer la famille "
                        {confirmDeleteIndex !== null && editFormData.familles[confirmDeleteIndex].nom_famille}" ?
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setConfirmDeleteIndex(null)} color="primary">
                        Annuler
                      </Button>
                      <Button
                        onClick={() => {
                          const newFamilles = editFormData.familles.filter(
                            (_, i) => i !== confirmDeleteIndex
                          );
                          setEditFormData({ ...editFormData, familles: newFamilles });
                          setConfirmDeleteIndex(null);
                        }}
                        color="error"
                        variant="contained"
                      >
                        Supprimer
                      </Button>
                    </DialogActions>
                  </Dialog>
                 <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="button"
                  onClick={() =>
                    setEditFormData({
                      ...editFormData,
                      familles: [...editFormData.familles, { id_famille: '', nom_famille: '', quantite: 0 }]
                    })
                  }
                >
                  Ajouter une famille
                </Button>

                <Button type="submit" variant="contained" disabled={loadingSubmit}>
                  {loadingSubmit ? <CircularProgress size={24} /> : 'Enregistrer'}
                </Button>
                
                {/* Bouton Annuler */}
               <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={() => setShowEditModal(false)}
                >
                Annuler
                </Button>
              </Box>
                </form>
              </Box>
            </Modal>
                  {/* Modal de détails */}
            <Modal open={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                maxHeight: '80vh',
                overflowY: 'auto',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2
              }}>
                {selectedChargement && (
                  <>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6">Détails du chargement #{selectedChargement.id}</Typography>
                      <IconButton onClick={() => setShowDetailsModal(false)}>
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Wagon:</Typography>
                        <Typography>{selectedChargement.wagon?.num_wagon || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Four:</Typography>
                        <Typography>{selectedChargement.four?.num_four || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Date Chargement:</Typography>
                        <Typography>{formatDate(selectedChargement.datetime_chargement)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Statut:</Typography>
                        <Chip 
                          label={selectedChargement.statut} 
                          color={getStatusColor(selectedChargement.statut)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Enregistré par:</Typography>
                        <Typography>
                          {selectedChargement.user?.nom} {selectedChargement.user?.prenom}  <stong>{selectedChargement.user?.matricule}</stong>
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Total pièces:</Typography>
                        <Typography>
                          {selectedChargement.details.reduce((sum, detail) => sum + detail.quantite, 0)}
                        </Typography>
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
                          {selectedChargement.details && selectedChargement.details.length > 0 ? (
                            selectedChargement.details.map((detail, index) => (
                              <TableRow key={index}>
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
                  </>
                )}
              </Box>
            </Modal>

    </Box>
  </SidebarChef>
  );
};

export default HistoriqueChargement;