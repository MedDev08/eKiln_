import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Container,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip
} from '@mui/material';
import axios from 'axios';

const WagonsRecap = () => {
  const [chargements, setChargements] = useState([]);
  const [selectedChargement, setSelectedChargement] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [chargementDetails, setChargementDetails] = useState(null);

  // Fetch last 30 wagons
  useEffect(() => {
    const fetchChargements = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/chargements/last-30-wagons',{
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setChargements(response.data);
      } catch (error) {
        console.error('Error fetching last 30 wagons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChargements();
  }, []);

  // Fetch detailed information for a chargement
  const fetchChargementDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/chargement-details1/${id}`);
      setChargementDetails(response.data.data);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching chargement details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setChargementDetails(null);
  };



  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table sx={{ minWidth: 1000 }} aria-label="chargements table">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Wagon_num</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Wagon_type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total piece</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Heure Sortie estimée</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Four</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chargements.map((chargement) => (
              <TableRow key={chargement.Id_chargement}>
                <TableCell>{chargement.Id_chargement}</TableCell>
                <TableCell>{chargement.Wagon_num}</TableCell>
                <TableCell>{chargement.Wagon_type}</TableCell>
                <TableCell>{chargement.Total}</TableCell>
                <TableCell>{chargement.heure_sortie_estimee}</TableCell>
                <TableCell>{chargement.Four}</TableCell>
                <TableCell>{chargement.statut}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => fetchChargementDetails(chargement.Id_chargement)}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Details'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for detailed view */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: 1,
            borderColor: 'divider',
            pb: 2,
            mb: 0
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            Wagon {chargementDetails?.wagon_num}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 3 }}>
          {chargementDetails && (
            <Box>
              {/* Informations principales */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Type de wagon
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {chargementDetails.wagon_type}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Four
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {chargementDetails.four_num}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Statut
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {chargementDetails.statut}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Date de chargement
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(chargementDetails.datetime_chargement).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Heure de sortie estimée
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {chargementDetails.heure_sortie_estimee}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Total pièces
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {chargementDetails.total_pieces}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Opérateur */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Opérateur
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {chargementDetails.user?.nom} {chargementDetails.user?.prenom}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />
              
              {/* Contenu du wagon */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Contenu du wagon
                </Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 500, border: 'none' }}>
                          Famille
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500, border: 'none' }}>
                          Quantité
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chargementDetails.details.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ border: 'none', py: 1.5 }}>
                            {detail.nom_famille}
                          </TableCell>
                          <TableCell align="right" sx={{ border: 'none', py: 1.5, fontWeight: 500 }}>
                            {detail.quantite}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseModal} 
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              borderRadius: 1,
              px: 3
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WagonsRecap;