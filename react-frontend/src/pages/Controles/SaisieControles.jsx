import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  Chip,
  Grid
} from '@mui/material';
import axios from 'axios';
import SidebarChef from '../../components/layout/SidebarChef';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SaisieControlesParFour() {
  const [controles, setControles] = useState([]);
  const [values, setValues] = useState({});
  const [selectedFour, setSelectedFour] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmittingByFrequence, setIsSubmittingByFrequence] = useState({});
  const [frequencesDejaFaitesParFour, setFrequencesDejaFaitesParFour] = useState({});
  const [errorByFrequence, setErrorByFrequence] = useState({});
  const [emptyRequiredFields, setEmptyRequiredFields] = useState({});
  const [fours, setFours] = useState([]);
  const [remarques, setRemarques] = useState([]);
  const [loadingRemarques, setLoadingRemarques] = useState(false);
  const token = localStorage.getItem('token');
  const successRef = useRef(null);
  
  const fetchRemarques = async () => {
       if (!selectedFour) return; 
       try {
        setLoadingRemarques(true);
        const response = await axios.get(
          `http://localhost:8000/api/trois-dernières-remarques/${selectedFour}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRemarques(response.data);
      } catch (error) {
        console.error(error);
      } 
      finally {
        setLoadingRemarques(false); 
      }
    };

   useEffect(() => {
     
        fetchRemarques();
      
   }, [selectedFour]);

  const fetchControles = async () => {
    try {
      setLoading(true);
        const [response, foursRes ] = await Promise.all([
        axios.get('http://localhost:8000/api/controles-a-faire', {
         headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get("http://localhost:8000/api/fours", {
         headers: { Authorization: `Bearer ${token}` }
         }),
      ]);
  
      setControles(response.data.controles);
      setFours(foursRes.data);
      setFrequencesDejaFaitesParFour(
        response.data.frequences_deja_faites_par_four||{}
      );  
      if (!selectedFour && foursRes.data.length > 0) {
       setSelectedFour(foursRes.data[0].id_four);
       }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const controlesDuFour = useMemo(() => {
    if (!selectedFour) return [];
    return controles.filter(c =>
      c.controle_fours?.some(cf => cf.id_four === selectedFour)
    );
  }, [controles, selectedFour]);

  const frequences = useMemo(() => {
    const set = new Set();
    controlesDuFour.forEach(c => c.frequence && set.add(c.frequence));
    return [...set];
  }, [controlesDuFour]);
  const getControleFourId = (controle) => {
    const link = controle.controle_fours?.find(cf => cf.id_four === selectedFour);
    return link?.id;
  };
  const frequencesDejaFaites = useMemo(() => {
    if (!selectedFour) return [];
    return frequencesDejaFaitesParFour[selectedFour] || [];
  }, [selectedFour, frequencesDejaFaitesParFour]);
  const isRequiredForSelectedFour = (controle) => {
  const cf = controle.controle_fours?.find(
    f => String(f.id_four) === String(selectedFour)
  );

  return cf?.required === 1;
};
  const initValues = () => {
    if (!selectedFour) return {};

    const initialValues = {};
    controlesDuFour.forEach(c => {
      initialValues[c.id] = ''; 
    });

    return initialValues;
  };
useEffect(() => {
  setValues(initValues());
  setErrorByFrequence({});
  setEmptyRequiredFields({});
}, [selectedFour, controlesDuFour]);

const setValue = (id, val) => {
    setValues(v => ({ ...v, [id]: val }));
  };

const save = async (frequence) => {
  const list = controlesDuFour.filter(c => c.frequence === frequence);
 const isEmptyValue = (controle, value) => {
  if (controle.type === 'checkbox') {
    return value !== '1';
  }

  return value === '' || value === null || value === undefined;
};

 const missingRequired = list.filter(c => {
  if (!isRequiredForSelectedFour(c)) return false;

  return isEmptyValue(c, values[c.id]);
});

  if (missingRequired.length > 0) {
    const emptyFields = {};
    missingRequired.forEach(c => {
      emptyFields[c.id] = true;
    });

    setEmptyRequiredFields(emptyFields);

    setErrorByFrequence(prev => ({
      ...prev,
      [frequence]: "Impossible d’enregistrer cette fréquence. Veuillez remplir tous les champs obligatoires."
    }));

    return;
  }
  setEmptyRequiredFields({});
  setIsSubmittingByFrequence(prev => ({ ...prev, [frequence]: true }));
  setErrorByFrequence(prev => ({ ...prev, [frequence]: null }));
  try {
    let response;

  for (let c of list) {
  const idControleFour = getControleFourId(c);
  if (!idControleFour) continue;

  const valeur = values[c.id];

    response = await axios.post(
      'http://localhost:8000/api/detail-controles',
      {
        id_controle_four: idControleFour,
        valeur: valeur
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

    setValues(initValues());
    fetchControles();
    fetchRemarques();
    if (response) setSuccessMessage(response.data.message);
    setTimeout(() => setSuccessMessage(""), 4000);
    
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
  } finally {
    setIsSubmittingByFrequence(prev => ({ ...prev, [frequence]: false }));
  }
};
    useEffect(() => {
      fetchControles();
      const interval = setInterval(fetchControles,  3600000);  
      return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    if (successMessage && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [successMessage]);
  const isFrequenceFaite = (fourId, freq) => {
    return frequencesDejaFaitesParFour[fourId]?.includes(freq);
  };
  const frequencesAFaire = frequences.filter(
    freq => !isFrequenceFaite(selectedFour, freq)
  );
  

  if (loading) {
    return (
      <SidebarChef>
       <Box sx={{ width: '100%', p: 3, textAlign: 'center', mt: 5 }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Chargement en cours...</Typography>
      </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef>
      <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            width: "100%",
            maxWidth: "1600px", 
            mx: "auto"
          }}
        >
        <Typography variant="h4" fontWeight={700} mb={3}>
          Saisie des contrôles
        </Typography>

       <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
          {fours.map(four => {
            const isActive = selectedFour === four.id_four;

            return (
              <Button
                key={four.id_four}
                variant={isActive ? "contained" : "outlined"}
                onClick={() =>{
                   setSelectedFour(four.id_four);
                  }}
                sx={{
                  borderRadius: "8px 8px 0 0",
                  backgroundColor: isActive ? "#3498db" : "transparent",
                  color: isActive ? "#fff" : "inherit",
                  "&:hover": {
                    backgroundColor: isActive
                      ? "#2980b9"
                      : "rgba(0,0,0,0.08)",
                  },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Four {four.num_four}
              </Button>
            );
          })}
        </Box>
       {successMessage && (
          <Alert
            ref={successRef}
            severity="success"
            variant="filled"
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {successMessage}
          </Alert>
        )}
      {loadingRemarques ? (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
        <>
        <Box
          display="flex"
          flexDirection="column" 
          gap={3}
        >
        {selectedFour && remarques.length > 0 && (
          <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                width: '100%'
              }}
            >
            <Typography fontWeight={600} mb={1}>
              📝 Dernières remarques (48h)
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {remarques.map((r, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{r.user}</strong> ({r.shift}) : {new Date(r.created_at).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>{r.valeur}</strong> 
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
        </Box>
         </> 
      )}
        
         {selectedFour && (
        <Box display="flex" gap={3} alignItems="flex-start">
          <Box flex={3}   sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",        
              sm: "1fr",       
              md: "repeat(2, 1fr)", 
            },
            gap: 3,
          }}>
            {frequences.map(freq => {
              const list = controlesDuFour.filter(c => c.frequence === freq);
              if (!list.length) return null;

              return (
               <Paper
                  key={freq}
                  sx={{
                    p: 3,
                    mb: 4,
                    display: "flex",
                    flexDirection: "column",
                    // height: "100%"
                  }}
                >
                  <Typography fontWeight={600} mb={2}>
                    {freq.toUpperCase()}
                  </Typography>
                  {errorByFrequence[freq] && (
                    <Alert severity="error" sx={{ mb: 2, fontWeight: 600 }}>
                      {errorByFrequence[freq]}
                    </Alert>
                  )}
                  <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
            {list.map(c => (
            <Grid container   key={c.id}  rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 2 }} >
                <Grid size={6}>
                  <Typography>
                    {c.libelle}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {c.type === 'number' && (
                        <TextField
                          type="number"
                          fullWidth
                          label="Valeur"
                          value={values[c.id]}
                          onChange={e => setValue(c.id, e.target.value)}
                          error={!!emptyRequiredFields[c.id]}
                        />
                      )}

                  {c.type === 'text' && (
                        <TextField
                          fullWidth
                          label="Valeur"
                          value={values[c.id]}
                          onChange={e => setValue(c.id, e.target.value)}
                          error={!!emptyRequiredFields[c.id]}
                        />
                      )}

                  {c.type === 'checkbox' && (  
                    <Box display="flex" justifyContent= "flex-end">
                      <Checkbox
                        checked={values[c.id] === '1'}
                            onChange={e =>
                              setValue(c.id, e.target.checked ? '1' : '0')
                            }
                            sx={{
                              color: emptyRequiredFields[c.id] ? 'error.main' : undefined
                            }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            ))}
            </Box>
               <Box mt="auto">
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    onClick={() => save(freq)}
                    disabled={isSubmittingByFrequence[freq]}
                  >
                    {isSubmittingByFrequence[freq] ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>

         <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: { xs: "100%", md: "300px" } 
            }}
          >
          <Paper sx={{ p: 2, top: 90 }}>
            <Typography fontWeight={600} mb={2}>
              Statut des fréquences
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fréquence</TableCell>
                  <TableCell align="center">Statut</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {frequencesAFaire.map(freq => (
                  <TableRow key={freq}>
                    <TableCell>{freq.toUpperCase()}</TableCell>
                    <TableCell align="center">
                      <Chip label="À faire" color="warning" size="small" />
                    </TableCell>
                  </TableRow>
                ))}

                {frequencesDejaFaites.map(freq => (
                  <TableRow key={freq}>
                    <TableCell>{freq.toUpperCase()}</TableCell>
                    <TableCell align="center">
                      <CheckCircleIcon
                        fontSize="small"
                        sx={{ color: "success.main" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          </Box>
          </Box>
          )}
     
      </Box>
    </SidebarChef>
  );
}
