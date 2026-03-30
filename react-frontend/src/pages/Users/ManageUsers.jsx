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
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';

// Color tokens
const tokens = (mode) => ({
    // Universal Gray Scale
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

    // Universal Primary Colors
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

    // Universal Accent Colors
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

    // Universal Functional Colors
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

// Header component
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

export default function EnhancedDataGrid() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [filteredUsers, setFilteredUsers] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'Matricule', headerName: 'Matricule', width: 200 },
    { field: 'Nom', headerName: 'Nom', width: 200 },
    { field: 'Prenom', headerName: 'Prenom', width: 200 },
    { field: 'Role', headerName: 'Role', width: 150 },
    {
      field: 'Service',
      headerName: 'Service',
      width: 200,
      // valueGetter: (params) => params?.nom_service || '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => navigate(`/settings/manage-users/edit/${params.row.id}`)}
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
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      
      const response = await axios.get('http://localhost:8000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // if (response.data.success) {
      //   setUsers(response.data.data);
      //   setFilteredUsers(response.data.data);
      // }
      if (response.data.success) {
        const sortedUsers = response.data.data.sort((a, b) => b.id - a.id); // tri du plus récent au plus ancien
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      }
      
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, [navigate]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = users.filter((user) =>
      Object.values(user).some((field) =>
        String(field).toLowerCase().includes(value)
      ));
    setFilteredUsers(filtered);
  };

  const handleAddClick = () => navigate('/settings/manage-users/add');
  const handleDeleteClick = (id) => { setDeleteId(id); setOpenDialog(true); };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/users/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(user => user.id !== deleteId));
      setFilteredUsers(prev => prev.filter(user => user.id !== deleteId));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setOpenDialog(false);
      setDeleteId(null);
    }
  };
  const handleCancelDelete = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <SidebarChef initialPath="/manage-users">
      <Box m="30px">
        <Header
          title="Manage Users"
          subtitle="List of Users for Management"
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

            "& .MuiDataGrid-columnHeader": { // Target individual header cells
              backgroundColor: colors.blueAccent[700],

              "& .MuiDataGrid-columnHeaderTitle": {
                color: colors.grey[100], // Header text color
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
            backgroundColor: colors.grey[100], // Row background

            '&:hover': {
              backgroundColor: colors.grey[200], // Hover state
            },
            '&.Mui-selected': {
              backgroundColor: colors.grey[300], // Selected row
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
                // backgroundColor: colors.blueAccent[100],
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
              Add User
            </Button>
          </Box>

          <DataGrid
            rows={filteredUsers}
            columns={columns}
            loading={loading}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            components={{ Toolbar: GridToolbar }}
          />

          <Dialog open={openDialog} onClose={handleCancelDelete}>
            <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </SidebarChef>
  );
}
