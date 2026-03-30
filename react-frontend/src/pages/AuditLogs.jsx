import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, Chip, Tooltip, FormControl,
  InputLabel, Select, MenuItem, IconButton, Modal,CircularProgress,
} from "@mui/material";
import axios from "axios";
import SidebarChef from '../components/layout/SidebarChef';
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AuditLogsDetails from './AuditLogsDetails';

export default function AuditLogs() {

  const [audits, setAudits] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedAudit, setSelectedAudit] = useState(null); 
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Charger les types disponibles
  const fetchTypes = async () => {
    try {
    const res = await axios.get("http://localhost:8000/api/audit-types", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTypes(res.data);
  } catch(err) {
    console.error(err);
  }
};

  // Charger les audits filtrés
  const fetchAudits = async (type = "") => {
   try {
    setLoading(true);
    const url = type ? `http://localhost:8000/api/audits?type=${type}` : `http://localhost:8000/api/audits`;
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    setAudits(res.data);
  } catch(err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
  };

  // Charger au démarrage
  useEffect(() => {
    fetchTypes();
    fetchAudits();
  }, []);

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    fetchAudits(value);
  };

  const formatDate = (d) =>
    d ? format(parseISO(d), "dd/MM/yyyy HH:mm:ss", { locale: fr }) : "-";

  const eventColor = (ev) => {
    switch (ev) {
      case "updated": return "success";
      case "deleted": return "error";
      case "created": return "info";
      default: return "default";
    }
  };

  const handleOpenModal = (audit) => {
    setSelectedAudit(audit);
    setOpenModal(true);
  };
  if (loading) {
      return (
        <SidebarChef>
          <Box sx={{ width: "100%", p: 3, textAlign: "center", mt: 5 }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 2 }}>Chargement en cours...</Typography>
          </Box>
        </SidebarChef>
      );
    }
  return (
    <SidebarChef>
      <Box p={3}>
        <Typography variant="h5" mb={2} fontWeight="bold">
          🧾 Historique des actions (Audit Log)
        </Typography>

        {/* Filtre par table */}
        <FormControl sx={{ mb: 2, minWidth: 250 }}>
          <InputLabel>Filtrer par table</InputLabel>
          <Select value={selectedType} label="Filtrer par table" onChange={handleTypeChange}>
            <MenuItem value="">
              <em>Toutes les tables</em>
            </MenuItem>
            {types.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Table</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Valeurs modifiées</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {audits.map(audit => (
                <TableRow key={audit.id}>
                  <TableCell>{audit.auditable_id}</TableCell>
                  <TableCell>{audit.user?.matricule || "Système"}</TableCell>
                  <TableCell>{audit.auditable_type.replace("App\\Models\\", "")}</TableCell>
                  <TableCell>
                    <Chip label={audit.event} color={eventColor(audit.event)} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(audit.created_at)}</TableCell>
                  <TableCell>
                    <Tooltip title="Voir détails">
                      <IconButton
                        sx={{ color: "#3f51b5" }}
                        onClick={() => handleOpenModal(audit)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Modal des détails */}
       {selectedAudit && (
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <AuditLogsDetails
            audit={selectedAudit}      
            onClose={() => setOpenModal(false)} 
            />
        </Modal>
        )}
      </Box>
    </SidebarChef>
  );
}
