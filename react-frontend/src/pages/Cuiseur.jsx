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
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import ChargementDetailsModal from "./Chargement/ChargementDetailsModal";
import SidebarChef from "../components/layout/SidebarChef";
import { Circle } from '@mui/icons-material'; 
import ModificationChargement from "./ModificationChargement";
function Cuiseur() {
  const [wagonsParFour, setWagonsParFour] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFour, setSelectedFour] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedChargement, setSelectedChargement] = useState(null);
  const [familles, setFamilles] = useState([]);
  const [fours, setFours] = useState([]);
  const [wagons, setWagons] = useState([]);
  const [users, setUsers] = useState([]);
  const [type_wagon, settype_wagon] = useState([]);

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
    const interval = setInterval(fetchWagons, 600000); // refresh toutes les 10 min 
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
  const handleOpenModal = (chargement , mode) => {
    setSelectedChargement({...chargement , mode});
    setOpenModal(true);
  };
   const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [famillesRes, foursRes, wagonsRes,usersRes,typeWagonsRes ] = await Promise.all([
        axios.get("http://localhost:8000/api/familles", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:8000/api/fours", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:8000/api/wagons1", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:8000/api/users", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:8000/api/type_wagons", { headers: { Authorization: `Bearer ${token}` } })
  
      ]);
      setFamilles(famillesRes.data);
      setFours(foursRes.data);
      setWagons(wagonsRes.data.data);
      setUsers(usersRes.data.data);
      // console.log("users",usersRes.data.data);
      settype_wagon(typeWagonsRes.data);
      // console.log("type_wagon",typeWagonsRes.data);
  
    } catch (err) {
      console.error("Erreur fetchInitialData :", err);
    }
  };
  useEffect(() => {
    fetchInitialData();
  }, []);

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
   // await fetchWagons();

  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};
  const boxStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, fontSize: 20 };
  //  Rendu du tableau
  const renderTable = (chargements, validated = false) => (
    <Paper sx={{ mt: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {validated && <TableCell> </TableCell>}
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
                  {validated && (
                  <TableCell>
                   {validated && c.anneaux && (
                      <Box sx={{ ...boxStyle, color: "gold" }}>
                        <Circle fontSize="small" />
                      </Box>
                    )}
                  </TableCell>
                )}
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
                      onClick={() => handleOpenModal(c ,"editer")}
                    >
                      Éditer
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleOpenModal(c ,"valider")}
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
    {/* Boutons pour choisir le four */}
  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
    {Object.keys(wagonsParFour).map((numFour) => {
      const count = wagonsParFour[numFour]?.enAttente?.length || 0;
      const isActive = selectedFour === numFour;
      const chipWidth = `${Math.max(count.toString().length * 10 + 10, 30)}px`; 

    return (
             <Button
                key={numFour}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => {
                    setSelectedFour(numFour); // changer le four
                    setLoading(true);          // afficher le loader
                    fetchWagons();             // actualiser les wagons
                  }}
                sx={{
                  borderRadius: "8px 8px 0 0",
                  backgroundColor: isActive ? "#3498db" : "transparent",
                  color: isActive ? "#fff" : "inherit",
                  "&:hover": {
                    backgroundColor: isActive ? "#2980b9" : "rgba(0,0,0,0.08)",
                  },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span>Four {numFour}</span>
                <Chip
                  label={count}
                  color="warning"
                  size="small"
                  sx={{
                    height: "17px",
                    width: chipWidth,
                  }}
                />
              </Button>
            );
          })}
  </Box>
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
            height: 850,
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
              height: 850,
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
              height: 850,
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
  <Typography> Chargement en cours...</Typography>
)}
        {/* {selectedChargement && ( */}
          {/* <Modal open={openModal} onClose={() => setOpenModal(false)}>*/}
            {/* <ChargementDetailsModal
              chargement={selectedChargement}
              onClose={() => setOpenModal(false)}
              onValidate={handleSaveValidation}
              getStatusColor={getStatusColor}
            /> */}
          {/* </Modal> */}
        {/* )} */}
         <ModificationChargement
            open={openModal}
            onClose={() => setOpenModal(false)}
            selectedChargement={selectedChargement}
            familles={familles}       
            fours={fours}            
            wagons={wagons} 
            type_wagon={type_wagon}        
            users={users}
            onValidate={handleSaveValidation} 
            onUpdate={fetchWagons}
          />
      </Box>
    </SidebarChef>
  );
}

export default Cuiseur;
