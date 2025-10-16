import * as React from 'react';
import { useState, useEffect, useRef,useNavigate } from 'react';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import eKilnLogo from '../components/assets/eKiln.png'; // Adjust path as needed
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport
} from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales'; // Example: French localization

import FamillesContent from './Familles/FamillesContent';
import ChargementContent from './ChargementContent';
import ParametrageContent from './ParametrageContent';
import WagonTable from './WagonTable';
import TrieursTable from './TrieursTable';
import EnfourneurTable from './EnfourneurTable';
import DashboardContent from './DashboardContent';
import HistoriqueChargement from './Chargement/HistoriqueChargement';
import HistoryIcon from '@mui/icons-material/History';
import CssBaseline from '@mui/material/CssBaseline';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import {Autocomplete} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import AffectationContent from '../components/AffectationContent';
import SettingsIcon from '@mui/icons-material/Settings';
import { Edit, Check, X, Settings, Clock, Zap, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import WagonVisualization from './Wagons/WagonVisualization';

// the sidebar
const NAVIGATION = [
  {
    kind: 'header',
    title: 'Main Menu',
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'team',
    title: 'Team Management',
    icon: <PeopleIcon />,
    children: [
      {
        segment: 'trieurs',
        title: 'Trieurs',
        icon: <PeopleIcon fontSize="small" />,
      },
      {
        segment: 'enfourneur',
        title: 'Enfourneur',
        icon: <PeopleIcon fontSize="small" />,
      },
    ],
  },
  {
    segment: 'wagon',
    title: 'Wagon Visualization',
    icon: <ViewModuleIcon />,
  },
  {
  segment: 'historique',
  title: 'Historique Chargements',
  icon: <HistoryIcon />,
  },
  {
    segment: 'affectation',
    title: 'Affectation des Trieurs',
    icon: <AssignmentIcon />,
  },
  {
    segment: 'chargement',
    title: 'Chargement Wagon',
    icon: <LocalShippingIcon />,
  },
  /*{
    segment: 'familles',
      title: 'Gestion des Familles',
      icon: <ListAltIcon />,
  },
  {
  segment: 'parametrage',
    title: 'Paramétre',
    icon: <SettingsIcon />,
  },
  {
    kind: 'divider',
  },*/
  {
    segment: 'logout',
    title: 'Déconnexion',
    icon: <LogoutIcon color="error" />,
  },
];
// const CustomToolbar = () => (
//   <GridToolbarContainer>
//     <GridToolbarExport csvOptions={{ fileName: 'wagons_export' }} />
//   </GridToolbarContainer>
// );

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Bleu profond plus élégant
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#f50057', // Rose/violet pour les accents
    },
    background: {
      default: '#f8fafc', // Très léger bleu-gris
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Gris foncé pour le texte
      secondary: '#64748b', // Gris moyen
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: [
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px 0 rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#ffffff',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#f8fafc',
          },
          '&:hover': {
            backgroundColor: '#f1f5ff',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});


// // Component: StatCard
// const StatCard = ({ title, value, details, icon }) => {
//   const [openTooltip, setOpenTooltip] = useState(false);
  
//   const densityTooltip = details ? (
//     <Box sx={{ p: 1 }}>
//       <Typography variant="subtitle2">Détails Densité ({details.interval.start} - {details.interval.end})</Typography>
//       <Divider sx={{ my: 1 }} />
//       <Grid container spacing={1}>
//         <Grid item xs={6}>
//           <Typography variant="body2"><strong>Four F3:</strong></Typography>
//           <Typography variant="body2">Total: {details.f3.total_pieces} pièces</Typography>
//           <Typography variant="body2">Densité: {details.f3.density} </Typography>
//         </Grid>
//         <Grid item xs={6}>
//           <Typography variant="body2"><strong>Four F4:</strong></Typography>
//           <Typography variant="body2">Total: {details.f4.total_pieces} pièces</Typography>
//           <Typography variant="body2">Densité: {details.f4.density} </Typography>
//         </Grid>
//       </Grid>
//     </Box>
//   ) : null;

//   return (
//     <Card sx={{ 
//       height: '100%',
//       background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
//       border: '1px solid rgba(0, 0, 0, 0.05)'
//     }}>
//       <CardContent sx={{ p: 3 }}>
//         <Box sx={{ 
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           mb: 2
//         }}>
//           <Typography 
//             color="text.secondary" 
//             variant="subtitle2" 
//             sx={{ 
//               fontWeight: 500,
//               color: '#64748b'
//             }}
//           >
//             {title}
//           </Typography>
//           {icon && (
//             <Box sx={{
//               width: 40,
//               height: 40,
//               borderRadius: '50%',
//               backgroundColor: 'rgba(63, 81, 181, 0.1)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: theme.palette.primary.main
//             }}>
//               {icon}
//             </Box>
//           )}
//           {title === 'Densite' && (
//             <Tooltip 
//               title={densityTooltip} 
//               arrow
//               open={openTooltip}
//               onOpen={() => setOpenTooltip(true)}
//               onClose={() => setOpenTooltip(false)}
//               disableFocusListener
//               disableHoverListener
//               disableTouchListener
//             >
//               <IconButton 
//                 size="small" 
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setOpenTooltip(!openTooltip);
//                 }}
//                 sx={{ 
//                   ml: 0.5, 
//                   verticalAlign: 'middle',
//                   color: theme.palette.text.secondary
//                 }}
//               >
//                 <InfoIcon fontSize="small" />
//               </IconButton>
//             </Tooltip>
//           )}
//         </Box>
//         <Typography 
//           variant="h4" 
//           component="div" 
//           sx={{ 
//             fontWeight: 700,
//             color: theme.palette.primary.dark
//           }}
//         >
//           {value}
//         </Typography>
//       </CardContent>
//     </Card>
//   );
// };


// // Ajoutez ce composant avant le composant ChefDashboard
// const ChargementContent = () => {
//   const [familles, setFamilles] = useState([]);
//   const [fours, setFours] = useState([]);
//   const [wagons, setWagons] = useState([]);
//   //const [wagonNum, setWagonNum] = useState("");
//   const [selectedFour, setSelectedFour] = useState("");
//   const [selectedWagon, setSelectedWagon] = useState("");
//   const [quantites, setQuantites] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [chargements, setChargements] = useState([]);
//   const [showRecap, setShowRecap] = useState(false);
//   const [recapLoading, setRecapLoading] = useState(false);
//   const [selectedChargement, setSelectedChargement] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [error, setError] = useState(null);
//   const [totalPieces, setTotalPieces] = useState(0); // Nouvel état pour le total des pièces
//   const [chargementCount, setChargementCount] = useState(0); // Nouvel état pour le nombre de chargements
//   const wagonRef = useRef(null);
//   const messageRef = useRef(null);
//   const [user,setUser]=useState(null);

//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const [famillesRes, foursRes, wagonsRes, userRes] = await Promise.all([
//           axios.get("http://localhost:8000/api/familles", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:8000/api/fours", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:8000/api/wagons1", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:8000/api/me", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         setFamilles(famillesRes.data);
//         setFours(foursRes.data);
//         setWagons(wagonsRes.data.data);
//         setUser(userRes.data);

//         const initialQuantites = {};
//         famillesRes.data.forEach(famille => {
//           initialQuantites[famille.id_famille] = 0;
//         });
//         setQuantites(initialQuantites);
//       } catch (error) {
//         console.error("Erreur lors du chargement des données:", error);
//         setError("Erreur lors du chargement des données initiales");
//       }
//     };
//     fetchInitialData();
//   }, []);

//   const handleQuantiteChange = (id_famille, value) => {
//     setQuantites({
//       ...quantites,
//       [id_famille]: parseInt(value) || 0
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem("token");
//       const userResponse = await axios.get("http://localhost:8000/api/me", {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const user = userResponse.data;

//       const pieces = [];
//       for (const id_famille in quantites) {
//         if (quantites[id_famille] > 0) {
//           pieces.push({
//             id_famille: parseInt(id_famille),
//             quantite: parseInt(quantites[id_famille])
//           });
//         }
//       }

//       if (pieces.length === 0) {
//         setError("Veuillez saisir au moins une quantité");
//         setLoading(false);
//         return;
//       }

//       const chargementData = {
//         id_user: user.id_user,
//         //id_wagon: parseInt(wagonNum),
//         id_wagon: parseInt(selectedWagon),
//         id_four: parseInt(selectedFour),
//         pieces: pieces
//       };

//       await axios.post("http://localhost:8000/api/chargements", chargementData, {
//         headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' },
//       });
//       // Mettre à jour les chargements et compteur
//       fetchChargements(false);
//       setError({ severity: "success", message: "Chargement enregistré avec succès!" });
//        // Scroll vers le message après rendu
//       setTimeout(() => {
//       messageRef.current?.scrollIntoView({ behavior: "smooth" });
//          }, 50);

//     // Mettre le focus sur le champ Wagon
//     wagonRef.current?.focus();
//       resetForm();
//     } catch (error) {
//       console.error("Erreur complète:", error);
//       if (error.response) {
//         const { data } = error.response;
//         if (data.errors) {
//           const messages = Object.values(data.errors).flat().join('\n');
//           setError(`Erreur(s) de validation:\n${messages}`);
//         } else {
//           setError(`Erreur: ${data.message || "Erreur inconnue"}`);
//         }
//       } else {
//         setError("Erreur réseau ou inconnue");
//       }
//     //Scroll vers le message
//    setTimeout(() => {
//     messageRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 50);
//     } finally {
//       setLoading(false);
//         wagonRef.current?.focus();
//     }
//   };

//   const resetForm = () => {
//     //setWagonNum("");
//     //setSelectedFour("");
//     setSelectedWagon("");
//     const resetQuantites = {};
//     familles.forEach(famille => {
//       resetQuantites[famille.id_famille] = 0;
//     });
//     setQuantites(resetQuantites);
//   };

//   const fetchWagonDetails = async (id) => {
//   try {
//     const token = localStorage.getItem('token');
//     const response = await axios.get(
//       `http://localhost:8000/api/chargements/${id}/popup-details`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
    
//     if (response.data.success) {
//       setSelectedWagonDetails(response.data.data);
//       setShowWagonDetailsModal(true);
//     }
//   } catch (error) {
//     console.error("Erreur:", error);
//   }
// };

//   const fetchChargements = async (toggleRecap = false) => {
//   setRecapLoading(true);
//   setError(null);

//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(
//       "http://localhost:8000/api/chargements/mes-chargements",
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     const chargements = response.data;

//     const totalPieces = chargements.reduce((sum, chargement) => {
//       return sum + (chargement.details
//         ? chargement.details.reduce((detSum, detail) => detSum + Number(detail.quantite), 0)
//         : 0);
//     }, 0);

//     const chargementCount = chargements.length;

//     setChargements(chargements);
//     setTotalPieces(totalPieces);
//     setChargementCount(chargementCount);

//     // toggle l'affichage seulement si demandé
//     if (toggleRecap) {
//       setShowRecap(!showRecap);
//     }

//   } catch (error) {
//     console.error("Erreur lors du chargement des chargements:", error);
//     setError("Impossible de charger les chargements");
//   } finally {
//     setRecapLoading(false);
//   }
// };
// useEffect(() => {
//     fetchChargements(); 
//   }, []);
//   const fetchChargementDetails = async (id) => {
//     if (!id) {
//       console.error("ID de chargement non fourni");
//       setError("Erreur: ID de chargement manquant");
//       return;
//     }
  
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `http://localhost:8000/api/chargements/${id}/details`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setSelectedChargement(response.data);
//       setShowDetailsModal(true);
//     } catch (error) {
//       console.error("Erreur lors du chargement des détails:", error);
//       if (error.response) {
//         console.error("Réponse d'erreur:", error.response.data);
//         setError(`Erreur: ${error.response.data.message || "Erreur serveur"}`);
//       } else {
//         setError("Erreur réseau ou inconnue");
//       }
//     }
//   };
//   const fourRef = useRef(null);
//   const [fourOpen, setFourOpen] = useState(false);

//   // Ref pour savoir si le menu a déjà été ouvert une fois
//   const hasOpenedFourOnce = useRef(false);

//   // Quand le wagon change → focus + ouvrir le menu **une seule fois**
//   useEffect(() => {
//     if (selectedWagon && fourRef.current && !hasOpenedFourOnce.current) {
//       fourRef.current.focus();       // focus visible
//       setFourOpen(true);             // ouvre le menu
//       hasOpenedFourOnce.current = true; // on ne le refait plus
//     }
//   }, [selectedWagon]);

//   return (
//     <Box sx={{ p: 3 }}>
//       {error && (
//         <Alert 
//           severity={typeof error === 'object' && error.severity ? error.severity : "error"} 
//           sx={{ mb: 2 }}
//           onClose={() => setError(null)}
//         >
//           {typeof error === 'object' && error.message ? error.message : error}
//         </Alert>
//       )}

//       <Paper sx={{ p: 3, mb: 3 }}>
//         <Typography variant="h5" component="h2" gutterBottom>
//           {showRecap ? "Chargements Récents" : "Nouveau Chargement de Wagon"}
//         </Typography>

//         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
//           <Button 
//             variant="contained"
//             startIcon={<ListAltIcon />}
//             onClick={fetchChargements}
//             disabled={recapLoading}
//           >
//             {recapLoading ? "Chargement..." : showRecap ? "Nouveau Chargement" : "Voir les Chargements"}
//           </Button>
//         </Box>

//         {showRecap ? (
//           <>
//             {recapLoading ? (
//               <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//                 <CircularProgress />
//               </Box>
//             ) : chargements.length === 0 ? (
//               <Alert severity="info">Aucun chargement récent</Alert>
//             ) : (
//               <TableContainer component={Paper} variant="outlined">
//                 <Table aria-label="chargements table">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Date</TableCell>
//                       <TableCell>Wagon</TableCell>
//                       <TableCell>Four</TableCell>
//                       <TableCell>           </TableCell>
//                       <TableCell>Statut</TableCell>
//                       <TableCell align="center">Actions</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {chargements.map((chargement) => (
//                       <TableRow key={chargement.id}>
//                         <TableCell>{new Date(chargement.datetime_chargement).toLocaleString()}</TableCell>
//                         <TableCell>{chargement.wagon?.num_wagon}</TableCell>
//                         <TableCell>{chargement.four?.num_four}</TableCell>
//                         <TableCell>{chargement.user?.nom.toUpperCase()} {chargement.user?.prenom.toUpperCase()}</TableCell>
//                         <TableCell>{chargement.statut}</TableCell>
//                         <TableCell align="center">
//                           <IconButton
//                             color="primary"
//                             onClick={() => {
//                               if (chargement.id) {
//                                 fetchChargementDetails(chargement.id);
//                               } else {
//                                 console.error("ID de chargement non défini", chargement);
//                                 setError("Erreur: ID de chargement manquant");
//                               }
//                             }}
//                             size="small"
//                           >
//                             <VisibilityIcon />
//                           </IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             )}
//           </>
//         ) : (
//           <Box component="form" onSubmit={handleSubmit} noValidate>
//               <Grid container spacing={3}>
//                            {/* Wagon Autocomplete */}
//                            <Grid item xs={12} md={6} width="180px">
//                              <Autocomplete
//                                options={wagons}
//                                getOptionLabel={(wagon) => `Wagon : ${wagon.num_wagon}`}
//                                value={wagons.find(w => w.id_wagon === selectedWagon) || null}
//                                onChange={(event, newValue) => {
//                                  setSelectedWagon(newValue ? newValue.id_wagon : '');
//                                }}
//                                renderInput={(params) => (
//                                  <TextField
//                                    {...params}
//                                    label="Wagon"
//                                    required
//                                    margin="normal"
//                                    inputRef={wagonRef} // <- ici la vraie ref sur l'input moi 
//                                  />
//                                )}
//                                sx={{ '& .MuiAutocomplete-input': { width: '240px' } }}
//                              />
//                            </Grid>
           
//                            {/* Four Select */}
//                            <Grid item xs={12} md={6}>
//                              <FormControl fullWidth margin="normal" required>
//                                <InputLabel id="four-select-label">Four</InputLabel>
//                                <Select
//                                  labelId="four-select-label"
//                                  id="four-select"
//                                  value={selectedFour}
//                                  label="Four"
//                                  inputRef={fourRef}
//                                  open={fourOpen}
//                                  onOpen={() => setFourOpen(true)}
//                                  onClose={() => setFourOpen(false)}
//                                  onChange={(e) => {
//                                    setSelectedFour(e.target.value);
//                                    setFourOpen(false); // referme après sélection
//                                  }}
//                                  sx={{ '& .MuiSelect-select': { width: '140px' } }}
//                                >
//                                  <MenuItem value="">
//                                    <em>Sélectionnez un four</em>
//                                  </MenuItem>
//                                  {fours.map((four) => (
//                                    <MenuItem key={four.id_four} value={four.id_four}>
//                                      {four.num_four} - Cadence: {four.cadence}
//                                    </MenuItem>
//                                  ))}
//                                </Select>
//                              </FormControl>
//                            </Grid>
           
//                            {/* Paper Fields */}
//                            <Grid container spacing={3} justifyContent="flex-end" minWidth={"50%"}>
//                              <Grid item xs={12} md={4}>
//                                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                  <Typography variant="h6" gutterBottom>
//                                     {user?.matricule.toUpperCase() ?? "N/A"}
//                                   </Typography>
            
//                                   <Typography variant="subtitle2" color="text.secondary">
//                                     {user?.nom.toUpperCase() ?? "N/A"} {user?.prenom.toUpperCase() ?? "N/A"}
//                                   </Typography>
//                                </Paper> 
//                              </Grid>
           
//                              <Grid item xs={12} md={4}>
//                                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                  <Typography variant="h6" gutterBottom>
//                                    {totalPieces}
//                                  </Typography>
//                                  <Typography variant="subtitle2" color="text.secondary">
//                                    Pièces
//                                  </Typography>
//                                </Paper>
//                              </Grid>
           
//                              <Grid item xs={12} md={4}>
//                                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                  <Typography variant="h6" gutterBottom>
//                                    {chargementCount}
//                                  </Typography>
//                                  <Typography variant="subtitle2" color="text.secondary">
//                                   Chargements
//                                  </Typography>
//                                </Paper>
//                              </Grid>

//                              <Grid item xs={12} md={4}>
//                                 <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                   <Typography variant="h6" gutterBottom>
//                                 {chargementCount==0 ? 0 : (totalPieces / chargementCount).toFixed(2)} 
//                                   </Typography>
//                                   <Typography variant="subtitle2" color="text.secondary">
//                                     Densite
//                                   </Typography>
//                                 </Paper>
//                               </Grid>
//                            </Grid>
//                          </Grid>

//             <Typography variant="h6" component="h3" sx={{ mt: 4, mb: 2 }}>
//               Détails du chargement
//             </Typography>
            
//             <TableContainer component={Paper} variant="outlined">
//               <Table aria-label="details table" size="small">
//                 <TableBody>
//                   {(() => {
//                     const listeSpeciale = [ "Cuvette", "Reservoir","colonne" ,"lavabo","Cache siphon"];

//                     // 1 Récupérer les familles spéciales dans l'ordre
//                     const special = listeSpeciale
//                       .map(name =>
//                         familles.find(f => f.nom_famille.toLowerCase() === name.toLowerCase())
//                       )
//                       .filter(Boolean);

//                     // 2 Balaste & Couvercles
//                     const balaste = familles.find(f => f.nom_famille === "Balaste");
//                     const couvercles = familles.find(f => f.nom_famille === "Couvercles");

//                     // 3 Le reste
//                     const reste = familles
//                       .filter(
//                         f =>
//                           !listeSpeciale.map(x => x.toLowerCase()).includes(f.nom_famille.toLowerCase()) &&
//                           !["Balaste", "Couvercles"].includes(f.nom_famille)
//                       )
//                       .sort((a, b) => a.nom_famille.localeCompare(b.nom_famille));

//                     //  Construire l'ordre final
//                     const ordre = [...special, ...reste];

//                     // 4 Découper en colonnes
//                     const mid = Math.ceil(ordre.length / 2);
//                     let col1 = ordre.slice(0, mid);
//                     let col2 = ordre.slice(mid);

//                     // 5 Ajouter Balaste à gauche, Couvercles à droite
//                     if (balaste) col1.push(balaste);
//                     if (couvercles) col2.push(couvercles);

//                     const maxRows = Math.max(col1.length, col2.length);

//                     return Array.from({ length: maxRows }).map((_, rowIndex) => {
//                       const famille1 = col1[rowIndex];
//                       const famille2 = col2[rowIndex];

//                       return (
//                         <TableRow key={rowIndex}>
//                           {/* Colonne 1 */}
//                           <TableCell>{famille1?.nom_famille || ""}</TableCell>
//                           <TableCell>
//                             {famille1 && (
//                               <TextField
//                                 type="text"
//                                 variant="outlined"
//                                 size="small"
//                                 value={
//                                   quantites[famille1.id_famille] === 0
//                                     ? "0"
//                                     : quantites[famille1.id_famille]
//                                 }
//                                 onFocus={() => {
//                                   if ((quantites[famille1.id_famille] || 0) === 0) {
//                                     setQuantites(prev => ({
//                                       ...prev,
//                                       [famille1.id_famille]: ""
//                                     }));
//                                     setIsEditing(prev => ({
//                                       ...prev,
//                                       [famille1.id_famille]: true
//                                     }));
//                                   }
//                                 }}
//                                 onChange={e => {
//                                   const val = e.target.value.replace(/[^0-9]/g, "");
//                                   handleQuantiteChange(
//                                     famille1.id_famille,
//                                     val === "" ? 0 : Number(val)
//                                   );
//                                 }}
//                                 onBlur={e => {
//                                   if (e.target.value === "")
//                                     handleQuantiteChange(famille1.id_famille, 0);
//                                 }}
//                                 fullWidth
//                                 sx={{
//                                   backgroundColor:
//                                     famille1.nom_famille === "Balaste" ||
//                                     famille1.nom_famille === "Couvercles"
//                                       ? "#f8d7da" // rouge clair
//                                       : quantites[famille1.id_famille] > 0
//                                       ? "#d1f7c4" // vert si rempli
//                                       : "inherit"
//                                 }}
//                               />
//                             )}
//                           </TableCell>

//                           {/* Colonne 2 */}
//                           {famille2 ? (
//                             <>
//                               <TableCell>{famille2.nom_famille}</TableCell>
//                               <TableCell>
//                                 <TextField
//                                   type="text"
//                                   variant="outlined"
//                                   size="small"
//                                   value={
//                                     quantites[famille2.id_famille] === 0
//                                       ? "0"
//                                       : quantites[famille2.id_famille]
//                                   }
//                                   onFocus={() => {
//                                     if ((quantites[famille2.id_famille] || 0) === 0) {
//                                       setQuantites(prev => ({
//                                         ...prev,
//                                         [famille2.id_famille]: ""
//                                       }));
//                                       setIsEditing(prev => ({
//                                         ...prev,
//                                         [famille2.id_famille]: true
//                                       }));
//                                     }
//                                   }}
//                                   onChange={e => {
//                                     const val = e.target.value.replace(/[^0-9]/g, "");
//                                     handleQuantiteChange(
//                                       famille2.id_famille,
//                                       val === "" ? 0 : Number(val)
//                                     );
//                                   }}
//                                   onBlur={e => {
//                                     if (e.target.value === "")
//                                       handleQuantiteChange(famille2.id_famille, 0);
//                                   }}
//                                   fullWidth
//                                   sx={{
//                                     backgroundColor:
//                                       famille2.nom_famille === "Balaste" ||
//                                       famille2.nom_famille === "Couvercles"
//                                         ? "#f8d7da"
//                                         : quantites[famille2.id_famille] > 0
//                                         ? "#d1f7c4"
//                                         : "inherit"
//                                   }}
//                                 />
//                               </TableCell>
//                             </>
//                           ) : (
//                             <>
//                               <TableCell></TableCell>
//                               <TableCell></TableCell>
//                             </>
//                           )}
//                         </TableRow>
//                       );
//                     });
//                   })()}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 startIcon={<SaveIcon />}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <CircularProgress size={24} sx={{ mr: 1 }} />
//                     Enregistrement...
//                   </>
//                 ) : (
//                   "Enregistrer"
//                 )}
//               </Button>
//             </Box>
//           </Box>
//         )}
//       </Paper>

//       {/* Modal pour les détails */}
//       <Modal 
//         open={showDetailsModal} 
//         onClose={() => setShowDetailsModal(false)}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//       >
//         <Box sx={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: 600,
//           bgcolor: 'background.paper',
//           boxShadow: 24,
//           p: 4,
//           borderRadius: 2
//         }}>
//           <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
//             <Typography variant="h6" component="h2">
//               Détails du chargement #{selectedChargement?.id}
//             </Typography>
//             <IconButton 
//               edge="end" 
//               color="inherit" 
//               onClick={() => setShowDetailsModal(false)} 
//               aria-label="close"
//             >
//               <CloseIcon />
//             </IconButton>
//           </Box>
          
//           {selectedChargement && (
//             <>
//               <Grid container spacing={2} sx={{ mb: 2 }}>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Wagon:</Typography>
//                   <Typography variant="body1">{selectedChargement.id_wagon}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Four:</Typography>
//                   <Typography variant="body1">{selectedChargement.four?.num_four}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Statut:</Typography>
//                   <Typography variant="body1">{selectedChargement.statut}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Date chargement:</Typography>
//                   <Typography variant="body1">
//                     {new Date(selectedChargement.datetime_chargement).toLocaleString()}
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Date sortie estimée:</Typography>
//                   <Typography variant="body1">
//                     {new Date(selectedChargement.datetime_sortieEstime).toLocaleString()}
//                   </Typography>
//                 </Grid>
//               </Grid>
              
//               <Divider sx={{ my: 2 }} />
              
//               <Typography variant="h6" gutterBottom>
//                 Pièces chargées
//               </Typography>
              
//               <TableContainer component={Paper} variant="outlined">
//                 <Table aria-label="pieces table" size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Famille</TableCell>
//                       <TableCell align="center">Quantité</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {selectedChargement.details?.map((detail) => (
//                       <TableRow key={detail.id_detail_chargement}>
//                         <TableCell>{detail.famille?.nom_famille || 'Inconnue'}</TableCell>
//                         <TableCell align="center">{detail.quantite}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </>
//           )}
//         </Box>
//       </Modal>
//     </Box>
//   );
// };
// const ParametrageContent = () => {
//   const [fours, setFours] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [editingFour, setEditingFour] = useState(null);
//   const [newCadence, setNewCadence] = useState('');

//   const formatDuration = (seconds) => {
//     if (!seconds) return '00:00:00';
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   useEffect(() => {
//     const fetchFours = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get('http://localhost:8000/api/fours', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setFours(response.data);
//       } catch (err) {
//         setError("Erreur lors du chargement des fours");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFours();
//   }, []);

//   const handleUpdateCadence = async (id_four) => {
//     if (!newCadence || isNaN(newCadence)) {
//       setError("Veuillez entrer une cadence valide");
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.patch(
//   `http://localhost:8000/api/fours/${id_four}`,
//   { new_cadence: parseFloat(newCadence) },
//   { headers: { Authorization: `Bearer ${token}` } }
// );

//       if (response.data.success) {
//         setFours(fours.map(four => 
//           four.id_four === id_four ? response.data.four : four
//         ));
//         setSuccess("Cadence mise à jour avec succès");
//         setEditingFour(null);
//         setNewCadence('');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Erreur lors de la mise à jour");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return (
//     <Box sx={{ 
//       display: 'flex', 
//       justifyContent: 'center', 
//       alignItems: 'center', 
//       height: '100vh',
//       backgroundColor: '#f8fafc'
//     }}>
//       <Box sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         gap: 3,
//         p: 4,
//         backgroundColor: 'white',
//         borderRadius: 2,
//         boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//         border: '1px solid #e2e8f0'
//       }}>
//         <CircularProgress 
//           size={50} 
//           thickness={4}
//           sx={{ color: '#3b82f6' }}
//         />
//         <Typography sx={{ 
//           color: '#64748b',
//           fontSize: '15px',
//           fontWeight: 500
//         }}>
//           Chargement des données...
//         </Typography>
//       </Box>
//     </Box>
//   );

//   return (
//     <Box sx={{ 
//       minHeight: '100vh',
//       backgroundColor: '#f8fafc',
//       p: 4
//     }}>
//       <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        
//         {/* Header */}
//         <Paper sx={{ 
//           p: 4,
//           mb: 4,
//           backgroundColor: 'white',
//           borderRadius: 2,
//           boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//           border: '1px solid #e2e8f0'
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
//             <Box sx={{
//               p: 2.5,
//               backgroundColor: '#3b82f6',
//               borderRadius: 2,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}>
//               <SettingsIcon sx={{ 
//                 fontSize: 28, 
//                 color: 'white'
//               }} />
//             </Box>
//             <Box>
//               <Typography variant="h4" sx={{ 
//                 fontWeight: 600,
//                 color: '#1e293b',
//                 mb: 0.5
//               }}>
//                 Paramétrage des Fours
//               </Typography>
//               <Typography sx={{ 
//                 color: '#64748b',
//                 fontSize: '16px'
//               }}>
//                 Gestion des cadences et durées de cuisson
//               </Typography>
//             </Box>
//           </Box>
//         </Paper>

//         {/* Messages */}
//         {success && (
//           <Alert 
//             severity="success" 
//             onClose={() => setSuccess(null)}
//             sx={{ 
//               mb: 3,
//               borderRadius: 2,
//               backgroundColor: '#f0fdf4',
//               border: '1px solid #bbf7d0',
//               '& .MuiAlert-icon': { color: '#16a34a' },
//               '& .MuiAlert-message': { color: '#15803d', fontWeight: 500 }
//             }}
//             icon={<Check size={20} />}
//           >
//             {success}
//           </Alert>
//         )}

//         {error && (
//           <Alert 
//             severity="error" 
//             onClose={() => setError(null)}
//             sx={{ 
//               mb: 3,
//               borderRadius: 2,
//               backgroundColor: '#fef2f2',
//               border: '1px solid #fecaca',
//               '& .MuiAlert-icon': { color: '#dc2626' },
//               '& .MuiAlert-message': { color: '#991b1b', fontWeight: 500 }
//             }}
//           >
//             {error}
//           </Alert>
//         )}

//         {/* Tableau */}
//         <Paper sx={{ 
//           borderRadius: 2,
//           overflow: 'hidden',
//           boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//           border: '1px solid #e2e8f0',
//           backgroundColor: 'white'
//         }}>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   color: '#334155',
//                   fontSize: '14px',
//                   py: 3,
//                   borderBottom: '1px solid #e2e8f0'
//                 }}>
//                   Four
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   color: '#334155',
//                   fontSize: '14px',
//                   py: 3,
//                   borderBottom: '1px solid #e2e8f0'
//                 }}>
//                   Cadence
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   color: '#334155',
//                   fontSize: '14px',
//                   py: 3,
//                   borderBottom: '1px solid #e2e8f0'
//                 }}>
//                   Durée Cuisson
//                 </TableCell>
//                 <TableCell align="right" sx={{ 
//                   fontWeight: 600, 
//                   color: '#334155',
//                   fontSize: '14px',
//                   py: 3,
//                   borderBottom: '1px solid #e2e8f0'
//                 }}>
//                   Actions
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {fours.map((four, index) => (
//                 <TableRow 
//                   key={four.id_four}
//                   sx={{
//                     '&:last-child td': { borderBottom: 0 },
//                     '&:hover': { 
//                       backgroundColor: '#f8fafc'
//                     },
//                     backgroundColor: editingFour === four.id_four ? '#eff6ff' : 'white',
//                     borderLeft: editingFour === four.id_four ? '3px solid #3b82f6' : '3px solid transparent',
//                     transition: 'all 0.2s ease'
//                   }}
//                 >
//                   <TableCell sx={{ py: 3, borderBottom: '1px solid #f1f5f9' }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                       <Box sx={{
//                         width: 10,
//                         height: 10,
//                         borderRadius: '50%',
//                       }} />
//                       <Typography sx={{ 
//                         fontWeight: 600,
//                         fontSize: '16px',
//                         color: '#1e293b'
//                       }}>
//                         {four.num_four}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell sx={{ py: 3, borderBottom: '1px solid #f1f5f9' }}>
//                     <Box>
//                       <Typography sx={{ 
//                         fontSize: '16px',
//                         fontWeight: 600,
//                         color: '#1e293b'
//                       }}>
//                         {four.cadence}
//                       </Typography>
//                       <Typography sx={{ 
//                         fontSize: '13px',
//                         color: '#64748b'
//                       }}>
                        
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell sx={{ py: 3, borderBottom: '1px solid #f1f5f9' }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                       <Clock size={18} color="#64748b" />
//                       <Typography sx={{ 
//                         fontFamily: 'monospace',
//                         fontSize: '15px',
//                         fontWeight: 600,
//                         color: '#334155',
//                         backgroundColor: '#f1f5f9',
//                         px: 2,
//                         py: 0.5,
//                         borderRadius: 1
//                       }}>
//                         {formatDuration(four.duree_cuisson)}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell align="right" sx={{ py: 3, borderBottom: '1px solid #f1f5f9' }}>
//                     {editingFour === four.id_four ? (
//                       <Box sx={{ 
//                         display: 'flex', 
//                         gap: 2, 
//                         justifyContent: 'flex-end',
//                         alignItems: 'center'
//                       }}>
//                         <TextField
//                           type="number"
//                           value={newCadence}
//                           onChange={(e) => setNewCadence(e.target.value)}
//                           size="small"
//                           sx={{ 
//                             width: 100,
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               '&:hover .MuiOutlinedInput-notchedOutline': {
//                                 borderColor: '#3b82f6'
//                               },
//                               '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//                                 borderColor: '#3b82f6'
//                               }
//                             },
//                             '& input': {
//                               textAlign: 'center',
//                               fontWeight: 500
//                             }
//                           }}
//                         />
//                         <Button
//                           variant="contained"
//                           onClick={() => handleUpdateCadence(four.id_four)}
//                           disabled={loading}
//                           startIcon={<Check size={16} />}
//                           sx={{
//                             borderRadius: 1.5,
//                             textTransform: 'none',
//                             fontWeight: 500,
//                             px: 3,
//                             backgroundColor: '#16a34a',
//                             '&:hover': {
//                               backgroundColor: '#15803d'
//                             }
//                           }}
//                         >
//                           Valider
//                         </Button>
//                         <Button
//                           variant="outlined"
//                           onClick={() => {
//                             setEditingFour(null);
//                             setNewCadence('');
//                           }}
//                           startIcon={<X size={16} />}
//                           sx={{
//                             borderRadius: 1.5,
//                             textTransform: 'none',
//                             fontWeight: 500,
//                             px: 3,
//                             borderColor: '#e2e8f0',
//                             color: '#64748b',
//                             '&:hover': {
//                               borderColor: '#cbd5e1',
//                               backgroundColor: '#f8fafc'
//                             }
//                           }}
//                         >
//                           Annuler
//                         </Button>
//                       </Box>
//                     ) : (
//                       <Button
//                         variant="outlined"
//                         onClick={() => {
//                           setEditingFour(four.id_four);
//                           setNewCadence(four.cadence);
//                         }}
//                         sx={{
//                           borderRadius: 1.5,
//                           textTransform: 'none',
//                           fontWeight: 500,
//                           px: 3,
//                           borderColor: '#3b82f6',
//                           color: '#3b82f6',
//                           '&:hover': {
//                             backgroundColor: '#eff6ff',
//                             borderColor: '#2563eb'
//                           }
//                         }}
//                       >
//                         Modifier
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>

//         {/* Note */}
//         <Paper sx={{ 
//           mt: 4,
//           p: 3,
//           backgroundColor: '#fffbeb',
//           borderRadius: 2,
//           border: '1px solid #fde68a',
//           borderLeft: '4px solid #f59e0b'
//         }}>
//           <Typography sx={{ 
//             color: '#92400e',
//             fontSize: '14px',
//             fontWeight: 500
//           }}>
//             <strong>Note :</strong> La modification de la cadence recalcule automatiquement la durée de cuisson.
//           </Typography>
//         </Paper>

//       </Box>
//     </Box>
//   );
// };
// // Component: WagonTable
// const WagonTable = ({ fourNum, id_four }) => {
//   const [selectedWagon, setSelectedWagon] = useState(null);
//   const [wagonsData, setWagonsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentInterval, setCurrentInterval] = useState('');
//   const [wagonSearch, setWagonSearch] = useState('');
//   const [totalCount, setTotalCount] = useState(0);
//   const [customTrieursNeeded, setCustomTrieursNeeded] = useState(null);
//   const [selectedWagonDetails, setSelectedWagonDetails] = useState(null);
//   const [showWagonDetailsModal, setShowWagonDetailsModal] = useState(false);
//   const [wagonCount, setWagonCount] = useState(id_four === 1 ? 30 : 16); // Valeur par défaut selon le four
  
//   const fetchWagonDetails = async (id) => {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(
//             `http://localhost:8000/api/chargements/${id}/details-popup`,
//             { headers: { Authorization: `Bearer ${token}` } }
//         );
        
//         if (response.data.success) {
//             setSelectedWagonDetails(response.data.data);
//             setShowWagonDetailsModal(true);
//         }
//     } catch (error) {
//         console.error("Error fetching wagon details:", error);
//     }
//   };

//   const fetchData = async (startFromWagon = null, count = wagonCount) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
      
//       const params = { 
//           id_four: id_four,
//           limit: count,
//           ...(startFromWagon && { start_from_wagon: startFromWagon })
//       };

//       // Requête pour les wagons
//       const wagonsResponse = await axios.get('http://localhost:8000/api/chargements/interval', {
//           headers: { 'Authorization': `Bearer ${token}` },
//           params: params
//       });
//       //console.log("Wagons Response:", wagonsResponse.data);
//       setWagonsData(wagonsResponse.data.chargements);
//       setCurrentInterval(`${wagonsResponse.data.current_interval.start} - ${wagonsResponse.data.current_interval.end}`);
//       setTotalCount(wagonsResponse.data.total_count || wagonsResponse.data.chargements.length);

//       // Requête pour les trieurs nécessaires avec les MÊMES paramètres
//       const trieursResponse = await axios.get('http://localhost:8000/api/chargements/calculate-trieurs', {
//           headers: { 'Authorization': `Bearer ${token}` },
//           params: params
//       });
//       //console.log("Trieurs Response:", trieursResponse.data);
//       setCustomTrieursNeeded({
//           ...trieursResponse.data,
//           interval: wagonsResponse.data.current_interval
//       });

//     } catch (error) {
//         console.error("Erreur de chargement:", error);
//         //setError("Erreur lors du chargement des données");
//         setError("Il ya aucun wagon charger ou sortie dans ce shift");
//         setWagonsData([]);
//         setCustomTrieursNeeded(null);
//     } finally {
//         setLoading(false);
//     }
//   };

//   const handleSearchByWagon = () => {
//       if (wagonSearch.trim() === '') {
//           fetchData();
//       } else {
//           fetchData(wagonSearch, wagonCount);
//       }
//   };

//   const handleReset = () => {
//       setWagonSearch('');
//       setWagonCount(id_four === 1 ? 30 : 16);
//       fetchData();
//   };

//   useEffect(() => {
//       fetchData();
      
//       // Mettre à jour toutes les 3 heures (10800000 ms)
//       const interval = setInterval(fetchData, 10800000);
      
//       return () => clearInterval(interval);
//   }, [fourNum]);

//   if (loading) return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//           <CircularProgress />
//       </Box>
//   );
    
//   /*if (error) return (
//       <Alert severity="info" sx={{ mb: 2 }}>
//           {error}
//       </Alert>
//   );*/
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'en attente': return 'warning';
//       case 'en cuisson': return 'info';
//       case 'prêt à sortir': return 'success';
//       case 'sorti': return 'default';
//       default: return 'primary';
//     }
//   };
//   const columns=[
//       { field: 'wagon_num', headerName: 'N° wagon', valueGetter: params => params || 'N/A', flex: 1 },
//       { field: 'wagon_type', headerName: 'Type', valueGetter: params => params || 'N/A', flex: 1 },
//       { field: 'four_num', headerName: 'Four', valueGetter: params => params || 'N/A', flex: 1 },
//       {
//         field: 'total_pieces',
//         headerName: 'Pièces',
//         valueGetter: params =>
//           //params?.reduce((sum, detail) => sum + Number(detail.quantite), 0) || 0,
//           params || 0,
//         flex: 1
//       },
//       {
//         field: 'heure_sortie',
//         headerName: 'Heure sortie estimée',
//         valueGetter: params =>params,
//           /*console.log("date",params) 
//           params
//             ? new Date(params).toLocaleTimeString()
//             : 'N/A',*/
//         flex: 1
//       },
//       { field: 'statut', headerName: 'Statut', flex: 1,
//         renderCell: (params) => (
//         <Chip
//           label={params.row.statut}
//           color={getStatusColor(params.row.statut)}
//           size="small"
//         />
//       )
//        },
//        {
//         field: 'actions',
//         headerName: 'Actions',
//         flex: 1,
//         sortable: false,
//         filterable: false,
//         renderCell: (params) => (
//           <Button
//             variant="outlined"
//             size="small"
//             onClick={() => fetchWagonDetails(params.row.id)}
//           >
//             Détails
//           </Button>
//         )
//        }
//     ]

//   return (
//       <>
//           <TableContainer component={Paper} sx={{ mb: 4 }}>
//               <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <Typography variant="subtitle1">
//                           Total: {totalCount} wagons 
//                       </Typography>
//                       <Button 
//                           variant="outlined" 
//                           startIcon={<RefreshIcon />}
//                           onClick={() => {
//                               setWagonSearch('');
//                               fetchData();
//                           }}
//                           size="small"
//                       >
//                           Actualiser
//                       </Button>
//                   </Box>

//                   <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
//                       <TextField
//                           label="Nombre de wagons"
//                           variant="outlined"
//                           size="small"
//                           type="number"
//                           value={wagonCount}
//                           onChange={(e) => setWagonCount(Math.max(1, parseInt(e.target.value) || 1))}
//                           sx={{ width: 120 }}
//                           inputProps={{ min: 1 }}
//                       />
                      
//                       <TextField
//                           label="Rechercher à partir du wagon..."
//                           variant="outlined"
//                           size="small"
//                           value={wagonSearch}
//                           onChange={(e) => setWagonSearch(e.target.value)}
//                           sx={{ width: 200 }}
//                           placeholder="Numéro de wagon"
//                       />
                      
//                       <Button 
//                           variant="contained" 
//                           onClick={handleSearchByWagon}
//                           size="small"
//                       >
//                           Rechercher
//                       </Button>
                      
//                       <Button 
//                           variant="outlined" 
//                           onClick={handleReset}
//                           size="small"
//                       >
//                           Réinitialiser
//                       </Button>
//                   </Box>
//               </Box>
              
//               <DataGrid
//                   rows={wagonsData}
//                   columns={columns}
//                   getRowId={(row) => row.id}
//                   localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
//                   components={{ Toolbar: CustomToolbar }}
//                   autoHeight
//                   showToolbar
//                 />

//             {customTrieursNeeded && (
//               <Box sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
//                   <Typography variant="subtitle1" sx={{ mb: 1 }}>
//                       Besoins en trieurs pour {wagonsData.length} wagons affichés:
//                   </Typography>
//                   <FourTrieursNeeded 
//                       data={id_four === 1 ? customTrieursNeeded.f3 : customTrieursNeeded.f4} 
//                       four={fourNum} 
//                       fullWidth 
//                   />
//               </Box>
//             )}
//           </TableContainer>

//           {/* Modal pour les détails du wagon */}
//           <Modal open={showWagonDetailsModal} onClose={() => setShowWagonDetailsModal(false)}>
//             <Box sx={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '50%',
//                 transform: 'translate(-50%, -50%)',
//                 width: 600,
//                 bgcolor: 'background.paper',
//                 boxShadow: 24,
//                 p: 4,
//                 borderRadius: 2
//             }}>
//             {selectedWagonDetails && (
//             <>
//               <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
//                   <Typography variant="h6">Détails du Wagon #{selectedWagonDetails.wagon_num}</Typography>
//                   <IconButton onClick={() => setShowWagonDetailsModal(false)}>
//                       <CloseIcon />
//                   </IconButton>
//               </Box>

//               <Grid container spacing={2} sx={{ mb: 2 }}>
//                   <Grid item xs={6}>
//                       <Typography variant="subtitle2">Type:</Typography>
//                       <Typography>{selectedWagonDetails.wagon_type}</Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                       <Typography variant="subtitle2">Four:</Typography>
//                       <Typography>{selectedWagonDetails.four_num}</Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                       <Typography variant="subtitle2">Statut:</Typography>
//                       <Typography>{selectedWagonDetails.statut}</Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                       <Typography variant="subtitle2">Date Chargement:</Typography>
//                       <Typography>
//                           {new Date(selectedWagonDetails.datetime_chargement).toLocaleString()}
//                       </Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                       <Typography variant="subtitle2">Date sorti estimée:</Typography>
//                       <Typography>
//                           {new Date(selectedWagonDetails.heure_sortie_estimee).toLocaleString()}
//                       </Typography>
//                   </Grid>
//               </Grid>

//               <Divider sx={{ my: 2 }} />

//               <Typography variant="h6" gutterBottom>Pièces Chargées</Typography>
//               <TableContainer component={Paper}>
//                   <Table size="small">
//                       <TableHead>
//                           <TableRow>
//                               <TableCell>Famille</TableCell>
//                               <TableCell align="right">Quantité</TableCell>
//                           </TableRow>
//                       </TableHead>
//                       <TableBody>
//                           {selectedWagonDetails.details.map((detail, index) => (
//                               <TableRow key={index}>
//                                   <TableCell>{detail.nom_famille}</TableCell>
//                                   <TableCell align="right">{detail.quantite}</TableCell>
//                               </TableRow>
//                           ))}
//                       </TableBody>
//                   </Table>
//               </TableContainer>
//             </>
//             )}
//             </Box>
//           </Modal>
//       </>
//   );
// };
// // Component: TrieursTable
// const TrieursTable = () => {
//   const [trieurs, setTrieurs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [openModal, setOpenModal] = useState(false);
//   const [familles, setFamilles] = useState([]); // Nouvel état pour les familles
//   const [selectedFamilles, setSelectedFamilles] = useState([]); // Familles sélectionnées
//   const [submitting, setSubmitting] = useState(false);
//   const [newTrieur, setNewTrieur] = useState({
//     matricule: '',
//     nom: '',
//     prenom: '',
//   });
//   const handleToggleActive = async (userId, isCurrentlyActive) => {
//   try {
//     const token = localStorage.getItem('token');
//     await axios.patch(`http://localhost:8000/api/users/${userId}/toggle-active`, {}, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     fetchTrieurs(); // Recharger la liste
//   } catch (err) {
//     console.error('Erreur:', err);
//     alert("Erreur lors de la modification du statut");
//   }
// };

// const handleDelete = async (userId) => {
//   if (window.confirm("Êtes-vous sûr de vouloir supprimer ce trieur ?")) {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`http://localhost:8000/api/users/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       fetchTrieurs(); // Recharger la liste
//     } catch (err) {
//       console.error('Erreur:', err);
//       alert("Erreur lors de la suppression");
//     }
//   }
// };

//   // Charger les familles disponibles
//   const fetchFamilles = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:8000/api/familles', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setFamilles(response.data || []);
//     } catch (err) {
//       console.error('Erreur:', err.response?.data || err.message);
//     }
//   };

//   // Fonction pour charger les trieurs
//   // Dans la fonction fetchTrieurs
// const fetchTrieurs = async () => {
//   setLoading(true);
//   try {
//     const token = localStorage.getItem('token');
//     const response = await axios.get('http://localhost:8000/api/trieurs/actifs', {
//       headers: { Authorization: `Bearer ${token}` },
//       params: { with_polyvalences: true } // Ajout de ce paramètre
//     });
//     setTrieurs(response.data || []);
//   } catch (err) {
//     console.error('Erreur:', err.response?.data || err.message);
//     setError("Erreur lors du chargement des trieurs");
//     setTrieurs([]);
//   } finally {
//     setLoading(false);
//   }
// };

//   // Chargement initial
//   useEffect(() => {
//     fetchTrieurs();
//     fetchFamilles();
//   }, []);

//   // Fonction de filtrage
//   const filteredTrieurs = trieurs.filter(trieur => 
//     trieur.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     trieur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     trieur.prenom.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Fonction pour ajouter un trieur
//   const handleAddTrieur = async () => {
//     setSubmitting(true);
//     try {
//       const token = localStorage.getItem('token');
      
//       // 1. Créer l'utilisateur (trieur)
//       const userResponse = await axios.post('http://localhost:8000/api/users', {
//         matricule: newTrieur.matricule,
//         nom: newTrieur.nom,
//         prenom: newTrieur.prenom,
//         role: 'trieur',
//         password: '' // ou générez un mot de passe aléatoire
//       }, {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
  
//       const userId = userResponse.data.id_user;
  
//       // 2. Ajouter les polyvalences si des familles sont sélectionnées
//       if (selectedFamilles.length > 0) {
//         await Promise.all(selectedFamilles.map(familleId => 
//           axios.post('http://localhost:8000/api/polyvalences', {
//             id_famille: familleId,
//             id_user: userId
//           }, {
//             headers: { Authorization: `Bearer ${token}` }
//           })
//         ));
//       }
  
//       // Rafraîchir la liste
//       await fetchTrieurs();
//       setOpenModal(false);
//       setNewTrieur({ matricule: '', nom: '', prenom: '' });
//       setSelectedFamilles([]);
//     } catch (err) {
//       console.error('Erreur détaillée:', {
//         message: err.message,
//         response: err.response?.data,
//         status: err.response?.status
//       });
//       alert(`Erreur: ${err.response?.data?.message || err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleFamilleChange = (event) => {
//     const { value } = event.target;
//     setSelectedFamilles(
//       typeof value === 'string' ? value.split(',') : value,
//     );
//   };

//   if (loading) return <Typography>Chargement en cours...</Typography>;
//   if (error) return <Typography color="error">{error}</Typography>;

//   return (
//     <TableContainer component={Paper}>
//       <Box sx={{ p: 2 }}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//           <TextField
//             label="Rechercher par matricule, nom ou prénom"
//             variant="outlined"
//             size="small"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             sx={{ width: '40%' }}
//           />
//           <Button 
//             variant="contained" 
//             onClick={() => setOpenModal(true)}
//             startIcon={<PeopleIcon />}
//           >
//             Ajouter un trieur
//           </Button>
//         </Box>

//         {/* Modal d'ajout */}
//         <Modal open={openModal} onClose={() => setOpenModal(false)}>
//           <Box sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: 400,
//             bgcolor: 'background.paper',
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2
//           }}>
//             <Typography variant="h6" sx={{ mb: 2 }}>Nouveau trieur</Typography>
            
//             <Stack spacing={2}>
//               <TextField
//                 label="Matricule"
//                 name="matricule"
//                 value={newTrieur.matricule}
//                 onChange={(e) => setNewTrieur({...newTrieur, matricule: e.target.value})}
//                 fullWidth
//                 required
//               />
//               <TextField
//                 label="Nom"
//                 name="nom"
//                 value={newTrieur.nom}
//                 onChange={(e) => setNewTrieur({...newTrieur, nom: e.target.value})}
//                 fullWidth
//                 required
//               />
//               <TextField
//                 label="Prénom"
//                 name="prenom"
//                 value={newTrieur.prenom}
//                 onChange={(e) => setNewTrieur({...newTrieur, prenom: e.target.value})}
//                 fullWidth
//                 required
//               />
              
//               <FormControl fullWidth>
//                 <InputLabel id="familles-label">Familles (polyvalence)</InputLabel>
//                 <Select
//                   labelId="familles-label"
//                   id="familles-select"
//                   multiple
//                   value={selectedFamilles}
//                   onChange={handleFamilleChange}
//                   input={<OutlinedInput label="Familles (polyvalence)" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                       {selected.map((value) => (
//                         <Chip key={value} label={familles.find(f => f.id_famille === value)?.nom_famille || value} />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   {familles.map((famille) => (
//                     <MenuItem
//                       key={famille.id_famille}
//                       value={famille.id_famille}
//                     >
//                       <Checkbox checked={selectedFamilles.indexOf(famille.id_famille) > -1} />
//                       <ListItemText primary={famille.nom_famille} />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
              
//               <LoadingButton
//                 variant="contained"
//                 onClick={handleAddTrieur}
//                 loading={submitting}
//                 loadingPosition="start"
//                 startIcon={<SaveIcon />}
//               >
//                 Enregistrer
//               </LoadingButton>
//             </Stack>
//           </Box>
//         </Modal>

//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Matricule</TableCell>
//               <TableCell>Nom</TableCell>
//               <TableCell>Prénom</TableCell>
//               <TableCell>Polyvalences</TableCell>
//               <TableCell>Statut</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
// <TableBody>
//   {filteredTrieurs.length === 0 ? (
//     <TableRow>
//       <TableCell colSpan={5} align="center">
//         {trieurs.length === 0 ? 'Aucun trieur disponible' : 'Aucun trieur trouvé avec ce critère'}
//       </TableCell>
//     </TableRow>
//   ) : (
//     filteredTrieurs.map((trieur) => (
//       <TableRow key={trieur.id_user}>
//         <TableCell>{trieur.matricule.toUpperCase()}</TableCell>
//         <TableCell>{trieur.nom.toUpperCase()}</TableCell>
//         <TableCell>{trieur.prenom.toUpperCase()}</TableCell>
//         <TableCell>
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//             {trieur.polyvalences?.map(poly => (
//               <Chip 
//                 key={poly.id_polyvalence} 
//                 label={poly.famille?.nom_famille || 'Inconnue'} 
//                 size="small"
//                 color="primary"
//               />
//             ))}
//             {(!trieur.polyvalences || trieur.polyvalences.length === 0) && (
//               <Typography variant="caption" color="text.secondary">
//                 Aucune polyvalence
//               </Typography>
//             )}
//           </Box>
//         </TableCell>
//         <TableCell>
//     <Chip
//       label={trieur.is_active ? 'Actif' : 'Inactif'}
//       color={trieur.is_active ? 'success' : 'default'}
//     />
//   </TableCell>
//   <TableCell>
//     <IconButton 
//       color={trieur.is_active ? "warning" : "success"}
//       onClick={() => handleToggleActive(trieur.id_user, trieur.is_active)}
//     >
//       {trieur.is_active ? <BlockIcon /> : <CheckCircleIcon />}
//     </IconButton>
//     <IconButton 
//       color="error"
//       onClick={() => handleDelete(trieur.id_user)}
//     >
//       <DeleteIcon />
//     </IconButton>
//   </TableCell>
// </TableRow>
//     ))
//   )}
// </TableBody>
//         </Table>
//       </Box>
//     </TableContainer>
//   );
// };


// const FourTrieursNeeded = ({ data, four, fullWidth }) => {
//   return (
//     <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
//       <Typography variant="h6" gutterBottom>
//         Four {four} - Besoins en Trieurs
//       </Typography>
//       <Typography variant="body1" sx={{ mb: 2 }}>
//         <strong>Total pièces à trier:</strong> {data.total_pieces}
//       </Typography>
//       <Typography variant="body1" sx={{ mb: 2 }}>
//         <strong>Trieurs nécessaires:</strong> {data.total_trieurs_needed}
//       </Typography>
      
//       <TableContainer component={Paper} variant="outlined">
//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell>Famille</TableCell>
//               <TableCell align="right">Pièces</TableCell>
//               <TableCell align="right">Trieurs nécessaires</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {data.familles
//               .sort((a, b) => b.total_pieces - a.total_pieces) // tri décroissant
//               .map((famille, index) => (
//               <TableRow key={index}>
//                 <TableCell>{famille.nom_famille}</TableCell>
//                 <TableCell align="right">{famille.total_pieces}</TableCell>
//                 <TableCell align="right">{famille.trieurs_needed}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };
// const WagonsTabs = () => {
//   const [activeTab, setActiveTab] = useState('f3');
//   const [filterActive, setFilterActive] = useState(true);

//   return (
//     <Box sx={{ mb: 4 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//           <Button
//             variant={activeTab === 'f3' ? 'contained' : 'text'}
//             onClick={() => setActiveTab('f3')}
//             sx={{ 
//               mr: 1,
//               borderRadius: '8px 8px 0 0',
//               backgroundColor: activeTab === 'f3' ? '#3498db' : 'transparent',
//               color: activeTab === 'f3' ? '#fff' : 'inherit',
//               '&:hover': {
//                 backgroundColor: activeTab === 'f3' ? '#2980b9' : 'rgba(0,0,0,0.04)'
//               }
//             }}
//           >
//             Four F3
//           </Button>
//           <Button
//             variant={activeTab === 'f4' ? 'contained' : 'text'}
//             onClick={() => setActiveTab('f4')}
//             sx={{ 
//               borderRadius: '8px 8px 0 0',
//               backgroundColor: activeTab === 'f4' ? '#3498db' : 'transparent',
//               color: activeTab === 'f4' ? '#fff' : 'inherit',
//               '&:hover': {
//                 backgroundColor: activeTab === 'f4' ? '#2980b9' : 'rgba(0,0,0,0.04)'
//               }
//             }}
//           >
//             Four F4
//           </Button>
//         </Box>
//         {activeTab === 'f3'}
//       </Box>

//       {activeTab === 'f3' && <WagonTable fourNum="F3" id_four={1} />}
//       {activeTab === 'f4' && <WagonTable fourNum="F4" id_four={2} />}
//     </Box>
//   );
// };
// Main Dashboard content
// // DashboardContent modifié
// const DashboardContent = () => {
//   const [filterActive, setFilterActive] = useState(true);
//   const [statsData, setStatsData] = useState([
//     { 
//       title: 'Wagon en cours', 
//       value: '0',
//       icon: <LocalShippingIcon fontSize="small" />
//     },
//     { 
//       title: 'Pièces en cours', 
//       value: '0',
//       icon: <ViewModuleIcon fontSize="small" />
//     },
//     { 
//       title: 'Trieurs disponible', 
//       value: '0',
//       icon: <PeopleIcon fontSize="small" />
//     },
//     { 
//       title: 'Densite', 
//       value: '0',
//       icon: <BarChartIcon fontSize="small" />
//     },
//   ]);
//   const [densityDetails, setDensityDetails] = useState({
//     f3: { totalPieces: 0, density: 0 },
//     f4: { totalPieces: 0, density: 0 },
//     interval: { start: '', end: '' }
//   });
//   const [trieursNeeded, setTrieursNeeded] = useState({
//     f3: { total_pieces: 0, total_trieurs_needed: 0, familles: [] },
//     f4: { total_pieces: 0, total_trieurs_needed: 0, familles: [] },
//     interval: { start: '', end: '' }
//   });
//   const [wagonsData, setWagonsData] = useState({ f3: [], f4: [] });

//   const fetchDensity = async () => {
//     try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:8000/api/chargements/density", {
//             headers: { Authorization: `Bearer ${token}` },
//         });

//         setStatsData(prevStats => {
//             const newStats = [...prevStats];
//             newStats[3] = { 
//                 ...newStats[3], 
//                 value: response.data.global_density.toString(),
//                 details: response.data // Stocker les détails pour le tooltip
//             };
//             return newStats;
//         });

//         setDensityDetails({
//             f3: {
//                 totalPieces: response.data.f3.total_pieces,
//                 density: response.data.f3.density
//             },
//             f4: {
//                 totalPieces: response.data.f4.total_pieces,
//                 density: response.data.f4.density
//             },
//             interval: response.data.interval
//         });
//     } catch (error) {
//         console.error("Erreur lors du calcul de la densité:", error);
//     }
// };

//   const fetchActiveTrieursCount = async () => {
//     try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:8000/api/trieurs/count-active", {
//             headers: { Authorization: `Bearer ${token}` },
//         });

//         setStatsData(prevStats => {
//             const newStats = [...prevStats];
//             newStats[2] = { ...newStats[2], value: response.data.count.toString() };
//             return newStats;
//         });
//     } catch (error) {
//         console.error("Erreur lors du chargement du nombre de trieurs actifs:", error);
//         setStatsData(prevStats => {
//             const newStats = [...prevStats];
//             newStats[2] = { ...newStats[2], value: 'N/A' };
//             return newStats;
//         });
//     }
// };

//   const fetchTrieursNeeded = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get("http://localhost:8000/api/chargements/trieurs-needed-dash", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       setTrieursNeeded({
//         f3: response.data.f3 || { total_pieces: 0, total_trieurs_needed: 0, familles: [] },
//         f4: response.data.f4 || { total_pieces: 0, total_trieurs_needed: 0, familles: [] },
//         interval: response.data.current_interval || { start: '', end: '' }
//       });

//       // Récupérer aussi les wagons pour chaque four
//       const [f3Response, f4Response] = await Promise.all([
//         axios.get('http://localhost:8000/api/chargements/interval', {
//           headers: { 'Authorization': `Bearer ${token}` },
//           params: { id_four: 1 }
//         }),
//         axios.get('http://localhost:8000/api/chargements/interval', {
//           headers: { 'Authorization': `Bearer ${token}` },
//           params: { id_four: 2 }
//         })
//       ]);

//       setWagonsData({
//         f3: f3Response.data.chargements,
//         f4: f4Response.data.chargements
//       });
//     } catch (error) {
//       console.error("Erreur lors du chargement des besoins en trieurs:", error);
//     }
//   };


//   const fetchCookingWagons = async () => {
//     try {
//       const response = await axios.get('http://localhost:8000/api/wagons/cooking-count');
//       const count = response.data.count;
      
//       setStatsData(prevStats => {
//         const newStats = [...prevStats];
//         newStats[0] = { ...newStats[0], value: count.toString() };
//         return newStats;
//       });
//     } catch (error) {
//       console.error('Error fetching cooking wagons count:', error);
//     }
//   };

//   const fetchTotalPieces = async () => {
//     try {
//       const response = await axios.get('http://localhost:8000/api/pieces/Somme');
//       const count = response.data.count || 0;
      
//       setStatsData(prevStats => {
//         const newStats = [...prevStats];
//         newStats[1] = { ...newStats[1], value: count.toString() };
//         return newStats;
//       });
//     } catch (error) {
//       console.error('Error fetching total pieces count:', error);
//       setStatsData(prevStats => {
//         const newStats = [...prevStats];
//         newStats[1] = { ...newStats[1], value: 'N/A' };
//         return newStats;
//       });
//     }
//   };

//   const handleRefresh = () => {
//     fetchCookingWagons();
//     fetchTotalPieces();
//     fetchTrieursNeeded();
//     fetchActiveTrieursCount();
//     fetchDensity();
//   };

//   useEffect(() => {
//     fetchCookingWagons();
//     fetchTotalPieces();
//     fetchTrieursNeeded();
//     fetchActiveTrieursCount();
//     fetchDensity();
//     const interval = setInterval(() => {
//       fetchCookingWagons();
//       fetchTotalPieces();
//       fetchTrieursNeeded();
//       fetchActiveTrieursCount();
//       fetchDensity();
//     }, 30000);
//     return () => clearInterval(interval);
//   }, []);
  

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header amélioré */}
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         mb: 4,
//         backgroundColor: 'white',
//         p: 3,
//         borderRadius: 3,
//         boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
//       }}>
//         <Box>
//           <Typography 
//             variant="h4" 
//             component="h1"
//             sx={{ 
//               fontWeight: 700,
//               color: theme.palette.primary.dark
//             }}
//           >
//             Tableau de bord
//           </Typography>
//           <Typography 
//             variant="body1"
//             sx={{
//               color: theme.palette.text.secondary
//             }}
//           >
//             Aperçu global de la production
//           </Typography>
//         </Box>
//         <Box sx={{ textAlign: 'right' }}>
//           <Button 
//             variant="contained" 
//             startIcon={<RefreshIcon />}
//             onClick={handleRefresh}
//             sx={{
//               backgroundColor: theme.palette.primary.main,
//               '&:hover': {
//                 backgroundColor: theme.palette.primary.dark
//               }
//             }}
//           >
//             Actualiser
//           </Button>
//         </Box>
//       </Box>

//       {/* Stats Cards améliorées */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {statsData.map((stat, index) => (
//           <Grid item xs={12} sm={6} md={3} key={index}>
//             <StatCard 
//               title={stat.title} 
//               value={stat.value} 
//               details={stat.details}
//               icon={stat.icon}
//             />
//           </Grid>
//         ))}
//       </Grid>

      

//       {/* Section Wagons améliorée */}
//       <Card sx={{ borderRadius: 3 }}>
//         <CardContent sx={{ p: 0 }}>
//           <Box sx={{ 
//             p: 3,
//             borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
//             backgroundColor: '#f8fafc',
//             borderTopLeftRadius: 12,
//             borderTopRightRadius: 12
//           }}>
//             <Typography 
//               variant="h5" 
//               component="h2"
//               sx={{ 
//                 fontWeight: 600,
//                 color: theme.palette.primary.dark
//               }}
//             >
//               Suivi des wagons
//             </Typography>
//           </Box>
//           <Box sx={{ p: 3 }}>
//             <WagonsTabs />
//           </Box>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };
// Team Management content
// Dans TeamContent.jsx
const TeamContent = ({ subSection }) => {
    return (
      <Box sx={{ p: 3 }}>
        {subSection === 'enfourneur' ? (
          <EnfourneurTable />
        ) : (
          <TrieursTable />
        )}
      </Box>
    );
  };
//   const EnfourneurTable = () => {
//   const [enfourneurs, setEnfourneurs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [openModal, setOpenModal] = useState(false);
//   const [newEnfourneur, setNewEnfourneur] = useState({
//     matricule: '',
//     nom: '',
//     prenom: '',
//     password: ''
//   });
//   const [submitting, setSubmitting] = useState(false);

//   // Fonction pour charger les enfourneurs (définie en dehors du useEffect)
//   const fetchEnfourneurs = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:8000/api/enfourneurs/actifs', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       setEnfourneurs(response.data);
//     } catch (err) {
//       setError("Erreur lors du chargement des enfourneurs");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleActive = async (userId, isCurrentlyActive) => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.patch(`http://localhost:8000/api/users/${userId}/toggle-active`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       fetchEnfourneurs(); // Maintenant cette fonction est définie
//     } catch (err) {
//       console.error('Erreur:', err);
//       alert("Erreur lors de la modification du statut");
//     }
//   };

//   const handleDelete = async (userId) => {
//     if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enfourneur ?")) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.delete(`http://localhost:8000/api/users/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         fetchEnfourneurs(); // Maintenant cette fonction est définie
//       } catch (err) {
//         console.error('Erreur:', err);
//         alert("Erreur lors de la suppression");
//       }
//     }
//   };

//   // Fonction pour ajouter un enfourneur
//   const handleAddEnfourneur = async () => {
//     setSubmitting(true);
//     try {
//       const token = localStorage.getItem('token');
//       await axios.post('http://localhost:8000/api/users', {
//         ...newEnfourneur,
//         role: 'enfourneur'
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       fetchEnfourneurs(); // Maintenant cette fonction est définie
//       setOpenModal(false);
//       setNewEnfourneur({ matricule: '', nom: '', prenom: '', password: '' });
//     } catch (err) {
//       console.error('Erreur:', err.response?.data || err.message);
//       alert("Erreur lors de l'ajout de l'enfourneur");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     fetchEnfourneurs(); // Utilisation de la fonction définie
//   }, []);

//   // Fonction de filtrage
//   const filteredEnfourneurs = enfourneurs.filter(enfourneur => 
//     enfourneur.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     enfourneur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     enfourneur.prenom.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) return <Typography>Chargement en cours...</Typography>;
//   if (error) return <Typography color="error">{error}</Typography>;

//   return (
//     <TableContainer component={Paper}>
//       <Box sx={{ p: 2 }}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//           <TextField
//             label="Rechercher par matricule, nom ou prénom"
//             variant="outlined"
//             size="small"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             sx={{ width: '40%' }}
//           />
//           <Button 
//             variant="contained" 
//             onClick={() => setOpenModal(true)}
//             startIcon={<PeopleIcon />}
//           >
//             Ajouter un enfourneur
//           </Button>
//         </Box>

//         {/* Modal d'ajout */}
//         <Modal open={openModal} onClose={() => setOpenModal(false)}>
//           <Box sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: 400,
//             bgcolor: 'background.paper',
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2
//           }}>
//             <Typography variant="h6" sx={{ mb: 2 }}>Nouvel enfourneur</Typography>
            
//             <Stack spacing={2}>
//               <TextField
//                 label="Matricule"
//                 name="matricule"
//                 value={newEnfourneur.matricule}
//                 onChange={(e) => setNewEnfourneur({...newEnfourneur, matricule: e.target.value})}
//                 fullWidth
//                 required
//               />
//               <TextField
//                 label="Nom"
//                 name="nom"
//                 value={newEnfourneur.nom}
//                 onChange={(e) => setNewEnfourneur({...newEnfourneur, nom: e.target.value})}
//                 fullWidth
//                 required
//               />
//               <TextField
//                 label="Prénom"
//                 name="prenom"
//                 value={newEnfourneur.prenom}
//                 onChange={(e) => setNewEnfourneur({...newEnfourneur, prenom: e.target.value})}
//                 fullWidth
//                 required
//               />
//               <TextField
//                 label="Mot de passe (optionnel)"
//                 type="password"
//                 name="password"
//                 value={newEnfourneur.password}
//                 onChange={(e) => setNewEnfourneur({...newEnfourneur, password: e.target.value})}
//                 fullWidth
//               />
              
//               <LoadingButton
//                 variant="contained"
//                 onClick={handleAddEnfourneur}
//                 loading={submitting}
//                 loadingPosition="start"
//                 startIcon={<SaveIcon />}
//               >
//                 Enregistrer
//               </LoadingButton>
//             </Stack>
//           </Box>
//         </Modal>

//         <Table sx={{ minWidth: 650 }} aria-label="enfourneurs table">
//           <TableHead>
//             <TableRow>
//               <TableCell>Matricule</TableCell>
//               <TableCell>Nom</TableCell>
//               <TableCell>Prénom</TableCell>
//               <TableCell>Statut</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredEnfourneurs.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5} align="center">Aucun enfourneur trouvé</TableCell>
//               </TableRow>
//             ) : (
//               filteredEnfourneurs.map((enfourneur) => (
//                 <TableRow key={enfourneur.id_user}>
//                   <TableCell>{enfourneur.matricule.toUpperCase()}</TableCell>
//                   <TableCell>{enfourneur.nom.toUpperCase()}</TableCell>
//                   <TableCell>{enfourneur.prenom.toUpperCase()}</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={enfourneur.is_active ? 'Actif' : 'Inactif'}
//                       color={enfourneur.is_active ? 'success' : 'default'}
//                       size="small"
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <IconButton 
//                       color={enfourneur.is_active ? "warning" : "success"}
//                       onClick={() => handleToggleActive(enfourneur.id_user, enfourneur.is_active)}
//                     >
//                       {enfourneur.is_active ? <BlockIcon /> : <CheckCircleIcon />}
//                     </IconButton>
//                     <IconButton 
//                       color="error"
//                       onClick={() => handleDelete(enfourneur.id_user)}
//                     >
//                       <DeleteIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </Box>
//     </TableContainer>
//   );
// };

// Report content
const ReportContent = ({ subSection }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Reports & Statistics - {subSection === 'monthly' ? 'Monthly Analysis' : 'Daily Report'}
      </Typography>
    </Box>
  );
};


const PlaceholderContent = ({ title }) => {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>{title}</Typography>
    </Box>
  );
};

const useSimpleRouter = () => {
    const [pathname, setPathname] = useState('/dashboard');
  
    const handleNavigate = (path) => {
      if (path === '/logout') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        setPathname(path.startsWith('/') ? path : `/${path}`);
      }
    };
  
    return {
      pathname,
      push: handleNavigate,
      replace: handleNavigate,
      navigate: handleNavigate,
    };
  };

function ChefDashboard() {
    const router = useSimpleRouter();
    // Ajoutez ces états ici
    const [selectedWagonDetails, setSelectedWagonDetails] = useState(null);
    const [showWagonDetailsModal, setShowWagonDetailsModal] = useState(false);

    const renderContent = () => {
        const pathSegments = router.pathname.split('/').filter(Boolean);
        const mainSection = pathSegments[0] || 'dashboard';
        const subSection = pathSegments[1];

        switch (mainSection) {
            case 'dashboard':
                return <DashboardContent />;
            case 'team':
                return <TeamContent subSection={subSection} />;
            case 'wagon':
                return <WagonVisualization 
                    setSelectedWagonDetails={setSelectedWagonDetails}
                    setShowWagonDetailsModal={setShowWagonDetailsModal}
                />;
            case 'report':
                return <ReportContent subSection={subSection} />;
            case 'historique':
                return <HistoriqueChargement />;
            case 'affectation':
                return <AffectationContent 
                    setSelectedWagonDetails={setSelectedWagonDetails}
                    setShowWagonDetailsModal={setShowWagonDetailsModal}
                />;
            case 'chargement':
                return <ChargementContent 
                    setSelectedWagonDetails={setSelectedWagonDetails}
                    setShowWagonDetailsModal={setShowWagonDetailsModal}
                />;
                case 'familles':
            return <FamillesContent />;
            case 'parametrage':
                return <ParametrageContent />;
            default:
                return <DashboardContent />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppProvider
                navigation={NAVIGATION}
                branding={{
                  //logo: <img src={eKilnLogo} alt="eKiln logo" />,
                  title: 'eKiln',
                  homeUrl: '/chedDashboard',
                }}
                router={router}
                theme={theme}
            >
                <DashboardLayout>
                    {renderContent()}
                </DashboardLayout>
            </AppProvider>
            {/* Modal pour les détails du wagon */}
            <Modal open={showWagonDetailsModal} onClose={() => setShowWagonDetailsModal(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2
                }}>
                    {selectedWagonDetails && (
                        <>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6">Détails du Wagon #{selectedWagonDetails.wagon_num}</Typography>
                                <IconButton onClick={() => setShowWagonDetailsModal(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Type:</Typography>
                                    <Typography>{selectedWagonDetails.wagon_type}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Four:</Typography>
                                    <Typography>{selectedWagonDetails.four_num}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Enfourneur:</Typography>
                                    <Typography>{selectedWagonDetails.enfourneur}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Date Chargement:</Typography>
                                    <Typography>
                                        {new Date(selectedWagonDetails.datetime_chargement).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom>Pièces Chargées</Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Famille</TableCell>
                                            <TableCell align="right">Quantité</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedWagonDetails.pieces.map((piece, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{piece.famille}</TableCell>
                                                <TableCell align="right">{piece.quantite}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </Modal>
        </ThemeProvider>
    );
}

export default ChefDashboard;