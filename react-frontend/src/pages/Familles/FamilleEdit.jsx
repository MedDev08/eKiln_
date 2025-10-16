// import React from 'react';
// import Sidebar from '../components/layout/sidebar';
// export default function FamilleEdit() {
//   return (
//     <Sidebar initialPath="/settings/familles/edit" >
//     <div>FamilleEdit</div>
//     </Sidebar>
//   )
// }

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/layout/sidebar';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';

export default function FamilleEdit() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nom_famille: '',
    valeur_trieur: ''
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

        setFormData({
          nom_famille: response.data.nom_famille,
          valeur_trieur: response.data.valeur_trieur
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
      <Sidebar initialPath="/settings/familles/edit">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </Sidebar>
    );
  }

  return (
    <Sidebar initialPath="/settings/familles/edit">
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
    </Sidebar>
  );
}