import * as React from 'react';
// import { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import Alert from '@mui/material/Alert';
// import Divider from '@mui/material/Divider';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';
// import Button from '@mui/material/Button';
// import Grid from '@mui/material/Grid';
// import IconButton from '@mui/material/IconButton';
// import TextField from '@mui/material/TextField';
// import Modal from '@mui/material/Modal';
// import SaveIcon from '@mui/icons-material/Save';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import Select from '@mui/material/Select';
// import MenuItem from '@mui/material/MenuItem';
// import ListAltIcon from '@mui/icons-material/ListAlt';
// import CloseIcon from '@mui/icons-material/Close';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import CircularProgress from '@mui/material/CircularProgress';
// import {Autocomplete} from "@mui/material";
import SidebarChef from '../components/layout/SidebarChef';
import Enfourneur from './Chargement/Enfourneur';
// Ajoutez ce composant avant le composant ChefDashboard
// const ChargementContent = () => {
//   const [familles, setFamilles] = useState([]);
//   const [fours, setFours] = useState([]);
//   const [wagons, setWagons] = useState([]);
//   //const [wagonNum, setWagonNum] = useState("");
//   const [selectedFour, setSelectedFour] = useState("");
//   const [selectedWagon, setSelectedWagon] = useState("");
//   const [quantites, setQuantites] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [chargements, setChargements] = useState([]);
//   const [showRecap, setShowRecap] = useState(false);
//   const [recapLoading, setRecapLoading] = useState(false);
//   const [selectedChargement, setSelectedChargement] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [error, setError] = useState(null);
//   const [totalPieces, setTotalPieces] = useState(0); // Nouvel état pour le total des pièces
//   const [chargementCount, setChargementCount] = useState(0); // Nouvel état pour le nombre de chargements
//   const wagonRef = useRef(null);
//   const messageRef = useRef(null);
//   const [user,setUser]=useState(null);

//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const [famillesRes, foursRes, wagonsRes, userRes] = await Promise.all([
//           axios.get("http://localhost:8000/api/familles", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:8000/api/fours", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:8000/api/wagons1", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:8000/api/me", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         setFamilles(famillesRes.data);
//         setFours(foursRes.data);
//         setWagons(wagonsRes.data.data);
//         setUser(userRes.data);

//         const initialQuantites = {};
//         famillesRes.data.forEach(famille => {
//           initialQuantites[famille.id_famille] = 0;
//         });
//         setQuantites(initialQuantites);
//       } catch (error) {
//         console.error("Erreur lors du chargement des données:", error);
//         setError("Erreur lors du chargement des données initiales");
//       }
//     };
//     fetchInitialData();
//   }, []);

//   const handleQuantiteChange = (id_famille, value) => {
//     setQuantites({
//       ...quantites,
//       [id_famille]: parseInt(value) || 0
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem("token");
//       const userResponse = await axios.get("http://localhost:8000/api/me", {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const user = userResponse.data;

//       const pieces = [];
//       for (const id_famille in quantites) {
//         if (quantites[id_famille] > 0) {
//           pieces.push({
//             id_famille: parseInt(id_famille),
//             quantite: parseInt(quantites[id_famille])
//           });
//         }
//       }

//       if (pieces.length === 0) {
//         setError("Veuillez saisir au moins une quantité");
//         setLoading(false);
//         return;
//       }

//       const chargementData = {
//         id_user: user.id_user,
//         //id_wagon: parseInt(wagonNum),
//         id_wagon: parseInt(selectedWagon),
//         id_four: parseInt(selectedFour),
//         pieces: pieces
//       };

//       await axios.post("http://localhost:8000/api/chargements", chargementData, {
//         headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' },
//       });
//       // Mettre à jour les chargements et compteur
//       fetchChargements(false);
//       setError({ severity: "success", message: "Chargement enregistré avec succès!" });
//        // Scroll vers le message après rendu
//       setTimeout(() => {
//       messageRef.current?.scrollIntoView({ behavior: "smooth" });
//          }, 50);

//     // Mettre le focus sur le champ Wagon
//     wagonRef.current?.focus();
//       resetForm();
//     } catch (error) {
//       console.error("Erreur complète:", error);
//       if (error.response) {
//         const { data } = error.response;
//         if (data.errors) {
//           const messages = Object.values(data.errors).flat().join('\n');
//           setError(`Erreur(s) de validation:\n${messages}`);
//         } else {
//           setError(`Erreur: ${data.message || "Erreur inconnue"}`);
//         }
//       } else {
//         setError("Erreur réseau ou inconnue");
//       }
//     //Scroll vers le message
//    setTimeout(() => {
//     messageRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 50);
//     } finally {
//       setLoading(false);
//         wagonRef.current?.focus();
//     }
//   };

//   const resetForm = () => {
//     //setWagonNum("");
//     //setSelectedFour("");
//     setSelectedWagon("");
//     const resetQuantites = {};
//     familles.forEach(famille => {
//       resetQuantites[famille.id_famille] = 0;
//     });
//     setQuantites(resetQuantites);
//   };

//   const fetchWagonDetails = async (id) => {
//   try {
//     const token = localStorage.getItem('token');
//     const response = await axios.get(
//       `http://localhost:8000/api/chargements/${id}/popup-details`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
    
//     if (response.data.success) {
//       setSelectedWagonDetails(response.data.data);
//       setShowWagonDetailsModal(true);
//     }
//   } catch (error) {
//     console.error("Erreur:", error);
//   }
// };

//   const fetchChargements = async (toggleRecap = false) => {
//   setRecapLoading(true);
//   setError(null);

//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(
//       "http://localhost:8000/api/chargements/mes-chargements",
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     const chargements = response.data;

//     const totalPieces = chargements.reduce((sum, chargement) => {
//       return sum + (chargement.details
//         ? chargement.details.reduce((detSum, detail) => detSum + Number(detail.quantite), 0)
//         : 0);
//     }, 0);

//     const chargementCount = chargements.length;

//     setChargements(chargements);
//     setTotalPieces(totalPieces);
//     setChargementCount(chargementCount);

//     // toggle l'affichage seulement si demandé
//     if (toggleRecap) {
//       setShowRecap(!showRecap);
//     }

//   } catch (error) {
//     console.error("Erreur lors du chargement des chargements:", error);
//     setError("Impossible de charger les chargements");
//   } finally {
//     setRecapLoading(false);
//   }
// };
// useEffect(() => {
//     fetchChargements(); 
//   }, []);
//   const fetchChargementDetails = async (id) => {
//     if (!id) {
//       console.error("ID de chargement non fourni");
//       setError("Erreur: ID de chargement manquant");
//       return;
//     }
  
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `http://localhost:8000/api/chargements/${id}/details`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setSelectedChargement(response.data);
//       setShowDetailsModal(true);
//     } catch (error) {
//       console.error("Erreur lors du chargement des détails:", error);
//       if (error.response) {
//         console.error("Réponse d'erreur:", error.response.data);
//         setError(`Erreur: ${error.response.data.message || "Erreur serveur"}`);
//       } else {
//         setError("Erreur réseau ou inconnue");
//       }
//     }
//   };
//   const fourRef = useRef(null);
//   const [fourOpen, setFourOpen] = useState(false);

//   // Ref pour savoir si le menu a déjà été ouvert une fois
//   const hasOpenedFourOnce = useRef(false);

//   // Quand le wagon change → focus + ouvrir le menu **une seule fois**
//   useEffect(() => {
//     if (selectedWagon && fourRef.current && !hasOpenedFourOnce.current) {
//       fourRef.current.focus();       // focus visible
//       setFourOpen(true);             // ouvre le menu
//       hasOpenedFourOnce.current = true; // on ne le refait plus
//     }
//   }, [selectedWagon]);

//   return (
//    <SidebarChef>
//     <Box sx={{ p: 3 }}>
//       {error && (
//         <Alert 
//           severity={typeof error === 'object' && error.severity ? error.severity : "error"} 
//           sx={{ mb: 2 }}
//           onClose={() => setError(null)}
//         >
//           {typeof error === 'object' && error.message ? error.message : error}
//         </Alert>
//       )}

//       <Paper sx={{ p: 3, mb: 3 }}>
//         <Typography variant="h5" component="h2" gutterBottom>
//           {showRecap ? "Chargements Récents" : "Nouveau Chargement de Wagon"}
//         </Typography>

//         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
//           <Button 
//             variant="contained"
//             startIcon={<ListAltIcon />}
//             onClick={fetchChargements}
//             disabled={recapLoading}
//           >
//             {recapLoading ? "Chargement..." : showRecap ? "Nouveau Chargement" : "Voir les Chargements"}
//           </Button>
//         </Box>

//         {showRecap ? (
//           <>
//             {recapLoading ? (
//               <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//                 <CircularProgress />
//               </Box>
//             ) : chargements.length === 0 ? (
//               <Alert severity="info">Aucun chargement récent</Alert>
//             ) : (
//               <TableContainer component={Paper} variant="outlined">
//                 <Table aria-label="chargements table">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Date</TableCell>
//                       <TableCell>Wagon</TableCell>
//                       <TableCell>Four</TableCell>
//                       <TableCell>           </TableCell>
//                       <TableCell>Statut</TableCell>
//                       <TableCell align="center">Actions</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {chargements.map((chargement) => (
//                       <TableRow key={chargement.id}>
//                         <TableCell>{new Date(chargement.datetime_chargement).toLocaleString()}</TableCell>
//                         <TableCell>{chargement.wagon?.num_wagon}</TableCell>
//                         <TableCell>{chargement.four?.num_four}</TableCell>
//                         <TableCell>{chargement.user?.nom.toUpperCase()} {chargement.user?.prenom.toUpperCase()}</TableCell>
//                         <TableCell>{chargement.statut}</TableCell>
//                         <TableCell align="center">
//                           <IconButton
//                             color="primary"
//                             onClick={() => {
//                               if (chargement.id) {
//                                 fetchChargementDetails(chargement.id);
//                               } else {
//                                 console.error("ID de chargement non défini", chargement);
//                                 setError("Erreur: ID de chargement manquant");
//                               }
//                             }}
//                             size="small"
//                           >
//                             <VisibilityIcon />
//                           </IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             )}
//           </>
//         ) : (
//           <Box component="form" onSubmit={handleSubmit} noValidate>
//               <Grid container spacing={3}>
//                            {/* Wagon Autocomplete */}
//                            <Grid item xs={12} md={6} width="180px">
//                              <Autocomplete
//                                options={wagons}
//                                getOptionLabel={(wagon) => `Wagon : ${wagon.num_wagon}`}
//                                value={wagons.find(w => w.id_wagon === selectedWagon) || null}
//                                onChange={(event, newValue) => {
//                                  setSelectedWagon(newValue ? newValue.id_wagon : '');
//                                }}
//                                renderInput={(params) => (
//                                  <TextField
//                                    {...params}
//                                    label="Wagon"
//                                    required
//                                    margin="normal"
//                                    inputRef={wagonRef} // <- ici la vraie ref sur l'input moi 
//                                  />
//                                )}
//                                sx={{ '& .MuiAutocomplete-input': { width: '240px' } }}
//                              />
//                            </Grid>
           
//                            {/* Four Select */}
//                            <Grid item xs={12} md={6}>
//                              <FormControl fullWidth margin="normal" required>
//                                <InputLabel id="four-select-label">Four</InputLabel>
//                                <Select
//                                  labelId="four-select-label"
//                                  id="four-select"
//                                  value={selectedFour}
//                                  label="Four"
//                                  inputRef={fourRef}
//                                  open={fourOpen}
//                                  onOpen={() => setFourOpen(true)}
//                                  onClose={() => setFourOpen(false)}
//                                  onChange={(e) => {
//                                    setSelectedFour(e.target.value);
//                                    setFourOpen(false); // referme après sélection
//                                  }}
//                                  sx={{ '& .MuiSelect-select': { width: '140px' } }}
//                                >
//                                  <MenuItem value="">
//                                    <em>Sélectionnez un four</em>
//                                  </MenuItem>
//                                  {fours.map((four) => (
//                                    <MenuItem key={four.id_four} value={four.id_four}>
//                                      {four.num_four} - Cadence: {four.cadence}
//                                    </MenuItem>
//                                  ))}
//                                </Select>
//                              </FormControl>
//                            </Grid>
           
//                            {/* Paper Fields */}
//                            <Grid container spacing={3} justifyContent="flex-end" minWidth={"50%"}>
//                              <Grid item xs={12} md={4}>
//                                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                  <Typography variant="h6" gutterBottom>
//                                     {user?.matricule.toUpperCase() ?? "N/A"}
//                                   </Typography>
            
//                                   <Typography variant="subtitle2" color="text.secondary">
//                                     {user?.nom.toUpperCase() ?? "N/A"} {user?.prenom.toUpperCase() ?? "N/A"}
//                                   </Typography>
//                                </Paper> 
//                              </Grid>
           
//                              <Grid item xs={12} md={4}>
//                                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                  <Typography variant="h6" gutterBottom>
//                                    {totalPieces}
//                                  </Typography>
//                                  <Typography variant="subtitle2" color="text.secondary">
//                                    Pièces
//                                  </Typography>
//                                </Paper>
//                              </Grid>
           
//                              <Grid item xs={12} md={4}>
//                                <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                  <Typography variant="h6" gutterBottom>
//                                    {chargementCount}
//                                  </Typography>
//                                  <Typography variant="subtitle2" color="text.secondary">
//                                   Chargements
//                                  </Typography>
//                                </Paper>
//                              </Grid>

//                              <Grid item xs={12} md={4}>
//                                 <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                   <Typography variant="h6" gutterBottom>
//                                 {chargementCount==0 ? 0 : (totalPieces / chargementCount).toFixed(2)} 
//                                   </Typography>
//                                   <Typography variant="subtitle2" color="text.secondary">
//                                     Densite
//                                   </Typography>
//                                 </Paper>
//                               </Grid>
//                            </Grid>
//                          </Grid>

//             <Typography variant="h6" component="h3" sx={{ mt: 4, mb: 2 }}>
//               Détails du chargement
//             </Typography>
            
//             <TableContainer component={Paper} variant="outlined">
//               <Table aria-label="details table" size="small">
//                 <TableBody>
//                   {(() => {
//                     const listeSpeciale = [ "Cuvette", "Reservoir","colonne" ,"lavabo","Cache siphon"];

//                     // 1 Récupérer les familles spéciales dans l'ordre
//                     const special = listeSpeciale
//                       .map(name =>
//                         familles.find(f => f.nom_famille.toLowerCase() === name.toLowerCase())
//                       )
//                       .filter(Boolean);

//                     // 2 Balaste & Couvercles
//                     const balaste = familles.find(f => f.nom_famille === "Balaste");
//                     const couvercles = familles.find(f => f.nom_famille === "Couvercles");

//                     // 3 Le reste
//                     const reste = familles
//                       .filter(
//                         f =>
//                           !listeSpeciale.map(x => x.toLowerCase()).includes(f.nom_famille.toLowerCase()) &&
//                           !["Balaste", "Couvercles"].includes(f.nom_famille)
//                       )
//                       .sort((a, b) => a.nom_famille.localeCompare(b.nom_famille));

//                     //  Construire l'ordre final
//                     const ordre = [...special, ...reste];

//                     // 4 Découper en colonnes
//                     const mid = Math.ceil(ordre.length / 2);
//                     let col1 = ordre.slice(0, mid);
//                     let col2 = ordre.slice(mid);

//                     // 5 Ajouter Balaste à gauche, Couvercles à droite
//                     if (balaste) col1.push(balaste);
//                     if (couvercles) col2.push(couvercles);

//                     const maxRows = Math.max(col1.length, col2.length);

//                     return Array.from({ length: maxRows }).map((_, rowIndex) => {
//                       const famille1 = col1[rowIndex];
//                       const famille2 = col2[rowIndex];

//                       return (
//                         <TableRow key={rowIndex}>
//                           {/* Colonne 1 */}
//                           <TableCell>{famille1?.nom_famille || ""}</TableCell>
//                           <TableCell>
//                             {famille1 && (
//                               <TextField
//                                 type="text"
//                                 variant="outlined"
//                                 size="small"
//                                 value={
//                                   quantites[famille1.id_famille] === 0
//                                     ? "0"
//                                     : quantites[famille1.id_famille]
//                                 }
//                                 onFocus={() => {
//                                   if ((quantites[famille1.id_famille] || 0) === 0) {
//                                     setQuantites(prev => ({
//                                       ...prev,
//                                       [famille1.id_famille]: ""
//                                     }));
//                                     setIsEditing(prev => ({
//                                       ...prev,
//                                       [famille1.id_famille]: true
//                                     }));
//                                   }
//                                 }}
//                                 onChange={e => {
//                                   const val = e.target.value.replace(/[^0-9]/g, "");
//                                   handleQuantiteChange(
//                                     famille1.id_famille,
//                                     val === "" ? 0 : Number(val)
//                                   );
//                                 }}
//                                 onBlur={e => {
//                                   if (e.target.value === "")
//                                     handleQuantiteChange(famille1.id_famille, 0);
//                                 }}
//                                 fullWidth
//                                 sx={{
//                                   backgroundColor:
//                                     famille1.nom_famille === "Balaste" ||
//                                     famille1.nom_famille === "Couvercles"
//                                       ? "#f8d7da" // rouge clair
//                                       : quantites[famille1.id_famille] > 0
//                                       ? "#d1f7c4" // vert si rempli
//                                       : "inherit"
//                                 }}
//                               />
//                             )}
//                           </TableCell>

//                           {/* Colonne 2 */}
//                           {famille2 ? (
//                             <>
//                               <TableCell>{famille2.nom_famille}</TableCell>
//                               <TableCell>
//                                 <TextField
//                                   type="text"
//                                   variant="outlined"
//                                   size="small"
//                                   value={
//                                     quantites[famille2.id_famille] === 0
//                                       ? "0"
//                                       : quantites[famille2.id_famille]
//                                   }
//                                   onFocus={() => {
//                                     if ((quantites[famille2.id_famille] || 0) === 0) {
//                                       setQuantites(prev => ({
//                                         ...prev,
//                                         [famille2.id_famille]: ""
//                                       }));
//                                       setIsEditing(prev => ({
//                                         ...prev,
//                                         [famille2.id_famille]: true
//                                       }));
//                                     }
//                                   }}
//                                   onChange={e => {
//                                     const val = e.target.value.replace(/[^0-9]/g, "");
//                                     handleQuantiteChange(
//                                       famille2.id_famille,
//                                       val === "" ? 0 : Number(val)
//                                     );
//                                   }}
//                                   onBlur={e => {
//                                     if (e.target.value === "")
//                                       handleQuantiteChange(famille2.id_famille, 0);
//                                   }}
//                                   fullWidth
//                                   sx={{
//                                     backgroundColor:
//                                       famille2.nom_famille === "Balaste" ||
//                                       famille2.nom_famille === "Couvercles"
//                                         ? "#f8d7da"
//                                         : quantites[famille2.id_famille] > 0
//                                         ? "#d1f7c4"
//                                         : "inherit"
//                                   }}
//                                 />
//                               </TableCell>
//                             </>
//                           ) : (
//                             <>
//                               <TableCell></TableCell>
//                               <TableCell></TableCell>
//                             </>
//                           )}
//                         </TableRow>
//                       );
//                     });
//                   })()}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 startIcon={<SaveIcon />}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <CircularProgress size={24} sx={{ mr: 1 }} />
//                     Enregistrement...
//                   </>
//                 ) : (
//                   "Enregistrer"
//                 )}
//               </Button>
//             </Box>
//           </Box>
//         )}
//       </Paper>

//       {/* Modal pour les détails */}
//       <Modal 
//         open={showDetailsModal} 
//         onClose={() => setShowDetailsModal(false)}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//       >
//         <Box sx={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: 600,
//           bgcolor: 'background.paper',
//           boxShadow: 24,
//           p: 4,
//           borderRadius: 2
//         }}>
//           <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
//             <Typography variant="h6" component="h2">
//               Détails du chargement #{selectedChargement?.id}
//             </Typography>
//             <IconButton 
//               edge="end" 
//               color="inherit" 
//               onClick={() => setShowDetailsModal(false)} 
//               aria-label="close"
//             >
//               <CloseIcon />
//             </IconButton>
//           </Box>
          
//           {selectedChargement && (
//             <>
//               <Grid container spacing={2} sx={{ mb: 2 }}>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Wagon:</Typography>
//                   <Typography variant="body1">{selectedChargement.id_wagon}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Four:</Typography>
//                   <Typography variant="body1">{selectedChargement.four?.num_four}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Statut:</Typography>
//                   <Typography variant="body1">{selectedChargement.statut}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Date chargement:</Typography>
//                   <Typography variant="body1">
//                     {new Date(selectedChargement.datetime_chargement).toLocaleString()}
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="subtitle2">Date sortie estimée:</Typography>
//                   <Typography variant="body1">
//                     {new Date(selectedChargement.datetime_sortieEstime).toLocaleString()}
//                   </Typography>
//                 </Grid>
//               </Grid>
              
//               <Divider sx={{ my: 2 }} />
              
//               <Typography variant="h6" gutterBottom>
//                 Pièces chargées
//               </Typography>
              
//               <TableContainer component={Paper} variant="outlined">
//                 <Table aria-label="pieces table" size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Famille</TableCell>
//                       <TableCell align="center">Quantité</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {selectedChargement.details?.map((detail) => (
//                       <TableRow key={detail.id_detail_chargement}>
//                         <TableCell>{detail.famille?.nom_famille || 'Inconnue'}</TableCell>
//                         <TableCell align="center">{detail.quantite}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </>
//           )}
//         </Box>
//       </Modal>
//     </Box>
//   </SidebarChef>
//   );
// };
function ChargementContent() {
  return (
  <SidebarChef initialPath="/ChargementContent">
  <Enfourneur/>
  </SidebarChef>
  )
}
export default ChargementContent;
