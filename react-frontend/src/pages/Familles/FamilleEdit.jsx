
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Switch, FormControlLabel } from '@mui/material';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';

export default function FamilleEdit() {
   const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nom_famille: '',
    valeur_trieur: '',
    active: true,
  });
  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFamilleData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/familles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("response",response.data);
        setFormData({
          nom_famille: response.data.nom_famille,
          valeur_trieur: response.data.valeur_trieur,
          active: response.data.active,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load famille');
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchFamilleData();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError('');
    setSuccess(false);

    try {
      await axios.put(`http://localhost:8000/api/familles/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/settings/familles');
      }, 500);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update famille');
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
      <SidebarChef initialPath="/settings/familles/edit">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef initialPath="/settings/familles/edit">
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
            EDIT FAMILLE
          </Typography>
        </Box>

        <TextField
          fullWidth
          margin="normal"
          label="Nom Famille"
          name="nom_famille"
          value={formData.nom_famille}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="Valeur Trieur"
          name="valeur_trieur"
          type="number"
          inputProps={{ min: 0, step: "0.01" }}
          value={formData.valeur_trieur}
          onChange={handleChange}
          required
        />
         <Box>
          <FormControlLabel
          control={
          <Switch
          checked={!!formData.active} 
          onChange={(e) =>
          setFormData({ ...formData, active: e.target.checked })
          }
          color="success"
          />
          }
          label={formData.active ? "Active" : "Inactive"}
        />
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Famille updated successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading.submit}
          sx={{ mt: 3 }}
        >
          {loading.submit ? <CircularProgress size={24} /> : 'Update Famille'}
        </Button>
      </Box>
    </SidebarChef>
  );
}