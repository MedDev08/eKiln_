// import React from 'react';
// import Sidebar from '../components/layout/sidebar';

// export default function FamilleAdd() {
//   return (
//     <Sidebar initialPath="/settings/familles/add" >
//     <div>FamilleAdd</div>
//     </Sidebar>
//   )
// }

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

export default function FamilleAdd() {
  const [formData, setFormData] = useState({
    nom_famille: '',
    valeur_trieur: ''
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
      const response = await axios.post('http://localhost:8000/api/familles', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setSuccess(true);
        setFormData({
          nom_famille: '',
          valeur_trieur: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create famille');
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
    <SidebarChef initialPath="/settings/familles/add">
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
          ADD NEW FAMILLE
        </Typography>

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
            Famille created successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Famille'}
        </Button>
      </Box>
    </SidebarChef>
  );
}


