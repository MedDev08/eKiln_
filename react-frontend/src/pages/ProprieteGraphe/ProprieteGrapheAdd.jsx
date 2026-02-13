
import React, { useState ,useEffect} from 'react';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
} from '@mui/material';

export default function ProprieteGrapheAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_four	: '',
    V1 : '',
    V2 : '',
    color : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('token');
  const [fours, setFours] = useState([]);
  
  useEffect(() => {
    const fetchFours = async () => {
    try {
        const res = await axios.get('http://localhost:8000/api/fours', {
        headers: { Authorization: `Bearer ${token}` },
        });
        setFours(res.data);
    } catch (err) {
        console.error(err);
        setError('Impossible de charger la liste des fours');
    }
    };
    fetchFours();
  }, [token]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://localhost:8000/api/propriete-graphe',
        formData,
       {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setSuccess(true);
        setFormData({
           id_four	: '',
           V1 : '',
           V2 : '',
           color : ''
        });
        setTimeout(() => {
        navigate('/settings/propriete_graphe');
      },500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create Graph Property');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return (
    <SidebarChef initialPath="/settings/propriete_graphe/add">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography
          variant="h4"
          sx={{
            backgroundColor: (theme) => theme.palette.primary.main,
            color: (theme) => theme.palette.primary.contrastText,
            p: 2,
            borderRadius: 1,
            boxShadow: 2,
            mb: 4,
            textAlign: 'center'
          }}
        >
          ADD NEW Graph Property
        </Typography>
        <TextField
        select
        fullWidth
        margin="normal"
        label="Four"
        name="id_four"
        value={formData.id_four}
        onChange={handleChange}
        required
        >
        {fours.length === 0 ? (
            <MenuItem disabled>Aucun four disponible</MenuItem>
        ) : (
            fours.map((four) => (
            <MenuItem key={four.id_four} value={four.id_four}>
                Four {four.num_four}
            </MenuItem>
            ))
        )}
        </TextField>
       <TextField
          fullWidth
          margin="normal"
          label="Valeur minimale (V1)"
          name="V1"
          type="number"
          value={formData.V1}
          onChange={handleChange}
          required
        >
        </TextField>
        <TextField
            fullWidth
            margin="normal"
            label="Valeur maximale (V2)"
            name="V2"
            type="number"
            value={formData.V2}
            onChange={handleChange}
        >
        </TextField>
        <TextField 
          fullWidth
          margin="normal"
          label="Couleur" 
          name="color" 
          type="color"  
          value={formData.color}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Graph property created successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> :'Create Graph Property'}
        </Button>
      </Box>
    </SidebarChef>
  );
}


