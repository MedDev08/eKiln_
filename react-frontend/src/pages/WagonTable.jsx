import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
} from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales'; 
import FlagIcon from '@mui/icons-material/Flag';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Modal,
  IconButton,
  CircularProgress,
  Divider,
  Chip,
  TextField,
  Grid,
  Tooltip,
  Paper,
  TableRow,
  Button,
  TableHead,
  TableBody,
  Table,
  TableCell,
  TableContainer
} from '@mui/material';
import { styled } from '@mui/material/styles';
// Style personnalisé pour le four
const FourTunnel = styled('div')({
    position: 'relative',
    width: '100%',
    height: '140px', // Un peu plus grand
    backgroundColor: '#f8f9fa',
    border: '3px solid #3498db',
    borderRadius: '12px',
    margin: '25px 0',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
});

const WagonPosition = styled('div')(({ progress,type_wagon
 }) => ({
    position: 'absolute',
    left: `${progress}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '45px',
    height: '70px',
   backgroundColor: type_wagon,
    border: '2px solid #2c3e50',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'left 1s ease-in-out, transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)',
    '&:hover': {
        transform: 'translate(-50%, -50%) scale(1.15)',
        zIndex: 10,
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    },
}));


// Component: WagonTable
const WagonTable = ({ fourNum, id_four }) => {
  const [wagonsData, setWagonsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wagonSearch, setWagonSearch] = useState('');
  const [matricule, setMatricule] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [customTrieursNeeded, setCustomTrieursNeeded] = useState(null);
  const [selectedWagonDetails, setSelectedWagonDetails] = useState(null);
  const [showWagonDetailsModal, setShowWagonDetailsModal] = useState(false);
  const [now,setNow] = useState(new Date());
  const [wagonCount, setWagonCount] = useState(id_four === 6 ? 30 : 16); // Valeur par défaut selon le four
  const [Chargements, setChargements] = useState([]);
  const [chargementsShift, setChargementsShift] = useState([]);
  const [searchParams, setSearchParams] = useState({
    dateFrom: "",
    dateTo: "",
  });
  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarExport csvOptions={{ fileName: 'wagons_export' }} />
    </GridToolbarContainer>
  );
  const FourTrieursNeeded = ({ data,  fullWidth }) => {
    return (
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
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
                .map((famille, index) => {
                  const isRed = famille.active === 0 ;
                  // const isRed = ["balaste", "couvercles"].includes(famille.nom_famille?.toLowerCase());
                  // console.log("active", famille.active);
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ color: isRed ? "red" : "inherit" }}>
                        {famille.nom_famille}
                      </TableCell>
                      <TableCell align="right" sx={{ color: isRed ? "red" : "inherit" }}>
                        {famille.total_pieces}
                      </TableCell>
                      <TableCell align="right" sx={{ color: isRed ? "red" : "inherit" }}>
                        {famille.trieurs_needed}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  const getWagonDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/chargements/${id}/details-popup`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Erreur fetching wagon details:", error);
      return null;
    }
  };
  const fetchWagonDetails = async (id) => {
    const details = await getWagonDetails(id);
    if (details) {
      setSelectedWagonDetails(details);
      setShowWagonDetailsModal(true);
    }
  };

  const fetchData = async (startFromWagon = null, count = wagonCount, searchParams = { dateFrom: '', dateTo: '' }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = {
        id_four: id_four,
        limit: count,
        ...(startFromWagon && { start_from_wagon: startFromWagon }),
        ...(searchParams.dateTo && { dateTo: searchParams.dateTo }),
        ...(searchParams.dateFrom && { dateFrom: searchParams.dateFrom }),
        ...(matricule && { matricule: matricule }),
      };
      // console.log("params", params);
      // Fetch wagons
      const wagonsResponse = await axios.get('http://localhost:8000/api/chargements/interval', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const wagons = wagonsResponse.data.chargements;
      // console.log("wagonsResponse", wagonsResponse.data.chargements);

      // Fetch all details in one batch
      const batchResponse = await axios.post(
        'http://localhost:8000/api/chargements/details-batch',
        { ids: wagons.map(w => w.id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const detailsMap = new Map();
      batchResponse.data.data.forEach(item => {
        detailsMap.set(item.id, item.details);
      });

      //  console.log("details",detailsMap);
      // Merge details into wagons
      const wagonsWithDetails = wagons.map(wagon => {
        const wagonDetails = detailsMap.get(wagon.id) || [];
      // console.log("wagons",wagonDetails);
        const containsBalsate = wagonDetails.some(
          d => d.id_famille === 37
        );
        return { ...wagon, containsBalsate };
      });

      setWagonsData(wagonsWithDetails);
      setChargements(wagonsResponse.data.graphe_entrer || []);
      setChargementsShift(wagonsResponse.data.graphe_sortie || []);
      //setCurrentInterval(`${wagonsResponse.data.current_interval.start} - ${wagonsResponse.data.current_interval.end}`);
      setTotalCount(wagonsResponse.data.total_count || wagonsResponse.data.chargements.length);

      // Fetch trieurs
      const trieursResponse = await axios.get('http://localhost:8000/api/chargements/calculate-trieurs', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setCustomTrieursNeeded({
        ...trieursResponse.data,
        interval: wagonsResponse.data.current_interval
      });

    } catch (error) {
      console.error("Erreur de chargement:", error);
      setWagonsData([]);
      setChargements([]);
      setCustomTrieursNeeded(null);
    } finally {
      setLoading(false);
    }
  };
   useEffect(() => {
          const timer = setInterval(() => {
              setNow(new Date());
          }, 60000); // Mise à jour chaque minute
          return () => clearInterval(timer);
      }, []);
  

  const handleSearchByWagon = () => {
    if (wagonSearch.trim() === '' && searchParams.dateFrom.trim() === '' && searchParams.dateTo.trim() === '') {
      fetchData();
    } else {
      fetchData(wagonSearch, wagonCount, searchParams);
    }
  };

  const handleReset = () => {
    setWagonSearch('');
    setSearchParams({ dateFrom: "", dateTo: "" });
    setWagonCount(id_four === 6 ? 30 : 16);
    fetchData();
  };
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role?.toLowerCase();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'en attente': return 'warning';
      case 'en cuisson': return 'info';
      case 'prêt à sortir': return 'success';
      case 'sorti': return 'default';
      default: return 'primary';
    }
  };
  const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};
    // Calculer le temps restant
    const calculateTimeLeft = (chargement) => {
        if (!chargement.FinCuissonEstimee) return 'N/A';
        
        const end = new Date(chargement.FinCuissonEstimee).getTime();
        const current = now.getTime();
        
        if (current >= end) return 'Terminé';
        
        return formatDuration(end - current);
    };

  const columns = [
    {
      field: 'containsBalsate',
      headerName: 'Balaste',
      flex: 1,
      renderCell: (params) => {
        if (!params.row.containsBalsate) return null; // si pas de balaste, rien
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              color: 'red', // couleur du drapeau
              fontSize: 20,
            }}
          >
            <FlagIcon fontSize="small" />
          </Box>
        );
      },
    },
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
      field: 'date_entrer',
      headerName: 'date entrer ',
      valueGetter: params => params,
      flex: 1
    },
     {
      field: 'matricule',
      headerName: 'matricule',
      valueGetter: params => params,
      flex: 1
    },
    {
      field: 'heure_sortie',
      headerName: 'Heure sortie estimée',
      valueGetter: params => params,
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
                setSearchParams({ dateFrom: "", dateTo: "" });
                fetchData();
              } }
              size="small"
            >
              Actualiser
            </Button>
          </Box>
           {/* {["admin", "chef d'equipe","chef"].includes(role) && (
             <>   */}
                {/* <GrapheShift Chargements={Chargements} />
                <GrapheShift Chargements={chargementsShift} isShift1={true} /> */}

          {["admin", "chef d'equipe", "chef"].includes(role) && (
            <Box sx={{ mt: 3, mb: 4 }}>
              <FourTunnel sx={{ position: 'relative', height: '180px' }}>
                {chargementsShift.map((chargement, index) => {
                  const totalRight = chargementsShift.length;
                  const reversedIndex = (totalRight - 1) - index;
                  const progress = totalRight > 0
                    ? 55 + (reversedIndex / (totalRight || 1)) * 40
                    : 75;
                const timeLeft = calculateTimeLeft(chargement); 
                  return (
                    <Tooltip 
                        key={chargement.id}
                        title={
                            <div>
                            <div>Wagon: {chargement.wagon_num}</div>
                              <div>Statut: {chargement.statut}</div>
                              <div>Temps restant: {timeLeft}</div>
                          </div>
                      }
                      arrow        
                      >
                      <WagonPosition
                        progress={progress}
                        type_wagon={chargement.color || '#95a5a6'}
                        onClick={() => fetchWagonDetails(chargement.id)}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                            {chargement.wagon_num}
                        </div>
                        <div style={{ 
                            fontSize: '10px',
                            color: '#333',
                            marginTop: '5px'
                        }}>
                            {timeLeft}
                        </div> 
                      </WagonPosition>
                    </Tooltip>
                  );
                })}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '10%',
                    height: '80%',
                    width: '6px',
                    backgroundColor: '#3498db',
                    borderRadius: '3px',
                    boxShadow: '0 0 15px rgba(52, 152, 219, 0.8)',
                    zIndex: 10,
                  }}
                />

                {Chargements.map((chargement, index) => {
                  const totalLeft = Chargements.length;
                  const reversedIndex = totalLeft - 1 - index;
                  const progress = totalLeft > 0
                    ? 5 + (reversedIndex / (totalLeft || 1)) * 40
                    : 25;

                  const timeLeft = calculateTimeLeft(chargement);

                  return (
                    <Tooltip
                      key={`left-${chargement.id}`}
                      title={
                        <div>
                          <div>Wagon: {chargement.wagon_num}</div>
                          <div>Statut: {chargement.statut}</div>
                          <div>Temps restant: {timeLeft}</div>
                        </div>
                      }
                      arrow
                    >
                      <WagonPosition
                        progress={progress}
                        type_wagon={chargement.color || '#e74c3c'}
                        onClick={() => fetchWagonDetails(chargement.id)}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          {chargement.wagon_num}
                          </div>
                          <div style={{ 
                              fontSize: '10px',
                              color: '#333',
                              marginTop: '5px'
                          }}>
                              {timeLeft}
                          </div> 
                      </WagonPosition>
                    </Tooltip>
                  );
                })}
              </FourTunnel>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#555' }}>
                <span>Entrée</span>
                <span>Sortie</span>
              </Box>
            </Box>
          )}
              
            {/* </>
           )} */}
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
              label="Rechercher par matricule..."
              variant="outlined"
              size="small"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              sx={{ width: 200 }}
              placeholder="Matricule" />
            <TextField
              label="Rechercher à partir du wagon..."
              variant="outlined"
              size="small"
              value={wagonSearch}
              onChange={(e) => setWagonSearch(e.target.value)}
              sx={{ width: 200 }}
              placeholder="Numéro de wagon" />
            {["admin", "cuiseur"].includes(role) && (
              <>
                <TextField
                  label="Date de"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={searchParams.dateFrom}
                  onChange={(e) => setSearchParams({ ...searchParams, dateFrom: e.target.value })} />
                <TextField
                  label="Date à"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={searchParams.dateTo}
                  onChange={(e) => setSearchParams({ ...searchParams, dateTo: e.target.value })} />
              </>)}
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
                <Typography variant="subtitle2">Total pièces :</Typography>
                <Typography>{selectedWagonDetails.total_pieces}
                </Typography>
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