
import React, { useState, useEffect } from 'react';
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
  Typography,
  Alert,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormHelperText
} from '@mui/material';

const ROLES = [
  'admin',
  'chef d\'equipe',
  'trieur',
  'enfourneur',
  'cuiseur'
];

export default function ManageUsersAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Matricule: '',
    Nom: '',
    Prenom: '',
    Role: '',
    Password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [familles, setFamilles] = useState([]);
  const [selectedFamilles, setSelectedFamilles] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFamilles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/familles', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFamilles(response.data);
      } catch (err) {
        console.error('Error fetching families:', err);
      }
    };

    if (formData.Role === 'trieur') {
      fetchFamilles();
    }
  }, [formData.Role, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const userData = {
        ...formData,
        matricule: formData.Matricule,
        nom: formData.Nom,
        prenom: formData.Prenom,
        role: formData.Role,
        password: formData.Password
      };

      const response = await axios.post('http://localhost:8000/api/users', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (formData.Role === 'trieur' && selectedFamilles.length > 0) {
        const userId = response.data.id_user;
        await Promise.all(selectedFamilles.map(familleId => 
          axios.post('http://localhost:8000/api/polyvalences', {
            id_famille: familleId,
            id_user: userId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
      }
      
      setSuccess(true);
      setFormData({
        Matricule: '',
        Nom: '',
        Prenom: '',
        Role: '',
        Password: ''
      });
      setSelectedFamilles([]);
      setSuccess(true);
      setTimeout(() => {
        navigate('/manage-users');
      },500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
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

  const handleFamilleChange = (event) => {
    const { value } = event.target;
    setSelectedFamilles(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <SidebarChef initialPath="/manage-users/add">
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
          ADD NEW USER
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Matricule"
          name="Matricule"
          value={formData.Matricule}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="Nom"
          name="Nom"
          value={formData.Nom}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="Prenom"
          name="Prenom"
          value={formData.Prenom}
          onChange={handleChange}
          required
        />
        
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Role</InputLabel>
          <Select
            name="Role"
            value={formData.Role}
            label="Role"
            onChange={handleChange}
          >
            {ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {formData.Role !== 'trieur' && (
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="Password"
            type="password"
            value={formData.Password}
            onChange={handleChange}
            required={formData.Role !== 'trieur'}
          />
        )}

        {formData.Role === 'trieur' && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Polyvalence</InputLabel>
            <Select
              multiple
              value={selectedFamilles}
              onChange={handleFamilleChange}
              input={<OutlinedInput label="Polyvalence" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={familles.find(f => f.id_famille === value)?.nom_famille || value} 
                    />
                  ))}
                </Box>
              )}
            >
              {familles.map((famille) => (
                <MenuItem key={famille.id_famille} value={famille.id_famille}>
                  <Checkbox checked={selectedFamilles.indexOf(famille.id_famille) > -1} />
                  <ListItemText primary={famille.nom_famille} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Sélectionnez les familles pour lesquelles ce trieur est polyvalent</FormHelperText>
          </FormControl>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            User created successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create User'}
        </Button>
      </Box>
    </SidebarChef>
  );
}