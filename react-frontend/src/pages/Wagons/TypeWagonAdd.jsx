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

export default function TypeWagonAdd() {
  const [formData, setFormData] = useState({
    type_wagon: '',
    description: ''
  });

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
        'http://localhost:8000/api/type_wagons',
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
          type_wagon: '',
          description: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create type wagon');
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
    <SidebarChef initialPath="/settings/type-wagons/add">
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
          ADD TYPE WAGON
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Type Wagon"
          name="type_wagon"
          value={formData.type_wagon}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
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
            Type Wagon created successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Type Wagon'}
        </Button>
      </Box>
    </SidebarChef>
  );
}
