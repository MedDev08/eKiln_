import React, { useState ,useEffect } from 'react';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function EssaisAdd() {
  const [formData, setFormData] = useState({
    id_service: '',
    nom_essais : ''
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [services, setServices] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
  const fetchServices = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8000/api/services',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setServices(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  fetchServices();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/essais',
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
          id_service: '',
          nom_essais: ''
        });
      }
        setTimeout(() => {
        navigate('/settings/essais');
      },500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create essais');
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
    <SidebarChef initialPath="/settings/essais/add">
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
          ADD ESSAIS
        </Typography>

       <TextField
        select
        fullWidth
        margin="normal"
        label="Service"
        name="id_service"
        value={formData.id_service}
        onChange={handleChange}
        required
        >
        {services.map(service => (
            <MenuItem key={service.id} value={service.id}>
            {service.nom_service}
            </MenuItem>
        ))}
        </TextField>

        <TextField 
        fullWidth
        margin="normal"
        label="Essai" 
        name="nom_essais" 
        value={formData.nom_essais}
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
             Essai created successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Essai'}
        </Button>
      </Box>
    </SidebarChef>
  );
}
