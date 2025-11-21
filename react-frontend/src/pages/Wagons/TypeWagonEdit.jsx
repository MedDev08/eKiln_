import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SidebarChef from "../../components/layout/SidebarChef";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography
} from "@mui/material";

export default function GestionTypeWagonsEdit() {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    type_wagon: "",
    description: "",
    color:"",
  });

  const [loading, setLoading] = useState({ form: true, submit: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTypeWagon = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/type_wagons/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log("response",response.data);
        if (response.data.success) {
          const { type_wagon, description,color } = response.data.data;

          setFormData({
            type_wagon: type_wagon || "",
            description: description || "",
            color: color ||"",  
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load type wagon"
        );
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchTypeWagon();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:8000/api/type_wagons/${id}`,
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
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update type wagon"
      );
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading.form) {
    return (
      <SidebarChef initialPath="/settings/type-wagons/edit">
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef initialPath="/settings/type-wagons/edit">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
          Edit Type Wagon
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
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            Type Wagon updated!
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
