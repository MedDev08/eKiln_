import * as React from 'react';
import { useState, useEffect} from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import { createTheme} from '@mui/material/styles';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import WagonTable from './WagonTable';

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
 
// Component: StatCard
const StatCard = ({ title, value, details, icon }) => {
  const [openTooltip, setOpenTooltip] = useState(false);
  
  const densityTooltip = details ? (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2">Détails Densité ({details.interval.start} - {details.interval.end})</Typography>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="body2"><strong>Four F3:</strong></Typography>
          <Typography variant="body2">Total: {details.f3.total_pieces} pièces</Typography>
          <Typography variant="body2">Densité: {details.f3.density} </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2"><strong>Four F4:</strong></Typography>
          <Typography variant="body2">Total: {details.f4.total_pieces} pièces</Typography>
          <Typography variant="body2">Densité: {details.f4.density} </Typography>
        </Grid>
      </Grid>
    </Box>
  ) : null;

  return (
    <Card sx={{ 
      height: '100%',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography 
            color="text.secondary" 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 500,
              color: '#64748b'
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(63, 81, 181, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.primary.main
            }}>
              {icon}
            </Box>
          )}
          {title === 'Densite' && (
            <Tooltip 
              title={densityTooltip} 
              arrow
              open={openTooltip}
              onOpen={() => setOpenTooltip(true)}
              onClose={() => setOpenTooltip(false)}
              disableFocusListener
              disableHoverListener
              disableTouchListener
            >
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenTooltip(!openTooltip);
                }}
                sx={{ 
                  ml: 0.5, 
                  verticalAlign: 'middle',
                  color: theme.palette.text.secondary
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            color: theme.palette.primary.dark
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};
const WagonsTabs = () => {
  const [activeTab, setActiveTab] = useState('f3');
  const [filterActive, setFilterActive] = useState(true);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant={activeTab === 'f3' ? 'contained' : 'text'}
            onClick={() => setActiveTab('f3')}
            sx={{ 
              mr: 1,
              borderRadius: '8px 8px 0 0',
              backgroundColor: activeTab === 'f3' ? '#3498db' : 'transparent',
              color: activeTab === 'f3' ? '#fff' : 'inherit',
              '&:hover': {
                backgroundColor: activeTab === 'f3' ? '#2980b9' : 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Four F3
          </Button>
          <Button
            variant={activeTab === 'f4' ? 'contained' : 'text'}
            onClick={() => setActiveTab('f4')}
            sx={{ 
              borderRadius: '8px 8px 0 0',
              backgroundColor: activeTab === 'f4' ? '#3498db' : 'transparent',
              color: activeTab === 'f4' ? '#fff' : 'inherit',
              '&:hover': {
                backgroundColor: activeTab === 'f4' ? '#2980b9' : 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Four F4
          </Button>
        </Box>
        {activeTab === 'f3'}
      </Box>

      {activeTab === 'f3' && <WagonTable fourNum="F3" id_four={6} />}
      {activeTab === 'f4' && <WagonTable fourNum="F4" id_four={7} />}
    </Box>
  );
};

// DashboardContent modifié
const DashboardContent = () => {
  const [filterActive, setFilterActive] = useState(true);
  const [statsData, setStatsData] = useState([
    { 
      title: 'Wagon en cours', 
      value: '0',
      icon: <LocalShippingIcon fontSize="small" />
    },
    { 
      title: 'Pièces en cours', 
      value: '0',
      icon: <ViewModuleIcon fontSize="small" />
    },
    { 
      title: 'Trieurs disponible', 
      value: '0',
      icon: <PeopleIcon fontSize="small" />
    },
    { 
      title: 'Densite', 
      value: '0',
      icon: <BarChartIcon fontSize="small" />
    },
  ]);
  const [densityDetails, setDensityDetails] = useState({
    f3: { totalPieces: 0, density: 0 },
    f4: { totalPieces: 0, density: 0 },
    interval: { start: '', end: '' }
  });
  const [trieursNeeded, setTrieursNeeded] = useState({
    f3: { total_pieces: 0, total_trieurs_needed: 0, familles: [] },
    f4: { total_pieces: 0, total_trieurs_needed: 0, familles: [] },
    interval: { start: '', end: '' }
  });
  const [wagonsData, setWagonsData] = useState({ f3: [], f4: [] });

  const fetchDensity = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/chargements/density", {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Réponse densité:", response.data); 

        setStatsData(prevStats => {
            const newStats = [...prevStats];
            newStats[3] = { 
                ...newStats[3], 
                value: response.data.global_density.toString(),
                details: response.data // Stocker les détails pour le tooltip
            };
            return newStats;
        });

        setDensityDetails({
            f3: {
                totalPieces: response.data.f3.total_pieces,
                density: response.data.f3.density
            },
            f4: {
                totalPieces: response.data.f4.total_pieces,
                density: response.data.f4.density
            },
            interval: response.data.interval
        });
    } catch (error) {
        console.error("Erreur lors du calcul de la densité:", error);
    }
};

  const fetchActiveTrieursCount = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/trieurs/count-active", {
            headers: { Authorization: `Bearer ${token}` },
        });

        setStatsData(prevStats => {
            const newStats = [...prevStats];
            newStats[2] = { ...newStats[2], value: response.data.count.toString() };
            return newStats;
        });
    } catch (error) {
        console.error("Erreur lors du chargement du nombre de trieurs actifs:", error);
        setStatsData(prevStats => {
            const newStats = [...prevStats];
            newStats[2] = { ...newStats[2], value: 'N/A' };
            return newStats;
        });
    }
};

  const fetchTrieursNeeded = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/chargements/trieurs-needed-dash", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTrieursNeeded({
        f3: response.data.f3 || { total_pieces: 0, total_trieurs_needed: 0, familles: [] },
        f4: response.data.f4 || { total_pieces: 0, total_trieurs_needed: 0, familles: [] },
        interval: response.data.current_interval || { start: '', end: '' }
      });

      // Récupérer aussi les wagons pour chaque four
      const [f3Response, f4Response] = await Promise.all([
        axios.get('http://localhost:8000/api/chargements/interval', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { id_four: 6 }
        }),
        axios.get('http://localhost:8000/api/chargements/interval', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { id_four: 7 }
        })
      ]);

      setWagonsData({
        f3: f3Response.data.chargements,
        f4: f4Response.data.chargements
      });
    } catch (error) {
      console.error("Erreur lors du chargement des besoins en trieurs:", error);
    }
  };


  const fetchCookingWagons = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/wagons/cooking-count');
      const count = response.data.count;
      
      setStatsData(prevStats => {
        const newStats = [...prevStats];
        newStats[0] = { ...newStats[0], value: count.toString() };
        return newStats;
      });
    } catch (error) {
      console.error('Error fetching cooking wagons count:', error);
    }
  };

  const fetchTotalPieces = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/pieces/Somme');
      const count = response.data.count || 0;
      
      setStatsData(prevStats => {
        const newStats = [...prevStats];
        newStats[1] = { ...newStats[1], value: count.toString() };
        return newStats;
      });
    } catch (error) {
      console.error('Error fetching total pieces count:', error);
      setStatsData(prevStats => {
        const newStats = [...prevStats];
        newStats[1] = { ...newStats[1], value: 'N/A' };
        return newStats;
      });
    }
  };

  const handleRefresh = () => {
    fetchCookingWagons();
    fetchTotalPieces();
    fetchTrieursNeeded();
    fetchActiveTrieursCount();
    fetchDensity();
  };

  useEffect(() => {
    fetchCookingWagons();
    fetchTotalPieces();
    fetchTrieursNeeded();
    fetchActiveTrieursCount();
    fetchDensity();
    const interval = setInterval(() => {
      fetchCookingWagons();
      fetchTotalPieces();
      fetchTrieursNeeded();
      fetchActiveTrieursCount();
      fetchDensity();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  

  return (
   
    <Box sx={{ p: 3 }}>
      {/* Header amélioré */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        backgroundColor: 'white',
        p: 3,
        borderRadius: 3,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              color: theme.palette.primary.dark
            }}
          >
            Tableau de bord
          </Typography>
          <Typography 
            variant="body1"
            sx={{
              color: theme.palette.text.secondary
            }}
          >
            Aperçu global de la production
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      {/* Stats Cards améliorées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard 
              title={stat.title} 
              value={stat.value} 
              details={stat.details}
              icon={stat.icon}
            />
          </Grid>
        ))}
      </Grid>

      

      {/* Section Wagons améliorée */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 3,
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: '#f8fafc',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}>
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ 
                fontWeight: 600,
                color: theme.palette.primary.dark
              }}
            >
              Suivi des wagons
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <WagonsTabs />
          </Box>
        </CardContent>
      </Card>
    </Box>
  
  );
};
export default DashboardContent;