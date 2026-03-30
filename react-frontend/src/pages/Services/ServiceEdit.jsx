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
  Typography
} from "@mui/material";

export default function GestionTypeWagonsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom_service: "",
    color:"",
  });

  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/services/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log("response",response.data);
        if (response.data.success) {
          const { nom_service,color } = response.data.data;

          setFormData({
            nom_service: nom_service || "",
            color: color ||"",  
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

    fetchServices();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:8000/api/services/${id}`,
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
        navigate('/settings/services');
      },500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update service"
      );
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading.form) {
    return (
      <SidebarChef initialPath="/settings/services/edit">
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef initialPath="/settings/services/edit">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
          Edit service
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
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            Service updated!
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
