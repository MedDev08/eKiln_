import React, { useState } from 'react';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function TypeWagonAdd() {
  const [formData, setFormData] = useState({
    nom_service: '',
    color: '#000000'
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/services',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setSuccess(true);
        setFormData({
          nom_service: '',
          color: '#000000'
        });
      }
        setTimeout(() => {
        navigate('/settings/services');
      },500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service');
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
    <SidebarChef initialPath="/settings/services/add">
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
          ADD SERVICE
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Service"
          name="nom_service"
          value={formData.nom_service}
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
             Service created successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Service'}
        </Button>
      </Box>
    </SidebarChef>
  );
}
