import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  TextField,
  Button,
  IconButton,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CircularProgress } from "@mui/material";

export default function ChargementDetailsModal({
  onClose,
  chargement,
  onValidate,
  getStatusColor,
  // densityFamilles 
}) {
const [selectedTypeWagon, setSelectedTypeWagon] = useState("");
const [typeWagons, setTypeWagons] = useState([]);
const [typeWagonOpen, setTypeWagonOpen] = useState(false);
const [loadingData, setLoadingData] = useState(true);
const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchTypeWagons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/type_wagons", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      setTypeWagons(data);

      // Préremplir
      if (chargement?.id_typeWagon) {
        setSelectedTypeWagon(chargement.id_typeWagon);
      }

    } catch (err) {
      console.error("Erreur chargement types wagons:", err);
    }finally {
      setLoadingData(false); // tout est chargé
    }
  };

useEffect(() =>{
fetchTypeWagons();
},[]);

const updateTypeWagon = async () => {
  try {
    const token = localStorage.getItem("token");
    await fetch(`http://127.0.0.1:8000/api/chargements/${chargement.id}/typeWagon`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_typeWagon: selectedTypeWagon }),
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du type wagon :", error);
  }
};

 // --- Ici on définit la fonction pour calculer la date initiale ---
const getInitialDate = async () => {
  if (!chargement) return new Date();

  //  si la date d’entrée existe, on l’utilise immédiatement
  if (chargement.date_entrer) {
    return new Date(chargement.date_entrer.replace(" ", "T"));
  }

  try {
    const token = localStorage.getItem("token");

    //  récupérer la dernière date d’entrée pour ce four
    const response = await fetch(
      `http://127.0.0.1:8000/api/chargements/last-date/${chargement.id_four}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();

    let baseDate;

    if (data?.date_entrer) {
      //  Si une dernière date existe, on part de là
      const safeDateStr = data.date_entrer.replace(" ", "T");
      baseDate = new Date(safeDateStr);
    } else {
      //  Sinon, on prend la date actuelle
      baseDate = new Date();
    }

    //  Ajouter le décalage selon le four
    if (chargement.id_four === 6)
      baseDate = new Date(baseDate.getTime() + 16 * 60 * 1000);
    else if (chargement.id_four === 7)
      baseDate = new Date(baseDate.getTime() + 34 * 60 * 1000);

    return baseDate;
  } catch (error) {
    console.error("Erreur récupération dernière date :", error);
    // En cas d'erreur, on retourne une date actuelle + décalage
    let fallbackDate = new Date();
    return fallbackDate;
  }finally {
      setLoadingData(false); // tout est chargé
    }
};

// --- Initialiser le state ---
const [validationDate, setValidationDate] = useState(null);
const [anneauxCoche, setAnneauxCoche] = useState(false);
useEffect(() => {
  if (!chargement) return;

// Si la relation existe et n'est pas null, checkbox cochée
  setAnneauxCoche(chargement.anneaux );
}, [chargement]);

// --- Charger la date initiale une fois que le chargement est disponible ---
useEffect(() => {
  if (!chargement) return;

  const initDate = async () => {
    const date = await getInitialDate();
    setValidationDate(date);
  };

  initDate();
}, [chargement]);

  // Fonction pour changer uniquement l'heure et les minutes
  const handleChangeTime = (e) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate = new Date(validationDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setValidationDate(newDate);
  };
const updateAnneaux = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:8000/api/chargements/${chargement.id}/anneaux`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coche: anneauxCoche }),
      }
    );

    const data = await response.json();
    // Mettre à jour l’objet chargement pour refléter la relation
    chargement.anneaux = anneauxCoche ? data : null;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des anneaux :", error);
  }
};


  const formatDate = (dateString) =>
    format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr });
 const user = JSON.parse(localStorage.getItem('user'));
 const role = user?.role?.toLowerCase();
 const showField = chargement.mode === "editer" || role === "admin";
  if (!chargement) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        maxHeight: "80vh",
        overflowY: "auto",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          le chargement #{chargement.id}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Informations principales */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Wagon :</Typography>
          <Typography>{chargement.wagon?.num_wagon || "N/A"}</Typography>
        </Grid>
         <Grid item xs={6}>
        <Typography variant="subtitle2">Type Wagon :</Typography>
          <Chip label={chargement.type_wagon?.type_wagon || 'N/A'} 
          sx={{backgroundColor: chargement.type_wagon?.color || '#ccc',
              color: '#fff', 
              fontWeight: 'bold'
            }}
            size="small"
          />          
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Four :</Typography>
          <Typography>{chargement.four?.num_four || "N/A"}</Typography>
        </Grid>
         <Grid item xs={6}>
          <Typography variant="subtitle2">Total pièces :</Typography>
          <Typography>{chargement.details.reduce((sum, d) =>
              d.famille?.active === 1 ? sum + Number(d.quantite): sum , 0)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Date chargement :</Typography>
          <Typography>{formatDate(chargement.datetime_chargement)}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Statut :</Typography>
          <Chip
            label={chargement.statut}
            color={getStatusColor(chargement.statut)}
            size="small"
          />
        </Grid>
         <Grid item xs={6}>
          <Typography variant="subtitle2"> Date sortie estimée :</Typography>
          <Typography>{formatDate(chargement.datetime_sortieEstime)}</Typography>
        </Grid>
          <Grid item xs={6}>
          <Typography variant="subtitle2">Matricule :</Typography>
          <Typography>{chargement.user?.matricule || "-"}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Détails des pièces */}
      <Typography variant="h6" gutterBottom>
        Détails des pièces
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Famille</TableCell>
              <TableCell align="right">Quantité</TableCell>
               <TableCell align="right">Densité (%)</TableCell>
            </TableRow>
          </TableHead>
       <TableBody>
          {chargement.details && chargement.details.length > 0 ? (
            chargement.details.map((detail, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{detail.famille?.nom_famille || "N/A"}</TableCell>
                  <TableCell align="right">{detail.quantite}</TableCell>
                  {/* <TableCell align="right">
                  {detail.famille && densityFamilles.find(
                    f => f.id_chargement === chargement.id && f.id_famille === detail.famille.id_famille
                  )?.density_famille || "-"}
                </TableCell> */}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center">
                Aucune famille associée
                </TableCell>
            </TableRow>
          )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      {/* Modification de l'heure */}
      {["admin","cuiseur"].includes(user?.role?.toLowerCase()) && location.pathname.toLowerCase().includes("/cuiseur") &&(
     <>
      <Box display="flex" alignItems="center" mb={2}>
       <input
          type="checkbox"
          checked={anneauxCoche}
          onChange={(e) => setAnneauxCoche(e.target.checked)}
        />
        <Typography ml={1}><strong>Anneaux Bullers</strong></Typography>
      </Box>
      <Typography sx={{ mb: 1 }}>Heure d’entrée :</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Autocomplete
              options={typeWagons}
              getOptionLabel={(tw) => tw.type_wagon}
              value={typeWagons.find(tw => tw.id === selectedTypeWagon) || null}
              onChange={(event, newValue) => {
                setSelectedTypeWagon(newValue ? newValue.id : null);
              }}
              //  OPTION BACKGROUND
              renderOption={(props, option) => {
                const color = option.color;
                const isColored = color !== "inherit";

              return (
                <li
                  {...props}
                  style={{
                    backgroundColor: isColored ? color : "white",
                    color: isColored ? "white" : "black",
                    borderRadius: "4px",
                    margin: "3px 0"
                  }}
                >
                  {option.type_wagon}
                </li>
              );
          }}
              renderInput={(params) => {
                const selected = typeWagons.find(tw => tw.id === selectedTypeWagon);
                return (
                  <TextField
                    {...params}
                    label="Type Wagon"
                    required
                    margin="dense"
                    sx={{ mb: 2 }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: selected ? (() => {
                        const bg = selected.color;
                        const isColored = bg !== "inherit";

                        return (
                          <Chip
                            label={selected.type_wagon}
                            size="small"
                            sx={{
                              backgroundColor: isColored ? bg : "white",
                              color: isColored ? "white" : "black",
                              fontWeight: "bold",
                              border: isColored ? "none" : "1px solid #ccc"
                            }}
                          />
                        );
                      })() : null,
                      inputProps: {
                        ...params.inputProps,
                        value: "" // garde ton comportement
                      }
                    }}
                  />
                );
                  }}
              open={typeWagonOpen}
              onOpen={() => setTypeWagonOpen(true)}
              onClose={() => setTypeWagonOpen(false)}
              sx={{ width: "130px" }}
                />
        </Grid>
      <Grid item xs={4}>
     {showField && (
        <>
          <TextField
            type="date"
            value={validationDate ? format(validationDate, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const newDate = new Date(
                e.target.value + "T" + format(validationDate, "HH:mm")
              );
              setValidationDate(newDate);
            }}
            margin="dense"
            fullWidth
            sx={{ mb: 2 }}
          />
        </>
      )}
      </Grid>
      <Grid item xs={4}>
      <TextField
        type="time"
        value={validationDate ? format(validationDate, "HH:mm") : ""}
        onChange={handleChangeTime}
        margin="dense"
        fullWidth
        sx={{ mb: 2 }}
      />
       </Grid>
       </Grid>
      {/* Boutons */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button onClick={onClose} sx={{ mr: 2 }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={loadingData || isSubmitting} // désactivé si data pas chargée ou submission en cours
          onClick={async () => {
            try {
              setIsSubmitting(true);

              await updateAnneaux();
              await updateTypeWagon();
              await onValidate(validationDate);
              onClose();
              return; 
            } catch (error) {
              console.error("Erreur validation :", error);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" /> // spinner dans le bouton
          ) : (
            "Valider"
          )}
        </Button>
      </Box>
       </>
    )}
    </Box>
  );
}
