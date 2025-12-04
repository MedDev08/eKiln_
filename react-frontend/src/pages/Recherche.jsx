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
  Modal,
  Chip,
  IconButton,
  Alert
} from "@mui/material";
import{Visibility as VisibilityIcon ,
Edit as EditIcon ,
}from '@mui/icons-material';
import axios from "axios";
import SidebarChef from "../components/layout/SidebarChef";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import BarChartIcon from "@mui/icons-material/BarChart";
import FlagIcon from "@mui/icons-material/Flag";
import { Circle } from '@mui/icons-material'; 
import ChargementDetailsModal from "./Chargement/ChargementDetailsModal"; 
import ModificationChargement from "./ModificationChargement";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";


const StatCard = ({ title, value, icon, subtitle  }) => {
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          gap: 0.8, // petit espace entre le texte et l’icône
        }}
      >
       <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#3f51b5", textAlign: "left" }}
        >
          {value}
        </Typography>
         {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, textAlign: "left" }}
          >
            / {subtitle}
          </Typography>
        )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default function Recherche() {
  const [chargements, setChargements] = useState([]);
  const [totaux, setTotaux] = useState({ 
    chargements: 0,
    pieces: 0 ,
    wagons_avec_balaste:0 ,
    densite: 0 ,
    pieces_sans_balaste_couvercle: 0,
    couvercles:0 ,
    balastes:0,
    densite_finale:0 
  });
  const [density,setDensity]= useState([]);
  // const [densityFamilles,setDensityFamilles]= useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);     
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [total, setTotal] = useState(0);    
  const today = new Date().toISOString().split("T")[0];
  const [selectedChargement, setSelectedChargement] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [familles, setFamilles] = useState([]);
  const [fours, setFours] = useState([]);
  const [wagons, setWagons] = useState([]);
  const [users, setUsers] = useState([]);
  const [editSuccess, setEditSuccess] = useState(false);
  const [type_wagon, settype_wagon] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chargementToDelete, setChargementToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  // const [anneaux, setAnneaux] = useState([]);

  const [searchParams, setSearchParams] = useState({
    matricule: "",
    date_from: today,
    date_to: "",
    wagon: "",
    four: "",
    shift: "",
    statut:"",
    type_wagon:"",
  });
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
      console.log("reponse",res.data.data.data);
      console.log("Totaux :", res.data.totaux);
      console.log("Densité par four :", res.data.densite_par_four);
    //  setChargements(res.data.data.data || []);   //les chargements sont ici
      const wagons = res.data.data.data || [];
      const wagonsWithDetails = wagons.map(wagon => {
      const containsBalsate = wagon.details?.some(
        d => d.famille?.nom_famille?.toLowerCase() === "balaste"
      );
      return { ...wagon, containsBalsate };
    });

    setChargements(wagonsWithDetails);
    setDensity(res.data.densite_par_four);
    setTotal(res.data.data.total || 0);        // ou last_page*rowsPerPage si total n'existe pas
    setTotaux(res.data.totaux || { chargements: 0,
       pieces: 0 ,
       wagons_avec_balaste:0 ,
       densite: 0 ,
       pieces_sans_balaste_couvercle: 0 ,
      couvercles:0,
      balastes:0 ,
      densite_finale:0
    });
    setTotaux(res.data.totaux || { chargements: 0,
        pieces: 0 ,
        wagons_avec_balaste:0 ,
        densite: 0 ,
        pieces_sans_balaste_couvercle: 0,
        couvercles:0 ,
        balastes:0 ,
        densite_finale:0
        });
    } catch (err) {
      console.error("Erreur API:", err.response?.data || err.message);
    setChargements([]);
    setTotaux({ chargements: 0,
        pieces: 0 ,
        wagons_avec_balaste:0 ,
        densite: 0 ,
        pieces_sans_balaste_couvercle: 0 ,
        couvercles:0,
        balastes:0,
        densite_finale:0
        });
    } finally {
      setLoading(false);
    }
  };
  // const fetchAnneaux = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const res = await axios.get("http://localhost:8000/api/all-chargement-ids", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setAnneaux(res.data.ids); // stocke tous les IDs de chargement
  //     console.log("id_chargemet",res.data.ids);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  useEffect(() => {
    fetchHistorique();
    // fetchAnneaux();
    // const interval = setInterval(fetchHistorique, 60000);
    // return () => clearInterval(interval);
  }, [searchParams, page, rowsPerPage]);
    const handleDeleteClick = (chargement) => {
      setChargementToDelete(chargement);
      setDeleteDialogOpen(true);
    };
    const confirmDelete = async () => {
      try {
        const token = localStorage.getItem("token");

        await axios.delete(
          `http://localhost:8000/api/chargements/${chargementToDelete.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // enlever l’élément du tableau après suppression
        setChargements(prev =>
          prev.filter((c) => c.id !== chargementToDelete.id)
        );

        setDeleteDialogOpen(false);
        setChargementToDelete(null);
        setDeleteSuccess("Le chargement a été supprimé avec succès.");
        setTimeout(() => setDeleteSuccess(""), 3000);

      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    };
  const boxStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, fontSize: 20 };

  const handleFilter = () => {
    fetchHistorique();
    // fetchAnneaux();
  };

  return (
    <SidebarChef>
      <Box p={3}>
        <Typography variant="h5" fontWeight="bold" mb={3}>        
          📊 Historique des chargements — Administrateur
        </Typography>

        {/* Indicateurs */}
        <Grid container spacing={2} mb={3}>
          {[
            { title: " pièces ", value: totaux.pieces, icon: <ViewModuleIcon fontSize="small" /> },
            { title: "Wagons Balaste",
               value: totaux.wagons_avec_balaste ,
               icon: <FlagIcon fontSize="small" />,
               subtitle: `${totaux.balastes}`,
             },
            { title: "couvercles ", value: totaux.couvercles, icon: <ViewModuleIcon fontSize="small" /> }, 
            { title: "Pièces sans B/C", value: totaux.pieces_sans_balaste_couvercle, icon: <ViewModuleIcon fontSize="small" /> },
            { title: " chargements ", value: totaux.chargements, icon: <LocalShippingIcon fontSize="small" /> },
            { title: "Densité ", value: totaux.densite, icon: <BarChartIcon fontSize="small" /> },
              // Spread the dynamically generated items
            ...density.map((four) => ({ title: `Four ${four.num_four}`, value: four.densite_finale, icon: <BarChartIcon fontSize="small" /> }
            ))
          ].map(
            (stat, i) => (
           <Grid item xs={12} sm={6} key={i}>
              <StatCard title={stat.title} value={stat.value} icon={stat.icon}  subtitle={stat.subtitle}  />
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
        sx={{ width: 80 }}
      />
    </Grid>
    <Grid item>
      <TextField
        size="small"
        label="Four"
        value={searchParams.four || ""}
        onChange={e => setSearchParams({ ...searchParams, four: e.target.value })}
        sx={{ width: 80 }}
      />
    </Grid>
    <Grid item>
      <TextField
        size="small"
        label="Type Wagon"
        value={searchParams.type_wagon || ""}
        onChange={e => setSearchParams({ ...searchParams, type_wagon: e.target.value })}
        sx={{ width: 100 }}
      />
    </Grid>
     <Grid item>
      <TextField
        size="small"
        label="statut "
        value={searchParams.statut || ""}
        onChange={e => setSearchParams({ ...searchParams, statut: e.target.value })}
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
      <Button variant="contained" onClick={handleFilter} sx={{ height: 40 , mr:1 }}>Filtrer</Button>
       <Button variant="outlined" color="primary" onClick={fetchHistorique} sx={{ height: 40 }}>
          Actualiser
        </Button>
    </Grid>
  </Grid>
</Paper>
        {/* Tableau */}
         {editSuccess && (
                  <Box sx={{ mb: 2 }}>
                    <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                      {editSuccess}
                    </Alert>
                  </Box>
                )}
          {deleteSuccess && (
                  <Box sx={{ mb: 2 }}>
                    <Alert
                      severity="success"
                      variant="filled"
                      sx={{ borderRadius: 2 }}
                    >
                      {deleteSuccess}
                    </Alert>
                  </Box>
                )}
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
                    <TableCell>    </TableCell>
                    <TableCell>Date chargement</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Wagon</TableCell>
                    <TableCell>Type Wagon</TableCell>
                    <TableCell>Four</TableCell>
                    <TableCell>pièces</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date Entrée</TableCell>
                    <TableCell>Date sortie estimée</TableCell>
                    <TableCell>densité</TableCell>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chargements.length > 0 ? (
                    chargements.map((row) => (
                      <TableRow key={row.id}>
                       <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                           {row.anneaux && ( 
                            <Box sx={{ ...boxStyle, color: "gold" }}>
                              <Circle fontSize="small" />
                            </Box>
                          )}
                          {row.containsBalsate && (
                            <Box sx={{ ...boxStyle, color: "red" }}>
                              <FlagIcon fontSize="small" />
                            </Box>
                          )}
                        </Box>
                        </TableCell>
                        <TableCell>{formatDate(row.datetime_chargement)}</TableCell>
                         <TableCell>{row.shift|| "-"}</TableCell>
                        <TableCell>{row.wagon?.num_wagon || "-"}</TableCell>
                        <TableCell><Chip label={row.type_wagon?.type_wagon || 'N/A'} 
                           sx={{backgroundColor: row.type_wagon?.color || '#ccc',
                              color: '#fff', 
                              fontWeight: 'bold'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{row.four?.num_four || "-"}</TableCell>
                        <TableCell>{row.details?.reduce((sum, d) => sum + d.quantite, 0) || 0}</TableCell>
                        <TableCell><Chip 
                          label={row.statut} 
                          color={getStatusColor(row.statut)}
                          size="small"
                        /></TableCell>
                        <TableCell>{formatDate(row.date_entrer)}</TableCell>
                         <TableCell>{row.date_entrer ?formatDate (row.datetime_sortieEstime) : "-"}</TableCell>
                         <TableCell>{density.length > 0
                          ? (() => {
                              const densiteFour = density.find(f => f.id_four === row.id_four);
                              const detailChargement = densiteFour.details.find(d => d.id_chargement === row.id);
                              return detailChargement ? detailChargement.density_chargement : "-";
                            })()
                          : "-"}
                        </TableCell>
                        <TableCell>{row.user?.matricule || "-"}</TableCell>
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
                             <Tooltip title="Modifier">
                                <IconButton color="secondary" 
                                  size="small"
                                  onClick={() => {
                                  setSelectedChargement(row);
                                  setOpenEditModal(true);
                                }}>
                                <EditIcon />
                              </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(row)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          </Box>
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
       <ModificationChargement
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          selectedChargement={selectedChargement}
          familles={familles}       
          fours={fours}            
          wagons={wagons} 
          type_wagon={type_wagon}        
          users={users}  
          // densityFamilles={densityFamilles}          
          // onUpdate={(updated) => {
          //   setChargements(prev =>
          //     prev.map(c => (c.id === updated.id ? updated : c))
          //   );
          // }}
          onUpdate={(updated) => {
            // recalculer automatiquement si le wagon contient "balaste"
            const containsBalsate = updated.details?.some(
              d => d.famille?.nom_famille?.toLowerCase() === "balaste"
            );
            // mettre à jour le tableau avec la nouvelle valeur
            setChargements(prev =>
              prev.map(c =>
                c.id === updated.id ? { ...updated, containsBalsate } : c
              )
            );
          }}
          onSuccessMessage={(msg) => {
          setEditSuccess(msg);
          setTimeout(() => setEditSuccess(false), 3000);
        }}
        />
        <Modal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              p: 4,
              borderRadius: 3,
              width: 380,
              textAlign: "center",
              boxShadow: 24,
            }}
          >
            {/* Icône du point d'exclamation */}
            <Box 
              sx={{
                bgcolor: "#fdecea",
                width: 70,
                height: 70,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 45, color: "#d32f2f" }} />
            </Box>

            <Typography variant="h6" fontWeight="bold" mb={1}>
              Confirmer la suppression
            </Typography>

            <Typography color="text.secondary" mb={3}>
              Voulez-vous vraiment supprimer ce chargement ?
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setDeleteDialogOpen(false)}
                sx={{ width: "45%" }}
              >
                Annuler
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={confirmDelete}
                sx={{ width: "45%" }}
              >
                Supprimer
              </Button>
            </Box>
          </Box>
        </Modal>
  </SidebarChef>
  );
}
