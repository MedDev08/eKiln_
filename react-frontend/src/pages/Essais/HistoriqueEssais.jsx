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
  Alert,
  TablePagination,
  Tooltip,
} from "@mui/material";
import { 
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  Edit as EditIcon ,
} from '@mui/icons-material';
import SidebarChef from '../../components/layout/SidebarChef';
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function HistoriqueEssais() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFour, setSelectedFour] = useState(null); 
  const [fours, setFours] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEssai, setSelectedEssai] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingFours, setIsLoadingFours] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
     wagon: "",
      type_wagon: "",
      four: "",
      date_entrer: "",
      date_sortie: "",
      valeur: "",
      user_cre: "",
      user_rep: "",
      essai: "",       
      service: "" 
    });

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
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
   
    const fetchFours = async () => {
    try{
      setIsLoadingFours(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/fours', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFours(res.data);
    }catch (error) {
        console.error(error);
      } finally {
        setIsLoadingFours(false);
      }
    };
    useEffect(() => {
         fetchFours();
       }, []);
    useEffect(() => {
        if (!selectedFour && fours.length > 0) {
            setSelectedFour(fours[0].num_four);
            fetchHistorique(fours[0].num_four);
        }
        }, [fours]);
       
       
    const fetchHistorique = async (selectedFour) => {
        if(!selectedFour) return;
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = {
        page: page + 1,
        per_page: rowsPerPage,
        ...(filters.wagon && { wagon: filters.wagon }),
        ...(filters.four && { four: filters.four }),
        ...(filters.type_wagon && { type_wagon: filters.type_wagon }),
        ...(filters.date_sortie && { date_sortie: filters.date_sortie }),
        ...(filters.user_cre && { user_cre: filters.user_cre }),
        ...(filters.user_rep && { user_rep: filters.user_rep }),
        ...(filters.date_entrer && { date_entrer: filters.date_entrer }),
        ...(filters.valeur && { valeur: filters.valeur }),
        ...(filters.date_sortie && { date_sortie: filters.date_sortie }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.essai && { essai: filters.essai }),
        ...(filters.service && { service: filters.service }),
        };
        const response = await axios.get(
        `http://localhost:8000/api/essais-historique/${selectedFour}`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params
        }
        );
        setData(response.data.data.data);
        setTotal(response.data.total);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
    };

 
    useEffect(() => {
        fetchHistorique(selectedFour);
    }, [page, rowsPerPage, filters,selectedFour]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };
  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
    setPage(0);
  };
         
  const handleShowDetails = (essai) => {
    setSelectedEssai({
      id: essai.id,            
      gauche: essai.gauche,
      droit: essai.droit,
      chargement: essai.chargement,
      user_cre:essai.user_cre,
      user_rep:essai.user_rep,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEssai(null);
  };
    const handleSaveValeur = async () => {
       try {
         setIsSubmitting(true);
         const token = localStorage.getItem("token");
         const response = await axios.post(
           `http://localhost:8000/api/essais/${selectedEssai.chargement.id}/valeur`,
           {  valeur: selectedEssai.valeur },
           { headers: { Authorization: `Bearer ${token}` } }
         );
         fetchHistorique(selectedFour);
         setShowModal(false);
         setSuccessMessage(response.data.message);
         setTimeout(() => setSuccessMessage(""), 4000);
       } catch (error) { 
         console.error(error.response?.data?.message || error.message);
       } finally{
         setIsSubmitting(false);
       }
     };
     const handleDeleteClick = (essai) => {
      setDeleteId(essai.id);
      setDeleteDialogOpen(true);
    };
     const confirmDelete = async () => {
        try {
          setIsDeleting(true);
          const token = localStorage.getItem("token");

         const res  = await axios.delete(
            `http://localhost:8000/api/detail-essais/${deleteId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
       
          setDeleteDialogOpen(false);
          setDeleteSuccess(res.data.message);

          fetchHistorique(selectedFour);

          setTimeout(() => setDeleteSuccess(""), 3000);

        } catch (error) {
          console.error(error);
        } finally {
          setIsDeleting(false); 
        }
      };

  if (isLoadingFours) {
      return (
        <SidebarChef>
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 2 }}>Chargement...</Typography>
          </Box>
        </SidebarChef>
      );
    }
  return (
    <SidebarChef>
    <Box p={3}>

      <Typography variant="h5" fontWeight="bold" mb={2}>
        📋 Historique des essais
      </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {fours.map((four) => {
            const isActive = selectedFour === four.num_four;

            return (
                <Button
                key={four.num_four}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => {
                    setSelectedFour(four.num_four);
                    fetchHistorique(four.num_four);
                }}
                sx={{
                    borderRadius: "8px 8px 0 0",
                    backgroundColor: isActive ? "#3498db" : "transparent",
                    color: isActive ? "#fff" : "inherit",
                    "&:hover": {
                    backgroundColor: isActive ? "#2980b9" : "rgba(0,0,0,0.08)",
                    },
                }}
                >
                Four {four.num_four}
                </Button>
            );
            })}
            </Box>

              <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                            const value = e.target.value;
                            setDateFrom(value);

                            handleFilterChange("dateFrom", value);
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
                            const value = e.target.value;
                            setDateTo(value);

                            handleFilterChange("dateTo", value);
                          }}
                          InputProps={{
                            startAdornment: <DateRangeIcon sx={{ mr: 1, color: 'action.active' }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={() => fetchHistorique(selectedFour)} 
                        >
                          Actualiser
                        </Button>
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
             {deleteSuccess && (
                <Alert severity="success" variant="filled" sx={{ mb: 2, borderRadius: 2 }}>
                  {deleteSuccess}
                </Alert>
              )}

            {successMessage && (
                <Alert severity="success" variant="filled" sx={{ mb: 2, borderRadius: 2 }}>
                  {successMessage}
                </Alert>
              )}
    
              <Typography variant="h6" sx={{ mt: 2 }}>Historique des essais</Typography>
                <Paper sx={{ overflow: 'hidden' }}>
                  <>
                    <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
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
                            Type
                            <TextField
                              variant="standard"
                              value={filters.type_wagon}
                              onChange={(e) => handleFilterChange('type_wagon', e.target.value)}
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
                          <TableCell>Date Entrée
                            <TextField
                              variant="standard"
                              type="date"
                              value={filters.date_entrer || ''}
                              onChange={(e) => handleFilterChange('date_entrer', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </TableCell>
                        <TableCell>Sortie estimée
                          <TextField
                              variant="standard"
                              type="date"
                              value={filters.date_sortie || ''}
                              onChange={(e) => handleFilterChange('date_sortie', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                        </TableCell>
                        <TableCell>
                          Essai
                          <TextField
                            variant="standard"
                            value={filters.essai}
                            onChange={(e) => handleFilterChange('essai', e.target.value)}
                            placeholder="Filtrer..."
                          />
                        </TableCell>

                        <TableCell>
                          Service
                          <TextField
                            variant="standard"
                            value={filters.service}
                            onChange={(e) => handleFilterChange('service', e.target.value)}
                            placeholder="Filtrer..."
                          />
                        </TableCell>
                          <TableCell> Valeur
                            <TextField
                              variant="standard"
                              value={filters.valeur}
                              onChange={(e) => handleFilterChange('valeur', e.target.value)}
                              placeholder="Filtrer..."
                            />
                          </TableCell>

                          <TableCell>
                            Validé par
                            <TextField
                            variant="standard"
                            value={filters.user_cre}
                            onChange={(e) => handleFilterChange('user_cre', e.target.value)}
                            placeholder="Filtrer..."
                          />
                          </TableCell>
                          <TableCell>
                          Rempli par
                            <TextField
                              variant="standard"
                              value={filters.user_rep}
                              onChange={(e) => handleFilterChange('user_rep', e.target.value)}
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
                        ) : (
                        <TableBody>
                          {data.length > 0 ? (
                            data.map(a => (
                            <TableRow key={a.id}>
                              <TableCell>{a.chargement?.wagon?.num_wagon || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={a.chargement?.type_wagon?.type_wagon || 'N/A'}
                                  sx={{
                                    backgroundColor: a.chargement?.type_wagon?.color || '#ccc',
                                    color: '#fff',
                                    fontWeight: 'bold'
                                  }}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{a.chargement?.four?.num_four || 'N/A'}</TableCell>
                              <TableCell>{formatDate(a.chargement?.date_entrer)}</TableCell>
                              <TableCell>{formatDate(a.chargement?.datetime_sortieEstime)}</TableCell>
                              <TableCell>{a.essai?.nom_essais || '-'}</TableCell>
                              <TableCell>{a.essai?.service?.nom_service || '-'}</TableCell>
                              <TableCell>{a.valeur ?? ' -'}</TableCell>
                              <TableCell>{a.user_cre?.matricule || '-'}</TableCell>
                              <TableCell>{a.user_rep?.matricule || '-'}</TableCell>
                              <TableCell>
                                 <Box sx={{ display: 'flex' }}>
                                    <Tooltip title="Modifier">
                                          <IconButton color="info" 
                                            size="small"
                                            onClick={() => handleShowDetails(a)}>
                                          <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <IconButton
                                          color="error"
                                          size="small"
                                          onClick={() => handleDeleteClick(a)}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                  </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={10} align="center" sx={{ fontStyle: 'italic' }}>
                              Aucun résultat
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                  <TablePagination
                      component="div"
                      count={total}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
              </Paper>
        </Box>
        {/* [MODAL */}
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
            {selectedEssai && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Chargement #{selectedEssai.chargement.id}
                  </Typography>
                  <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Wagon :</Typography>
                    <Typography>{selectedEssai.chargement.wagon?.num_wagon || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Type Wagon :</Typography>
                    <Chip
                      label={selectedEssai.chargement.type_wagon?.type_wagon || 'N/A'} 
                      sx={{
                        backgroundColor: selectedEssai.chargement.type_wagon?.color || '#ccc',
                        color: '#fff', fontWeight: 'bold'
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Four :</Typography>
                    <Typography>{selectedEssai.chargement.four?.num_four || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Total pièces :</Typography>
                    <Typography>{selectedEssai.chargement.details.reduce((sum, d) => d.famille?.active === 1 ? sum + Number(d.quantite) : sum, 0)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Date chargement :</Typography>
                    <Typography>{formatDate(selectedEssai.chargement.datetime_chargement)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Statut :</Typography>
                    <Chip label={selectedEssai.chargement.statut} color={getStatusColor(selectedEssai.chargement.statut)} size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Sortie estimée :</Typography>
                    <Typography>{formatDate(selectedEssai.chargement.datetime_sortieEstime)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Matricule :</Typography>
                    <Typography>{selectedEssai.chargement.user?.matricule || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Validé par :</Typography>
                    <Typography>{selectedEssai.user_cre?.matricule || '-'}</Typography>
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
                      {selectedEssai.chargement.details.length > 0 ? (
                        selectedEssai.chargement.details.map((detail, idx) => (
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
                      label="Valeur"
                      type="number"
                      fullWidth
                      value={selectedEssai.valeur ?? ''}
                      onChange={e => setSelectedEssai({ ...selectedEssai, valeur: e.target.value })}
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
                  onClick= {handleSaveValeur}
                  color="success"
                  variant="contained"
                  disabled={!selectedEssai?.valeur }
                >
                  {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Valider"
                )}      
                </Button>
              </Box>
              </>
            )}
          </Box>
        </Modal>
         <Modal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "white",
                p: 4,
                borderRadius: 3,
                width: 380,
                textAlign: "center",
                boxShadow: 24,
              }}
            >
              {/* Icône du point d'exclamation */}
              <Box 
                sx={{
                  bgcolor: "#fdecea",
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 45, color: "#d32f2f" }} />
              </Box>
  
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Confirmer la suppression
              </Typography>
  
              <Typography color="text.secondary" mb={3}>
                  Voulez-vous vraiment supprimer cet essai ?
              </Typography>
  
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setDeleteDialogOpen(false)}
                  sx={{ width: "45%" }}
                >
                  Annuler
                </Button>
  
                <Button
                  variant="contained"
                  color="error"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  sx={{ width: "45%" }}
                  >
                  {isDeleting ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Supprimer"
                  )}
                </Button>
              </Box>
            </Box>
          </Modal>
    </SidebarChef>
  );
}