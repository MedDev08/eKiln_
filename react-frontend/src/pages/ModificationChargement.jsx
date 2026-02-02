
import * as React from 'react';
import { useState ,useEffect } from 'react';

import {
  Box, Typography, Button, Grid, IconButton,
  Modal, CircularProgress, Autocomplete, Select, Alert,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { format } from "date-fns";
// import { fr } from "date-fns/locale";

export default function ModificationChargement({
  open,
  onClose,
  selectedChargement,
  familles,
  fours,
  wagons,
  type_wagon,
  users,
  onUpdate,
  onSuccessMessage,
  onValidate
}) {
  const [editFormData, setEditFormData] = useState({
    wagon_id: '',
    type_wagon_id:'',
    four_id: '',
    user_id: '',
    datetime_chargement: '',
    statut: '',
    familles: [],
  });
  const [editError, setEditError] =useState('');
  const [loadingSubmit, setLoadingSubmit] =useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] =useState(null);
  const [_editSuccess, setEditSuccess] = useState(false);
  const [validationDate, setValidationDate] = useState(null);
  const [anneauxCoche, setAnneauxCoche] = useState(false);

  useEffect(() => {
  if (open) {
    // Si on rouvre le modal, on réinitialise les messages d'erreur et succès
    setEditError('');

    // Si un chargement est sélectionné, on recharge ses données
    if (selectedChargement) {
      setEditFormData({
        wagon_id: selectedChargement.wagon?.id_wagon || '',
        four_id: selectedChargement.four?.id_four || '',
        type_wagon_id: selectedChargement.type_wagon?.id|| '',
        user_id: selectedChargement.user?.id_user || '',
        datetime_chargement: selectedChargement.datetime_chargement?.slice(0, 10) || '',
        statut: selectedChargement.statut || '',
        familles: selectedChargement.details.map((d) => ({
          id_famille: d.famille?.id_famille,
          nom_famille: d.famille?.nom_famille,
          quantite: d.quantite,
        })),
      });
    } 
  } else {
    // Quand on ferme le modal : on nettoie aussi tout
    setEditError('');
  }
}, [open, selectedChargement]);
 const getInitialDate = async () => {
  if (!selectedChargement) return new Date();

  //  si la date d’entrée existe, on l’utilise immédiatement
  if (selectedChargement.date_entrer) {
    return new Date(selectedChargement.date_entrer.replace(" ", "T"));
  }

  try {
    const token = localStorage.getItem("token");

    //  récupérer la dernière date d’entrée pour ce four
    const response = await fetch(
      `http://127.0.0.1:8000/api/chargements/last-date/${selectedChargement.id_four}`,
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
     if (data?.cadence) {
      const decalageMinutes = Math.trunc(1440 / data.cadence); 
      baseDate = new Date(baseDate.getTime() + decalageMinutes * 60 * 1000);
    }

    return baseDate;
  } catch (error) {
    console.error("Erreur récupération dernière date :", error);
    // En cas d'erreur, on retourne une date actuelle + décalage
    let fallbackDate = new Date();
    return fallbackDate;
  }
};// --- Charger la date initiale une fois que le chargement est disponible ---
useEffect(() => {
  if (!selectedChargement) return;

// Si la relation existe et n'est pas null, checkbox cochée
  setAnneauxCoche(selectedChargement.anneaux );
}, [selectedChargement]);
// --- Charger la date initiale une fois que le chargement est disponible ---
useEffect(() => {
  if (!selectedChargement) return;

  const initDate = async () => {
    const date = await getInitialDate();
    setValidationDate(date);
  };

  initDate();
}, [selectedChargement]);
  // Fonction pour changer uniquement l'heure et les minutes
  const handleChangeTime = (e) => {
     if (!e.target.value) {
        setValidationDate(null); 
        return;
      }
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate =  validationDate ? new Date(validationDate) : new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setValidationDate(newDate);
  };
  // const formatDate = (dateString) =>
  //   format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr });
  const updateAnneaux = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:8000/api/chargements/${selectedChargement.id}/anneaux`,
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
    selectedChargement.anneaux = anneauxCoche ? data : null;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des anneaux :", error);
  }
};
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setEditSuccess(false);
    setEditError('');
    try {
       
      const token = localStorage.getItem('token');
      const payload = {
        id_wagon: editFormData.wagon_id,
        id_four: editFormData.four_id,
        id_typeWagon: editFormData.type_wagon_id,
        id_user: editFormData.user_id,
        datetime_chargement: editFormData.datetime_chargement,
        statut: editFormData.statut,
        familles: editFormData.familles.map((f) => ({
          id_famille: f.id_famille,
          quantite: f.quantite,
        })),
      };

      const response = await axios.put(
        `http://localhost:8000/api/chargements/${selectedChargement.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (typeof onValidate === "function"  ) {
        await updateAnneaux();
        await onValidate(validationDate);
      }
      onUpdate(response.data.data);
      onSuccessMessage(response.data.message || "Chargement mis à jour avec succès ✅");
      onClose();
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoadingSubmit(false);
    }
  };
  useEffect(() => {
    if (editError) {
      const modalBox = document.getElementById('modal-box');
      if (modalBox) {
        modalBox.scrollTop = 0; 
      }
    }
  }, [editError]);

   const user = JSON.parse(localStorage.getItem('user'));
   const role = user?.role?.toLowerCase(); 
    if (!selectedChargement) return null;
   const showField = selectedChargement.mode === "editer" || role === "admin";
 
  return (
    <Modal open={open} onClose={onClose}>
      <Box  id="modal-box" sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",  width: { xs: "90%", sm: 600 }, bgcolor: "background.paper", boxShadow: 24, p: 4, borderRadius: 2, overflowY: "auto", maxHeight: "90vh" }}>
        {editError && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                {editError}
              </Alert>
            </Box>
          )}
        <Typography variant="h6" gutterBottom>Modifier le chargement #{selectedChargement?.id}</Typography>
        <form onSubmit={handleEditSubmit}>
  
          {/* Wagon */}
          <Grid container spacing={2}>
            <Grid size={4}>
              <Autocomplete
                options={wagons}
                getOptionLabel={w => `${w.num_wagon}`}
                // - Statut: ${w.statut}
                value={wagons.find(w => w.id_wagon === editFormData.wagon_id) || null}
                onChange={(e, newValue) => setEditFormData({...editFormData, wagon_id: newValue ? newValue.id_wagon : ''})}
                renderInput={(params) => <TextField {...params} label="Wagon" required size="small" margin="normal" />}
              />
            </Grid>
         
            <Grid size={4}>
              <Autocomplete
                options={type_wagon}
                getOptionLabel={w => `${w.type_wagon}`}
                value={type_wagon.find(w => w.id == editFormData.type_wagon_id) || null}
                onChange={(e, newValue) => setEditFormData({...editFormData, type_wagon_id: newValue ? newValue.id : ''})}
                renderInput={(params) => <TextField {...params} label="Type Wagon" required size="small" margin="normal" />}
                  />
            </Grid> 
         
              <Grid size ={4}>
                <Autocomplete
                  options={fours} 
                  getOptionLabel={(option) => `${option.num_four}`}
                  // - Cadence: ${option.cadence}
                  value={fours.find(f => f.id_four === editFormData.four_id) || null}
                  isOptionEqualToValue={(option, value) =>
                    option.id_four === value.id_four
                  }
                  onChange={(event, newValue) => {
                    setEditFormData({
                      ...editFormData,
                      four_id: newValue ? newValue.id_four : ''
                    });
                  }}
                  renderInput={(params) => <TextField {...params} label="Four" required size="small" margin="normal" />}
                />
              </Grid> 
            </Grid>
            {["admin","chef d'equipe"].includes(user?.role?.toLowerCase()) &&(
           <>
              <Grid >
                <Autocomplete
                options={users.filter(u => u.Role.toLowerCase() === "enfourneur")} 
                getOptionLabel={(u) => `(${u.Matricule}) ${u.Nom} ${u.Prenom}`}
                value={users.find(u => u.id === editFormData.user_id) || null}
                onChange={(e, newValue) =>
                  setEditFormData({
                    ...editFormData,
                    user_id: newValue ? newValue.id : '',
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Utilisateur (Enfourneur)" required size="small" margin="normal" />
                )}
              />
              </Grid>
          </>
           )}
        {/* Familles */}
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Familles et quantités</Typography>
          <Box sx={{ mt: 1 }}> {/* juste un petit espace */}
          {editFormData.familles.map((famille, index) => (
            <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 1 }}>
              {/* Autocomplete pour la famille */}
              <Grid size ={5}>
                <Autocomplete
                  freeSolo
                  options={familles.map(f => f.nom_famille)}
                  value={famille.nom_famille || ''}
                  onChange={(e, newValue) => {
                    const newFamilles = [...editFormData.familles];
                    const selected = familles.find(f => f.nom_famille === newValue);
                    newFamilles[index] = {
                      ...newFamilles[index],
                      id_famille: selected ? selected.id_famille : '',
                      nom_famille: newValue
                    };
                    setEditFormData({ ...editFormData, familles: newFamilles });
                  }}
                  onInputChange={(e, newInputValue) => {
                    const newFamilles = [...editFormData.familles];
                    newFamilles[index] = { ...newFamilles[index], nom_famille: newInputValue };
                    setEditFormData({ ...editFormData, familles: newFamilles });
                  }}
                  renderInput={(params) => <TextField {...params} label="Famille" size="small" sx={{ mb: 1 }}/>}
                  // sx={{ width: '250px' }} // largeur fixe
                />
              </Grid>

              {/* Quantité */}
              <Grid size ={2}>
                <TextField
                  type="number"
                  value={famille.quantite}
                  onFocus={() => {
                    if (famille.quantite === 0 || famille.quantite === '0') {
                      const newFamilles = [...editFormData.familles];
                      newFamilles[index].quantite = '';
                      setEditFormData({ ...editFormData, familles: newFamilles });
                    }
                  }}
                  onBlur={() => {
                    if (famille.quantite === '' || famille.quantite === null) {
                      const newFamilles = [...editFormData.familles];
                      newFamilles[index].quantite = 0;
                      setEditFormData({ ...editFormData, familles: newFamilles });
                    }
                  }}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Supprimer le "0" au début si l’utilisateur tape un autre chiffre
                    if (value.length > 1 && value.startsWith("0")) {
                      value = value.replace(/^0+/, "");
                    }
                    const newFamilles = [...editFormData.familles];
                    newFamilles[index].quantite = value === "" ? "" : parseInt(value);
                    setEditFormData({ ...editFormData, familles: newFamilles });
                  }}
                  // sx={{ width: '50%' }} // largeur fixe
                  size="small"
                   sx={{ mb: 1 }}
                />
              </Grid>

              {/* Supprimer */}
              <Grid size ={1}>
                <IconButton color="error" onClick={() => setConfirmDeleteIndex(index)}>
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          </Box>
          {/* Dialog confirmation suppression */}
          <Dialog
            open={confirmDeleteIndex !== null}
            onClose={() => setConfirmDeleteIndex(null)}
          >
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogContent>
              <Typography>
                Êtes-vous sûr de vouloir supprimer la famille "
                {confirmDeleteIndex !== null && editFormData.familles[confirmDeleteIndex].nom_famille}" ?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDeleteIndex(null)} color="primary">
                Annuler
              </Button>
              <Button
                onClick={() => {
                  const newFamilles = editFormData.familles.filter(
                    (_, i) => i !== confirmDeleteIndex
                  );
                  setEditFormData({ ...editFormData, familles: newFamilles });
                  setConfirmDeleteIndex(null);
                }}
                color="error"
                variant="contained"
              >
                Supprimer
              </Button>
            </DialogActions>
          </Dialog>
        <Box >
        <Button
          type="button"
          onClick={() =>
            setEditFormData({
              ...editFormData,
              familles: [...editFormData.familles, { id_famille: '', nom_famille: '', quantite: 0 }]
            })
          }
        >
          Ajouter une famille
        </Button>
        </Box>
         {["admin","cuiseur"].includes(user?.role?.toLowerCase()) && location.pathname.toLowerCase().includes("/cuiseur") &&(
             <>
              <Typography sx={{ mb: 1 }}>Heure d’entrée :</Typography>
              <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                {showField && (
                <>
                  <TextField
                    type="date"
                    value={validationDate ? format(validationDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                     if (!e.target.value) {
                        setValidationDate(null);
                        return;
                      }
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
               <Box display="flex" alignItems="center" mb={2} mt={2}>
                <input
                    type="checkbox"
                    checked={anneauxCoche}
                    onChange={(e) => setAnneauxCoche(e.target.checked)}
                  />
                  <Typography ml={1}><strong>Anneaux Bullers</strong></Typography>
                </Box>
               </Grid>
              
               </>
            )}
             <Grid container spacing={4} justifyContent="flex-end">
              <Grid item>
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={onClose}
                >
                Annuler
              </Button>
              </Grid>
             <Grid item>
              <Button 
               type="submit" 
               variant="contained" 
               disabled={loadingSubmit || !validationDate}
               >
               {loadingSubmit ? (
                  <CircularProgress size={24} />
                ):  (!validationDate && ["admin","cuiseur"].includes(user?.role?.toLowerCase()) && location.pathname.toLowerCase().includes("/cuiseur")) ? (
                  "Chargement de la date..."
                ):(
                   "Enregistrer"
                )}
              </Button>
              </Grid>
          </Grid>
    </form>
      </Box>
    </Modal>
                    
  );
}
