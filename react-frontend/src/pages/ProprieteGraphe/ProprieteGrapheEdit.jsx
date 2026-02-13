
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Switch
} from '@mui/material';

export default function ProprieteGrapheEdit() {
   const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    id_four	: '',
    V1 : '',
    V2 : '',
    color : '',
  });
  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fours, setFours] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchControleData = async () => {
      try {
       const [proprieteRes, foursRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/propriete-graphe/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/api/fours`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const propriete = proprieteRes.data;

      setFours(foursRes.data);

      setFormData({
        id_four: propriete.id_four,
        V1: propriete.V1,
        V2: propriete.V2,
        color: propriete.color,})
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load propriété graphe');
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchControleData();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError('');
    setSuccess(false);

    try {
      await axios.put(`http://localhost:8000/api/propriete-graphe/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/settings/propriete_graphe');
      }, 500);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update propriété graphe');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  if (loading.form) {
    return (
      <SidebarChef initialPath="/settings/propriete_graphe/edit">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef initialPath="/settings/propriete_graphe/edit">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Box
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            p: 2,
            borderRadius: '4px',
            boxShadow: 3,
            mb: 4,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 500,
              letterSpacing: 1
            }}
          >
            EDIT Propriété Graphe
          </Typography>
        </Box>

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
            {fours.map((four) => (
                <MenuItem key={four.id_four} value={four.id_four}>
                Four {four.num_four}
                </MenuItem>
            ))}
       </TextField>

       <TextField
            fullWidth
            margin="normal"
            label="V1"
            name="V1"
            type="number"
            value={formData.V1}
            onChange={handleChange}
            required
            />

            <TextField
            fullWidth
            margin="normal"
            label="V2"
            name="V2"
            type="number"
            value={formData.V2}
            onChange={handleChange}
            required
            />

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
             Propriété graphe mise à jour avec succès !
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading.submit}
          sx={{ mt: 3 }}
        >
          {loading.submit ? <CircularProgress size={24} /> : 'Update Propriété Graphe'}
        </Button>
      </Box>
    </SidebarChef>
  );
}