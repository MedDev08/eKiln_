
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Switch
} from '@mui/material';

export default function ControleEdit() {
   const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    libelle	: '',
    type: '',
    frequence: '',
    ids_four: [],
  });
  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fours, setFours] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchControleData = async () => {
      try {
       const [controleRes, foursRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/controles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/api/fours`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const controle = controleRes.data;

      setFours(foursRes.data);

      setFormData({
        libelle: controle.libelle,
        type: controle.type,
        frequence: controle.frequence,
        ids_four: controle.controle_fours?.map(cf => ({
          id_four: cf.id_four,
          required: cf.required 
        })) || []
      });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load controle');
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchControleData();
  }, [id, token]);

  const isChecked = (id_four) =>
  formData.ids_four.some(f => f.id_four === id_four);

  const handleCheckboxChange = (id_four) => {
    setFormData(prev => ({
      ...prev,
      ids_four: isChecked(id_four)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError('');
    setSuccess(false);

    try {
      await axios.put(`http://localhost:8000/api/controles/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/settings/controles');
      }, 500);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update controle');
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

  if (loading.form) {
    return (
      <SidebarChef initialPath="/settings/controles/edit">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef initialPath="/settings/controles/edit">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Box
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            p: 2,
            borderRadius: '4px',
            boxShadow: 3,
            mb: 4,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 500,
              letterSpacing: 1
            }}
          >
            EDIT Controle
          </Typography>
        </Box>

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
              {fours.map((four) => (
                <Box key={four.id_four} sx={{ display: 'flex', alignItems: 'center' }}>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked(four.id_four)}
                        onChange={() => handleCheckboxChange(four.id_four)}
                      />
                    }
                    label={`Four ${four.num_four}`}
                  />

                  {isChecked(four.id_four) && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.ids_four.find(f => f.id_four === four.id_four)?.required}
                          onChange={() => toggleRequired(four.id_four)}
                          color="primary"
                        />
                      }
                      label={formData.ids_four.find(f => f.id_four === four.id_four)?.required ? "Required" : "Optional"}
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
            Controle updated successfully!
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading.submit}
          sx={{ mt: 3 }}
        >
          {loading.submit ? <CircularProgress size={24} /> : 'Update Controle'}
        </Button>
      </Box>
    </SidebarChef>
  );
}