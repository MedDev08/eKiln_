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
import Sidebar from '../../components/layout/sidebar';
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
    { field: 'Role', headerName: 'Role', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 1000,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => navigate(`/manage-users/edit/${params.row.id}`)}
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

  const handleAddClick = () => navigate('/manage-users/add');
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
    <Sidebar initialPath="/manage-users">
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
    </Sidebar>
  );
}
// import React, { useState, useEffect } from 'react';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import {
//   Box,
//   TextField,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogTitle,
//   DialogContent,
//   IconButton,
//   Typography,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
//   CircularProgress,
//   Chip,
//   OutlinedInput,
//   Checkbox,
//   ListItemText,
//   FormHelperText
// } from '@mui/material';
// import Sidebar from '../components/layout/sidebar';
// import axios from 'axios';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';
// import { createTheme, ThemeProvider } from '@mui/material/styles';


// const theme = createTheme({
//   components: {
//     MuiDataGrid: {
//       styleOverrides: {
//         columnHeaders: {
//           backgroundColor: '#1976d2', // Blue color for header
//           color: 'white',
//           fontSize: '1rem',
//         },
//         footerContainer: {
//           backgroundColor: '#1976d2', // Blue color for footer
//           color: 'black',
//         },
//         toolbarContainer: {
//           '& .MuiButton-text': {
//             color: 'black', // White text for toolbar buttons
//           },
//         },
//       },
//     },
//   },
// });
// // Header component
// const Header = ({ title, subtitle }) => (
//   <Box mb="30px">
//     <Typography variant="h5" fontWeight="bold" sx={{ m: "0 0 5px 0" }}>
//       {title}
//     </Typography>
//     <Typography variant="h7" color="textSecondary">
//       {subtitle}
//     </Typography>
//   </Box>
// );
// const ROLES = ['admin', 'chef d\'equipe', 'trieur', 'enfourneur'];

// export default function ManageUsers() {
//   const [users, setUsers] = useState([]);
//   const [searchText, setSearchText] = useState('');
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [deleteDialog, setDeleteDialog] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userDialog, setUserDialog] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [familles, setFamilles] = useState([]);

//   const [formData, setFormData] = useState({
//     Matricule: '',
//     Nom: '',
//     Prenom: '',
//     Role: '',
//     Password: ''
//   });
//   const [selectedFamilles, setSelectedFamilles] = useState([]);

//   // Fetch users and familles
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('token');
        
//         // Fetch users
//         const usersResponse = await axios.get('http://localhost:8000/api/users', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
        
//         if (usersResponse.data.success) {
//           const sortedUsers = usersResponse.data.data.sort((a, b) => b.id - a.id);
//           setUsers(sortedUsers);
//           setFilteredUsers(sortedUsers);
//         }

//         // Fetch familles
//         const famillesResponse = await axios.get('http://localhost:8000/api/familles', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setFamilles(famillesResponse.data);

//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle search
//   const handleSearch = (event) => {
//     const value = event.target.value.toLowerCase();
//     setSearchText(value);
//     const filtered = users.filter((user) =>
//       Object.values(user).some((field) =>
//         String(field).toLowerCase().includes(value)
//       ));
//     setFilteredUsers(filtered);
//   };

//   // Handle form input changes
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleFamilleChange = (event) => {
//     const { value } = event.target;
//     setSelectedFamilles(typeof value === 'string' ? value.split(',') : value);
//   };

//   // Open add user dialog
//   const handleAddClick = () => {
//     setEditMode(false);
//     setCurrentUserId(null);
//     setFormData({
//       Matricule: '',
//       Nom: '',
//       Prenom: '',
//       Role: '',
//       Password: ''
//     });
//     setSelectedFamilles([]);
//     setUserDialog(true);
//   };

//   // Open edit user dialog
//   const handleEditClick = (user) => {
//     setEditMode(true);
//     setCurrentUserId(user.id);
//     setFormData({
//       Matricule: user.Matricule,
//       Nom: user.Nom,
//       Prenom: user.Prenom,
//       Role: user.Role,
//       Password: ''
//     });
    
//     // If editing a trieur, fetch their polyvalences
//     if (user.Role === 'trieur') {
//       axios.get(`http://localhost:8000/api/polyvalences/${user.id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       }).then(response => {
//         setSelectedFamilles(response.data.map(p => p.id_famille));
//       });
//     } else {
//       setSelectedFamilles([]);
//     }
    
//     setUserDialog(true);
//   };

//   // Submit user form (add/edit)
//   const handleUserSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const token = localStorage.getItem('token');
//       const userData = {
//         ...formData,
//         matricule: formData.Matricule,
//         nom: formData.Nom,
//         prenom: formData.Prenom,
//         role: formData.Role,
//         password: formData.Password || undefined
//       };

//       let response;
      
//       if (editMode) {
//         // Edit existing user
//         response = await axios.put(`http://localhost:8000/api/users/${currentUserId}`, userData, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         // Update polyvalences if trieur
//         if (formData.Role === 'trieur') {
//           const currentPolyResponse = await axios.get(`http://localhost:8000/api/polyvalences/${currentUserId}`, {
//             headers: { Authorization: `Bearer ${token}` }
//           });
//           const currentPoly = currentPolyResponse.data.map(p => p.id_famille);
          
//           // Add new polyvalences
//           const toAdd = selectedFamilles.filter(f => !currentPoly.includes(f));
//           await Promise.all(toAdd.map(familleId => 
//             axios.post('http://localhost:8000/api/polyvalences', {
//               id_famille: familleId,
//               id_user: currentUserId
//             }, {
//               headers: { Authorization: `Bearer ${token}` }
//             })
//           ));
          
//           // Remove old polyvalences
//           const toRemove = currentPoly.filter(f => !selectedFamilles.includes(f));
//           await Promise.all(toRemove.map(familleId => {
//             const polyToDelete = currentPolyResponse.data.find(p => p.id_famille === familleId);
//             if (polyToDelete) {
//               return axios.delete(`http://localhost:8000/api/polyvalences/${polyToDelete.id_polyvalence}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//               });
//             }
//             return Promise.resolve();
//           }));
//         }
//       } else {
//         // Add new user
//         response = await axios.post('http://localhost:8000/api/users', userData, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         // Add polyvalences if trieur
//         if (formData.Role === 'trieur' && selectedFamilles.length > 0) {
//           const userId = response.data.id_user;
//           await Promise.all(selectedFamilles.map(familleId => 
//             axios.post('http://localhost:8000/api/polyvalences', {
//               id_famille: familleId,
//               id_user: userId
//             }, {
//               headers: { Authorization: `Bearer ${token}` }
//             })
//           ));
//         }
//       }

//       // Refresh users list
//       const usersResponse = await axios.get('http://localhost:8000/api/users', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUsers(usersResponse.data.data.sort((a, b) => b.id - a.id));
//       setFilteredUsers(usersResponse.data.data.sort((a, b) => b.id - a.id));
      
//       setUserDialog(false);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to save user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle user deletion
//   const handleDeleteClick = (id) => {
//     setDeleteId(id);
//     setDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       await axios.delete(`http://localhost:8000/api/users/${deleteId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setUsers(prev => prev.filter(user => user.id !== deleteId));
//       setFilteredUsers(prev => prev.filter(user => user.id !== deleteId));
//     } catch (err) {
//       setError(err.response?.data?.message || 'Delete failed');
//     } finally {
//       setDeleteDialog(false);
//       setDeleteId(null);
//     }
//   };

//   // Columns configuration
//   const columns = [
//     { field: 'id', headerName: 'ID', width: 100 },
//     { field: 'Matricule', headerName: 'Matricule', width: 200 },
//     { field: 'Nom', headerName: 'Nom', width: 200 },
//     { field: 'Prenom', headerName: 'Prenom', width: 200 },
//     { field: 'Role', headerName: 'Role', width: 200 },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 150,
//       sortable: false,
//       renderCell: (params) => (
//         <>
//           <IconButton color="primary" onClick={() => handleEditClick(params.row)}>
//             <EditIcon />
//           </IconButton>
//           <IconButton color="error" onClick={() => handleDeleteClick(params.row.id)}>
//             <DeleteIcon />
//           </IconButton>
//         </>
//       ),
//     },
//   ];

//   if (loading && users.length === 0) return <div>Loading users...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <Sidebar initialPath="/manage-users">
//          <ThemeProvider theme={theme}>
//       <Box m="30px">
//         {/* <Typography variant="h4" gutterBottom>
//           Manage Users
//         </Typography> */}
//              <Header
//           title="Manage Users"
//           subtitle="List of Users for Management"
//         />
//         <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
//           <TextField
//             variant="outlined"
//             placeholder="Search..."
//             value={searchText}
//             onChange={handleSearch}
//             fullWidth
//           />
//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={handleAddClick}
//           >
//             Add User
//           </Button>
//         </Box>

//         <Box sx={{ height: 600 }}>
//           <DataGrid
//             rows={filteredUsers}
//             columns={columns}
//             pageSize={10}
//             rowsPerPageOptions={[10]}
//             components={{ Toolbar: GridToolbar }}
//           />
//         </Box>

//         {/* Add/Edit User Dialog */}
//         <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="md" fullWidth>
//           <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
//           <DialogContent>
//             <Box component="form" onSubmit={handleUserSubmit} sx={{ mt: 2 }}>
//               <TextField
//                 fullWidth
//                 margin="normal"
//                 label="Matricule"
//                 name="Matricule"
//                 value={formData.Matricule}
//                 onChange={handleChange}
//                 required
//               />

//               <TextField
//                 fullWidth
//                 margin="normal"
//                 label="Nom"
//                 name="Nom"
//                 value={formData.Nom}
//                 onChange={handleChange}
//                 required
//               />

//               <TextField
//                 fullWidth
//                 margin="normal"
//                 label="Prenom"
//                 name="Prenom"
//                 value={formData.Prenom}
//                 onChange={handleChange}
//                 required
//               />
              
//               <FormControl fullWidth margin="normal" required>
//                 <InputLabel>Role</InputLabel>
//                 <Select
//                   name="Role"
//                   value={formData.Role}
//                   label="Role"
//                   onChange={handleChange}
//                 >
//                   {ROLES.map((role) => (
//                     <MenuItem key={role} value={role}>
//                       {role}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               {formData.Role !== 'trieur' && (
//                 <TextField
//                   fullWidth
//                   margin="normal"
//                   label={editMode ? 'New Password' : 'Password'}
//                   name="Password"
//                   type="password"
//                   value={formData.Password}
//                   onChange={handleChange}
//                   required={!editMode}
//                   helperText={editMode ? "Leave blank to keep current password" : ""}
//                 />
//               )}

//               {formData.Role === 'trieur' && (
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Polyvalence</InputLabel>
//                   <Select
//                     multiple
//                     value={selectedFamilles}
//                     onChange={handleFamilleChange}
//                     input={<OutlinedInput label="Polyvalence" />}
//                     renderValue={(selected) => (
//                       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                         {selected.map((value) => (
//                           <Chip 
//                             key={value} 
//                             label={familles.find(f => f.id_famille === value)?.nom_famille || value} 
//                           />
//                         ))}
//                       </Box>
//                     )}
//                   >
//                     {familles.map((famille) => (
//                       <MenuItem key={famille.id_famille} value={famille.id_famille}>
//                         <Checkbox checked={selectedFamilles.indexOf(famille.id_famille) > -1} />
//                         <ListItemText primary={famille.nom_famille} />
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   <FormHelperText>Sélectionnez les familles pour lesquelles ce trieur est polyvalent</FormHelperText>
//                 </FormControl>
//               )}

//               {error && (
//                 <Typography color="error" sx={{ mt: 2 }}>
//                   Error: {error}
//                 </Typography>
//               )}
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setUserDialog(false)}>Cancel</Button>
//             <Button onClick={handleUserSubmit} variant="contained" disabled={loading}>
//               {loading ? <CircularProgress size={24} /> : editMode ? 'Update' : 'Create'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Delete Confirmation Dialog */}
//         <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
//           <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
//           <DialogActions>
//             <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
//             <Button onClick={handleConfirmDelete} color="error" disabled={loading}>
//               {loading ? <CircularProgress size={24} /> : 'Delete'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//       </ThemeProvider>
//     </Sidebar>
//   );
// }