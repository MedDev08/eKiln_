import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
} from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales'; // Example: French localization
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
// Component: WagonTable
const WagonTable = ({ fourNum, id_four }) => {
  const [selectedWagon, setSelectedWagon] = useState(null);
  const [wagonsData, setWagonsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentInterval, setCurrentInterval] = useState('');
  const [wagonSearch, setWagonSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [customTrieursNeeded, setCustomTrieursNeeded] = useState(null);
  const [selectedWagonDetails, setSelectedWagonDetails] = useState(null);
  const [showWagonDetailsModal, setShowWagonDetailsModal] = useState(false);
  const [wagonCount, setWagonCount] = useState(id_four === 6 ? 30 : 16); // Valeur par défaut selon le four
  const CustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarExport csvOptions={{ fileName: 'wagons_export' }} />
  </GridToolbarContainer>
);
const FourTrieursNeeded = ({ data, four, fullWidth }) => {
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {/* <Typography variant="h6" gutterBottom>
        Four {four} - Besoins en Trieurs
      </Typography> */}
      <Typography variant="body1" sx={{ mb: 2 }}>
        <strong>Total pièces à trier:</strong> {data.total_pieces}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        <strong>Trieurs nécessaires:</strong> {data.total_trieurs_needed}
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Famille</TableCell>
              <TableCell align="right">Pièces</TableCell>
              <TableCell align="right">Trieurs nécessaires</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.familles
              .sort((a, b) => b.total_pieces - a.total_pieces) // tri décroissant
              .map((famille, index) => (
              <TableRow key={index}>
                <TableCell>{famille.nom_famille}</TableCell>
                <TableCell align="right">{famille.total_pieces}</TableCell>
                <TableCell align="right">{famille.trieurs_needed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
  const fetchWagonDetails = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `http://localhost:8000/api/chargements/${id}/details-popup`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
            setSelectedWagonDetails(response.data.data);
            setShowWagonDetailsModal(true);
        }
    } catch (error) {
        console.error("Error fetching wagon details:", error);
    }
  };

  const fetchData = async (startFromWagon = null, count = wagonCount) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = { 
          id_four: id_four,
          limit: count,
          ...(startFromWagon && { start_from_wagon: startFromWagon })
      };

      // Requête pour les wagons
      const wagonsResponse = await axios.get('http://localhost:8000/api/chargements/interval', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: params
      });
      //console.log("Wagons Response:", wagonsResponse.data);
      setWagonsData(wagonsResponse.data.chargements);
      setCurrentInterval(`${wagonsResponse.data.current_interval.start} - ${wagonsResponse.data.current_interval.end}`);
      setTotalCount(wagonsResponse.data.total_count || wagonsResponse.data.chargements.length);

      // Requête pour les trieurs nécessaires avec les MÊMES paramètres
      const trieursResponse = await axios.get('http://localhost:8000/api/chargements/calculate-trieurs', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: params
      });
      //console.log("Trieurs Response:", trieursResponse.data);
      setCustomTrieursNeeded({
          ...trieursResponse.data,
          interval: wagonsResponse.data.current_interval
      });

    } catch (error) {
        console.error("Erreur de chargement:", error);
        //setError("Erreur lors du chargement des données");
        setError("Il ya aucun wagon charger ou sortie dans ce shift");
        setWagonsData([]);
        setCustomTrieursNeeded(null);
    } finally {
        setLoading(false);
    }
  };

  const handleSearchByWagon = () => {
      if (wagonSearch.trim() === '') {
          fetchData();
      } else {
          fetchData(wagonSearch, wagonCount);
      }
  };

  const handleReset = () => {
      setWagonSearch('');
      setWagonCount(id_four === 6 ? 30 : 16);
      fetchData();
  };

  useEffect(() => {
      fetchData();
      
      // Mettre à jour toutes les 3 heures (10800000 ms)
      const interval = setInterval(fetchData, 10800000);
      
      return () => clearInterval(interval);
  }, [fourNum]);

  if (loading) return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
      </Box>
  );
    
  /*if (error) return (
      <Alert severity="info" sx={{ mb: 2 }}>
          {error}
      </Alert>
  );*/
  const getStatusColor = (status) => {
    switch (status) {
      case 'en attente': return 'warning';
      case 'en cuisson': return 'info';
      case 'prêt à sortir': return 'success';
      case 'sorti': return 'default';
      default: return 'primary';
    }
  };
  const columns=[
      { field: 'wagon_num', headerName: 'N° wagon', valueGetter: params => params || 'N/A', flex: 1 },
      { field: 'wagon_type', headerName: 'Type', valueGetter: params => params || 'N/A', flex: 1 },
      { field: 'four_num', headerName: 'Four', valueGetter: params => params || 'N/A', flex: 1 },
      {
        field: 'total_pieces',
        headerName: 'Pièces',
        valueGetter: params =>
          //params?.reduce((sum, detail) => sum + Number(detail.quantite), 0) || 0,
          params || 0,
        flex: 1
      },
      {
        field: 'heure_sortie',
        headerName: 'Heure sortie estimée',
        valueGetter: params =>params,
          /*console.log("date",params) 
          params
            ? new Date(params).toLocaleTimeString()
            : 'N/A',*/
        flex: 1
      },
      { field: 'statut', headerName: 'Statut', flex: 1,
        renderCell: (params) => (
        <Chip
          label={params.row.statut}
          color={getStatusColor(params.row.statut)}
          size="small"
        />
      )
       },
       {
        field: 'actions',
        headerName: 'Actions',
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            onClick={() => fetchWagonDetails(params.row.id)}
          >
            Détails
          </Button>
        )
       }
    ]

  return (
      <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                          Total: {totalCount} wagons 
                      </Typography>
                      <Button 
                          variant="outlined" 
                          startIcon={<RefreshIcon />}
                          onClick={() => {
                              setWagonSearch('');
                              fetchData();
                          }}
                          size="small"
                      >
                          Actualiser
                      </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <TextField
                          label="Nombre de wagons"
                          variant="outlined"
                          size="small"
                          type="number"
                          value={wagonCount}
                          onChange={(e) => setWagonCount(Math.max(1, parseInt(e.target.value) || 1))}
                          sx={{ width: 120 }}
                          inputProps={{ min: 1 }}
                      />
                      
                      <TextField
                          label="Rechercher à partir du wagon..."
                          variant="outlined"
                          size="small"
                          value={wagonSearch}
                          onChange={(e) => setWagonSearch(e.target.value)}
                          sx={{ width: 200 }}
                          placeholder="Numéro de wagon"
                      />
                      
                      <Button 
                          variant="contained" 
                          onClick={handleSearchByWagon}
                          size="small"
                      >
                          Rechercher
                      </Button>
                      
                      <Button 
                          variant="outlined" 
                          onClick={handleReset}
                          size="small"
                      >
                          Réinitialiser
                      </Button>
                  </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 2 }}>
                  {/* Tableau DataGrid */}
                  <Box sx={{ flex: 2.2, height: 700, overflow: 'auto'}}>
                    <DataGrid
                      rows={wagonsData}
                      columns={columns}
                      getRowId={(row) => row.id}
                      localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                      components={{ Toolbar: CustomToolbar }}
                      autoHeight={false} // désactive autoHeight
                      showToolbar
                    />
                  </Box>

                  {/* Besoins en trieurs */}
                  {customTrieursNeeded && (
                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1,
                        height: '100%',
                      }}
                    >
                      {/* <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Besoins en trieurs pour {wagonsData.length} wagons affichés :
                      </Typography> */}
                      <FourTrieursNeeded
                        data={id_four === 6 ? customTrieursNeeded.f3 : customTrieursNeeded.f4}
                        four={fourNum}
                        fullWidth
                      />
                    </Box>
                  )}
                </Box>

          </TableContainer>

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
                      <Typography variant="subtitle2">Statut:</Typography>
                      <Typography>{selectedWagonDetails.statut}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                      <Typography variant="subtitle2">Date Chargement:</Typography>
                      <Typography>
                          {new Date(selectedWagonDetails.datetime_chargement).toLocaleString()}
                      </Typography>
                  </Grid>
                  <Grid item xs={6}>
                      <Typography variant="subtitle2">Date sorti estimée:</Typography>
                      <Typography>
                          {new Date(selectedWagonDetails.heure_sortie_estimee).toLocaleString()}
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
                          {selectedWagonDetails.details.map((detail, index) => (
                              <TableRow key={index}>
                                  <TableCell>{detail.nom_famille}</TableCell>
                                  <TableCell align="right">{detail.quantite}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </TableContainer>
            </>
            )}
            </Box>
          </Modal>
      </>
  );
  
};
export default WagonTable;