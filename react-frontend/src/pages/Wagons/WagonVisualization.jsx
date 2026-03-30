import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../../components/layout/FourBoxViewer.css';
import SidebarChef from '../../components/layout/SidebarChef';
import {
    Box,
    Typography,
    Modal,
    Backdrop,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Fade,
    Button,
    LinearProgress,
    Tooltip
} from '@mui/material';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { styled } from '@mui/system';
import FlagIcon from '@mui/icons-material/Flag';
import { Circle } from '@mui/icons-material'; 
import CircularProgress from '@mui/material/CircularProgress';

const Header = ({ title, subtitle }) => (
    <Box mb="30px">
        <Typography variant="h5" fontWeight="bold" sx={{ m: "0 0 5px 0" }}>
            {title}
        </Typography>
        <Typography variant="h7" color="textSecondary">
            {subtitle}
        </Typography>
    </Box>
);

// Style personnalisé pour le four
const FourTunnel = styled('div')({
    position: 'relative',
    width: '100%',
    height: '140px', // Un peu plus grand
    backgroundColor: '#f8f9fa',
    border: '3px solid #3498db',
    borderRadius: '12px',
    margin: '25px 0',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
});

const WagonPosition = styled('div')(({ progress,type_wagon
 }) => ({
    position: 'absolute',
    left: `${progress}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '45px',
    height: '70px',
   backgroundColor: type_wagon,
    border: '2px solid #2c3e50',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'left 1s ease-in-out, transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)',
    '&:hover': {
        transform: 'translate(-50%, -50%) scale(1.15)',
        zIndex: 10,
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    },
}));


const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if(hours == 0){
        return `${minutes}m`
    }
    return `${hours}h ${minutes}m`;
};

const WagonVisualization = () => {
    const [fourData, setFourData] = useState({
        four3: [],
        four4: [],
        loading: true,
        error: null
    });
    const [selectedChargement, setSelectedChargement] = useState(null);
    const [details, setDetails] = useState([]);
    const [footerData, setFooterData] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [now, _setNow] = useState(new Date());
    const [anneauxCoche, setAnneauxCoche] = useState(false);
    const [selectedEssais, setSelectedEssais] = useState([]);
    const [allEssais, setAllEssais] = useState([]);
    const [serviceSansEssaiIds, setServiceSansEssaiIds] = useState([]);
    const [isUpdatingAnneaux, setIsUpdatingAnneaux] = useState(false);
    const [isSavingEssais, setIsSavingEssais] = useState(false);
    
    const fetchServicesSansEssais = async () => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.get(
                'http://localhost:8000/api/services-sans-essais',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

             const servicesData = res.data.data || [];

        setServiceSansEssaiIds(servicesData.map(s => s.id));


        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchServicesSansEssais(); 
    }, []);

    const fetchEssais = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/essais', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllEssais(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };
    const saveEssais = async () => {
        try {
            setIsSavingEssais(true);
            const token = localStorage.getItem('token');
            await axios.post(
            'http://localhost:8000/api/details-essais',
            {
                chargement_id: selectedChargement,
                essais_ids: selectedEssais
            },
            { headers: { Authorization: `Bearer ${token}` } }
            );
            handleCloseModal();
            handleRefresh(); 
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingEssais(false);
        }
        };
    // Charger les données depuis le localStorage ou l'API
    useEffect(() => {
        const loadFromLocalStorage = () => {
            const savedData = localStorage.getItem('wagonVisualizationData');
            console.log('wagonVisualizationData',savedData);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    console.log('parse',parsedData);
                    if (parsedData.four3 && parsedData.four4) {
                        setFourData({
                            ...parsedData,
                            loading: false,
                            error: null
                        });
                        return true;
                    }
                } catch (e) {
                    console.error('Error parsing localStorage data:', e);
                }
            }
            return false;
        };

        if (!loadFromLocalStorage()) {
            fetchChargements();
        }

        // Refresh auto chaque 60 secondes
        const intervalId = setInterval(() => {
            handleRefresh();
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchChargements = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/four-chargements1', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = {
                four3: response.data.four3 || [],
                four4: response.data.four4 || [],
                loading: false,
                error: null
            };
            
            setFourData(data);
            
            localStorage.setItem('wagonVisualizationData', JSON.stringify({
                four3: data.four3,
                four4: data.four4
            }));
        } catch (error) {
            console.error('API Error:', error);
            setFourData({
                four3: [],
                four4: [],
                loading: false,
                error: 'Failed to load data from API'
            });
        }
    };
   const updateAnneaux = async () => {
    if (!selectedChargement) return; 

    try {
        setIsUpdatingAnneaux(true);
        const token = localStorage.getItem("token");
        await fetch(
            `http://localhost:8000/api/chargements/${selectedChargement}/anneaux`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ coche: anneauxCoche }),
            }
        );

    } catch (error) {
        console.error("Erreur lors de la mise à jour des anneaux :", error);
    } finally {
        setIsUpdatingAnneaux(false);
    }
};
    const handleBoxClick = async (chargement) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8000/api/chargement-details/${chargement.id_chargement}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setDetails(response.data.details || []);
            setFooterData({
                enfourne: response.data.username || 'Unknown',
                debut: new Date(response.data.debut_cuisson).toLocaleString(),
                fin: new Date(response.data.FinCuissonEstimee).toLocaleString()
            });
            setSelectedEssais(response.data.essais.map(e => e.id));
            setSelectedChargement(chargement.id_chargement);
            setAnneauxCoche(response.data.anneaux);
            console.log(response.data.anneaux);
            setOpenModal(true);
        } catch (error) {
            console.error('Details Error:', error);
            setDetails([]);
            setFooterData(null);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleRefresh = () => {
        localStorage.removeItem('wagonVisualizationData');
        setFourData(prev => ({ ...prev, loading: true }));
        fetchChargements();
    };
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role?.toLowerCase();
    
    // Calculer la progression de la cuisson pour un wagon
    const calculateProgress = (chargement) => {
        if (!chargement.debut_cuisson || !chargement.FinCuissonEstimee) return 0;
        
        const start = new Date(chargement.debut_cuisson).getTime();
        const end = new Date(chargement.FinCuissonEstimee).getTime();
        const current = now.getTime();
        
        if (current >= end) return 100;
        if (current <= start) return 0;
        
        return ((current - start) / (end - start)) * 100;
    };

    // Calculer le temps restant
    const calculateTimeLeft = (chargement) => {
        if (!chargement.FinCuissonEstimee) return 'N/A';
        
        const end = new Date(chargement.FinCuissonEstimee).getTime();
        const current = now.getTime();
        
        if (current >= end) return 'Terminé';
        
        return formatDuration(end - current);
    };

    // Nouveau rendu pour le four avec animation
   const renderFourTunnel = (fourNumber, chargements) => (
        <div className="four-section" key={fourNumber}>
            <h2>Four {fourNumber}</h2>           
             <FourTunnel>
                {chargements.map(chargement => {
                    const progress = calculateProgress(chargement);
                    const timeLeft = calculateTimeLeft(chargement);
                    
                    return (
                        <Tooltip 
                            key={chargement.id_chargement}
                            title={
                                <div>
                                    <div>Wagon: {chargement.num_wag}</div>
                                    <div>Statut: {chargement.Statut}</div>
                                    <div>Temps restant: {timeLeft}</div>
                                </div>
                            }
                            arrow
                        >
                            <WagonPosition 
                                progress={progress} 
                                type_wagon={chargement.color}
                                onClick={async () => {
                                     handleBoxClick(chargement);
                                     fetchEssais();
                                }}
                            >     
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                    {chargement.num_wag}
                                </div>
                                <div style={{ 
                                    fontSize: '10px',
                                    color: '#333',
                                    marginTop: '5px',
                                    // left: '85%',
                                    // transform: 'translateX(-50%)'
                                }}>
                                    {timeLeft}
                                </div>  
                               {(chargement.anneaux || chargement.essais?.length > 0 ) && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '55px',
                                        right: '4px',
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: 'gold',
                                        border: '1px solid #000000',
                                    }} />
                                )}                  
                                {/* Cercle doré en bas à droite si l'id est dans anneaux */}
                                {/* {chargement.anneaux && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '55px',
                                        right: '4px',
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: 'gold',
                                        border: '1px solid #000000',
                                    }} />
                                )} */}
                               
                                {chargement.has_famille_37 && (
                                    <div style={{
                                        position: 'absolute',
                                       bottom: "4px",
                                       right: "4px",
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: 'red',
                                        border: '1px solid #000000',
                                    }} />
                                )}
                               {/* {chargement.essais?.length > 0 && (
                                    <Box
                                        sx={{
                                        position: "absolute",
                                        // top: "4px",
                                        bottom: '35px',
                                        right: "4px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "2px",
                                        }}
                                    >
                                        {Array.from(
                                        new Map(
                                            chargement.essais
                                            ?.filter((e) => e.essai?.service)
                                            .map((e) => [e.essai.service.id, e.essai.service])
                                        ).values()
                                        ).map((service) => (
                                        <Box
                                            key={service.id}
                                            sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            backgroundColor: service.color || "#999",
                                            border: '1px solid #000000',
                                            }}
                                        />
                                        ))}
                                    </Box>
                                    )} */}
                            </WagonPosition>
                        </Tooltip>
                    );
                })}
            </FourTunnel>
            <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ 
                    height: '12px', 
                    borderRadius: '6px',
                    backgroundColor: '#e9ecef',
                    margin: '15px 0 5px 0',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#3498db',
                        borderRadius: '6px',
                        backgroundImage: 'linear-gradient(to right, #3498db, #2c3e50)',
                    }
                }} 
            />
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '5px'
            }}>
                <span>Entrée</span>
                <span>Sortie</span>
            </div>
        </div>
    );

    return (
    <SidebarChef>
        <Box m="30px">
            <Header
                title="VISUALISATION DES FOURS"
                subtitle="Position des wagons en temps réel selon leur progression de cuisson"
            />
            <Button 
                onClick={handleRefresh} 
                variant="contained" 
                style={{ marginBottom: '20px' }}
            >
                Actualiser les données
            </Button>
            
            <div className="four-box-container">
                {fourData.error ? (
                    <div className="error-message">{fourData.error}</div>
                ) : fourData.loading ? (
                    <div>Chargement en cours...</div>
                ) : (
                    <div className="four-section-container">
                        {renderFourTunnel(3, fourData.four3)}
                        {renderFourTunnel(4, fourData.four4)}
                    </div>
                )}
            </div>

            {/* Modal pour les détails */}
            <Modal open={openModal} onClose={handleCloseModal} >
                 <Box sx={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: { xs: "90%", sm: 600 },
                        maxHeight: "80vh",
                        overflowY: "auto",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2
                        }}>
                        <Typography variant="h6" gutterBottom>Détails du Wagon</Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                        <TableRow>
                                            <TableCell>Famille</TableCell>
                                            <TableCell align="right">Quantité</TableCell>
                                        </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {details.length > 0 ?(
                                              details.map((detail, idx) => (
                                               <TableRow key={idx}>
                                                <TableCell>{detail?.nom_famille || 'N/A'}</TableCell>
                                                <TableCell align="right">{detail?.quantite}</TableCell>
                                                </TableRow>
                                                ))
                                                ) : (
                                                <TableRow>
                                                <TableCell colSpan={2} align="center">Aucune famille associée</TableCell>
                                                </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                      {["admin","cuiseur"].includes(role) &&(
                                        <>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <input
                                        type="checkbox"
                                        checked={anneauxCoche}
                                        onChange={(e) => {
                                            setAnneauxCoche(e.target.checked);
                                           // updateAnneaux();
                                        }}
                                        />
                                        <Typography ml={1}><strong>Anneaux Bullers</strong></Typography>
                                    </Box>
                                    </>)}
                                {allEssais.length > 0 && (
                                    <Box
                                        mb={2}
                                        sx={{
                                            maxHeight: 170,      
                                            width: "100%",       
                                            overflow: "auto",    
                                            border: "1px solid #ddd",
                                            borderRadius: 1,
                                            p: 1
                                        }}
                                        >
                                        <Box display="flex" gap={2} minWidth="max-content">

                                            {Object.values(
                                            allEssais.reduce((acc, essai) => {
                                                if (!acc[essai.service.nom_service]) acc[essai.service.nom_service] = [];
                                                acc[essai.service.nom_service].push(essai);
                                                return acc;
                                            }, {})
                                            ).map((essaisByService, idx, arr) => (
                                            <Box
                                                key={idx}
                                                minWidth="120px"
                                                mr={2}
                                                pr={2}
                                                sx={{
                                                borderRight: idx !== arr.length - 1 ? '1px solid #ccc' : 'none', 
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" mb={1}>
                                                <Box
                                                    sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: essaisByService[0].service.color || '#999',
                                                    mr: 1
                                                    }}
                                                />
                                                <Typography fontWeight="bold" fontSize="0.9rem">
                                                    {essaisByService[0].service.nom_service}
                                                </Typography>
                                                </Box>
                                                {essaisByService.map((essai) => (
                                                <Box key={essai.id} display="flex" alignItems="center" mb={0.5}>
                                                    <input
                                                    type="checkbox"
                                                    checked={selectedEssais.includes(essai.id)}
                                                    onChange={() => {
                                                        setSelectedEssais(prev =>
                                                        prev.includes(essai.id)
                                                            ? prev.filter(id => id !== essai.id)
                                                            : [...prev, essai.id]
                                                        );
                                                    }}
                                                    />
                                                    <Typography ml={0.5} fontSize="0.85rem">
                                                    {essai.nom_essais}
                                                    </Typography>
                                                </Box>
                                                ))}
                                            </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                    )}
                                    {footerData && (
                                        <div className="footer-info">
                                            <p><strong>Historique de traitement</strong></p>
                                            <p>Enfourné par : <span className="light-text">{footerData.enfourne}</span></p>
                                            <p>Début : {footerData.debut}</p>
                                            <p>Fin estimée : {footerData.fin}</p>
                                        </div>
                                    )}
                               
                            <Box display="flex" justifyContent="space-between" mt={3}>
                                <Button 
                                    onClick={handleCloseModal} 
                                     sx={{ mr: 2 }}
                                >
                                    Fermer
                                </Button>
                                {/* {["admin","cuiseur"].includes(role) &&(
                                <> */}
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={async () => {
                                        if (role =="admin" ||  role == "cuiseur") {
                                        await updateAnneaux(); 
                                            }
                                         if (serviceSansEssaiIds.includes(user.id_service) || selectedEssais.length === 0 ) {
                                            handleCloseModal();
                                            return;
                                        }
                                        await saveEssais();  
                                        }}
                                        //disabled={isSavingEssais||isUpdatingAnneaux ||selectedEssais.length === 0}
                                        >
                                        {isSavingEssais||isUpdatingAnneaux ? (
                                        <CircularProgress size={22} color="inherit" />
                                        ) : (
                                        "Valider"
                                        )}
                                    </Button>
                                {/* </>
                                )} */}
                            </Box>
                </Box>
            </Modal>
        </Box>
    </SidebarChef>
    );
};

export default WagonVisualization;