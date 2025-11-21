
import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';

// Color tokens (ajouté depuis Familles.jsx)
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

export default function GestionTypeWagons() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Ajouté pour utiliser les tokens de couleur
  const [TypeWagons, setTypeWagons] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [filteredTypeWagons, setFilteredTypeWagons] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  // Snackbar state (ajouté depuis Familles.jsx)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'type_wagon', headerName: 'Type de Wagon', width: 200 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'color', headerName: 'Couleur', width: 150 ,
       renderCell: (params) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '4px',
          backgroundColor: params.value,
          border: '1px solid #ccc'
        }}
      />
      <span>{params.value}</span>
    </Box>
  )
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
            onClick={() => navigate(`/settings/type-wagons/edit/${params.row.id}`)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

 React.useEffect(() => {
  const fetchTypeWagons = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/type_wagons", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data; // l'API renvoie un tableau directement

      const sortedTypeWagons = data.sort((a, b) => b.id - a.id);

      setTypeWagons(sortedTypeWagons);
      setFilteredTypeWagons(sortedTypeWagons);
    } catch (err) {
      console.log(err);
      setError("Erreur chargement type wagons");
    } finally {
      setLoading(false);
    }
  };

  fetchTypeWagons();
}, []);



  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = TypeWagons.filter(wagon =>
      Object.values(wagon).some(field =>
        String(field).toLowerCase().includes(value)
      )
    );
    setFilteredTypeWagons(filtered);
  };

  const handleAddClick = () => navigate('/settings/type-wagons/add');

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:8000/api/type_wagons/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTypeWagons(prev => prev.filter(type_wagon => type_wagon.id!== deleteId));
        setFilteredTypeWagons(prev => prev.filter(type_wagon => type_wagon.id !== deleteId));
        setSnackbarMessage("Type Wagon supprimé avec succès");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setSnackbarMessage(err.response?.data?.message || 'Échec de la suppression');
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

  if (loading) return <div>Loading Type Wagons...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <SidebarChef initialPath="/settings/type-wagons">
      <Box m="30px">
        <Header
          title="Gestion des Types de Wagons"
          subtitle="Liste des types de wagons"
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
              height: 15,
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
              Add Type Wagon
            </Button>
          </Box>

          <DataGrid
            rows={filteredTypeWagons}
            columns={columns}
            loading={loading}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.id}
            components={{ Toolbar: GridToolbar }} // Ajouté depuis Familles.jsx
          />

          <Dialog open={openDialog} onClose={handleCancelDelete}>
            <DialogTitle>Are you sure you want to delete this Type Wagon?</DialogTitle>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Ajout du Snackbar depuis Familles.jsx */}
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