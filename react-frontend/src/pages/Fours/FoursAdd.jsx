// import React from 'react';
// import Sidebar from '../components/layout/sidebar';
// export default function FoursAdd() {
//   return (
//    < Sidebar initialPath="/settings/fours/add"   >
//     <div>FoursAdd</div>
//     </Sidebar>
//   )
// }
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SidebarChef from '../../components/layout/SidebarChef';
import axios from 'axios';
import Cookies from 'js-cookie';
import AddIcon from '@mui/icons-material/Add';

// Theme colors
const colors = {
  primary: {
    100: '#e0f7fa',
    300: '#4db6ac',
    500: '#009688',
    700: '#00796b',
    900: '#004d40'
  },
  secondary: {
    100: '#f5f5f5',
    300: '#e0e0e0',
    500: '#9e9e9e',
    700: '#616161',
    900: '#212121'
  },
  accent: {
    blue: '#2196f3',
    green: '#4caf50',
    amber: '#ffc107',
    red: '#f44336'
  }
};

const FoursAdd = () => {
  const [formData, setFormData] = useState({
    Num_four: '',
    Cadence: '',
    Durée_cuisson: '00:00:00'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Function to convert minutes to HH:MM:SS format
  const minutesToTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = Cookies.get('auth_token');
      if (!token) throw new Error('Authentication required');

      // Create payload
      const payload = {
        Num_four: formData.Num_four,
        Cadence: parseInt(formData.Cadence, 10),
        Durée_cuisson: formData.Durée_cuisson
      };

      const response = await axios.post(
        'http://localhost:8000/api/fours1',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setSuccess(true);
        // Reset form after successful submission
        setFormData({
          Num_four: '',
          Cadence: '',
          Durée_cuisson: '00:00:00'
        });
        // Redirect to fours list after 2 seconds
        setTimeout(() => navigate('/settings/fours'), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          err.message ||
                          'Failed to add four';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // If cadence changes, update baking duration
    if (name === 'Cadence') {
      const minutes = parseInt(value, 10);
      if (!isNaN(minutes) && minutes > 0) {
        const duration = minutesToTime(minutes);
        setFormData(prev => ({
          ...prev,
          Durée_cuisson: duration
        }));
      }
    }
  };

  return (
    <SidebarChef initialPath="/settings/fours/add">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          maxWidth: 600,
          margin: '0 auto'
        }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: colors.primary[500],
            color: 'white',
            borderRadius: 2,
            boxShadow: 3,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              letterSpacing: 1
            }}
          >
            ADD NEW FOUR
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Configure baking parameters for a new oven
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Four Number</InputLabel>
            <Select
              name="Num_four"
              value={formData.Num_four}
              label="Four Number"
              onChange={handleChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value={3}>Four 3</MenuItem>
              <MenuItem value={4}>Four 4</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Cadence (minutes)"
            name="Cadence"
            type="number"
            value={formData.Cadence}
            onChange={handleChange}
            required
            inputProps={{ min: 1, max: 120 }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Baking Duration"
            name="Durée_cuisson"
            value={formData.Durée_cuisson}
            InputProps={{
              readOnly: true,
            }}
            helperText="Calculated automatically from cadence"
            sx={{ mb: 2 }}
          />
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            Four added successfully! Redirecting to fours list...
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/settings/fours')}
            sx={{
              flex: 1,
              py: 1.5,
              fontWeight: 600,
              borderColor: colors.primary[500],
              color: colors.primary[500],
              '&:hover': {
                backgroundColor: colors.primary[50],
                borderColor: colors.primary[700]
              }
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={loading}
            sx={{
              flex: 1,
              py: 1.5,
              backgroundColor: colors.primary[500],
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: colors.primary[700],
                boxShadow: '0 4px 8px rgba(0, 150, 136, 0.3)'
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Four'}
          </Button>
        </Box>
      </Box>
    </SidebarChef>
  );
};

export default FoursAdd;
