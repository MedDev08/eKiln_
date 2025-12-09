import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../../components/layout/FourBoxViewer.css';
import SidebarChef from '../../components/layout/SidebarChef';
import {
    Box,
    Typography,
    Modal,
    Backdrop,
    Fade,
    Button,
    LinearProgress,
    Tooltip
} from '@mui/material';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { styled } from '@mui/system';

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
    // // Animation pour les wagons en cuisson
    // ...(status?.toLowerCase() === 'en cuisson' && {
    //     animation: 'pulse 2s infinite',
    // }),
}));


const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
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
    const [now, setNow] = useState(new Date());
    const [anneaux, setAnneaux] = useState([]);
    const [anneauxCoche, setAnneauxCoche] = useState(false);

   
    const fetchAnneaux = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/all-chargement-ids", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnneaux(res.data.ids); // stocke tous les IDs de chargement
        console.log("id_chargemet",res.data.ids);
      } catch (err) {
        console.error(err);
      }
    };
    // Mettre à jour l'heure courante chaque minute pour les animations
    useEffect(() => {
        fetchAnneaux();
        const timer = setInterval(() => {
            setNow(new Date());
            fetchAnneaux();
        }, 60000); // Mise à jour chaque minute
        return () => clearInterval(timer);
    }, []);

    // Charger les données depuis le localStorage ou l'API
    useEffect(() => {
        const loadFromLocalStorage = () => {
            const savedData = localStorage.getItem('wagonVisualizationData');
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
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

        // Mettre à jour le state local pour refléter le changement
        if (anneauxCoche) {
            setAnneaux(prev => [...prev, selectedChargement]);
        } else {
            setAnneaux(prev => prev.filter(id => id !== selectedChargement));
        }

    } catch (error) {
        console.error("Erreur lors de la mise à jour des anneaux :", error);
        // Revenir à l’état précédent si erreur
        setAnneauxCoche(prev => !prev);
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
            setSelectedChargement(chargement.id_chargement);
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
        fetchAnneaux();
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
                                onClick={() => handleBoxClick(chargement)}
                            >     
                               {console.log("TEST ", chargement.color)}
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                    {chargement.num_wag}
                                </div>
                                <div style={{ 
                                    fontSize: '10px',
                                    color: '#333',
                                    marginTop: '5px'
                                }}>
                                    {timeLeft}
                                </div>                      
                                {/* Cercle doré en bas à droite si l'id est dans anneaux */}
                                {anneaux.includes(chargement.id_chargement) && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '55px',
                                        right: '2px',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: 'gold',
                                        border: '1px solid #fff',
                                    }} />
                                )}
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
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openModal}>
                    <div className="modal-container">
                        <div className="modal-content">
                            <h2>Détails du Wagon</h2>
                            {details.length > 0 && (
                                <>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Famille</th>
                                                <th>Quantité</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.map((detail, idx) => (
                                                <tr key={idx}>
                                                    <td>{detail.nom_famille}</td>
                                                    <td>{detail.quantite}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                      {["admin","cuiseur"].includes(role) &&(
                                        <>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <input
                                        type="checkbox"
                                        checked={anneauxCoche}
                                        onChange={(e) => {
                                            setAnneauxCoche(e.target.checked);
                                            updateAnneaux();
                                        }}
                                        />
                                        <Typography ml={1}><strong>Anneaux Bullers</strong></Typography>
                                    </Box>
                                    </>)}
                                    {footerData && (
                                        <div className="footer-info">
                                            <p><strong>Historique de traitement</strong></p>
                                            <p>Enfourné par : <span className="light-text">{footerData.enfourne}</span></p>
                                            <p>Début : {footerData.debut}</p>
                                            <p>Fin estimée : {footerData.fin}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            <Box display="flex" justifyContent="space-between" mt={3}>
                                <Button 
                                    onClick={handleCloseModal} 
                                     sx={{ mr: 2 }}
                                >
                                    Fermer
                                </Button>
                                {["admin","cuiseur"].includes(role) &&(
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={async () => {
                                        await updateAnneaux(); // Mise à jour des anneaux
                                         handleRefresh();
                                         handleCloseModal();      
                                        }}
                                        >
                                        Valider
                                    </Button>
                                </>
                                )}
                            </Box>
                        </div>
                    </div>
                </Fade>
            </Modal>
        </Box>
    </SidebarChef>
    );
};

export default WagonVisualization;