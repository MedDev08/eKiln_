import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import Sidebar from '../../components/layout/sidebar';
import axios from 'axios';

export default function FoursEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cadence: '',
    duree_cuisson: ''
  });
  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFour = async () => {
      try {
        setLoading(prev => ({ ...prev, form: true }));
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/fours/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data) {
          setFormData({
            cadence: response.data.cadence,
            duree_cuisson: response.data.duree_cuisson
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load four data');
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchFour();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        new_cadence: parseInt(formData.cadence, 10)
      };

      await axios.patch(
        `http://localhost:8000/api/fours/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/settings/fours');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update four');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  if (loading.form) {
    return (
      <Sidebar>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Modifier le Four
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Cadence (minutes)"
          name="cadence"
          type="number"
          value={formData.cadence}
          onChange={handleChange}
          required
          inputProps={{ min: 1, max: 120 }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Erreur: {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Four mis à jour avec succès! Redirection...
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/settings/fours')}
            sx={{ flex: 1 }}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading.submit}
            sx={{ flex: 1 }}
          >
            {loading.submit ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </Box>
      </Box>
    </Sidebar>
  );
}