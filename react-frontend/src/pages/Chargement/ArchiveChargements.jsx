import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableHead,
  TableRow, Button, Typography, IconButton, Alert, Modal,Tooltip,Chip, CircularProgress,TablePagination,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import axios from "axios";
import SidebarChef from "../../components/layout/SidebarChef";
import{Visibility as VisibilityIcon }from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import ChargementDetailsModal from "./ChargementDetailsModal";

export default function ArchiveChargements() {
  const [archives, setArchives] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedChargement, setSelectedChargement] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRestore, setLoadingRestore] = useState(false);

  const fetchArchives = async () => {
     try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:8000/api/chargements/archives", {
      headers: { Authorization: `Bearer ${token}` },
          params: {
        page: page + 1,         // backend généralement 1-indexed
        per_page: rowsPerPage,
      }
    });
    setArchives(res.data.archives.data || []);
    console.log("archives:", res.data.archives.data);
    setTotal(res.data.total || 0);
    console.log('total',res.data.total)
    }catch(err){
    console.error("Erreur chargement archives  :", err);
      }finally {
      setLoading(false);
    }
    };

  useEffect(() => {
    fetchArchives();
  }, [page, rowsPerPage]);

  //Fonction RESTORE 
  const restoreChargement = async () => {
    const token = localStorage.getItem("token");
     setLoadingRestore(true);
    try {
      await axios.post(
        `http://localhost:8000/api/chargements/${selectedId}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Chargement restauré avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);

      setArchives(prev => prev.filter(c => c.id !== selectedId));
      fetchArchives();
      setConfirmOpen(false);
    } catch (error) {
      console.error("Erreur restauration :", error);
    }finally {
    setLoadingRestore(false); 
  }
  };
 const formatDate = (dateString) =>
      dateString
        ? format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: fr })
        : "-";
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
   const handleOpenModal = (chargement , mode) => {
    setSelectedChargement({...chargement , mode});
    setOpenModal(true);
  };
  
  //OUVERTURE MODAL 
  const openConfirm = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <Typography variant="h5" fontWeight="bold" mb={3}>
          📁 Archivage des chargements supprimés
        </Typography>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>
        )}

     
        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date chargement</TableCell>
                <TableCell>Wagon</TableCell>
                <TableCell>Type Wagon</TableCell>
                <TableCell>Four</TableCell>
                <TableCell>pièces</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date Entrée</TableCell>
                <TableCell>Date sortie estimée</TableCell>
                <TableCell>Matricule</TableCell>
                <TableCell>Supprimé par</TableCell>
                <TableCell>Supprimé le</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {archives.length > 0 ? (
                archives.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.datetime_chargement)}</TableCell>
                    <TableCell>{row.wagon?.num_wagon}</TableCell>
                    <TableCell>{row.type_wagon?.type_wagon}</TableCell>
                    <TableCell>{row.four?.num_four}</TableCell>
                    <TableCell>{row.details?.reduce((sum, d) => d.famille?.active === 1 ? sum + Number(d.quantite) : sum, 0)}</TableCell>
                    <TableCell><Chip 
                          label={row.statut} 
                          color={getStatusColor(row.statut)}
                          size="small"
                      /></TableCell>
                    <TableCell>{formatDate(row.date_entrer)}</TableCell>
                    <TableCell>{row.date_entrer ?formatDate (row.datetime_sortieEstime) : "-"}</TableCell>
                    <TableCell>{row.user?.matricule || "-"}</TableCell>
                    <TableCell>  {row.deleted_by_user?.matricule || "-"} </TableCell>
                    <TableCell>{formatDate(row.deleted_at)}</TableCell>
                    <TableCell>
                     <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Voir détails">
                          <IconButton  
                          sx={{ cursor: "pointer", color: "#3f51b5" }}
                            onClick={() => handleOpenModal(row ,"editer")}
                          >
                            <VisibilityIcon/>
                            </IconButton>
                        </Tooltip>
                         <Tooltip title="Restaurer le chargement">
                            <IconButton
                              color="success"
                              onClick={() => openConfirm(row.id)}
                            >
                              <RestoreIcon />
                            </IconButton>
                        </Tooltip>
                     </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucun chargement archivé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
         {selectedChargement && (
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <ChargementDetailsModal
              chargement={selectedChargement}
              onClose={() => setOpenModal(false)}
              getStatusColor={getStatusColor}
            />
          </Modal>
        )}

        {/* --- MODAL CONFIRMATION RESTORE --- */}
        <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            p: 4,
            borderRadius: 2,
            width: 350,
            textAlign: "center"
          }}>
            <Typography variant="h6" mb={2}>Confirmer la restauration</Typography>
            <Typography mb={3}>
              Voulez-vous vraiment restaurer ce chargement ?
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
                Annuler
              </Button>

              <Button variant="contained" color="success" onClick={restoreChargement}  disabled={loadingRestore}>
                 {loadingRestore ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Restaurer"
                  )}
              </Button>
            </Box>
          </Box>
        </Modal>

      </Box>
    </SidebarChef>
  );
}
