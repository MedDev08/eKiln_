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
} from "@mui/material";
import { 
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import SidebarChef from '../components/layout/SidebarChef';
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import ScatterGraph from './ScatterGraph';
const AnneauxPage = () => {
  const [anneauxNonTraites, setAnneauxNonTraites] = useState({});
  const [anneauxTraites, setAnneauxTraites] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAnneau, setSelectedAnneau] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFour, setSelectedFour] = useState(null); 
  const [showHistorique, setShowHistorique] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anneauxExport, setAnneauxExport] = useState([]);
  const [showChartModal, setShowChartModal] = useState(false);
  const [fours, setFours] = useState([]);
  const [filters, setFilters] = useState({
    dateTo:'',
    dateFrom:'',
    wagon: '',
    type_wagon:'',
    date_sortie: '', 
    user_cre: '',
    user_rep: '',
    date_entrer:'',
    gauche:'',
    droit:'',
  });

  // Fetch anneaux depuis l'API
  const fetchAnneaux = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
       const [response, foursRes ] = await Promise.all([
             axios.get(
                'http://localhost:8000/api/anneaux',
                { 
                  headers: { Authorization: `Bearer ${token}` },
                }
              ),
              axios.get("http://localhost:8000/api/fours", {
               headers: { Authorization: `Bearer ${token}` }
               }),
            ]);    
      setAnneauxNonTraites(response.data.anneauxParFour);
      setFours(foursRes.data);
    } catch (error) {
      console.error(error);
      setAnneauxNonTraites({});
    } finally {
      setLoading(false);
    }
  };
   useEffect(() => {
        fetchAnneaux();
      }, []);

  useEffect(() => {
    if (!selectedFour && fours.length > 0) {
      setSelectedFour(fours[0].num_four);
    }
  }, [fours]);

   const handleFilterChange = (field, value) => {
  setFilters((prev) => {
    let updated = { ...prev, [field]: value };

    if ((field === "date_sortie" || field === "date_entrer") && value) {
      setDateFrom('');
      setDateTo('');

      updated.dateFrom = '';
      updated.dateTo = '';
    }
    if ((field === "dateFrom" || field === "dateTo") && value) {
      updated.date_entrer = '';
      updated.date_sortie = '';
    }

    return updated;
  });
};

    const fetchHistorique = async (selectedFour) => {
      
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
      ...(filters.gauche && { gauche: filters.gauche }),
      ...(filters.droit && { droit: filters.droit }),
      ...(filters.date_sortie && { date_sortie: filters.date_sortie }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
    };
    const response = await axios.get(
      `http://localhost:8000/api/historique-anneaux/${selectedFour}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params
      }
    );
    if (!selectedFour) {
        const fours = Object.keys(response.data);
        if (fours.length > 0) setSelectedFour(fours[0]);
      }
    setAnneauxTraites(response.data.data.data);
    setAnneauxExport(response.data.Exporter);
    setTotal(response.data.total);
  } catch (error) {
    console.error(error);
    setAnneauxTraites({});
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
   if (selectedFour) { 
    fetchHistorique(selectedFour);
  }
  }, [page, rowsPerPage, dateFrom, dateTo , filters]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
    const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
    setPage(0);
  };
       
  const handleShowDetails = (anneau) => {
    setSelectedAnneau({
      id: anneau.id,            
      gauche: anneau.gauche,
      droit: anneau.droit,
      chargement: anneau.chargement,
      user_cre:anneau.user_cre,
      user_rep:anneau.user_rep,
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
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/anneaux/${selectedAnneau.chargement.id}/mesures`,
        { gauche: selectedAnneau.gauche, droit: selectedAnneau.droit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnneauxNonTraites(prev => {
        const four = selectedAnneau.chargement.four.num_four;

        return {
          ...prev,
          [four]: (prev[four] ?? []).map(a =>
            a.id === selectedAnneau.id ? response.data.anneau : a
          )
        };
      });
      fetchHistorique(selectedFour);
      fetchAnneaux();
      setShowModal(false);
      setSuccessMessage(response.data.message);
      setTimeout(() => setSuccessMessage(""), 4000);
      console.log("Anneaux",response);
    } catch (error) { 
      console.error(error.response?.data?.message || error.message);
    } finally{
      setIsSubmitting(false);
    }
  };
 const handleExportCSV = () => {
  if (!anneauxExport || anneauxExport.length === 0) return;

  const sep = ";";
  let csv = `Date${sep}Anneau Gauche${sep}Anneau Droit\n`;

  anneauxExport.forEach(a => {
    const date = a.chargement?.datetime_sortieEstime
      ? format(parseISO(a.chargement.datetime_sortieEstime), "dd/MM/yyyy", { locale: fr })
      : "-";
    csv += [date, a.gauche ?? "-", a.droit ?? "-"].join(sep) + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `anneaux_four_${selectedFour}_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};
const getShiftFromDate = (date) => {
  const h = date.getHours();

  if (h >= 6 && h < 14) return "P1";
  if (h >= 14 && h < 22) return "P2";
  return "P3";
};

const scatterDataFromAnneaux = anneauxExport
  .map(a => {
    const dateStr = a.chargement?.datetime_sortieEstime;
    if (!dateStr) return null;
    const date = new Date(dateStr.replace(' ', 'T'));
    const day = date.toLocaleDateString("fr-FR");
    const shift = getShiftFromDate(date);
    return { 
      x: `${day} ${shift}`,
       sortDate: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        shift === "P1" ? 6 : shift === "P2" ? 14 : 22
      ).getTime(),                      
      yGauche: Number(a.gauche) || 0,
      yDroit: Number(a.droit) || 0,
    };
  })
  .sort((a, b) => a.sortDate - b.sortDate); 
// console.log('scatterDataFromAnneaux',scatterDataFromAnneaux);
// console.log('selectedFour',selectedFour);
const anneauxNonTraitesAFour = selectedFour ? anneauxNonTraites[selectedFour] || [] : [];
  if (!showHistorique && loading) {
  return (
    <SidebarChef>
      <Box sx={{ width: '100%', p: 3, textAlign: 'center', mt: 5 }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Chargement en cours...</Typography>
      </Box>
    </SidebarChef>
  );
}
  return (
    <SidebarChef>
      
      <Box sx={{ width: '100%', p: 3 }}>
        {!showHistorique &&(
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Liste des Anneaux du Shift
        </Typography>)}

        {/* Bouton pour basculer historique */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant={showHistorique ? "contained" : "outlined"}
             onClick={() => {
                setShowHistorique(!showHistorique);
                if (!showHistorique) fetchHistorique(selectedFour);
              }}
            >
            {showHistorique ? "Masquer l'historique" : "Afficher l'historique"}
          </Button>
        </Box>
        {/* Sélection du four */}
       
       <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
       {fours.map((four) => {
          const isActive = selectedFour === four.num_four;

          return (
            <Button
              key={four.num_four}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => {
                setSelectedFour(four.num_four);
                if (showHistorique) fetchHistorique(four.num_four);
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
        {successMessage && (
          <Alert severity="success" variant="filled" sx={{ mb: 2, borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}
     {!showHistorique ? (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>Anneaux non traités</Typography>
              <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>N° Wagon</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Four</TableCell>
                  <TableCell>Date Entrée</TableCell>
                  <TableCell>Sortie estimée</TableCell>
                  <TableCell>Anneau Gauche</TableCell>
                  <TableCell>Anneau Droit</TableCell>
                  <TableCell>Validé par</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {anneauxNonTraitesAFour.length > 0 ? anneauxNonTraitesAFour.map(a => (
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
                    <TableCell>{a.gauche ?? 'Non rempli'}</TableCell>
                    <TableCell>{a.droit ?? 'Non rempli'}</TableCell>
                    <TableCell>{a.user_cre?.matricule || '-'}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => handleShowDetails(a)}>
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ fontStyle: 'italic' }}>
                      Aucun résultat
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </>
          ) : (
            <>
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
                        <Button variant="contained" color="success" onClick={handleExportCSV} sx={{mr:2}}>
                            Exporter CSV
                          </Button>
                        <Button
                          variant="contained"
                          onClick={() => setShowChartModal(true)}
                          sx={{mr:2}}
                        >
                          Afficher le graphique
                        </Button>
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
              <Typography variant="h6" sx={{ mt: 2 }}>Historique des anneaux traités</Typography>
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
                          <TableCell> Gauche
                            <TextField
                              variant="standard"
                              value={filters.gauche}
                              onChange={(e) => handleFilterChange('gauche', e.target.value)}
                              placeholder="Filtrer..."
                            />
                          </TableCell>
                          <TableCell> Droit
                            <TextField
                              variant="standard"
                              value={filters.droit}
                              onChange={(e) => handleFilterChange('droit', e.target.value)}
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
                          {anneauxTraites.length > 0 ? (
                          anneauxTraites.map(a => (
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
                              <TableCell>{a.gauche ?? 'Non rempli'}</TableCell>
                              <TableCell>{a.droit ?? 'Non rempli'}</TableCell>
                              <TableCell>{a.user_cre?.matricule || '-'}</TableCell>
                              <TableCell>{a.user_rep?.matricule || '-'}</TableCell>
                              <TableCell>
                                <Button variant="outlined" size="small" onClick={() => handleShowDetails(a)}>
                                  Éditer
                                </Button>
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
            </>
          )}
        </Box>
        [{/* MODAL */}]
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
                    <Typography variant="subtitle2">Type Wagon :</Typography>
                    <Chip
                      label={selectedAnneau.chargement.type_wagon?.type_wagon || 'N/A'} 
                      sx={{
                        backgroundColor: selectedAnneau.chargement.type_wagon?.color || '#ccc',
                        color: '#fff', fontWeight: 'bold'
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Four :</Typography>
                    <Typography>{selectedAnneau.chargement.four?.num_four || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Total pièces :</Typography>
                    <Typography>{selectedAnneau.chargement.details.reduce((sum, d) => d.famille?.active === 1 ? sum + Number(d.quantite) : sum, 0)}</Typography>
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
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Validé par :</Typography>
                    <Typography>{selectedAnneau.user_cre?.matricule || '-'}</Typography>
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
                  disabled={!selectedAnneau?.gauche || !selectedAnneau?.droit }
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
        <Modal
          open={showChartModal}
          onClose={() => setShowChartModal(false)}
        >
          <Box sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Graphique des anneaux</Typography>
                <IconButton  onClick={() => setShowChartModal(false)}>
                  <CloseIcon />
                </IconButton>
            </Box>
             <Box
              sx={{
                flex: 1,
                overflow: "auto",
              }}
            >
            {scatterDataFromAnneaux.length > 0 ? (
              <ScatterGraph 
                data={scatterDataFromAnneaux}
              />
            ) : (
              <Typography>Aucune donnée à afficher</Typography>
            )}
          </Box>
          </Box>
        </Modal>
    </SidebarChef>
  );
};

export default AnneauxPage;
