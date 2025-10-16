import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsIcon from '@mui/icons-material/Settings';
import { Check, X, Clock} from 'lucide-react';
const ParametrageContent = () => {
  const [fours, setFours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingFour, setEditingFour] = useState(null);
  const [newCadence, setNewCadence] = useState('');

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchFours = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/fours', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFours(response.data);
      } catch (err) {
        setError("Erreur lors du chargement des fours");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFours();
  }, []);

  const handleUpdateCadence = async (id_four) => {
    if (!newCadence || isNaN(newCadence)) {
      setError("Veuillez entrer une cadence valide");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.patch(
  `http://localhost:8000/api/fours/${id_four}`,
  { new_cadence: parseFloat(newCadence) },
  { headers: { Authorization: `Bearer ${token}` } }
);

      if (response.data.success) {
        setFours(fours.map(four => 
          four.id_four === id_four ? response.data.four : four
        ));
        setSuccess("Cadence mise à jour avec succès");
        setEditingFour(null);
        setNewCadence('');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 4,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <CircularProgress 
          size={50} 
          thickness={4}
          sx={{ color: '#3b82f6' }}
        />
        <Typography sx={{ 
          color: '#64748b',
          fontSize: '15px',
          fontWeight: 500
        }}>
          Chargement des données...
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      p: 4
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        
        {/* Header */}
        <Paper sx={{ 
          p: 4,
          mb: 4,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{
              p: 2.5,
              backgroundColor: '#3b82f6',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <SettingsIcon sx={{ 
                fontSize: 28, 
                color: 'white'
              }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600,
                color: '#1e293b',
                mb: 0.5
              }}>
                Paramétrage des Fours
              </Typography>
              <Typography sx={{ 
                color: '#64748b',
                fontSize: '16px'
              }}>
                Gestion des cadences et durées de cuisson
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Messages */}
        {success && (
          <Alert 
            severity="success" 
            onClose={() => setSuccess(null)}
            sx={{ 
              mb: 3,
              borderRadius: 2,
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              '& .MuiAlert-icon': { color: '#16a34a' },
              '& .MuiAlert-message': { color: '#15803d', fontWeight: 500 }
            }}
            icon={<Check size={20} />}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              mb: 3,
              borderRadius: 2,
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              '& .MuiAlert-icon': { color: '#dc2626' },
              '& .MuiAlert-message': { color: '#991b1b', fontWeight: 500 }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Tableau */}
        <Paper sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          backgroundColor: 'white'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#334155',
                  fontSize: '14px',
                  py: 3,
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Four
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#334155',
                  fontSize: '14px',
                  py: 3,
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Cadence
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#334155',
                  fontSize: '14px',
                  py: 3,
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Durée Cuisson
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: 600, 
                  color: '#334155',
                  fontSize: '14px',
                  py: 3,
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fours.map((four) => (
                <TableRow 
                  key={four.id_four}
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { 
                      backgroundColor: '#f8fafc'
                    },
                    backgroundColor: editingFour === four.id_four ? '#eff6ff' : 'white',
                    borderLeft: editingFour === four.id_four ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TableCell sx={{ py: 3, borderBottom: '1px solid #f1f5f9' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                      }} />
                      <Typography sx={{ 
                        fontWeight: 600,
                        fontSize: '16px',
                        color: '#1e293b'
                      }}>
                        {four.num_four}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 3, borderBottom: '1px solid #f1f5f9' }}>
                    <Box>
                      <Typography sx={{ 
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1e293b'
                      }}>
                        {four.cadence}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '13px',
                        color: '#64748b'
                      }}>
                        
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 3, borderBottom: '1px solid #f1f5f9' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Clock size={18} color="#64748b" />
                      <Typography sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#334155',
                        backgroundColor: '#f1f5f9',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {formatDuration(four.duree_cuisson)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 3, borderBottom: '1px solid #f1f5f9' }}>
                    {editingFour === four.id_four ? (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                      }}>
                        <TextField
                          type="number"
                          value={newCadence}
                          onChange={(e) => setNewCadence(e.target.value)}
                          size="small"
                          sx={{ 
                            width: 100,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#3b82f6'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#3b82f6'
                              }
                            },
                            '& input': {
                              textAlign: 'center',
                              fontWeight: 500
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={() => handleUpdateCadence(four.id_four)}
                          disabled={loading}
                          startIcon={<Check size={16} />}
                          sx={{
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3,
                            backgroundColor: '#16a34a',
                            '&:hover': {
                              backgroundColor: '#15803d'
                            }
                          }}
                        >
                          Valider
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingFour(null);
                            setNewCadence('');
                          }}
                          startIcon={<X size={16} />}
                          sx={{
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3,
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                              borderColor: '#cbd5e1',
                              backgroundColor: '#f8fafc'
                            }
                          }}
                        >
                          Annuler
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditingFour(four.id_four);
                          setNewCadence(four.cadence);
                        }}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 3,
                          borderColor: '#3b82f6',
                          color: '#3b82f6',
                          '&:hover': {
                            backgroundColor: '#eff6ff',
                            borderColor: '#2563eb'
                          }
                        }}
                      >
                        Modifier
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Note */}
        <Paper sx={{ 
          mt: 4,
          p: 3,
          backgroundColor: '#fffbeb',
          borderRadius: 2,
          border: '1px solid #fde68a',
          borderLeft: '4px solid #f59e0b'
        }}>
          <Typography sx={{ 
            color: '#92400e',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <strong>Note :</strong> La modification de la cadence recalcule automatiquement la durée de cuisson.
          </Typography>
        </Paper>

      </Box>
    </Box>
  );
};
export default ParametrageContent;