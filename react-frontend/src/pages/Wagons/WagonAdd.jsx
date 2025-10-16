import React, { useState } from 'react';
import Sidebar from '../../components/layout/sidebar';
import axios from 'axios';
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
  'En cours de chargement',
  'Chargé',
  'En attente de déchargement',
  'Non disponible'
];

export default function GestionWagonsAdd() {
  const [formData, setFormData] = useState({
    num_wagon: '',
    type_wagon: '',
    statut: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/wagons1', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setFormData({ num_wagon: '', type_wagon: '', statut: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create wagon');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Sidebar initialPath="/settings/wagons/add">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
          Add New Wagon
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
        {success && <Typography color="success.main" sx={{ mt: 2 }}>Wagon created!</Typography>}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Wagon'}
        </Button>
      </Box>
    </Sidebar>
  );
}