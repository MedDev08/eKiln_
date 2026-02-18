
import React, { useState ,useEffect } from 'react';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
} from '@mui/material';

export default function ControleAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    libelle	: '',
    type: '',
    frequence: '',
    ids_four: [],
  });
  const [fours, setFours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const fetchFours = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/fours', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFours(res.data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger la liste des fours');
      }
    };
    fetchFours();
  }, [token]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://localhost:8000/api/controles',
        formData,
       {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setSuccess(true);
        setFormData({
           libelle	: '',
           type: '',
           frequence: '',
           ids_four: []
        });
        setTimeout(() => {
        navigate('/settings/controles');
      },500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create controle');
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
  const handleCheckboxChange = (id_four) => {
    setFormData(prev => ({
      ...prev,
      ids_four: prev.ids_four.some(f => f.id_four === id_four)
        ? prev.ids_four.filter(f => f.id_four !== id_four)
        : [...prev.ids_four, { id_four, required: true }]
    }));
  };
  const toggleRequired = (id_four) => {
    setFormData(prev => ({
      ...prev,
      ids_four: prev.ids_four.map(f =>
        f.id_four === id_four ? { ...f, required: !f.required } : f
      )
    }));
  };

  return (
    <SidebarChef initialPath="/settings/controles/add">
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
          ADD NEW Controle
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Libellé"
          name="libelle"
          value={formData.libelle}
          onChange={handleChange}
          required
        />

       <TextField
        select
        fullWidth
        margin="normal"
        label="Type"
        name="type"
        value={formData.type}
        onChange={handleChange}
        required
      >
        <MenuItem value="checkbox">Checkbox</MenuItem>
        <MenuItem value="number">Number</MenuItem>
        <MenuItem value="text">Text</MenuItem>
      </TextField>

         <TextField
          select
          fullWidth
          margin="normal"
          label="Fréquence de contrôle"
          name="frequence"
          value={formData.frequence}
          onChange={handleChange}
          required
        >
          <MenuItem value="heure">Heure</MenuItem>
          <MenuItem value="shift">Shift</MenuItem>
          <MenuItem value="jour">Jour</MenuItem>
          <MenuItem value="semaine">Semaine</MenuItem>
          <MenuItem value="mois">Mois</MenuItem>
          <MenuItem value="annee">Année</MenuItem>
        </TextField>
         <Typography sx={{ mt: 2, mb: 1 }}>Fours concernés :</Typography>
       <FormGroup>
          {fours.map(four => (
            <Box key={four.id_four} sx={{ display: 'flex', alignItems: 'center' }}>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.ids_four.some(f => f.id_four === four.id_four)}
                    onChange={() => handleCheckboxChange(four.id_four)}
                  />
                }
                label={`Four ${four.num_four}`}
              />

              {formData.ids_four.some(f => f.id_four === four.id_four) && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.ids_four.find(f => f.id_four === four.id_four)?.required}
                      onChange={() => toggleRequired(four.id_four)}
                      color="primary"
                    />
                  }
                  label={formData.ids_four.find(f => f.id_four === four.id_four)?.required ? "Required" : "Optional"}
                  // label="Required"
                  sx={{ ml: 2 }}
                />
              )}

            </Box>
          ))}
        </FormGroup>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Controle created successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Controle'}
        </Button>
      </Box>
    </SidebarChef>
  );
}


