import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SidebarChef from "../../components/layout/SidebarChef";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  MenuItem
} from "@mui/material";

export default function GestionEssaisEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_service: "",
    nom_essais:"",
  });

  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem("token");

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
  useEffect(() => {
    const fetchEssais = async () => {
      try {

        const response = await axios.get(
          `http://localhost:8000/api/essais/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log("response",response.data);
        if (response.data.success) {
            const essais = response.data.data;

           setFormData({
                id_service: essais.id_service || "",
                nom_essais: essais.nom_essais || "",
            });
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load service"
        );
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchEssais();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError("");
    setSuccess(false);

    try {

      const response = await axios.put(
        `http://localhost:8000/api/essais/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
      setTimeout(() => {
        navigate('/settings/essais');
      },500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update essais"
      );
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading.form) {
    return (
      <SidebarChef initialPath="/settings/essais/edit">
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef initialPath="/settings/essais/edit">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
          Edit Essai
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
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            Essai updated!
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading.submit}
          sx={{ mt: 3 }}
        >
          {loading.submit ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </Box>
    </SidebarChef>
  );
}
