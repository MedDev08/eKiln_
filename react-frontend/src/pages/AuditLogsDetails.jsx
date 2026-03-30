import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export default function AuditLogsDetailsModal({ audit, onClose }) {
  if (!audit) return null;

  const { old_values, new_values, event, created_at, auditable } = audit;

  const formatDate = (dateString) =>
    dateString ? format(parseISO(dateString), "dd/MM/yyyy HH:mm:ss", { locale: fr }) : "-";

  const eventColor = (event) => {
    switch (event) {
      case "updated": return "success";
      case "deleted": return "error";
      case "created": return "info";
      default: return "default";
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700,
        maxHeight: "80vh",
        overflowY: "auto",
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: 2,
        p: 3
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Détails de l'audit #{audit.id}</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      {/* Informations principales */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1">
          <strong>Table :</strong> {audit.auditable_type.replace("App\\Models\\", "")}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Action :</strong> <Chip label={event} color={eventColor(event)} size="small"/>
        </Typography>
        <Typography variant="subtitle1"><strong>Date :</strong> {formatDate(created_at)}</Typography>

        {/* Relations du modèle audité */}
        <Typography variant="subtitle1">
          <strong>Wagon :</strong> {auditable?.wagon?.num_wagon || "-"}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Four :</strong> {auditable?.four?.num_four || "-"}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Type Wagon :</strong> {auditable?.type_wagon?.type_wagon || "-"}
        </Typography>
      </Paper>

      {/* Comparaison avant / après */}
      {event === "updated" && old_values && new_values ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>Comparaison avant / après</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Champ</TableCell>
                <TableCell>Avant</TableCell>
                <TableCell>Après</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(new_values).map((key) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell
                    style={{
                      textDecoration: old_values[key] !== new_values[key] ? "line-through" : "none",
                      color: old_values[key] !== new_values[key] ? "red" : "inherit",
                      backgroundColor: old_values[key] !== new_values[key] ? "#fff3cd" : "transparent"
                    }}
                  >
                    {old_values[key] ?? "-"}
                  </TableCell>
                  <TableCell
                    style={{
                      color: old_values[key] !== new_values[key] ? "green" : "inherit",
                      backgroundColor: old_values[key] !== new_values[key] ? "#d4edda" : "transparent"
                    }}
                  >
                    {new_values[key] ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Typography>Aucune comparaison nécessaire pour cet audit ({event})</Typography>
        </Paper>
      )}
    </Box>
  );
}
