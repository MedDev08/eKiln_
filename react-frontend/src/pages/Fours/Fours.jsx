import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
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
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';

const colors = {
  primary: {
    100: '#e0f7fa',
    300: '#4db6ac',
    500: '#009688',
    700: '#00796b',
    900: '#004d40'
  },
  secondary: {
    100: '#f5f5f5',
    300: '#e0e0e0',
    500: '#9e9e9e',
    700: '#616161',
    900: '#212121'
  },
  accent: {
    blue: '#2196f3',
    green: '#4caf50',
    amber: '#ffc107',
    red: '#f44336'
  }
};

const FoursManagement = () => {
  const [fours, setFours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [tempCadence, setTempCadence] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const fetchFours = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await axios.get('http://localhost:8000/api/fours', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formattedData = response.data.map(four => ({
        ...four,
        formatted_duration: formatDuration(four.duree_cuisson)
      }));

      setFours(formattedData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load four data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFours();
  }, []);

  const startEditing = (four) => {
    setEditingId(four.id_four);
    setTempCadence({
      cadence: four.cadence,
      duration: four.duree_cuisson,
      formatted_duration: four.formatted_duration
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempCadence({});
  };

  const handleTempCadenceChange = (e) => {
    const newCadence = Number(e.target.value);
    const four = fours.find(f => f.id_four === editingId);
    if (!four) return;

    const newDuration = Math.round((newCadence * four.duree_cuisson) / four.cadence);
    
    setTempCadence({
      cadence: newCadence,
      duration: newDuration,
      formatted_duration: formatDuration(newDuration)
    });
  };

  const saveChanges = async () => {
    try {
      setSaveLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      await axios.patch(
        `http://localhost:8000/api/fours/${editingId}`,
        { new_cadence: tempCadence.cadence },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setFours(prev => prev.map(four =>
        four.id_four === editingId ? {
          ...four,
          cadence: tempCadence.cadence,
          duree_cuisson: tempCadence.duration,
          formatted_duration: tempCadence.formatted_duration
        } : four
      ));

      setEditingId(null);
      setTempCadence({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          err.message ||
                          'Failed to save changes';
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarChef>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh'
        }}>
          <CircularProgress size={60} sx={{ color: colors.primary[500] }} />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef>
      <Box m="30px">
        <Typography variant="h4" fontWeight={700} color={colors.primary[700]} sx={{ mb: 1 }}>
          Gestion des Fours
        </Typography>
        <Typography variant="subtitle1" color={colors.secondary[700]}>
          Modifier les paramètres de cuisson
        </Typography>

        <Snackbar
          open={saveSuccess}
          autoHideDuration={3000}
          onClose={() => setSaveSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="success" sx={{ width: '100%', boxShadow: 2 }}>
            Modifications enregistrées avec succès!
          </Alert>
        </Snackbar>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
            {error}
          </Alert>
        )}

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            mt: 3
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: colors.primary[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: colors.primary[900] }}>Numéro</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.primary[900] }}>Cadence (min)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.primary[900] }}>Durée de cuisson</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.primary[900] }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {fours.map((four) => (
                <TableRow
                  key={four.id_four}
                  hover
                  sx={{
                    '&:nth-of-type(even)': {
                      backgroundColor: colors.secondary[100]
                    },
                    '&:hover': {
                      backgroundColor: colors.primary[50]
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: colors.primary[500],
                          borderRadius: '50%',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 14,
                          fontWeight: 'bold'
                        }}
                      >
                        {four.num_four}
                      </Box>
                      <Typography>Four {four.num_four}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    {editingId === four.id_four ? (
                      <TextField
                        type="number"
                        value={tempCadence.cadence}
                        onChange={handleTempCadenceChange}
                        inputProps={{ min: 1, max: 120 }}
                        size="small"
                      />
                    ) : (
                      <Typography>{four.cadence}</Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography color={editingId === four.id_four ? colors.accent.amber : colors.primary[700]}>
                      {editingId === four.id_four ? tempCadence.formatted_duration : four.formatted_duration}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {editingId === four.id_four ? (
                      <>
                        <IconButton
                          onClick={saveChanges}
                          disabled={saveLoading}
                          color="success"
                        >
                          {saveLoading ? <CircularProgress size={24} /> : <CheckIcon />}
                        </IconButton>
                        <IconButton
                          onClick={cancelEditing}
                          color="error"
                          disabled={saveLoading}
                        >
                          <CloseIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        onClick={() => startEditing(four)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </SidebarChef>
  );
};

export default FoursManagement;