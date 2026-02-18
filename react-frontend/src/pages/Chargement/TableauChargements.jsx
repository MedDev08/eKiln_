import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Modal,
  Divider,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import SidebarChef from "../../components/layout/SidebarChef";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export default function TableauChargements() {
  const today = new Date().toISOString().split("T")[0];

  const [rowsByDay, setRowsByDay] = useState([]);
  const [familles, setFamilles] = useState([]);
  const [fours, setFours] = useState([]);
  const [selectedFour, setSelectedFour] = useState(null);
  // const [total, setTotal] = useState(0);
  // const [page, setPage] = useState(0);
  // const [rowsPerPage, setRowsPerPage] = useState(90);
  const [loading, setLoading] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [searchParams, setSearchParams] = useState({
    dateFrom: today,
    dateTo: "",
   //  shift: "",
  });

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [famillesRes, foursRes] = await Promise.all([
        axios.get("http://localhost:8000/api/familles", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8000/api/fours", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setFamilles(famillesRes.data);
      setFours(foursRes.data);
      if (foursRes.data.length > 0) setSelectedFour(foursRes.data[0].num_four);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchChargements = async (numFour) => {
    try {
      setLoadingTable(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:8000/api/chargements/${numFour}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: searchParams,
        }
      );

      const data = res.data.data || {};

      const rows = data.map((day) => ({
        jour: day.jour,
        familles: day.familles, 
        nombre_wagons: day.nombre_wagons, 
        cadence_theorique: day.cadence_theorique,
        nombre_wagons_Ballast: day.nombre_wagons_Ballast,
        total_poids:day.total_poids,
        conso:day.conso,
        coef:day.coef,
        consom:day.consom,
        conso_eff:day.conso_eff,
        ratio:day.ratio,
        temps_cycle:day.temps_cycle,
        // temperature_s14:day.temperature_s14,
        // temperature_s15:day.temperature_s15,
        controles: day.controles || {}
      }));
      setRowsByDay(rows);
    } catch (err) {
      console.error(err);
      setRowsByDay([]); 
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    if (selectedFour) fetchChargements(selectedFour);
  }, [selectedFour,
  //  page, rowsPerPage,
    searchParams]);

  const handleResetFilters = () => {
    setSearchParams({ dateFrom: "", dateTo: "" });
  };
  const handleExportCSV = () => {
  if (!rowsByDay.length) return;

  const sep = ";";
  const showCoef = selectedFour == 3;
  let csv = `Jour${sep}Index Gaz [m3]${sep}Conso [m3]${sep}Pres [mbar]${sep}Tempé [°C]${sep}`+
  (showCoef ? `Coef${sep}` : ``) +
 `Consom [Kg]${sep}${familles.map(f => f.nom_famille).join(sep)}${sep}`+
 `Total Poids[Kg]${sep}Conso. eff [KWh/kg]${sep}Total pieces${sep}Cadence Théorique${sep}Cadence réelle${sep}`+
 `Nbr de Wagon BALLAST${sep}Densité [Nbr pieces/wg]${sep}Ratio [Kg pieces / Kg Refractaires]${sep}Temps de Cycle [heure]\n`;

  rowsByDay.forEach((row) => {
    let rowData = [format(parseISO(row.jour), "dd/MM/yyyy", { locale: fr })];
    rowData.push(row.controles.Compteur_Propane ?? 0);
    rowData.push(row.conso ?? 0);
    rowData.push(row.controles.Relevee_pression ?? 0);
    rowData.push(row.controles.Relevee_temperature ?? 0);
    rowData.push(row.coef ?? 0);
    rowData.push(row.consom ?? 0);
    familles.forEach((f) => {
      const familleData = row.familles?.find(
      (v) => v.id_famille === f.id_famille);
      rowData.push(familleData ? familleData.total : 0);
    });

    const totalPieces = row.familles?.reduce((sum, f) => sum + (f.total || 0), 0) ?? 0;
    const densite = row.nombre_wagons ? (totalPieces / row.nombre_wagons).toFixed(2) : 0;
    
    rowData.push(row.total_poids ||0);
    rowData.push(row.conso_eff ?? 0)
    rowData.push(totalPieces);                   
    rowData.push(row.cadence_theorique ?? 0);     
    rowData.push(row.nombre_wagons ?? 0);         
    rowData.push(row.nombre_wagons_Ballast || 0);  
    rowData.push(densite);   
    rowData.push(row.ratio);  
    rowData.push(row.temps_cycle)  ;                  
    // rowData.push(row.temperature_s14);
    // rowData.push(row.temperature_s15);
    csv += rowData.join(sep) + "\n";
  });

  // Download CSV
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `totaux_journaliers_Four_${selectedFour}_${new Date()
    .toLocaleString("fr-FR")
    .replace(/[/: ]/g, "-")}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

    // const handleChangePage = (event, newPage) => {
    //   setPage(newPage);
    // };
    // const handleChangeRowsPerPage = (event) => {
    //   setRowsPerPage(parseInt(event.target.value, 10));
    //   setPage(0);
    // };

  if (loading) {
    return (
      <SidebarChef>
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Chargement...</Typography>
        </Box>
      </SidebarChef>
    );
  }

  return (
    <SidebarChef>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Totaux journaliers par famille
        </Typography>

        {/* Filtres */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            type="date"
            label="Date de"
            InputLabelProps={{ shrink: true }}
            value={searchParams.dateFrom}
            onChange={(e) =>
              setSearchParams({ ...searchParams, dateFrom: e.target.value })
            }
          />
          <TextField
            type="date"
            label="Date à"
            InputLabelProps={{ shrink: true }}
            value={searchParams.dateTo}
            onChange={(e) =>
              setSearchParams({ ...searchParams, dateTo: e.target.value })
            }
          />
           {/* <TextField
              size="small"
              type="number"
              label="Shift"
              InputProps={{ inputProps: { min: 1, max: 3 } }}
              value={searchParams.shift || ""}
              onChange={e => setSearchParams({ ...searchParams, shift: e.target.value })}
              sx={{ width: 70 }}
             /> */}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchChargements(selectedFour)}
          >
            Actualiser
          </Button>
          <Button
            variant="text"
            startIcon={<CloseIcon />}
            onClick={handleResetFilters}
          >
            Réinitialiser
          </Button>
          <Button variant="contained" color="success" onClick={handleExportCSV}>
            Exporter CSV
          </Button>
        </Box>

         <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {fours.map((four) => {
             const num = four.num_four;
            const isActive = selectedFour === num;

            return (
              <Button
                key={num}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => {
                  setSelectedFour(num);
                  // setPage(0);
                }}
                sx={{
                  borderRadius: "8px 8px 0 0",
                  backgroundColor: isActive ? "#3498db" : "transparent",
                  color: isActive ? "#fff" : "inherit",
                  "&:hover": {
                    backgroundColor: isActive
                      ? "#2980b9"
                      : "rgba(0,0,0,0.08)",
                  },
                }}
              >
                Four {num}
              </Button>
            );
          })}
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            height: 550,
            overflowY: "auto",
            overflowX: "auto",
            border: "1px solid #000",
          }}
        >
          <Table 
          stickyHeader
          size="small"  
         sx={{
          borderCollapse: "collapse",
         "& .MuiTableRow-root": {
            border: "1px solid #000", 
          },
          "& .MuiTableCell-root": {
            border: "1px solid #000", 
          }
          }}
            >
            <TableHead>
              <TableRow>
                <TableCell>
                  Jour (06h → 06h)
                </TableCell>
                <TableCell>
                  Index Gaz [m3]
                </TableCell>
                <TableCell>Conso [m3]</TableCell>
                <TableCell>Pres [mbar]</TableCell>
                 <TableCell>Tempé [°C]</TableCell>
               {selectedFour == 3 && <TableCell>Coef</TableCell>}
                 <TableCell>Consom [Kg]</TableCell>
                {/* {famillesUtilisees.map((f) => (
                  <TableCell key={f.id_famille} align="right">
                    {f.nom_famille}
                  </TableCell>
                ))} */}
                <TableCell>Total Poids[Kg]</TableCell>
                <TableCell>Conso. eff [KWh/kg]</TableCell>
                <TableCell>Total pieces</TableCell>
                <TableCell>Cadence Théorique</TableCell>
                <TableCell>Cadence réelle</TableCell>
                <TableCell>Nbr de Wagon BALLAST</TableCell>
                <TableCell>Densité</TableCell>
                <TableCell>Ratio [Kg pieces / Kg Refractaires]</TableCell>
                <TableCell>Temps de Cycle [heure]</TableCell>
                {/* <TableCell>Température de consigne S14 [°C]</TableCell>
                <TableCell>Température de consigne S15 [°C]</TableCell> */}
                <TableCell> Action </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingTable ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                  >
                     <Box display="flex" justifyContent="flex-start">
                    <CircularProgress size={35} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rowsByDay.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    Aucune donnée
                  </TableCell>
                </TableRow>
              ) : (
                rowsByDay.map((row) => (
                  <TableRow key={row.jour}>
                    <TableCell>
                      {format(parseISO(row.jour), "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>{row.controles?.Compteur_Propane ?? 0 }</TableCell>
                    <TableCell>{row.conso ?? 0}</TableCell>
                    <TableCell>{row.controles?.Relevee_pression ?? 0 }</TableCell>
                    <TableCell>{row.controles?.Relevee_temperature ?? 0}</TableCell>
                    {selectedFour == 3 && <TableCell>{row.coef ?? 0}</TableCell>}
                    <TableCell>{row.consom ?? 0}</TableCell>
                    {/* {famillesUtilisees.map((f) => {
                      const familleData = row.familles.find(
                        (v) => v.id_famille === f.id_famille
                      );
                      return (
                        <TableCell key={f.id_famille} align="right">
                          {familleData ? familleData.total : 0}
                        </TableCell>
                      );
                    })} */}
                    <TableCell>{row.total_poids || 0}</TableCell>
                    <TableCell>{row.conso_eff}</TableCell>
                    <TableCell>{row.familles?.reduce((sum, f) => sum + f.total, 0) ?? 0}</TableCell>
                    <TableCell>{row.cadence_theorique ?? 0} </TableCell>
                    <TableCell>{row.nombre_wagons|| 0}</TableCell>
                    <TableCell>{row.nombre_wagons_Ballast ||0}   </TableCell>
                    <TableCell>{row.nombre_wagons ? (row.familles?.reduce((sum, f) => sum + (f.total || 0), 0) / row.nombre_wagons).toFixed(2): 0}</TableCell>
                    <TableCell>{row.ratio ?? 0}</TableCell>
                    <TableCell>{row.temps_cycle ?? 0}</TableCell>
                    {/* <TableCell>{row.temperature_s14 ?? 0}</TableCell>
                    <TableCell>{row.temperature_s15 ?? 0}</TableCell> */}
                   
                    <TableCell> 
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedDay(row);
                              setOpenDetail(true);
                            }}
                          >
                            Détails
                        </Button>
                     </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
          {/* <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */}
      </Box>
      <Modal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
      >
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
           Détails de la journée du {selectedDay && format(parseISO(selectedDay.jour), "dd/MM/yyyy", { locale: fr })}
          </Typography>
          <IconButton onClick={() => setOpenDetail(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6" gutterBottom>
          Détails des pièces
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Famille</TableCell>
                <TableCell align="right">Quantité</TableCell>
                <TableCell align="right">Total Poids[Kg]</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {selectedDay?.familles?.length > 0 ? (
                selectedDay.familles.map((fam) => (
                  <TableRow key={fam.id_famille}>
                    <TableCell>{fam.nom_famille}</TableCell>
                    <TableCell align="right">{fam.total}</TableCell>
                    <TableCell align="right">{fam.total_poids}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Aucune famille associée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
    </SidebarChef>
  );
}
