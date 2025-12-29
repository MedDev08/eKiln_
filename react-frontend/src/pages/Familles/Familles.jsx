
import * as React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  useTheme,
  Typography,
  Snackbar,
  Alert,
  Switch,
  DialogContent,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';

// Color tokens
const tokens = (mode) => ({
  grey: {
    100: mode === "dark" ? "#0a0a0a" : "#f8f9fa",
    200: mode === "dark" ? "#1a1a1a" : "#e9ecef",
    300: mode === "dark" ? "#2a2a2a" : "#dee2e6",
    400: mode === "dark" ? "#3a3a3a" : "#ced4da",
    500: mode === "dark" ? "#4a4a4a" : "#adb5bd",
    600: mode === "dark" ? "#5a5a5a" : "#6c757d",
    700: mode === "dark" ? "#6a6a6a" : "#495057",
    800: mode === "dark" ? "#7a7a7a" : "#343a40",
    900: mode === "dark" ? "#8a8a8a" : "#212529"
  },
  primary: {
    100: mode === "dark" ? "#d0d1d5" : "#2b2d42",
    200: mode === "dark" ? "#a1a4ab" : "#404467",
    300: mode === "dark" ? "#727681" : "#565a8c",
    400: mode === "dark" ? "#434957" : "#6c70b1",
    500: mode === "dark" ? "#141b2d" : "#8d93d6",
    600: mode === "dark" ? "#101624" : "#a8adf0",
    700: mode === "dark" ? "#0c101b" : "#c3c6fd",
    800: mode === "dark" ? "#080b12" : "#dfe0fe",
    900: mode === "dark" ? "#040509" : "#f0f1ff"
  },
  blueAccent: {
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e"
  },
  redAccent: {
    100: "#fee2e2",
    500: "#ef4444",
    900: "#7f1d1d"
  },
  greenAccent: {
    100: "#dcfce7",
    500: "#22c55e",
    900: "#14532d"
  }
});

const Header = ({ title, subtitle }) => (
  <Box mb="30px">
    <Typography variant="h5" fontWeight="bold" sx={{ m: "0 0 5px 0" }}>
      {title}
    </Typography>
    <Typography variant="h7" color="textSecondary">
      {subtitle}
    </Typography>
  </Box>
);

export default function Familles() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [familles, setFamilles] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [filteredFamilles, setFilteredFamilles] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isSubmitting, setIsSubmitting] = React.useState(false); 

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
  const [openActiveDialog, setOpenActiveDialog] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState(null);
  const [newActive, setNewActive] = React.useState(false);

  
  const columns = [
    { field: 'id_famille', headerName: 'ID', width: 100 },
    { field: 'nom_famille', headerName: 'Nom Famille', width: 350 },
    { field: 'valeur_trieur', headerName: 'Valeur Trieur', width: 250 },
    { field: 'active',
      headerName: 'Active',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Switch
          checked={Boolean(params.value)}
          color="success" 
          size="small"
          onChange={() => {
        setCurrentRow(params.row);
        setNewActive(!params.value);
        setOpenActiveDialog(true);
        }}
         
        />
      ),
     
    }, 
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => navigate(`/settings/familles/edit/${params.row.id_famille}`)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.id_famille)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  React.useEffect(() => {
    const fetchFamilles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        
        const response = await axios.get('http://localhost:8000/api/familles', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const sortedFamilles = response.data.sort((a, b) => b.id_famille - a.id_famille);
        setFamilles(sortedFamilles);
        setFilteredFamilles(sortedFamilles);

        
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          console.error('Error fetching familles:', err);
          setError('Failed to fetch familles');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFamilles();
  }, [navigate]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = familles.filter((famille) =>
      Object.values(famille).some((field) =>
        String(field).toLowerCase().includes(value)
      ));
    setFilteredFamilles(filtered);
  };

  const handleAddClick = () => navigate('/settings/familles/add');
  const handleDeleteClick = (id) => { setDeleteId(id); setOpenDialog(true); };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/familles/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilles(prev => prev.filter(famille => famille.id_famille !== deleteId));
      setFilteredFamilles(prev => prev.filter(famille => famille.id_famille !== deleteId));
      setSnackbarMessage("Famille supprimée avec succès");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Delete failed:', err);
      setSnackbarMessage(err.response?.data?.message || "Échec de la suppression");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setOpenDialog(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  if (loading) return <div>Loading familles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <SidebarChef initialPath="/settings/familles">
      <Box m="30px">
        <Header
          title="Manage Familles"
          subtitle="List of Familles for Management"
        />
        <Box
          mt="25px"
          height="55vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              border: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.primary[700],
              borderBottom: "none",
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: colors.blueAccent[700],
                "& .MuiDataGrid-columnHeaderTitle": {
                  color: colors.grey[100],
                  fontWeight: "bold",
                },
              },
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
              height:15,
            },
            "& .MuiDataGrid-row": {
              backgroundColor: colors.grey[100],
              '&:hover': {
                backgroundColor: colors.grey[200],
              },
              '&.Mui-selected': {
                backgroundColor: colors.grey[300],
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              variant="outlined"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
              fullWidth
              sx={{
                borderRadius: '4px',
                '& .MuiInputBase-input': { color: colors.blueAccent[900] },
              }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.blueAccent[300],
                '&:hover': { backgroundColor: colors.blueAccent[600] },
              }}
              onClick={handleAddClick}
            >
              Add Famille
            </Button>
          </Box>

          <DataGrid
            rows={filteredFamilles}
            columns={columns}
            loading={loading}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.id_famille}
            components={{ Toolbar: GridToolbar }}
          />
          <Dialog
            open={openActiveDialog}
            onClose={() => setOpenActiveDialog(false)}
            maxWidth="xs" // tu peux mettre 'sm' ou 'md' si tu veux plus grand
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
              Confirmer la modification
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', fontSize: 16 }}>
              Êtes-vous sûr de vouloir{' '}
              <span style={{ fontWeight: 'bold', color: newActive ? 'green' : 'red' }}>
                {newActive ? 'activer' : 'désactiver'}
              </span>{' '}
              cette famille ?
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', paddingBottom: 3 }}>
              <Button
                onClick={() => setOpenActiveDialog(false)}
                variant="outlined"
                sx={{ marginRight: 2 }}
              >
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    await axios.put(
                      `http://localhost:8000/api/familles/${currentRow.id_famille}`,
                      {
                        nom_famille: currentRow.nom_famille,
                        valeur_trieur: currentRow.valeur_trieur,
                        active: newActive ? 1 : 0,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    // mettre à jour le tableau
                    currentRow.active = newActive;
                    setFamilles(prev => [...prev]);
                    setFilteredFamilles(prev => [...prev]);
                    setSnackbarMessage(`Famille ${newActive ? 'activée' : 'désactivée'} avec succès !`);
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                  } catch (err) {
                    console.error(err);
                    setSnackbarMessage("Impossible de modifier l'état actif");
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  } finally {
                    setOpenActiveDialog(false);
                    setIsSubmitting(false);
                  }
                }}
                variant="contained"
                sx={{
                  backgroundColor: newActive ? 'green' : 'red',
                  '&:hover': { backgroundColor: newActive ? '#006400' : '#8B0000' },
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {isSubmitting ? (
                <CircularProgress size={24} color="inherit" /> // spinner dans le bouton
                ) : (
                  "Confirmer"
                )}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog open={openDialog} onClose={handleCancelDelete}>
            <DialogTitle>Are you sure you want to delete this famille?</DialogTitle>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setSnackbarOpen(false)} 
              severity={snackbarSeverity} 
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </SidebarChef>
  );
}
