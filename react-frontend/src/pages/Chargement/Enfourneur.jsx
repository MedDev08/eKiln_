import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  AppBar,
  Toolbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
  Alert,
  Autocomplete,
  CardContent,
  Card,
  Chip 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/Save";
import ListAltIcon from "@mui/icons-material/ListAlt";

function Enfourneur() {
  const [familles, setFamilles] = useState([]);
  const [fours, setFours] = useState([]);
  const [wagons, setWAgons] = useState([]);
  //const [wagonNum, setWagonNum] = useState("");
  const [selectedFour, setSelectedFour] = useState("");
  const [selectedWagon, setSelectedWagon] = useState("");
  const [quantites, setQuantites] = useState({});
  const [loading, setLoading] = useState(false);
  const [chargements, setChargements] = useState([]);
  const [showRecap, setShowRecap] = useState(false);
  const [recapLoading, setRecapLoading] = useState(false);
  const [selectedChargement, setSelectedChargement] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState(null);
  const [totalPieces, setTotalPieces] = useState(0); // Nouvel état pour le total des pièces
  const [chargementCount, setChargementCount] = useState(0); // Nouvel état pour le nombre de chargements
  const wagonRef = useRef(null);
  const messageRef = useRef(null);
  const [user, setUser] = useState(null);
  const [selectedTypeWagon, setSelectedTypeWagon] = useState("");
  const [typeWagons, setTypeWagons] = useState([]);
  const [typeWagonOpen, setTypeWagonOpen] = useState(false);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [famillesRes, foursRes, wagonsRes, userRes,typeWagonsRes] = await Promise.all([
          axios.get("http://localhost:8000/api/familles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/fours", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/wagons1", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/type_wagons", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFamilles(famillesRes.data);
        setFours(foursRes.data);
        setWAgons(wagonsRes.data.data);
        setUser(userRes.data);
        setTypeWagons(typeWagonsRes.data);
        console.log(typeWagonsRes.data);

        const initialQuantites = {};
        famillesRes.data.forEach(famille => {
          initialQuantites[famille.id_famille] = 0;
        });
        setQuantites(initialQuantites);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Erreur lors du chargement des données initiales");
      }
    };
    fetchInitialData();
  }, []);

  const handleQuantiteChange = (id_famille, value) => {
    setQuantites({
      ...quantites,
      [id_famille]: parseInt(value) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get("http://localhost:8000/api/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = userResponse.data;
      //localStorage.setItem("user", JSON.stringify(user));
      // Vérification spécifique Four 6
        if (!selectedTypeWagon) {
          setError("Veuillez sélectionner un type de wagon");
          setLoading(false);
          return;
        }
        const pieces = [];
        for (const id_famille in quantites) {
            if (quantites[id_famille] > 0) {
                pieces.push({
                    id_famille: parseInt(id_famille),
                    quantite: parseInt(quantites[id_famille])
                });
            }
        }

        if (pieces.length === 0) {
            setError("Veuillez saisir au moins une quantité");
            setLoading(false);
            setTimeout(() => {
                  messageRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 50);
            return;
        }

        const chargementData = {
            id_user: user.id_user,
            //id_wagon: parseInt(wagonNum),
            id_four: parseInt(selectedFour),
            id_wagon: parseInt(selectedWagon),
            pieces: pieces,
            id_typeWagon: selectedTypeWagon ? parseInt(selectedTypeWagon) : null
        };

        await axios.post("http://localhost:8000/api/chargements", chargementData, {
            headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' },
        });
 // Mettre à jour les chargements et compteur
     fetchChargements(false);
    // Afficher le message
    setError({ severity: "success", message: "Chargement enregistré avec succès!" });
    // Scroll vers le message après rendu
    setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    // Mettre le focus sur le champ Wagon
    wagonRef.current?.focus();
     resetForm();
    } catch (error) {
        console.error("Erreur complète:", error);
        if (error.response) {
            const { data } = error.response;
            if (data.statut_wagon) {
                setError(`Ce wagon n'est pas disponible (statut: ${data.statut_wagon})`);
            } else if (data.errors) {
                const messages = Object.values(data.errors).flat().join('\n');
                setError(`Erreur(s) de validation:\n${messages}`);
            } else {
                setError(`Erreur: ${data.message || "Erreur inconnue"}`);
            }
        } else {
            setError("Erreur réseau ou inconnue");
        }
        // Scroll vers le message
        setTimeout(() => {
            messageRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
          } finally {
              setLoading(false);
              wagonRef.current?.focus(); // remettre le focus sur le champ Wagon
          }
      };
//    useEffect(() => {
//   if (selectedTypeWagon === "") {
//     // Ouvre l'Autocomplete Type Wagon automatiquement
//     setTypeWagonOpen(true);
//   } else {
//     setTypeWagonOpen(false);
//   }
// }, [selectedFour, selectedTypeWagon]);

  const resetForm = () => {
    //setWagonNum("");
    setSelectedWagon("");
    setSelectedTypeWagon("");
    //setSelectedFour("");
    const resetQuantites = {};
    familles.forEach(famille => {
      resetQuantites[famille.id_famille] = 0;
    });
    setQuantites(resetQuantites);
  };

  const fetchChargements = async (toggleRecap = false) => {
  setRecapLoading(true);
  setError(null);

  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:8000/api/chargements/mes-chargements",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const chargements = response.data;

    // const totalPieces = chargements.reduce((sum, chargement) => {
    //   return sum + (chargement.details
    //     ? chargement.details.reduce((detSum, detail) => detSum + Number(detail.quantite), 0)
    //     : 0);
    // }, 0);
      const totalPieces = chargements.reduce((sum, chargement) => {
        return sum + (chargement.details ? chargement.details.reduce(
              (detSum, detail) =>
                // ["balaste", "couvercles"].includes(detail.famille?.nom_famille?.toLowerCase())
                  (detail.famille.active === 0)
                  ? detSum 
                  : detSum + Number(detail.quantite),
              0
            )
          : 0);
      }, 0);

    const chargementCount = chargements.length;

    setChargements(chargements);
    setTotalPieces(totalPieces);
    setChargementCount(chargementCount);

    // toggle l'affichage seulement si demandé
    if (toggleRecap) {
      setShowRecap(!showRecap);
    }

  } catch (error) {
    console.error("Erreur lors du chargement des chargements:", error);
    setError("Impossible de charger les chargements");
  } finally {
    setRecapLoading(false);
  }
};
useEffect(() => {
    fetchChargements(); 
  }, []);

  const fetchChargementDetails = async (id) => {
    if (!id) {
      console.error("ID de chargement non fourni");
      setError("Erreur: ID de chargement manquant");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/api/chargements/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedChargement(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      if (error.response) {
        console.error("Réponse d'erreur:", error.response.data);
        setError(`Erreur: ${error.response.data.message || "Erreur serveur"}`);
      } else {
        setError("Erreur réseau ou inconnue");
      }
    }
  };
//  const getTypeColor = (type) => {
//   switch(type) {
//     case 'SP': return '#1976d2';    // bleu
//     case '1/2 SP': return '#9c27b0'; // violet
//     case 'RD': return '#388e3c';    // vert
//     case 'DP': return '#d32f2f';    // rouge
//     default: return 'inherit';       // gris
//   }
// };
  const fourRef = useRef(null);
  const [fourOpen, setFourOpen] = useState(false);

  // Ref pour savoir si le menu a déjà été ouvert une fois
  const hasOpenedFourOnce = useRef(false);

  // Quand le wagon change → focus + ouvrir le menu **une seule fois**
  useEffect(() => {
    if (selectedWagon && fourRef.current && !hasOpenedFourOnce.current) {
      fourRef.current.focus();       // focus visible
      setFourOpen(true);             // ouvre le menu
      hasOpenedFourOnce.current = true; // on ne le refait plus
    }
  }, [selectedWagon]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  const role = user?.role?.toLowerCase();

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Système de Gestion des Fours
          </Typography>
          <Button 
            color="inherit"
            startIcon={<ListAltIcon />}
            onClick={fetchChargements}
            disabled={recapLoading}
          >
            {recapLoading ? "Chargement..." : showRecap ? "Masquer" : "Mes Chargements"}
          </Button>
            {role === "enfourneur" && (
          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />} 
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert 
          ref={messageRef}
            severity={typeof error === 'object' && error.severity ? error.severity : "error"} 
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {typeof error === 'object' && error.message ? error.message : error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {showRecap ? "Mes Chargements" : "Nouveau Chargement de Wagon"}
          </Typography>

          {showRecap ? (
            <>
              {recapLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : chargements.length === 0 ? (
                <Alert severity="info">Aucun chargement enregistré</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table aria-label="chargements table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Wagon</TableCell>
                        <TableCell>Four</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chargements.map((chargement) => (
                        <TableRow key={chargement.id}>
                          <TableCell>{new Date(chargement.datetime_chargement).toLocaleString()}</TableCell>
                          <TableCell>{chargement.wagon?.num_wagon}</TableCell>
                          <TableCell>{chargement.four?.num_four}</TableCell>
                          <TableCell>{chargement.statut}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                if (chargement.id) {
                                  fetchChargementDetails(chargement.id);
                                } else {
                                  console.error("ID de chargement non défini", chargement);
                                  setError("Erreur: ID de chargement manquant");
                                }
                              }}
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
             <Grid container spacing={3}>
                {/* Wagon Autocomplete */}
                <Grid item xs={12} md={6} width="170px">
                  <Autocomplete
                    options={wagons}
                    getOptionLabel={(wagon) => `Wagon : ${wagon.num_wagon}`}
                    value={wagons.find(w => w.id_wagon === selectedWagon) || null}
                    onChange={(event, newValue) => {
                      setSelectedWagon(newValue ? newValue.id_wagon : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Wagon"
                        required
                        margin="normal"
                         inputRef={wagonRef} 
                      />
                    )}
                    sx={{ '& .MuiAutocomplete-input': { width: '240px' } }}
                  />
                </Grid>

                {/* Four Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel id="four-select-label">Four</InputLabel>
                    <Select
                      labelId="four-select-label"
                      id="four-select"
                      value={selectedFour}
                      label="Four"
                      inputRef={fourRef}
                      open={fourOpen}
                      onOpen={() => setFourOpen(true)}
                      onClose={() => setFourOpen(false)}
                      onChange={(e) => {
                         const selected = e.target.value;
                        setSelectedFour(selected);
                        setFourOpen(false); // referme après sélection
                         // Si ce n'est pas le four 6, on réinitialise le type wagon
                        // if (Number(selected) !== 6) {
                        //   setSelectedTypeWagon(null); // ou "" selon ton state
                        // }
                      }}
                      sx={{ '& .MuiSelect-select': { width: '130px' } }}
                    >
                      <MenuItem value="">
                        <em>Sélectionnez un four</em>
                      </MenuItem>
                      {fours.map((four) => (
                        <MenuItem key={four.id_four} value={four.id_four}>
                          {four.num_four} - Cadence: {four.cadence}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              <Grid item xs={12} md={6} width="130px">
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
                    margin="normal"
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
                {/* Paper Fields */}
                <Grid container spacing={3} justifyContent="flex-end" minWidth={"50%"}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        {user?.matricule ?? "N/A"}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        {user?.nom ?? "N/A"} {user?.prenom ?? "N/A"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        {totalPieces}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Les Pièces
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        {chargementCount}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                      Chargements
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                     {chargementCount==0 ? 0 : (totalPieces / chargementCount).toFixed(2)} 
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Densite
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>

              <Typography variant="h6" component="h3" sx={{ mt: 4, mb: 2 }}>
                Détails du chargement
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                  <Table aria-label="details table" size="small">
                    <TableBody>
                      {(() => {
                        const listeSpeciale = [ "Cuvette", "Reservoir","colonne" ,"lavabo","Cache siphon"];

                        // 1 Récupérer les familles spéciales dans l'ordre
                        const special = listeSpeciale
                          .map(name =>
                            familles.find(f => f.nom_famille.toLowerCase() === name.toLowerCase())
                          )
                          .filter(Boolean);

                        // 2 Balaste & Couvercles
                        const balaste = familles.find(f => f.nom_famille === "Balaste");
                        const couvercles = familles.find(f => f.nom_famille === "Couvercles");

                        // 3 Le reste
                        const reste = familles
                          .filter(
                            f =>
                              !listeSpeciale.map(x => x.toLowerCase()).includes(f.nom_famille.toLowerCase()) &&
                              !["Balaste", "Couvercles"].includes(f.nom_famille)
                          )
                          .sort((a, b) => a.nom_famille.localeCompare(b.nom_famille));

                        //  Construire l'ordre final
                        const ordre = [...special, ...reste];

                        // 4 Découper en colonnes
                        const mid = Math.ceil(ordre.length / 2);
                        let col1 = ordre.slice(0, mid);
                        let col2 = ordre.slice(mid);

                        // 5 Ajouter Balaste à gauche, Couvercles à droite
                        if (balaste) col1.push(balaste);
                        if (couvercles) col2.push(couvercles);

                        const maxRows = Math.max(col1.length, col2.length);

                        return Array.from({ length: maxRows }).map((_, rowIndex) => {
                          const famille1 = col1[rowIndex];
                          const famille2 = col2[rowIndex];

                          return (
                            <TableRow key={rowIndex}>
                              {/* Colonne 1 */}
                              <TableCell>{famille1?.nom_famille || ""}</TableCell>
                              <TableCell>
                                {famille1 && (
                                  <TextField
                                    type="text"
                                    variant="outlined"
                                    size="small"
                                    value={
                                      quantites[famille1.id_famille] === 0
                                        ? "0"
                                        : quantites[famille1.id_famille]
                                    }
                                    onFocus={() => {
                                      if ((quantites[famille1.id_famille] || 0) === 0) {
                                        setQuantites(prev => ({
                                          ...prev,
                                          [famille1.id_famille]: ""
                                        }));
                                        setIsEditing(prev => ({
                                          ...prev,
                                          [famille1.id_famille]: true
                                        }));
                                      }
                                    }}
                                    onChange={e => {
                                      const val = e.target.value.replace(/[^0-9]/g, "");
                                      handleQuantiteChange(
                                        famille1.id_famille,
                                        val === "" ? 0 : Number(val)
                                      );
                                    }}
                                    onBlur={e => {
                                      if (e.target.value === "")
                                        handleQuantiteChange(famille1.id_famille, 0);
                                    }}
                                    fullWidth
                                    sx={{
                                      backgroundColor:
                                        famille1.active === 0 
                                          ? "#f8d7da" // rouge clair
                                          : quantites[famille1.id_famille] > 0
                                          ? "#d1f7c4" // vert si rempli
                                          : "inherit"
                                    }}
                                  />
                                )}
                              </TableCell>

                              {/* Colonne 2 */}
                              {famille2 ? (
                                <>
                                  <TableCell>{famille2.nom_famille}</TableCell>
                                  <TableCell>
                                    <TextField
                                      type="text"
                                      variant="outlined"
                                      size="small"
                                      value={
                                        quantites[famille2.id_famille] === 0
                                          ? "0"
                                          : quantites[famille2.id_famille]
                                      }
                                      onFocus={() => {
                                        if ((quantites[famille2.id_famille] || 0) === 0) {
                                          setQuantites(prev => ({
                                            ...prev,
                                            [famille2.id_famille]: ""
                                          }));
                                          setIsEditing(prev => ({
                                            ...prev,
                                            [famille2.id_famille]: true
                                          }));
                                        }
                                      }}
                                      onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        handleQuantiteChange(
                                          famille2.id_famille,
                                          val === "" ? 0 : Number(val)
                                        );
                                      }}
                                      onBlur={e => {
                                        if (e.target.value === "")
                                          handleQuantiteChange(famille2.id_famille, 0);
                                      }}
                                      fullWidth
                                      sx={{
                                        backgroundColor:
                                          famille2.active === 0
                                            ? "#f8d7da"
                                            : quantites[famille2.id_famille] > 0
                                            ? "#d1f7c4"
                                            : "inherit"
                                      }}
                                    />
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                </>
                              )}
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Modal pour les détails */}
      <Dialog 
        open={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Détails du chargement #{selectedChargement?.id}
            </Typography>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={() => setShowDetailsModal(false)} 
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedChargement && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Wagon:</Typography>
                  <Typography variant="body1">{selectedChargement.wagon?.num_wagon}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Four:</Typography>
                  <Typography variant="body1">{selectedChargement.four?.num_four}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Statut:</Typography>
                  <Typography variant="body1">{selectedChargement.statut}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Date chargement:</Typography>
                  <Typography variant="body1">
                    {new Date(selectedChargement.datetime_chargement).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Date sorti estimée:</Typography>
                  <Typography variant="body1">
                    {new Date(selectedChargement.datetime_sortieEstime).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Pièces chargées
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table aria-label="pieces table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Famille</TableCell>
                      <TableCell align="center">Quantité</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedChargement.details?.map((detail) => (
                      <TableRow key={detail.id_detail_chargement}>
                        <TableCell>{detail.famille?.nom_famille || 'Inconnue'}</TableCell>
                        <TableCell align="center">{detail.quantite}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDetailsModal(false)}
            color="primary"
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Enfourneur;