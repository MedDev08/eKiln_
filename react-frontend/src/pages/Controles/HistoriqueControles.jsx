import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  TextField,
  TablePagination,
  Tooltip,
  IconButton,
  Modal,
  Checkbox,
  Autocomplete
} from '@mui/material';

import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { 
  Refresh as RefreshIcon,
  Edit as EditIcon 
} from '@mui/icons-material';
export default function HistoriqueControles() {
  const [historique, setHistorique] = useState([]);
  const [fours, setFours] = useState([]);
  const [selectedFour, setSelectedFour] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [controleToDelete, setControleToDelete] = useState(null);
  const [successMessage , setSuccessMessage] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [controleToEdit, setControleToEdit] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [frequences, setFrequences] = useState([]);
  const [controles, setControles] = useState([]);
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const [filters, setFilters] = useState({
    dateFrom: firstDay,
    dateTo:'',
    frequence: '',
    controle: [],
    poste:'',
    matricule:''
  });

    useEffect(() => {
      const fetchFours = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/fours', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFours(res.data);
      };

      fetchFours();
    }, []);
   useEffect(() => {
      if (!selectedFour) return;

      const fetchFiltres = async () => {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:8000/api/controles/by-four/${selectedFour}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setFrequences(res.data.frequences || []);
        setControles(res.data.controles || []);
      };

      fetchFiltres();
    }, [selectedFour]);

    useEffect(() => {
        if (fours.length && !selectedFour) {
          setSelectedFour(fours[0].id_four);
        }
    }, [fours]);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const params = {
          page: page + 1,
          per_page: rowsPerPage,
          ...(selectedFour && { four: selectedFour }),
          ...(filters.dateFrom && { date_from: filters.dateFrom }),
          ...(filters.dateTo && { date_to: filters.dateTo }),
          ...(filters.frequence && { frequence: filters.frequence }),
          ...(filters.controle.length && {controles: filters.controle.map(c => c.id)}),
          ...(filters.poste && {poste:filters.poste}),
          ...(filters.matricule && {matricule:filters.matricule})
        };
     const histoRes= await axios.get('http://localhost:8000/api/historique-controles', {
            headers: { Authorization: `Bearer ${token}` },
            params,
          });

        setHistorique(histoRes.data.historiques.data);
        setTotal(histoRes.data.total);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    useEffect(()=>{
      fetchData();
    },[page, rowsPerPage, selectedFour]);

   const handleDeleteClick = (controle) => {
      setControleToDelete(controle);
      setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
      try {
        const token = localStorage.getItem('token');

       const res= await axios.delete(
          `http://localhost:8000/api/historique-controles/${controleToDelete.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setHistorique(prev =>
          prev.filter(c => c.id !== controleToDelete.id)
        );

        setDeleteDialogOpen(false);
        setControleToDelete(null);
        setSuccessMessage(res.data.message);

        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error(err);
      }
    };
    const confirmEdit = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.put(
          `http://localhost:8000/api/historique-controles/${controleToEdit.id}`,
          { valeur: editValue },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setHistorique(prev =>
          prev.map(h =>
            h.id === controleToEdit.id ? res.data.data : h
          )
        );

        setEditDialogOpen(false);
        setControleToEdit(null);
        setSuccessMessage(res.data.message);
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error(err);
      }
    };

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

     const handleResetFilters = () => {
      setFilters({ dateFrom: '', dateTo: '', frequence: '',controle: [], poste:'',matricule:'' });
      setPage(0);
    };
    const addOneMonth = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      date.setMonth(date.getMonth() + 1);
      // format YYYY-MM-DD
      return date.toISOString().split('T')[0];
    };
  return (
    <SidebarChef>
      <Box m={4}>
        <Typography variant="h4" mb={3}>
          Historique des contrôles
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {fours.map(four => {
            const isActive = Number(selectedFour) === four.id_four;

            return (
              <Button
                key={four.id_four}
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => {
                  setSelectedFour(four.id_four)
                  setPage(0);
                }}
                sx={{
                  borderRadius: '8px 8px 0 0',
                  backgroundColor: isActive ? '#3498db' : 'transparent',
                  color: isActive ? '#fff' : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive
                      ? '#2980b9'
                      : 'rgba(0,0,0,0.08)',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Four {four.num_four}
              </Button>
            );
          })}
        </Box>
        <Paper sx={{ p: 2, mb: 3, }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item >
              <TextField
                label="Date de début"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </Grid>
             <Grid item >
              <TextField
                label="Date de fin"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                 inputProps={{
                    min: filters.dateFrom,
                    max: addOneMonth(filters.dateFrom) 
                  }}
              />
            </Grid>
            <Grid item >
              <TextField
              // size="small"
              label="Poste"
              select
              SelectProps={{ native: true }}
              value={filters.poste}
              onChange={(e) =>
                setFilters({ ...filters, poste: e.target.value })
              }
              sx={{ width: 100 }}
            >
              <option value=""> </option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </TextField>
            </Grid>
            <Grid item >
             <Autocomplete
                options={frequences}
                value={filters.frequence || null}
                onChange={(e, newValue) =>
                  setFilters({ ...filters, frequence: newValue || "" })
                }
                sx={{ width: '130px' }}
                renderInput={(params) => (
                  <TextField {...params} label="Fréquence" />
                )}
              />
            </Grid>
            <Grid item >
             <Autocomplete
                multiple
                options={controles}
                getOptionLabel={(option) => option.libelle}
                value={filters.controle}
                onChange={(e, newValue) =>
                  setFilters({ ...filters, controle: newValue })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Contrôles" />
                )}
                sx={{ width: '300px' }}
              />
            </Grid>
            <Grid item >
              <TextField
                // size="small"
                label="Matricule"
                type="text"
                value={filters.matricule}
                onChange={(e) =>
                  setFilters({ ...filters, matricule: e.target.value })
                }
                sx={{ width: '160px' }}
              />
            </Grid>
            <Grid item >
              <Button
                variant="outlined"
                // startIcon={<RefreshIcon />}
                onClick={fetchData}
              >
                Filtrer
              </Button>
            </Grid>
            <Grid item >
              <Button
                variant="text"
                onClick={handleResetFilters}
                startIcon={<CloseIcon />}
              >
                Réinitialiser
              </Button>
          </Grid> 
          </Grid>    
       </Paper>
          <Paper> 
            {successMessage && (
                <Box sx={{ mb: 2 }}>
                  <Alert severity="success" variant="filled">
                    {successMessage}
                  </Alert>
                </Box>
              )} 
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contrôle</TableCell>
                  <TableCell align="center">Valeur</TableCell>
                  <TableCell>Fréquence</TableCell>
                  <TableCell>Poste</TableCell>
                  <TableCell>Date / Heure</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
                {loading ? (
                <Box sx={{p: 3, textAlign: 'center', mt: 5 }}>
                  <CircularProgress />
                </Box>
                ) : (
                  <>
              <TableBody>
                {historique.length > 0 ?(
                  historique.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>
                      {h.controle_four?.controle?.libelle ?? 'N/A'}
                    </TableCell>
                    
                    <TableCell align="center">
                      {h.controle_four?.controle?.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={Number(h.valeur) === 1}
                          readOnly
                        />
                      ) : (
                        h.valeur
                      )}
                    </TableCell>

                    <TableCell>
                      {h.controle_four?.controle?.frequence ?? 'N/A'}
                    </TableCell>

                    <TableCell>{h.poste ?? 'N/A'}</TableCell>

                    <TableCell>
                      {new Date(h.created_at).toLocaleString()}
                    </TableCell>

                    <TableCell>{h.user?.matricule ?? 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Modifier">
                          <IconButton
                            color="primary"
                            size="small"
                           onClick={() => {
                              setControleToEdit(h);
                              setEditValue(h.valeur);
                              setEditDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(h)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ):(
                <TableRow>
                    <TableCell colSpan={5} align="center">Aucun résultat</TableCell>
                  </TableRow>
                )}  
              </TableBody>
              
              </>
              )}
            </Table>
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
          </Paper>
      </Box>

        <Modal open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 500 },  // responsive
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              overflowY: "auto",
              maxHeight: "90vh",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Modifier le contrôle
            </Typography>

            <Typography mb={2}>
              {controleToEdit?.controle_four?.controle?.libelle}
            </Typography>

            {controleToEdit?.controle_four?.controle?.type === "checkbox" && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Checkbox
                  checked={Number(editValue) === 1}
                  onChange={(e) => setEditValue(e.target.checked ? 1 : 0)}
                />
                <Typography>
                  {Number(editValue) === 1 ? "Oui" : "Non"}
                </Typography>
              </Box>
            )}

            {["number", "text"].includes(controleToEdit?.controle_four?.controle?.type) && (
              <TextField
                fullWidth
                type={controleToEdit?.controle_four?.controle?.type}
                label="Valeur"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}
            <Grid container spacing={4} justifyContent="flex-end">
              <Grid item>
              <Button
                type="button"
                variant="outlined"
                color="error"
                  onClick={() => setEditDialogOpen(false)}
                >
                Annuler
              </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={confirmEdit}>
                Enregistrer
                </Button>
                </Grid>
              </Grid>
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
              width: 340,
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
              Voulez-vous vraiment supprimer ce contrôle ?
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
                sx={{ width: "45%" }}
              >
                Supprimer
              </Button>
            </Box>
          </Box>
        </Modal>
    </SidebarChef>
  );
}
