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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ChargementDetailsModal({
  onClose,
  chargement,
  onValidate,
  getStatusColor,
}) {
  // Initialisation de la date de validation
 const [validationDate, setValidationDate] = useState(new Date());

  // Synchroniser validationDate si le chargement change
 useEffect(() => {
  if (chargement?.date_entrer) {
    setValidationDate(new Date(chargement.date_entrer));
  } else {
    setValidationDate(new Date());
  }
}, [chargement]);

  // Fonction pour changer uniquement l'heure et les minutes
  const handleChangeTime = (e) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate = new Date(validationDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setValidationDate(newDate);
  };

  const formatDate = (dateString) =>
    format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr });

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
          Valider le chargement #{chargement.id}
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
          <Typography variant="subtitle2">Four :</Typography>
          <Typography>{chargement.four?.num_four || "N/A"}</Typography>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {chargement.details && chargement.details.length > 0 ? (
              chargement.details.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>{detail.famille?.nom_famille || "N/A"}</TableCell>
                  <TableCell align="right">{detail.quantite}</TableCell>
                </TableRow>
              ))
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
      <Typography sx={{ mb: 1 }}>Heure d’entrée :</Typography>
      <TextField
        type="time"
        value={format(validationDate, "HH:mm")}
        onChange={handleChangeTime}
        fullWidth
      />

      {/* Boutons */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button onClick={onClose} sx={{ mr: 2 }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => onValidate(validationDate)}
        >
          Valider
        </Button>
      </Box>
    </Box>
  );
}
