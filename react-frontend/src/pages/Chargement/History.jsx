


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { format, parseISO } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import {
//   Box,
//   Typography,
//   Button,
//   ButtonGroup,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Grid,
//   Card,
//   CardContent,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   IconButton,
//   useMediaQuery,
//   useTheme
// } from '@mui/material';
// import { PieChart } from 'react-minimal-pie-chart';
// import CloseIcon from '@mui/icons-material/Close';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import HistoryIcon from '@mui/icons-material/History';
// import Sidebar from '../components/layout/sidebar'; // Assurez-vous d'avoir ce composant

// const HistoryPage = () => {
//   const [period, setPeriod] = useState('today');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [history, setHistory] = useState([]);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [openModal, setOpenModal] = useState(false);
//   const [exportData, setExportData] = useState(null);
  
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   useEffect(() => {
//     fetchHistory(period);
//   }, []);

//   const fetchHistory = async (periodValue) => {
//     setLoading(true);
//     setError('');
    
//     try {
//       // Get token from localStorage
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setError('Authentication required. Please login.');
//         setLoading(false);
//         return;
//       }

//       const params = {
//         period:periodValue,
//         ...(periodValue === 'personalized' && { 
//           start_date: startDate, 
//           end_date: endDate 
//         })
//       };

//       const response = await axios.get('http://localhost:8000/api/history', { 
//         params,
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
      
//       setHistory(response.data);
      
//       // Safely generate export data
//       if (response.data.length > 0) {
//         const firstItem = response.data[0];
//         setExportData({
//           chefMatricule: firstItem.chef?.matricule || 'N/A',
//           trieurMatricule: firstItem.trieur_matricule || 'N/A',
//           pieces: [
//             { nom: 'Cuvette', quantite: Math.floor(firstItem.total_piece * 0.6) },
//             { nom: 'Lave main', quantite: Math.floor(firstItem.total_piece * 0.3) },
//             { nom: 'Bâti support', quantite: Math.floor(firstItem.total_piece * 0.1) },
//           ],
//           total: firstItem.total_piece
//         });
//       }
//     } catch (err) {
//       setError('Erreur lors du chargement des données');
//       console.error('Fetch error:', err);
      
//       // Handle specific error cases
//       if (err.response && err.response.status === 401) {
//         setError('Session expired. Please login again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const changePeriod = (newPeriod) => {
//     setPeriod(newPeriod);
//     fetchHistory(newPeriod);
//   };

//   const formatDate = (dateString) => {
//     return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     fetchHistory(period);
//   };

//   const openDetailsModal = (item) => {
//     setSelectedItem(item);
//     setOpenModal(true);
//   };

//   return (
//     <Sidebar>
//       <Box sx={{ p: isMobile ? 1 : 3 }}>
//         <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
//           <HistoryIcon sx={{ mr: 2, fontSize: '2rem' }} />
//           Historique / Archives
//         </Typography>

//         {/* Filtres */}
//         <Card sx={{ mb: 3, boxShadow: 3 }}>
//           <CardContent>
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//               <FilterListIcon sx={{ mr: 1 }} />
//               <Typography variant="h6">Filtres</Typography>
//             </Box>
            
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12} md={8}>
//                 <ButtonGroup variant="contained" fullWidth={isMobile}>
//                   <Button 
//                     onClick={() => changePeriod('today')}
//                     color={period === 'today' ? 'primary' : 'inherit'}
//                   >
//                     Quotidien
//                   </Button>
//                   <Button 
//                     onClick={() => changePeriod('weekly')}
//                     color={period === 'weekly' ? 'primary' : 'inherit'}
//                   >
//                     Hebdomadaire
//                   </Button>
//                   <Button 
//                     onClick={() => changePeriod('personalized')}
//                     color={period === 'personalized' ? 'primary' : 'inherit'}
//                   >
//                     Personnalisé
//                   </Button>
//                 </ButtonGroup>
//               </Grid>
              
//               {period === 'personalized' && (
//                 <Grid item xs={12} md={4}>
//                   <form onSubmit={handleSubmit}>
//                     <Grid container spacing={1} alignItems="center">
//                       <Grid item xs={5}>
//                         <input
//                           type="date"
//                           value={startDate}
//                           onChange={(e) => setStartDate(e.target.value)}
//                           style={{
//                             width: '100%',
//                             padding: '8px 12px',
//                             border: '1px solid #ccc',
//                             borderRadius: '4px',
//                             fontSize: '16px'
//                           }}
//                         />
//                       </Grid>
//                       <Grid item xs={5}>
//                         <input
//                           type="date"
//                           value={endDate}
//                           onChange={(e) => setEndDate(e.target.value)}
//                           style={{
//                             width: '100%',
//                             padding: '8px 12px',
//                             border: '1px solid #ccc',
//                             borderRadius: '4px',
//                             fontSize: '16px'
//                           }}
//                         />
//                       </Grid>
//                       <Grid item xs={2}>
//                         <Button 
//                           type="submit" 
//                           variant="contained" 
//                           color="primary"
//                           sx={{ minWidth: 'auto' }}
//                         >
//                           OK
//                         </Button>
//                       </Grid>
//                     </Grid>
//                   </form>
//                 </Grid>
//               )}
//             </Grid>
//           </CardContent>
//         </Card>

//         {/* Tableau d'historique */}
//         <Card sx={{ mb: 3, boxShadow: 3 }}>
//           <CardContent>
//             <TableContainer component={Paper}>
//               <Table>
//                 <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Date d'affectation</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Nom du trieur</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Total pièces triées</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Four</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {loading ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <CircularProgress />
//                         <Typography variant="body2" sx={{ mt: 2 }}>Chargement des données...</Typography>
//                       </TableCell>
//                     </TableRow>
//                   ) : error ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4, color: theme.palette.error.main }}>
//                         <Typography>{error}</Typography>
//                       </TableCell>
//                     </TableRow>
//                   ) : history.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <Typography>Aucune donnée disponible</Typography>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     history.map((item) => (
//                       <TableRow key={item.id} hover>
//                         <TableCell>{item.id}</TableCell>
//                         <TableCell>{formatDate(item.date_affectation)}</TableCell>
//                         <TableCell>{item.trieur_nom}</TableCell>
//                         <TableCell>
//                           <Box sx={{ 
//                             display: 'inline-block', 
//                             bgcolor: theme.palette.primary.light,
//                             color: theme.palette.primary.dark,
//                             px: 1.5,
//                             py: 0.5,
//                             borderRadius: 1
//                           }}>
//                             {item.total_piece} unités
//                           </Box>
//                         </TableCell>
                        
//                         <TableCell>{item.num_four}</TableCell>
//                         <TableCell>
//                           <Button 
//                             variant="outlined" 
//                             size="small"
//                             onClick={() => openDetailsModal(item)}
//                           >
//                             Détails
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </CardContent>
//         </Card>

        
//       </Box>

//       {/* Modal pour les détails */}
//       <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
//         <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <span>Détails de l'affectation</span>
//           <IconButton onClick={() => setOpenModal(false)}>
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent dividers>
//           {selectedItem && (
//             <Grid container spacing={3}>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Chef d'équipe</Typography>
//                 <Typography variant="h6">{selectedItem.chef?.nom || 'N/A'}</Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   Matricule: {selectedItem.chef?.matricule || 'N/A'}
//                 </Typography>
//               </Grid>
              
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Trieur</Typography>
//                 <Typography variant="h6">{selectedItem.trieur_nom}</Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   Matricule: {selectedItem.trieur_matricule}
//                 </Typography>
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Box sx={{ 
//                   bgcolor: theme.palette.grey[100], 
//                   p: 2, 
//                   borderRadius: 1,
//                   textAlign: 'center'
//                 }}>
//                   <Typography variant="subtitle2" color="textSecondary">Total pièces triées</Typography>
//                   <Typography variant="h3" color="primary">
//                     {selectedItem.total_piece}
//                   </Typography>
//                   <Typography variant="body2">unités</Typography>
//                 </Box>
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenModal(false)} color="primary">
//             Fermer
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Sidebar>
//   );
// };

// export default HistoryPage;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { PieChart } from 'react-minimal-pie-chart';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import HistoryIcon from '@mui/icons-material/History';
import Sidebar from '../../components/layout/sidebar';

const HistoryPage = () => {
  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [exportData, setExportData] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchHistory(period);
  }, []);

  const fetchHistory = async (periodValue) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      const params = {
        period: periodValue,
        ...(periodValue === 'personalized' && { 
          start_date: startDate, 
          end_date: endDate 
        })
      };

      const response = await axios.get('http://localhost:8000/api/history', { 
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setHistory(response.data);
      
      if (response.data.length > 0) {
        const firstItem = response.data[0];
        setExportData({
          chefMatricule: firstItem.chef?.matricule || 'N/A',
          trieurMatricule: firstItem.trieur_matricule || 'N/A',
          pieces: [
            { nom: 'Cuvette', quantite: Math.floor(firstItem.total_piece * 0.6) },
            { nom: 'Lave main', quantite: Math.floor(firstItem.total_piece * 0.3) },
            { nom: 'Bâti support', quantite: Math.floor(firstItem.total_piece * 0.1) },
          ],
          total: firstItem.total_piece
        });
      }
    } catch (err) {
      setError('Error loading data');
      console.error('Fetch error:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const changePeriod = (newPeriod) => {
    setPeriod(newPeriod);
    fetchHistory(newPeriod);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHistory(period);
  };

  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  return (
    <Sidebar>
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 2, fontSize: '2rem' }} />
          Historique / Archives
        </Typography>

        {/* Filtres */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterListIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Filtres</Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <ButtonGroup variant="contained" fullWidth={isMobile}>
                  <Button 
                    onClick={() => changePeriod('today')}
                    color={period === 'today' ? 'primary' : 'inherit'}
                  >
                    Quotidien
                  </Button>
                  <Button 
                    onClick={() => changePeriod('weekly')}
                    color={period === 'weekly' ? 'primary' : 'inherit'}
                  >
                    Hebdomadaire
                  </Button>
                  <Button 
                    onClick={() => changePeriod('personalized')}
                    color={period === 'personalized' ? 'primary' : 'inherit'}
                  >
                    Personnalisé
                  </Button>
                </ButtonGroup>
              </Grid>
              
              {period === 'personalized' && (
                <Grid item xs={12} md={4}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={5}>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px'
                          }}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px'
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary"
                          sx={{ minWidth: 'auto' }}
                        >
                          OK
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Tableau d'historique */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date d'affectation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nom du trieur</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total pièces</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Four</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ mt: 2 }}>Chargement des données...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: theme.palette.error.main }}>
                        <Typography>{error}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography>Aucune donnée disponible</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{formatDate(item.date_affectation)}</TableCell>
                        <TableCell>{item.trieur_nom}</TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'inline-block', 
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.dark,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1
                          }}>
                            {item.total_piece} unités
                          </Box>
                        </TableCell>
                        <TableCell>{item.num_four || 'N/A'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => openDetailsModal(item)}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        
      </Box>

      {/* Modal pour les détails */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Détails de l'affectation</span>
          <IconButton onClick={() => setOpenModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Chef d'équipe</Typography>
                <Typography variant="h6">{selectedItem.chef?.nom || 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Matricule: {selectedItem.chef?.matricule || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Trieur</Typography>
                <Typography variant="h6">{selectedItem.trieur_nom}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Matricule: {selectedItem.trieur_matricule}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Four</Typography>
                <Typography variant="h6">{selectedItem.num_four || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  bgcolor: theme.palette.grey[100], 
                  p: 2, 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Typography variant="subtitle2" color="textSecondary">Total pièces triées</Typography>
                  <Typography variant="h3" color="primary">
                    {selectedItem.total_piece}
                  </Typography>
                  <Typography variant="body2">unités</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Sidebar>
  );
};

export default HistoryPage;