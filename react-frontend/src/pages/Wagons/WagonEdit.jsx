import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Typography
} from '@mui/material';

const WAGON_TYPES = ['BG', 'DP', 'GF', 'BV'];
const WAGON_STATUS = [
  'Disponible',
  'en maintenance',
  'Non disponible'
];

export default function GestionWagonsEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    num_wagon: '',
    type_wagon: '',
    statut: ''
  });
  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchWagon = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/wagons1/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const { num_wagon, type_wagon, statut } = response.data.data;
          setFormData({
            num_wagon,
            type_wagon,
            statut
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load wagon');
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchWagon();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8000/api/wagons1/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
        navigate('/settings/wagons/edit');
      }, 500);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update wagon');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading.form) {
    return (
      <SidebarChef initialPath="/gestion-wagons/edit">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef initialPath="/settings/wagons/edit">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
          Edit Wagon
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Wagon Number"
          name="num_wagon"
          value={formData.num_wagon}
          onChange={handleChange}
          required
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Type</InputLabel>
          <Select
            name="type_wagon"
            value={formData.type_wagon}
            label="Type"
            onChange={handleChange}
          >
            {WAGON_TYPES.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Status</InputLabel>
          <Select
            name="statut"
            value={formData.statut}
            label="Status"
            onChange={handleChange}
          >
            {WAGON_STATUS.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {success && <Typography color="success.main" sx={{ mt: 2 }}>Wagon updated!</Typography>}

        <Button
          type="submit"
          variant="contained"
          disabled={loading.submit}
          sx={{ mt: 3 }}
        >
          {loading.submit ? <CircularProgress size={24} /> : 'Update Wagon'}
        </Button>
      </Box>
    </SidebarChef>
  );
}