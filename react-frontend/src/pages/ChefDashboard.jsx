// import * as React from 'react';
// import { useState, useEffect, useRef,useNavigate } from 'react';
// import axios from 'axios';
// import Alert from '@mui/material/Alert';
// import Divider from '@mui/material/Divider';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import BlockIcon from '@mui/icons-material/Block';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import DeleteIcon from '@mui/icons-material/Delete';
// import eKilnLogo from '../components/assets/eKiln.png'; // Adjust path as needed
// import {
//   DataGrid,
//   GridToolbarContainer,
//   GridToolbarExport
// } from '@mui/x-data-grid';
// import { frFR } from '@mui/x-data-grid/locales'; // Example: French localization

// import FamillesContent from './Familles/FamillesContent';
// import ChargementContent from './ChargementContent';
// import ParametrageContent from './ParametrageContent';
// import WagonTable from './WagonTable';
// import TrieursTable from './TrieursTable';
// import EnfourneurTable from './EnfourneurTable';
// import DashboardContent from './DashboardContent';
// import HistoriqueChargement from './Chargement/HistoriqueChargement';
// import HistoryIcon from '@mui/icons-material/History';
// import CssBaseline from '@mui/material/CssBaseline';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';
// import Button from '@mui/material/Button';
// import Grid from '@mui/material/Grid';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import Chip from '@mui/material/Chip';
// import IconButton from '@mui/material/IconButton';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import PeopleIcon from '@mui/icons-material/People';
// import ViewModuleIcon from '@mui/icons-material/ViewModule';
// import BarChartIcon from '@mui/icons-material/BarChart';
// import AssignmentIcon from '@mui/icons-material/Assignment';
// import LogoutIcon from '@mui/icons-material/Logout';
// import ArrowRightIcon from '@mui/icons-material/ArrowRight';
// import TextField from '@mui/material/TextField';
// import Modal from '@mui/material/Modal';
// import Stack from '@mui/material/Stack';
// import SaveIcon from '@mui/icons-material/Save';
// import LoadingButton from '@mui/lab/LoadingButton';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import Select from '@mui/material/Select';
// import MenuItem from '@mui/material/MenuItem';
// import OutlinedInput from '@mui/material/OutlinedInput';
// import Checkbox from '@mui/material/Checkbox';
// import ListItemText from '@mui/material/ListItemText';
// import ListAltIcon from '@mui/icons-material/ListAlt';
// import CloseIcon from '@mui/icons-material/Close';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import CircularProgress from '@mui/material/CircularProgress';
// import Tooltip from '@mui/material/Tooltip';
// import {Autocomplete} from "@mui/material";
// import InfoIcon from '@mui/icons-material/Info';
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';
// import { AppProvider } from '@toolpad/core/AppProvider';
// import { DashboardLayout } from '@toolpad/core/DashboardLayout';
// import AffectationContent from '../components/AffectationContent';
// import SettingsIcon from '@mui/icons-material/Settings';
// import { Edit, Check, X, Settings, Clock, Zap, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
// import WagonVisualization from './Wagons/WagonVisualization';

// // the sidebar
// const NAVIGATION = [
//   {
//     kind: 'header',
//     title: 'Main Menu',
//   },
//   {
//     segment: 'dashboard',
//     title: 'Dashboard',
//     icon: <DashboardIcon />,
//   },
//   {
//     segment: 'team',
//     title: 'Team Management',
//     icon: <PeopleIcon />,
//     children: [
//       {
//         segment: 'trieurs',
//         title: 'Trieurs',
//         icon: <PeopleIcon fontSize="small" />,
//       },
//       {
//         segment: 'enfourneur',
//         title: 'Enfourneur',
//         icon: <PeopleIcon fontSize="small" />,
//       },
//     ],
//   },
//   {
//     segment: 'wagon',
//     title: 'Wagon Visualization',
//     icon: <ViewModuleIcon />,
//   },
//   {
//   segment: 'historique',
//   title: 'Historique Chargements',
//   icon: <HistoryIcon />,
//   },
//   {
//     segment: 'affectation',
//     title: 'Affectation des Trieurs',
//     icon: <AssignmentIcon />,
//   },
//   {
//     segment: 'chargement',
//     title: 'Chargement Wagon',
//     icon: <LocalShippingIcon />,
//   },
//   /*{
//     segment: 'familles',
//       title: 'Gestion des Familles',
//       icon: <ListAltIcon />,
//   },
//   {
//   segment: 'parametrage',
//     title: 'Paramétre',
//     icon: <SettingsIcon />,
//   },
//   {
//     kind: 'divider',
//   },*/
//   {
//     segment: 'logout',
//     title: 'Déconnexion',
//     icon: <LogoutIcon color="error" />,
//   },
// ];
// // const CustomToolbar = () => (
// //   <GridToolbarContainer>
// //     <GridToolbarExport csvOptions={{ fileName: 'wagons_export' }} />
// //   </GridToolbarContainer>
// // );

// // Create theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#3f51b5', // Bleu profond plus élégant
//       light: '#757de8',
//       dark: '#002984',
//     },
//     secondary: {
//       main: '#f50057', // Rose/violet pour les accents
//     },
//     background: {
//       default: '#f8fafc', // Très léger bleu-gris
//       paper: '#ffffff',
//     },
//     text: {
//       primary: '#1e293b', // Gris foncé pour le texte
//       secondary: '#64748b', // Gris moyen
//     },
//     success: {
//       main: '#4caf50',
//     },
//     warning: {
//       main: '#ff9800',
//     },
//     error: {
//       main: '#f44336',
//     },
//     info: {
//       main: '#2196f3',
//     },
//   },
//   typography: {
//     fontFamily: [
//       '"Inter"',
//       '-apple-system',
//       'BlinkMacSystemFont',
//       '"Segoe UI"',
//       'Roboto',
//       '"Helvetica Neue"',
//       'Arial',
//       'sans-serif',
//       '"Apple Color Emoji"',
//       '"Segoe UI Emoji"',
//       '"Segoe UI Symbol"',
//     ].join(','),
//     h1: {
//       fontWeight: 700,
//       fontSize: '2.5rem',
//     },
//     h2: {
//       fontWeight: 600,
//       fontSize: '2rem',
//     },
//     h3: {
//       fontWeight: 600,
//       fontSize: '1.75rem',
//     },
//     h4: {
//       fontWeight: 600,
//       fontSize: '1.5rem',
//     },
//     h5: {
//       fontWeight: 600,
//       fontSize: '1.25rem',
//     },
//     h6: {
//       fontWeight: 600,
//       fontSize: '1.1rem',
//     },
//     subtitle1: {
//       fontWeight: 500,
//     },
//     body1: {
//       lineHeight: 1.6,
//     },
//   },
//   components: {
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//           boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
//           transition: 'box-shadow 0.3s ease, transform 0.3s ease',
//           '&:hover': {
//             boxShadow: '0 8px 30px 0 rgba(0,0,0,0.1)',
//             transform: 'translateY(-2px)',
//           },
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 8,
//           textTransform: 'none',
//           fontWeight: 500,
//           padding: '8px 16px',
//         },
//         contained: {
//           boxShadow: 'none',
//           '&:hover': {
//             boxShadow: 'none',
//           },
//         },
//       },
//     },
//     MuiPaper: {
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//         },
//       },
//     },
//     MuiTable: {
//       styleOverrides: {
//         root: {
//           '& .MuiTableCell-root': {
//             borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
//           },
//         },
//       },
//     },
//     MuiTableRow: {
//       styleOverrides: {
//         root: {
//           '&:nth-of-type(odd)': {
//             backgroundColor: '#ffffff',
//           },
//           '&:nth-of-type(even)': {
//             backgroundColor: '#f8fafc',
//           },
//           '&:hover': {
//             backgroundColor: '#f1f5ff',
//           },
//         },
//       },
//     },
//     MuiChip: {
//       styleOverrides: {
//         root: {
//           borderRadius: 6,
//         },
//       },
//     },
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           '& .MuiOutlinedInput-root': {
//             borderRadius: 8,
//           },
//         },
//       },
//     },
//     MuiSelect: {
//       styleOverrides: {
//         root: {
//           borderRadius: 8,
//         },
//       },
//     },
//   },
// });


// const TeamContent = ({ subSection }) => {
//     return (
//       <Box sx={{ p: 3 }}>
//         {subSection === 'enfourneur' ? (
//           <EnfourneurTable />
//         ) : (
//           <TrieursTable />
//         )}
//       </Box>
//     );
//   };

// // Report content
// const ReportContent = ({ subSection }) => {
//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
//         Reports & Statistics - {subSection === 'monthly' ? 'Monthly Analysis' : 'Daily Report'}
//       </Typography>
//     </Box>
//   );
// };


// const PlaceholderContent = ({ title }) => {
//   return (
//     <Box sx={{ p: 3, textAlign: 'center' }}>
//       <Typography variant="h4" component="h1" sx={{ mb: 3 }}>{title}</Typography>
//     </Box>
//   );
// };

// const useSimpleRouter = () => {
//     const [pathname, setPathname] = useState('/dashboard');
  
//     const handleNavigate = (path) => {
//       if (path === '/logout') {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/';
//       } else {
//         setPathname(path.startsWith('/') ? path : `/${path}`);
//       }
//     };
  
//     return {
//       pathname,
//       push: handleNavigate,
//       replace: handleNavigate,
//       navigate: handleNavigate,
//     };
//   };

// function ChefDashboard() {
//     const router = useSimpleRouter();
//     // Ajoutez ces états ici
//     const [selectedWagonDetails, setSelectedWagonDetails] = useState(null);
//     const [showWagonDetailsModal, setShowWagonDetailsModal] = useState(false);

//     const renderContent = () => {
//         const pathSegments = router.pathname.split('/').filter(Boolean);
//         const mainSection = pathSegments[0] || 'dashboard';
//         const subSection = pathSegments[1];

//         switch (mainSection) {
//             case 'dashboard':
//                 return <DashboardContent />;
//             case 'team':
//                 return <TeamContent subSection={subSection} />;
//             case 'wagon':
//                 return <WagonVisualization 
//                     setSelectedWagonDetails={setSelectedWagonDetails}
//                     setShowWagonDetailsModal={setShowWagonDetailsModal}
//                 />;
//             case 'report':
//                 return <ReportContent subSection={subSection} />;
//             case 'historique':
//                 return <HistoriqueChargement />;
//             case 'affectation':
//                 return <AffectationContent 
//                     setSelectedWagonDetails={setSelectedWagonDetails}
//                     setShowWagonDetailsModal={setShowWagonDetailsModal}
//                 />;
//             case 'chargement':
//                 return <ChargementContent 
//                     setSelectedWagonDetails={setSelectedWagonDetails}
//                     setShowWagonDetailsModal={setShowWagonDetailsModal}
//                 />;
//                 case 'familles':
//             return <FamillesContent />;
//             case 'parametrage':
//                 return <ParametrageContent />;
//             default:
//                 return <DashboardContent />;
//         }
//     };

//     return (
//         <ThemeProvider theme={theme}>
//             <CssBaseline />
//             <AppProvider
//                 navigation={NAVIGATION}
//                 branding={{
//                   //logo: <img src={eKilnLogo} alt="eKiln logo" />,
//                   title: 'eKiln',
//                   homeUrl: '/chedDashboard',
//                 }}
//                 router={router}
//                 theme={theme}
//             >
//                 <DashboardLayout>
//                     {renderContent()}
//                 </DashboardLayout>
//             </AppProvider>
//             {/* Modal pour les détails du wagon
//             <Modal open={showWagonDetailsModal} onClose={() => setShowWagonDetailsModal(false)}>
//                 <Box sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                     width: 600,
//                     bgcolor: 'background.paper',
//                     boxShadow: 24,
//                     p: 4,
//                     borderRadius: 2
//                 }}>
//                     {selectedWagonDetails && (
//                         <>
//                             <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
//                                 <Typography variant="h6">Détails du Wagon #{selectedWagonDetails.wagon_num}</Typography>
//                                 <IconButton onClick={() => setShowWagonDetailsModal(false)}>
//                                     <CloseIcon />
//                                 </IconButton>
//                             </Box>

//                             <Grid container spacing={2} sx={{ mb: 2 }}>
//                                 <Grid item xs={6}>
//                                     <Typography variant="subtitle2">Type:</Typography>
//                                     <Typography>{selectedWagonDetails.wagon_type}</Typography>
//                                 </Grid>
//                                 <Grid item xs={6}>
//                                     <Typography variant="subtitle2">Four:</Typography>
//                                     <Typography>{selectedWagonDetails.four_num}</Typography>
//                                 </Grid>
//                                 <Grid item xs={6}>
//                                     <Typography variant="subtitle2">Enfourneur:</Typography>
//                                     <Typography>{selectedWagonDetails.enfourneur}</Typography>
//                                 </Grid>
//                                 <Grid item xs={6}>
//                                     <Typography variant="subtitle2">Date Chargement:</Typography>
//                                     <Typography>
//                                         {new Date(selectedWagonDetails.datetime_chargement).toLocaleString()}
//                                     </Typography>
//                                 </Grid>
//                             </Grid>

//                             <Divider sx={{ my: 2 }} />

//                             <Typography variant="h6" gutterBottom>Pièces Chargées</Typography>
//                             <TableContainer component={Paper}>
//                                 <Table size="small">
//                                     <TableHead>
//                                         <TableRow>
//                                             <TableCell>Famille</TableCell>
//                                             <TableCell align="right">Quantité</TableCell>
//                                         </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                         {selectedWagonDetails.pieces.map((piece, index) => (
//                                             <TableRow key={index}>
//                                                 <TableCell>{piece.famille}</TableCell>
//                                                 <TableCell align="right">{piece.quantite}</TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </TableContainer>
//                         </>
//                     )}
//                 </Box>
//             </Modal> */}
//         </ThemeProvider>
//     );
// }

// export default ChefDashboard;
import React from 'react';
import SidebarChef from '../components/layout/SidebarChef';
import DashboardContent from './DashboardContent';

function ChefDashboard() {
  return (
  <SidebarChef initialPath="/chefDashboard">
  <DashboardContent/>
  </SidebarChef>
  )
}

export default ChefDashboard;
