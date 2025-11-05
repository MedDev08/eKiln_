
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

export default function ManageUsersEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    Matricule: '',
    Nom: '',
    Prenom: '',
    Role: '',
    Password: ''
  });
  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [familles, setFamilles] = useState([]);
  const [selectedFamilles, setSelectedFamilles] = useState([]);
  const [userPolyvalences, setUserPolyvalences] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:8000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { Matricule, Nom, Prenom, Role } = userResponse.data.data;
        setFormData({
          Matricule,
          Nom,
          Prenom,
          Role,
          Password: ''
        });

        if (Role === 'trieur') {
          const famillesResponse = await axios.get('http://localhost:8000/api/familles', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFamilles(famillesResponse.data);

          const polyResponse = await axios.get(`http://localhost:8000/api/polyvalences/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userFamilles = polyResponse.data.map(p => p.id_famille);
          setSelectedFamilles(userFamilles);
          setUserPolyvalences(polyResponse.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user');
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchUserData();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError('');
    setSuccess(false);

    try {
      const userData = {
        ...formData,
        matricule: formData.Matricule,
        nom: formData.Nom,
        prenom: formData.Prenom,
        role: formData.Role,
        password: formData.Password || undefined
      };

      await axios.put(`http://localhost:8000/api/users/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (formData.Role === 'trieur') {
        const currentPoly = userPolyvalences.map(p => p.id_famille);
        const toAdd = selectedFamilles.filter(f => !currentPoly.includes(f));
        const toRemove = currentPoly.filter(f => !selectedFamilles.includes(f));
        
        await Promise.all(toAdd.map(familleId => 
          axios.post('http://localhost:8000/api/polyvalences', {
            id_famille: familleId,
            id_user: id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
        
        await Promise.all(toRemove.map(familleId => {
          const polyToDelete = userPolyvalences.find(p => p.id_famille === familleId);
          if (polyToDelete) {
            return axios.delete(`http://localhost:8000/api/polyvalences/${polyToDelete.id_polyvalence}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          return Promise.resolve();
        }));
      }
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
      }, 500);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
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

  const handleFamilleChange = (event) => {
    const { value } = event.target;
    setSelectedFamilles(typeof value === 'string' ? value.split(',') : value);
  };

  if (loading.form) {
    return (
      <SidebarChef initialPath="/manage-users/edit">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef initialPath="/manage-users/edit">
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
          EDIT USER
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
            label="New Password"
            name="Password"
            type="password"
            value={formData.Password}
            onChange={handleChange}
            helperText="Leave blank to keep current password"
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
            User updated successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading.submit}
          sx={{ mt: 3 }}
        >
          {loading.submit ? <CircularProgress size={24} /> : 'Update User'}
        </Button>
      </Box>
    </SidebarChef>
  );
}