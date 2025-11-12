
import * as React from 'react';
import { useState ,useEffect } from 'react';

import {
  Box, Typography, Button, Grid, IconButton,
  Modal, CircularProgress, Autocomplete, Select, Alert,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

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
  onSuccessMessage
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

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, bgcolor: "background.paper", boxShadow: 24, p: 4, borderRadius: 2 }}>
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
          <Autocomplete
            options={wagons}
            getOptionLabel={w => `${w.num_wagon} - Statut: ${w.statut}`}
            value={wagons.find(w => w.id_wagon === editFormData.wagon_id) || null}
            onChange={(e, newValue) => setEditFormData({...editFormData, wagon_id: newValue ? newValue.id_wagon : ''})}
            renderInput={(params) => <TextField {...params} label="Wagon" required margin="normal" />}
          />
          <Autocomplete
            options={type_wagon}
            getOptionLabel={w => `${w.type_wagon}`}
            value={type_wagon.find(w => w.id == editFormData.type_wagon_id) || null}
            onChange={(e, newValue) => setEditFormData({...editFormData, type_wagon_id: newValue ? newValue.id : ''})}
            renderInput={(params) => <TextField {...params} label="Type Wagon" required margin="normal" />}
          />

          {/* Four */}
          <Select
            fullWidth
            value={editFormData.four_id || ''}
            onChange={(e) => setEditFormData({...editFormData, four_id: e.target.value})}
            margin="normal"
          >
            {fours.map(four => (
              <MenuItem key={four.id_four} value={four.id_four}>
                {four.num_four} - Cadence: {four.cadence}
              </MenuItem>
            ))}
          </Select>
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
              <TextField {...params} label="Utilisateur (Enfourneur)" required margin="normal" />
            )}
          />

        {/* Familles */}
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Familles et quantités</Typography>
          <Box sx={{ mt: 1 }}> {/* juste un petit espace */}
          {editFormData.familles.map((famille, index) => (
            <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 1 }}>
              {/* Autocomplete pour la famille */}
              <Grid item>
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
                  renderInput={(params) => <TextField {...params} label="Famille" />}
                  sx={{ width: '250px' }} // largeur fixe
                />
              </Grid>

              {/* Quantité */}
              <Grid item>
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
                  sx={{ width: '50%' }} // largeur fixe
                />
              </Grid>

              {/* Supprimer */}
              <Grid item>
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
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
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

        <Button type="submit" variant="contained" disabled={loadingSubmit}>
          {loadingSubmit ? <CircularProgress size={24} /> : 'Enregistrer'}
        </Button>
        
        {/* Bouton Annuler */}
      <Button
        type="button"
        variant="outlined"
        color="error"
      onClick={onClose}
        >
        Annuler
        </Button>
      </Box>
        </form>
      </Box>
    </Modal>
                    
  );
}
