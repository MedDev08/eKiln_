import React, { useState, useEffect } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import { TextField } from '@mui/material';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Modal,
  Divider,
  IconButton,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  Fade,
  Backdrop,
  Container,
  AppBar,
  Toolbar,
  Badge,
  Tooltip,
  Skeleton,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  ListAlt as ListAltIcon,
  LocalShipping as TruckIcon,
  Factory as FactoryIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Tabs, Tab } from '@mui/material';
import SidebarChef from '../components/layout/SidebarChef';
//  Thème global
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

const AffectationContent = () => {
  const [formErrors, setFormErrors] = useState({});
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);
  const [filteredTrieurs, setFilteredTrieurs] = useState([]);
  const [activeTab, setActiveTab] = useState('f3');
  const [dateFilter, setDateFilter] = useState('');
  const [chefFilter, setChefFilter] = useState('');
  const [familleFilter, setFamilleFilter] = useState('');
  const [quantites, setQuantites] = useState({});
  const [familles, setFamilles] = useState([]);
  const [trieurs, setTrieurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedTrieur, setSelectedTrieur] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAffectation, setSelectedAffectation] = useState(null);
  const [trieursNeeded, setTrieursNeeded] = useState({});
  const [showTrieurSelectionModal, setShowTrieurSelectionModal] = useState(false);
  const [currentFamilleForAffectation, setCurrentFamilleForAffectation] = useState(null);
  const [showNewAffectationModal, setShowNewAffectationModal] = useState(false);
  const [startWagonNumber, setStartWagonNumber] = useState('');
  const [selectedFour, setSelectedFour] = useState('f3');
  const [lastChargement, setLastChargement] = useState(null);
  const [calculatedWagons, setCalculatedWagons] = useState([]);
  const [selectedWagons, setSelectedWagons] = useState([]);
  const [wagonCount, setWagonCount] = useState(selectedFour === 'f3' ? 30 : 16);
  const filterAffectations = (affectations) => {
  return Object.entries(affectations[activeTab] || {}).filter(([interval, group]) => {
    const dateMatch = dateFilter ? 
      interval.split(' - ')[0].includes(dateFilter) : true;
    const chefMatch = chefFilter ? 
      `${group[0]?.chef?.prenom} ${group[0]?.chef?.nom}`.toLowerCase().includes(chefFilter.toLowerCase()) : true;
    const familleMatch = familleFilter ? 
      group.some(aff => aff.famille?.nom_famille.toLowerCase().includes(familleFilter.toLowerCase())) : true;
    
    return dateMatch && chefMatch && familleMatch;
  });
};
  const fetchAffectations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8000/api/affectations/with-details', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Grouper les affectations par four et par intervalle
    const groupedByFour = {
      f3: {},
      f4: {}
    };
    
    response.data.forEach(affectation => {
      const fourKey = affectation.id_four === 1 ? 'f3' : 'f4';
      const date = new Date(affectation.date_affectation);
      const hour = date.getHours();
      let interval;
      
      if (hour >= 5 && hour < 14) interval = 'Matin (5h-14h)';
      else if (hour >= 14 && hour < 22) interval = 'Après-midi (14h-22h)';
      else interval = 'Nuit (22h-5h)';
      
      const key = `${date.toLocaleDateString('fr-FR')} - ${interval}`;
      
      if (!groupedByFour[fourKey][key]) groupedByFour[fourKey][key] = [];
      groupedByFour[fourKey][key].push(affectation);
    });
    
    setAffectations(groupedByFour);
  } catch (err) {
    console.error('Error fetching affectations:', err);
    setError('Erreur lors du chargement des affectations');
    setAffectations({ f3: {}, f4: {} });
  }
};

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [famillesRes, trieursRes] = await Promise.all([
        axios.get('http://localhost:8000/api/familles', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/trieurs/actifs', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setFamilles(famillesRes.data || []);
      setTrieurs(trieursRes.data || []);
      await fetchAffectations();
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const findLastChargement = async (wagonNum) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/chargements/last-by-wagon/${wagonNum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLastChargement(response.data);
      return response.data;
    } catch (err) {
      console.error('Error finding last chargement:', err);
      setError('Erreur lors de la recherche du dernier chargement');
      return null;
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);
  const handleAddTrieur = () => {
  const newSelectedTrieur = [...selectedTrieur, ''];
  setSelectedTrieur(newSelectedTrieur);
  
  // Calculer la nouvelle quantité automatiquement
  const totalPieces = currentFamilleForAffectation?.total_pieces || 0;
  const valeurTrieur = currentFamilleForAffectation?.valeur_trieur || 0;
  const currentTotal = Object.values(quantites).reduce((sum, q) => sum + q, 0);
  const remaining = totalPieces - currentTotal;
  
  const newQuantites = {...quantites};
  
  // Pour le nouveau trieur
  if (remaining > 0) {
    if (newSelectedTrieur.length >= Math.ceil(currentFamilleForAffectation?.trieurs_needed || 0)) {
      // Dernier trieur - prend le reste
      newQuantites[''] = remaining;
    } else {
      // Prend la valeur max
      newQuantites[''] = Math.min(valeurTrieur, remaining);
    }
  } else {
    newQuantites[''] = 0;
  }
  
  setQuantites(newQuantites);
};
  const handleNewAffectation = async () => {
    if (!startWagonNumber) {
        setError("Veuillez entrer un numéro de wagon valide");
        return;
    }

    setLoading(true);
    try {
        const lastChargement = await findLastChargement(startWagonNumber);
        if (!lastChargement) {
            setError("Aucun chargement trouvé pour ce wagon");
            return;
        }

        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/chargements/trieurs-needed2', {
            params: {
                start_from_wagon: startWagonNumber,
                id_four: selectedFour === 'f3' ? 1 : 2,
                limit: wagonCount // Utilisez wagonCount au lieu de la valeur fixe
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        setTrieursNeeded(response.data || {});
        setCalculatedWagons(response.data.wagons || []);
        
        localStorage.setItem('calculated_wagons', JSON.stringify(response.data.wagons || []));
        
        setSuccess(`Besoins calculés pour ${wagonCount} wagons à partir du wagon ${startWagonNumber}`);
    } catch (err) {
        console.error('Error calculating trieurs needed:', err);
        setError(err.response?.data?.message || err.message || 'Erreur lors du calcul des besoins');
    } finally {
        setLoading(false);
    }
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setModalError(null);
  setModalSuccess(null);
  
  const errors = {};
  
  if (!currentFamilleForAffectation?.id_famille) {
    errors.famille = "Veuillez sélectionner une famille";
  }

  const trieursData = selectedTrieur.map(id => ({
    id: id,
    quantite: quantites[id] || 0,
    valeur_trieur: currentFamilleForAffectation?.valeur_trieur || 0
  }));

  // Validate wagon IDs
  if (!calculatedWagons || calculatedWagons.length === 0) {
    errors.wagons = "Aucun wagon sélectionné";
    setModalError(errors.wagons);
    return;
  }

  const wagonIds = calculatedWagons.map(w => w.id_wagon);
  if (wagonIds.some(id => !id)) {
    errors.wagons = "Certains wagons ne sont pas valides";
    setModalError(errors.wagons);
    return;
  }

  const totalQuantite = trieursData.reduce((sum, t) => sum + t.quantite, 0);
  const valeurTrieur = currentFamilleForAffectation?.valeur_trieur || 0;
  const totalPieces = currentFamilleForAffectation?.total_pieces || 0;

  if (trieursData.some(t => t.quantite <= 0 || !Number.isInteger(t.quantite))) {
    errors.quantite = "Chaque quantité doit être un entier strictement positif";
  }

  if (totalQuantite !== totalPieces) {
    errors.total = `La somme des quantités (${totalQuantite}) doit être exactement égale à ${totalPieces} pièces`;
  }

  if (trieursData.some(t => t.quantite > valeurTrieur)) {
    errors.max = `Aucune quantité ne peut dépasser la valeur maximale par trieur : ${valeurTrieur}`;
  }

  setFormErrors(errors);
  
  if (Object.keys(errors).length > 0) {
    setModalError(Object.values(errors).join(' '));
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post('http://localhost:8000/api/affectations', {
      id_famille: currentFamilleForAffectation.id_famille,
      trieurs: trieursData,
      id_wagons: wagonIds,
      id_four: selectedFour === 'f3' ? 1 : 2
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setModalSuccess('Affectation enregistrée avec succès');
    setSelectedTrieur([]);
    setQuantites({});
    await fetchAffectations();
    
    setTimeout(() => {
      setShowTrieurSelectionModal(false);
    }, 1500);
  } catch (err) {
    console.error('Error saving affectation:', err);
    if (err.response?.data?.error === 'Productivité maximale atteinte') {
      // Erreur spécifique pour productivité maximale
      const trieurId = err.response.data.message.match(/Le trieur (\d+)/)[1];
      const trieur = filteredTrieurs.find(t => t.id_user == trieurId);
      const trieurName = trieur ? `${trieur.prenom} ${trieur.nom}` : 'un trieur';
      
      setModalError(`${trieurName} a déjà atteint 100% de productivité pour cet intervalle et ne peut pas être affecté`);
    } else if (err.response?.data?.errors) {
      const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
      setModalError(errorMessages);
    } else {
      setModalError(err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement');
    }
  } finally {
    setLoading(false);
  }
};

  const fetchAffectationDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/affectations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedAffectation(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching affectation details:', err);
      setError('Erreur lors du chargement des détails');
    }
  };

  const handleOpenTrieurSelection = async (famille) => {
  if (!famille?.id_famille) {
    setError("Famille invalide");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const trieursRes = await axios.get(`http://localhost:8000/api/trieurs/polyvalents/${famille.id_famille}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const familleData = trieursNeeded[selectedFour]?.familles?.find(f => f.id_famille === famille.id_famille) || {};
    
    const totalPieces = familleData.total_pieces || 0;
    const valeurTrieur = familleData.valeur_trieur || 1;
    const trieursNeededValue = familleData.trieurs_needed || 0;

    setFilteredTrieurs(trieursRes.data);
    setSelectedTrieur([]);
    setQuantites({});
    setCurrentFamilleForAffectation({
      ...famille,
      total_pieces: totalPieces,
      valeur_trieur: valeurTrieur,
      trieurs_needed: trieursNeededValue
    });
    setShowTrieurSelectionModal(true);
  } catch (err) {
    console.error('Error fetching polyvalent trieurs:', err);
    setError('Erreur lors du chargement des trieurs polyvalents');
  } finally {
    setLoading(false);
  }
};

  const handleCloseTrieurSelection = () => {
    setShowTrieurSelectionModal(false);
    setCurrentFamilleForAffectation(null);
    setSelectedTrieur([]);
    setSelectedWagons([]);
  };

  if (loading && !showTrieurSelectionModal && !showNewAffectationModal) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
          </Box>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rectangular" height={56} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rectangular" height={56} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 4 }}>
                <Skeleton variant="rectangular" height={300} />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <SidebarChef>
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'primary.main', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PeopleIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" component="h1" sx={{ color: 'text.primary', fontWeight: 700 }}>
                  Affectation des Trieurs
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Gestion des affectations des trieurs aux familles de pièces
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setShowNewAffectationModal(true)}
              sx={{ ml: 'auto' }}
            >
              Nouvelle Affectation
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {error && (
            <Alert 
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}

<Card sx={{ mt: 4 }}>
  <CardContent sx={{ p: 0 }}>
    <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ListAltIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Historique des Affectations
        </Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Four F3" value="f3" />
          <Tab label="Four F4" value="f4" />
        </Tabs>
      </Box>
      
      {/* Ajout des champs de filtre */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Filtrer par date"
            variant="outlined"
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="JJ/MM/AAAA"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Filtrer par responsable"
            variant="outlined"
            size="small"
            value={chefFilter}
            onChange={(e) => setChefFilter(e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>

    {Object.keys(affectations[activeTab] || {}).length === 0 ? (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <PeopleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
          Aucune affectation enregistrée pour ce four
        </Typography>
      </Box>
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trieurs Affectés</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Quantité Totale</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filterAffectations(affectations).map(([interval, affectationsGroup]) => {
              const uniqueTrieurIds = new Set();
              
              affectationsGroup.forEach(aff => {
                aff.details?.forEach(detail => {
                  uniqueTrieurIds.add(detail.id_user);
                });
              });
              
              const totalTrieurs = uniqueTrieurIds.size;
              const totalPieces = affectationsGroup.reduce((sum, aff) => {
                return sum + (aff.details?.reduce((s, d) => s + (d.quantite_tri || 0), 0) || 0);
              }, 0);

              return (
                <TableRow key={interval} hover onClick={() => setSelectedAffectation(affectationsGroup)}>
                  <TableCell>{interval.split(' - ')[0]}</TableCell>
                  <TableCell>{affectationsGroup[0]?.chef?.prenom} {affectationsGroup[0]?.chef?.nom}</TableCell>
                  <TableCell>{totalTrieurs} trieurs</TableCell>
                  <TableCell>{totalPieces} pièces</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAffectation(affectationsGroup);
                        setShowDetailsModal(true);
                      }}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </CardContent>
</Card>

          

          
        </Container>

        <Modal
  open={showNewAffectationModal}
  onClose={() => {
    setShowNewAffectationModal(false);
    setLastChargement(null);
    setTrieursNeeded({});
    setCalculatedWagons([]);
  }}
  closeAfterTransition
  BackdropComponent={Backdrop}
>
  <Fade in={showNewAffectationModal}>
    <Box sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 600,
      maxHeight: '90vh',
      overflow: 'auto',
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 24,
      p: 4,
    }}>
      {Object.keys(trieursNeeded).length === 0 ? (
        // Étape 1: Sélection des paramètres
        <>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Nouvelle Affectation
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Four</InputLabel>
            <Select
              value={selectedFour}
              onChange={(e) => {
                setSelectedFour(e.target.value);
                setWagonCount(e.target.value === 'f3' ? 30 : 16); // Mettre à jour le nombre par défaut
              }}
              label="Four"
            >
              <MenuItem value="f3">F3 (30 wagons)</MenuItem>
              <MenuItem value="f4">F4 (16 wagons)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Numéro de wagon de départ"
            value={startWagonNumber}
            onChange={(e) => setStartWagonNumber(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Ajout du champ nombre de wagons */}
          <TextField
            fullWidth
            label={`Nombre de wagons (${selectedFour === 'f3' ? 'recommandé 30' : 'recommandé 16'})`}
            type="number"
            value={wagonCount}
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value) || 1); // Minimum 1
              setWagonCount(value);
            }}
            inputProps={{
              min: 1 // Seule contrainte : minimum 1
            }}
            sx={{ mb: 3 }}
          />

          {lastChargement && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">Dernier chargement trouvé:</Typography>
              <Typography>
                Wagon {lastChargement.wagon_num} - Four {lastChargement.four_num}
              </Typography>
              <Typography>
                Sortie prévue: {lastChargement.heure_sortie}
              </Typography>
              <Typography>
                Statut: {lastChargement.statut}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowNewAffectationModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleNewAffectation}
              disabled={!startWagonNumber}
            >
              Calculer les besoins
            </Button>
          </Box>
        </>
      ) : (
        // Étape 2: Résultats du calcul
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Besoins en Trieurs
            </Typography>
            <IconButton 
              onClick={() => {
                setTrieursNeeded({});
                setCalculatedWagons([]);
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Affichage des besoins par four */}
          {trieursNeeded.f3 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FactoryIcon fontSize="small" /> Four F3
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Total pièces: {trieursNeeded.f3.total_pieces} | 
                Trieurs nécessaires: {trieursNeeded.f3.total_trieurs_needed}
              </Typography>
              
              {trieursNeeded.f3.familles?.map((famille) => (
                <Box key={famille.nom_famille} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 1,
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}>
                  <Box>
                    <Typography variant="subtitle2">{famille.nom_famille}</Typography>
                    <Typography variant="body2">{famille.trieurs_needed} trieurs nécessaires</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleOpenTrieurSelection({
                      id_famille: famille.id_famille,
                      nom_famille: famille.nom_famille,
                      trieurs_needed: famille.trieurs_needed
                    })}
                  >
                    Affecter
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          {trieursNeeded.f4 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FactoryIcon fontSize="small" /> Four F4
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Total pièces: {trieursNeeded.f4.total_pieces} | 
                Trieurs nécessaires: {trieursNeeded.f4.total_trieurs_needed}
              </Typography>
              
              {trieursNeeded.f4.familles?.map((famille) => (
                <Box key={famille.nom_famille} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 1,
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}>
                  <Box>
                    <Typography variant="subtitle2">{famille.nom_famille}</Typography>
                    <Typography variant="body2">{famille.trieurs_needed} trieurs nécessaires</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleOpenTrieurSelection({
                      id_famille: famille.id_famille,
                      nom_famille: famille.nom_famille,
                      trieurs_needed: famille.trieurs_needed
                    })}
                  >
                    Affecter
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          {/* Liste des wagons inclus */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Wagons inclus ({calculatedWagons.length})
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 1 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>Wagon</TableCell>
                      <TableCell>Four</TableCell>
                      <TableCell>Sortie</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calculatedWagons.map((wagon, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{wagon.wagon_num}</TableCell>
                        <TableCell>{wagon.four_num}</TableCell>
                        <TableCell>{wagon.heure_sortie}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setShowNewAffectationModal(false)}
            >
              Fermer
            </Button>
          </Box>
        </>
      )}
    </Box>
  </Fade>
</Modal>

        <Modal 
            open={showDetailsModal} 
            onClose={() => setShowDetailsModal(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
          >
            <Fade in={showDetailsModal}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 800 },
                maxHeight: '90vh',
                overflow: 'auto',
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
              }}>
                <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main', borderRadius: '12px 12px 0 0' }}>
                  <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                      Détails des Affectations - {selectedAffectation && selectedAffectation[0] && 
                        new Date(selectedAffectation[0].date_affectation).toLocaleDateString('fr-FR')}
                    </Typography>
                    <IconButton 
                      edge="end" 
                      color="inherit" 
                      onClick={() => setShowDetailsModal(false)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Toolbar>
                </AppBar>
                
                {selectedAffectation && Array.isArray(selectedAffectation) && (
                  <Box sx={{ p: 4 }}>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Responsable
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedAffectation[0].chef?.prenom} {selectedAffectation[0].chef?.nom}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Intervalle
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {(() => {
                              const date = new Date(selectedAffectation[0].date_affectation);
                              const hour = date.getHours();
                              if (hour >= 5 && hour < 14) return 'Matin (5h-14h)';
                              if (hour >= 14 && hour < 22) return 'Après-midi (14h-22h)';
                              return 'Nuit (22h-5h)';
                            })()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Wagons concernés
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedAffectation.flatMap(aff => 
                              aff.wagons?.map(w => w.num_wagon) || []
                            ).filter((v, i, a) => a.indexOf(v) === i).map(wagonNum => (
                              <Chip 
                                key={wagonNum} 
                                label={wagonNum}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" sx={{ mb: 3 }}>
                      Répartition par famille
                    </Typography>
                    
                    {selectedAffectation.map((affectation) => (
                      <Box key={affectation.id_affectation} sx={{ mb: 4 }}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {affectation.famille?.nom_famille}
                              </Typography>
                              <Typography variant="body2">
                                {affectation.details?.reduce((sum, detail) => sum + (detail.quantite_tri || 0), 0)} pièces
                              </Typography>
                            </Box>

                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Trieur</TableCell>
                                    <TableCell>Matricule</TableCell>
                                    <TableCell align="right">Quantité</TableCell>
                                    <TableCell align="right">Valeur trieur</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {affectation.details?.map((detail) => (
                                    <TableRow key={detail.id_detail_affectation}>
                                    <TableCell>
                                      {detail.trieur?.prenom} {detail.trieur?.nom}
                                    </TableCell>
                                    <TableCell>
                                      {detail.trieur?.matricule}
                                    </TableCell>
                                    <TableCell align="right">
                                      {detail.quantite_tri} pièces
                                    </TableCell>
                                    <TableCell align="right">
                                      {detail.valeur_trieur} 
                                    </TableCell>
                                  </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">
                        <strong>Nombre total de trieurs:</strong> {selectedAffectation.reduce((sum, aff) => 
                          sum + [...new Set(aff.details?.map(d => d.id_user))].length, 0)}
                      </Typography>
                      <Typography variant="subtitle1">
                        <strong>Total général:</strong> {selectedAffectation.reduce((sum, aff) => 
                          sum + (aff.details?.reduce((s, d) => s + (d.quantite_tri || 0), 0) || 0), 0)} pièces
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Fade>
         </Modal>

        <Modal
        open={showTrieurSelectionModal}
        onClose={handleCloseTrieurSelection}
        closeAfterTransition
        BackdropComponent={Backdrop}
      >
        <Fade in={showTrieurSelectionModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 900 },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          }}>
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main', borderRadius: '12px 12px 0 0' }}>
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                  Affecter des trieurs à {currentFamilleForAffectation?.nom_famille}
                </Typography>
                <IconButton 
                  edge="end" 
                  color="inherit" 
                  onClick={handleCloseTrieurSelection}
                >
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>

            <Box sx={{ p: 4 }}>
              {modalError && (
                <Alert 
                  severity="error"
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setModalError(null)}
                >
                  {modalError}
                </Alert>
              )}

              {modalSuccess && (
                <Alert 
                  severity="success"
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setModalSuccess(null)}
                >
                  {modalSuccess}
                </Alert>
              )}

              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Besoins:</Typography>
                    <Typography>{currentFamilleForAffectation?.trieurs_needed} trieurs</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Total pièces:</Typography>
                    <Typography>{currentFamilleForAffectation?.total_pieces}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Valeur trieur:</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={currentFamilleForAffectation?.valeur_trieur || ''}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        setCurrentFamilleForAffectation({
                          ...currentFamilleForAffectation,
                          valeur_trieur: newValue
                        });
                      }}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Sélectionnez les trieurs à affecter:
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Trieur</TableCell>
                      <TableCell>Quantité à trier</TableCell>
                      <TableCell>Pourcentage</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                {selectedTrieur.map((trieurId, index) => {
                  const trieur = filteredTrieurs.find(t => t.id_user === trieurId);
                  const quantite = quantites[trieurId] || 0;
                  const pourcentage = currentFamilleForAffectation?.total_pieces 
                    ? (quantite / currentFamilleForAffectation.total_pieces * 100).toFixed(1) + '%'
                    : '0%';

                  // Vérifier si le trieur est proche de la limite de productivité
                  const isNearLimit = trieur?.productivity && trieur.productivity > 80;

                  return (
                    <TableRow key={trieurId}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={trieurId}
                            onChange={(e) => {
                              const newSelectedTrieurs = [...selectedTrieur];
                              newSelectedTrieurs[index] = e.target.value;
                              setSelectedTrieur(newSelectedTrieurs);
                              
                              const totalPieces = currentFamilleForAffectation?.total_pieces || 0;
                              const valeurTrieur = currentFamilleForAffectation?.valeur_trieur || 0;
                              const currentTotal = Object.values(quantites).reduce((sum, q, i) => 
                                i !== index ? sum + q : sum, 0);
                              const remaining = totalPieces - currentTotal;
                              
                              const newQuantites = {...quantites};
                              delete newQuantites[trieurId];
                              
                              if (remaining > 0) {
                                if (index === newSelectedTrieurs.length - 1 && 
                                    newSelectedTrieurs.length >= Math.ceil(currentFamilleForAffectation?.trieurs_needed || 0)) {
                                  newQuantites[e.target.value] = remaining;
                                } else {
                                  newQuantites[e.target.value] = Math.min(valeurTrieur, remaining);
                                }
                              } else {
                                newQuantites[e.target.value] = 0;
                              }
                              
                              setQuantites(newQuantites);
                            }}
                          >
                            {filteredTrieurs.map((t) => (
                              <MenuItem 
                                key={t.id_user} 
                                value={t.id_user}
                                disabled={selectedTrieur.includes(t.id_user) && !trieurId === t.id_user}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {t.prenom} {t.nom} ({t.matricule})
                                  {t.productivity && t.productivity > 80 && (
                                    <Tooltip title={`Productivité élevée (${t.productivity}%)`} arrow>
                                      <ErrorIcon color="warning" sx={{ ml: 1, fontSize: 16 }} />
                                    </Tooltip>
                                  )}
                                </Box>
                              </MenuItem>
                            ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={quantite}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value) || 0;
                                setQuantites({
                                  ...quantites,
                                  [trieurId]: newValue
                                });
                              }}
                              inputProps={{ min: 0, step: 0.1 }}
                            />
                          </TableCell>
                          <TableCell>
                            {pourcentage}
                          </TableCell>
                          <TableCell>
                            {index === selectedTrieur.length - 1 && (
                              <IconButton
                                onClick={() => {
                                  setSelectedTrieur([...selectedTrieur, '']);
                                  setQuantites({
                                    ...quantites,
                                    '': 0
                                  });
                                }}
                              >
                                <AddIcon />
                              </IconButton>
                            )}
                            {selectedTrieur.length > 1 && (
                              <IconButton
                                onClick={() => {
                                  const newSelected = [...selectedTrieur];
                                  newSelected.splice(index, 1);
                                  setSelectedTrieur(newSelected);
                                  
                                  const newQuantites = {...quantites};
                                  delete newQuantites[trieurId];
                                  setQuantites(newQuantites);
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  Total affecté: {Object.values(quantites).reduce((sum, q) => sum + q, 0)} / {currentFamilleForAffectation?.total_pieces || 0}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddTrieur}
                  disabled={Object.values(quantites).reduce((sum, q) => sum + q, 0) >= 
                            (currentFamilleForAffectation?.total_pieces || 0)}
                >
                  Ajouter un trieur
                </Button>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCloseTrieurSelection}
                  sx={{ mr: 2 }}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                    !selectedTrieur.length || 
                    selectedTrieur.some(id => !id) ||
                    Object.keys(formErrors).length > 0 ||
                    Object.values(quantites).reduce((sum, q) => sum + q, 0) !== currentFamilleForAffectation?.total_pieces
                  }
                >
                  Confirmer l'affectation
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
      </Box>
    </ThemeProvider>
  </SidebarChef>
  );
};

export default AffectationContent;