import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  Card,
  Tooltip,
  CardContent,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  CircularProgress,
  TablePagination,
  Modal
} from "@mui/material";
import{Visibility as VisibilityIcon}from '@mui/icons-material';
import axios from "axios";
import SidebarChef from "../components/layout/SidebarChef";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import BarChartIcon from "@mui/icons-material/BarChart";
import ChargementDetailsModal from "./Chargement/ChargementDetailsModal"; 

const StatCard = ({ title, value, icon }) => {
  return (
    <Card
      sx={{
        height: 130, // taille fixe pour toutes les cartes
        minWidth: 140, // largeur minimale
        borderRadius: 2,
        border: "1px solid rgba(0, 0, 0, 0.05)",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
     <CardContent sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          gap: 0.8, // petit espace entre le texte et l’icône
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 500,
            color: "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "120px", // ajuste la largeur pour le titre
          }}
        >
          {title}
        </Typography>

        {icon && (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "rgba(63,81,181,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3f51b5",
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
       <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#3f51b5", textAlign: "left" }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function Recherche() {
  const [chargements, setChargements] = useState([]);
  const [totaux, setTotaux] = useState({ chargements: 0, pieces: 0 , balastes:0 , densite: 0 , pieces_sans_balaste_couvercle: 0,couvercles:0  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);     
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [total, setTotal] = useState(0);    
  const today = new Date().toISOString().split("T")[0];
  const [selectedChargement, setSelectedChargement] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchParams, setSearchParams] = useState({
    matricule: "",
    date_from: today,
    date_to: "",
    wagon: "",
    four: "",
    shift: "",
  });
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

  const fetchHistorique = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8000/api/chargements/recherche", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...searchParams,   //  tous les filtres (matricule, wagon, four, shift, date_from, date_to)
          page: page + 1,    // pagination
          per_page: rowsPerPage
        }
      });
      console.log("reponse",res);
     setChargements(res.data.data.data || []);   //les chargements sont ici
     setTotal(res.data.data.total || 0);        // ←ou last_page*rowsPerPage si total n'existe pas
     setTotaux(res.data.totaux || { chargements: 0, pieces: 0 , balastes:0 , densite: 0 , pieces_sans_balaste_couvercle: 0 ,couvercles:0 });
      setTotaux(res.data.totaux || { chargements: 0, pieces: 0 , balastes:0 , densite: 0 , pieces_sans_balaste_couvercle: 0,couvercles:0 });
    } catch (err) {
      console.error("Erreur API:", err.response?.data || err.message);
      setChargements([]);
      setTotaux({ chargements: 0, pieces: 0 , balastes:0 , densite: 0 , pieces_sans_balaste_couvercle: 0});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorique();
    const interval = setInterval(fetchHistorique, 60000);
    return () => clearInterval(interval);
  }, [searchParams, page, rowsPerPage]);

  const handleFilter = () => fetchHistorique();

  return (
    <SidebarChef>
      <Box p={3}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          📊 Historique des chargements — Administrateur
        </Typography>

        {/* Indicateurs */}
        <Grid container spacing={2} mb={3}>
          {[
            { title: " chargements ", value: totaux.chargements, icon: <LocalShippingIcon fontSize="small" /> },
            { title: " pièces ", value: totaux.pieces, icon: <ViewModuleIcon fontSize="small" /> },
            { title: "Wagons Balaste", value: totaux.balastes, icon: <ViewModuleIcon fontSize="small" /> },
            { title: "couvercles ", value: totaux.couvercles, icon: <ViewModuleIcon fontSize="small" /> }, 
            { title: "Pièces sans B/C", value: totaux.pieces_sans_balaste_couvercle, icon: <ViewModuleIcon fontSize="small" /> },
            { title: "Densité ", value: totaux.densite, icon: <BarChartIcon fontSize="small" /> },
          ].map(
            (stat, i) => (
           <Grid item xs={12} sm={6} key={i}>
              <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
            </Grid>
          ))}
        </Grid>

        {/* Filtres */}
<Paper sx={{ p: 2, mb: 3 }}>
  <Grid container spacing={1} alignItems="center">
    <Grid item>
      <TextField
        size="small"
        label="Matricule"
        value={searchParams.matricule}
        onChange={e => setSearchParams({ ...searchParams, matricule: e.target.value })}
        sx={{ width: 120 }}
      />
    </Grid>
    <Grid item>
      <TextField
        size="small"
        label="Wagon"
        value={searchParams.wagon || ""}
        onChange={e => setSearchParams({ ...searchParams, wagon: e.target.value })}
        sx={{ width: 100 }}
      />
    </Grid>
    <Grid item>
      <TextField
        size="small"
        label="Four"
        value={searchParams.four || ""}
        onChange={e => setSearchParams({ ...searchParams, four: e.target.value })}
        sx={{ width: 100 }}
      />
    </Grid>
    <Grid item>
      <TextField
        size="small"
        type="number"
        label="Shift"
        InputProps={{ inputProps: { min: 1, max: 3 } }}
        value={searchParams.shift || ""}
        onChange={e => setSearchParams({ ...searchParams, shift: e.target.value })}
        sx={{ width: 70 }}
      />
    </Grid>
    <Grid item>
      <TextField
        size="small"
        type="date"
        label="Date début"
        InputLabelProps={{ shrink: true }}
        value={searchParams.date_from}
        onChange={e => setSearchParams({ ...searchParams, date_from: e.target.value })}
        sx={{ width: 145 }}
      />
    </Grid>
    <Grid item>
      <TextField
        size="small"
        type="date"
        label="Date fin"
        InputLabelProps={{ shrink: true }}
        value={searchParams.date_to}
        onChange={e => setSearchParams({ ...searchParams, date_to: e.target.value })}
        sx={{ width: 145 }}
      />
    </Grid>
    <Grid item>
      <Button variant="contained" onClick={handleFilter} sx={{ height: 40 }}>Filtrer</Button>
    </Grid>
  </Grid>
</Paper>
        {/* Tableau */}
        <Paper sx={{ p: 2 }}>
         {loading ? (
  <Box sx={{ textAlign: "center", py: 3 }}>
    <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date chargement</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Wagon</TableCell>
                    <TableCell>Four</TableCell>
                    <TableCell>pièces</TableCell>
                    <TableCell>Date Entrée</TableCell>
                    <TableCell>Date sortie estimée</TableCell>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chargements.length > 0 ? (
                    chargements.map((row) => (
                      <TableRow key={row.id}>
                         <TableCell>{row.datetime_chargement}</TableCell>
                         <TableCell>{row.shift|| "-"}</TableCell>
                        <TableCell>{row.wagon?.num_wagon || "-"}</TableCell>
                        <TableCell>{row.four?.num_four || "-"}</TableCell>
                        <TableCell>{row.details?.reduce((sum, d) => sum + d.quantite, 0) || 0}</TableCell>
                        <TableCell>{row.date_entrer || "-"}</TableCell>
                         <TableCell>{row.date_entrer ? (row.datetime_sortieEstime || "-") : "-"}</TableCell>
                        <TableCell>{row.user?.matricule || "-"}</TableCell>
                        <TableCell>
                          <Tooltip title="Voir détails">
                            <VisibilityIcon  
                             sx={{ cursor: "pointer", color: "#3f51b5" }}
                              onClick={() => handleOpenModal(row ,"editer")}
                            />
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Aucun résultat</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/*  TablePagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={total}                  // total de lignes côté backend
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);  // revenir à la première page
                }}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              />
            </>
          )}
        </Paper>
      </Box>
    {selectedChargement && (
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <ChargementDetailsModal
              chargement={selectedChargement}
              onClose={() => setOpenModal(false)}
              getStatusColor={getStatusColor}
            />
          </Modal>
        )}
    </SidebarChef>
  );
}
