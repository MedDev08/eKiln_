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
  Grid,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import ChargementDetailsModal from "./Chargement/ChargementDetailsModal";
import SidebarChef from "../components/layout/SidebarChef";

function JeuneFour() {
  const [wagonsParFour, setWagonsParFour] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFour, setSelectedFour] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedChargement, setSelectedChargement] = useState(null);

  //  Fonction de récupération des wagons
  const fetchWagons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:8000/api/chargements/en-attente",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // On récupère directement la liste renvoyée par Laravel
      const wagons = response.data.data || [];
      //  Regrouper par numéro de four
      const grouped = {};
      wagons.forEach((c) => {
        const numFour = c.four?.num_four?.toString() || `Four ${c.id_four}`;

        if (!grouped[numFour]) grouped[numFour] = { enAttente: [], enCuisson: [] };
       
        if (c.statut === "en attente") grouped[numFour].enAttente.push(c);
        else
          //  if (c.statut === "en cuisson" && c.date_entrer)
          grouped[numFour].enCuisson.push(c);
      });
      setWagonsParFour(grouped);

      // Sélectionner le premier four par défaut
      if (!selectedFour && Object.keys(grouped).length > 0) {
        setSelectedFour(Object.keys(grouped)[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des wagons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWagons();
    const interval = setInterval(fetchWagons, 60000); // refresh toutes les 60s
    return () => clearInterval(interval);
  }, []);
  //  Formatage des dates
  const formatDate = (dateString) =>
    dateString
      ? format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: fr })
      : "-";

  //  Couleur selon le statut
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

  //  Ouvrir modal de validation
  const handleOpenModal = (chargement) => {
    setSelectedChargement(chargement);
    setOpenModal(true);
  };

  //  Sauvegarde validation (date d’entrée)
 const handleSaveValidation = async (validationDate) => {
  try {
    const token = localStorage.getItem("token");
    const formattedDate = format(validationDate, "yyyy-MM-dd HH:mm:ss");

     await axios.post(
      `http://localhost:8000/api/chargements/valider/${selectedChargement.id}`,
      { date_entrer: formattedDate },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Fermer la modal d'abord
    setOpenModal(false);
    setSelectedChargement(null);

    //  Recharge toutes les données pour mettre à jour wagon et user immédiatement
    await fetchWagons();

  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};
  //  Rendu du tableau
  const renderTable = (chargements, validated = false) => (
    <Paper sx={{ mt: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Chargement</TableCell>
              <TableCell>Wagon</TableCell>
              <TableCell>Four</TableCell>
              <TableCell>Statut</TableCell>
              {validated && <TableCell>Date Entrée</TableCell>}
               <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chargements.length > 0 ? (
              chargements.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{formatDate(c.datetime_chargement)}</TableCell>
                  <TableCell>{c.wagon?.num_wagon || "-"}</TableCell>
                  <TableCell>Four{c.four?.num_four || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.statut}
                      color={getStatusColor(c.statut)}
                      size="small"
                    />
                  </TableCell>
                  {validated && (
                    <TableCell>{formatDate(c.date_entrer)}</TableCell>
                  )}
                  <TableCell>
                  {validated ? (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenModal(c)}
                    >
                      Éditer
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleOpenModal(c)}
                    >
                      Valider
                    </Button>
                  )}
                </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun chargement trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  //  Rendu principal
  return (
    <SidebarChef>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Wagons par four
        </Typography>

        {/* Onglets des fours */}
      <Tabs
      value={selectedFour}
        // onChange={(e, newValue) => setSelectedFour(newValue)}
      onChange={(e, newValue) => {
        setSelectedFour(newValue); // change de four
        setLoading(true);          // montrer le loader
        // On attend 50ms pour que le loader apparaisse avant de fetcher
        setTimeout(() => {
          fetchWagons();
        }, 50);
      }}
      sx={{ mb: 2 }}
      variant="scrollable"
      scrollButtons="auto"
    >
      {Object.keys(wagonsParFour).map((numFour) => {
        const count = wagonsParFour[numFour]?.enAttente?.length || 0;

        return (
          <Tab
            key={numFour}
            value={numFour}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              textTransform: "none",
              marginRight: 1,
              "&.Mui-selected": {
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
              },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              paddingTop: 2,
              paddingBottom: 2,
            }}
            label={
              <Box sx={{ position: "relative", width: "100%" }}>
               <Badge
                  badgeContent={count}
                  color="warning"
                  max={999}
                  sx={{
                    position: "absolute",
                    top: -6,
                    right: 5,
                  }}
                >
               </Badge>
               {/* <Box
                  sx={{
                    position: "absolute",
                    top: -17,
                    left: 48,
                    width: 24,
                    height: 24,
                    backgroundColor: (theme) => theme.palette.warning.main, // couleur warning
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: "bold",
                    borderRadius: 1, // coins légèrement arrondis pour carré
                  }}
                >
                  {count}
                </Box> */}
                <span>Four {numFour}</span>
              </Box>
            } 
          />
        );
      })}
    </Tabs>
        {/* Bouton actualiser */}
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={fetchWagons}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? "Chargement..." : "Actualiser"}
        </Button>

        {error && <Typography color="error">{error}</Typography>}

       {selectedFour && wagonsParFour[selectedFour] ? (
  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
    <Box sx={{ flex: 1 }}>
      {/* Tables côte à côte avec hauteur fixe et scroll */}
      {loading ? (
        <Box
          sx={{
            flex: 1,
            height: 450,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {/* Table En attente */}
          <Box
            sx={{
              flex: 1,
              height: 450,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              En attente
            </Typography>
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {renderTable(wagonsParFour[selectedFour].enAttente || [], false)}
            </Box>
          </Box>
          {/* Table En cuisson */}
          <Box
            sx={{
              flex: 1,
              height: 450,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              En cuisson
            </Typography>
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {renderTable(wagonsParFour[selectedFour].enCuisson || [], true)}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  </Box>
) : (
  <Typography>Aucun wagon trouvé pour ce four.</Typography>
)}


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
