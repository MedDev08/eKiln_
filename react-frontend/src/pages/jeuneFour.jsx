import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Chip,
  Modal,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import ChargementDetailsModal from "./Chargement/ChargementDetailsModal";
import SidebarChef from "../components/layout/SidebarChef";

function JeuneFour() {
  const [chargements, setChargements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userShift, setUserShift] = useState(null);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedChargement, setSelectedChargement] = useState(null);

  const fetchChargements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/chargements/historique",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChargements(response.data.data.data);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "jeune four") setUserShift(user.shift);
  }, []);

  useEffect(() => {
    fetchChargements();
  }, [userShift]);
const formatDate = (dateString) => format(parseISO(dateString),
 "dd/MM/yyyy HH:mm", { locale: fr });
  const getStatusColor = (status) => {
    switch (status) {
      case "en attente":
        return "warning";
      case "en cuisson":
        return "info";
      case "sorti":
        return "default";
      default:
        return "primary";
    }
  };

  const handleOpenModal = (chargement) => {
    setSelectedChargement(chargement);
    setOpenModal(true);
  };

  const handleSaveValidation = async (validationDate) => {
    try {
      const token = localStorage.getItem("token");
      const formattedDate = format(validationDate, "yyyy-MM-dd HH:mm:ss");
      const response = await axios.post(
        `http://localhost:8000/api/chargements/valider/${selectedChargement.id}`,
        { date_entrer: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedChargement = response.data.data;
      setChargements((prev) =>
        prev.map((c) =>
          c.id === selectedChargement.id
            ? { ...c, ...updatedChargement, date_validation: validationDate }
            : c
        )
      );
      setOpenModal(false);
      setSelectedChargement(null);
    } catch (error) {
      console.error("Erreur validation:", error.response?.data || error.message);
      alert("Erreur: " + JSON.stringify(error.response?.data || error.message));
    }
  };

  const renderTable = (data, title, showValidate = false, showEdit = false) => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Chargement</TableCell>
                <TableCell>Wagon</TableCell>
                <TableCell>Four</TableCell>
                <TableCell>Total pièces</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell> Date sortie estimée</TableCell>
                <TableCell> Matricule</TableCell>
                {showEdit && <TableCell>Date Entrer</TableCell>}
                {(showValidate || showEdit) && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.datetime_chargement ? formatDate(c.datetime_chargement) :'N/A'}</TableCell>
                  <TableCell>{c.wagon?.num_wagon || "N/A"}</TableCell>
                  <TableCell>{c.four?.num_four || "N/A"}</TableCell>
                  <TableCell>
                    {c.details.reduce((sum, d) => sum + d.quantite, 0)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.statut}
                      color={getStatusColor(c.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{c.datetime_sortieEstime ? formatDate(c.datetime_sortieEstime): 'N/A'}</TableCell>
                  <TableCell>  {c.user?.matricule || "-"}</TableCell>
                  {showEdit && ( <TableCell>{c.date_entrer ? formatDate(c.date_entrer) :'-'}</TableCell>)}
                 {(showValidate || showEdit) && (
                  <TableCell>
                    {showValidate && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleOpenModal(c)}
                      >
                        Valider
                      </Button>
                    )}
                    {showEdit && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenModal(c)}
                        sx={{ ml: 1 }}
                      >
                        Éditer
                      </Button>
                    )}
                  </TableCell>
                )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

 const chargementsValides = chargements
  .filter((c) => c.statut === "en cuisson")
  .sort((a, b) => new Date(b.date_entrer) - new Date(a.date_entrer));
  const chargementsEnCours = chargements.filter((c) => c.statut === "en attente");

  return (
    <SidebarChef>
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Chargements de mon shift
      </Typography>

      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
        onClick={fetchChargements}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? "Chargement..." : "Actualiser"}
      </Button>

      {error && <Typography color="error">{error}</Typography>}

      {renderTable(chargementsEnCours, "Chargements en cours", true)}
      {renderTable(chargementsValides, "Chargements validés",false, true)}

      {/* --- Modal --- */}
      {selectedChargement && (
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <ChargementDetailsModal
            chargement={selectedChargement}
            onClose={() => setOpenModal(false)}
            onValidate={handleSaveValidation}
            getStatusColor={getStatusColor}
          />
        </Modal>
      )}
    </Box>
    </SidebarChef>
  );
}

export default JeuneFour;
