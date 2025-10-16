import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../components/layout/FourBoxViewer.css';
import Sidebar from '../../components/layout/sidebar';
import {
    Box,
    Typography,
    Modal,
    Backdrop,
    Fade,
    Button
} from '@mui/material';

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

const FourBoxViewer = () => {
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

    // Charger les données depuis le localStorage au montage
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

    // ✅ Refresh auto chaque 60 secondes
    const intervalId = setInterval(() => {
        handleRefresh(); // recharge les données automatiquement
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(intervalId); // nettoyage
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
    };
// Remplacer la partie renderFourSection par ceci :
const renderFourSection = (fourNumber, chargements) => (
    <div className="four-section" key={fourNumber}>
        <h2>Four {fourNumber}</h2>
        <div className="scroll-boxes">
            {chargements.map(chargement => (
                <div
                    key={chargement.id_chargement}
                    className={`box ${selectedChargement === chargement.id_chargement ? 'active' : ''} ${chargement.Statut?.toLowerCase().replace(' ', '-')}`}
                    onClick={() => handleBoxClick(chargement)}
                >
                    <div className="wagon-number">
                        {chargement.num_wag}
                    </div>
                    <div className="status-text">
                        {chargement.Statut}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

    return (
        <Sidebar>
            <Box m="30px">
                <Header
                    title="WAGON VISUALIZATION"
                    subtitle="List of wagon inside fours"
                />
                <button onClick={handleRefresh} style={{ marginBottom: '20px' }}>
                    Refresh Data
                </button>
                <div className="four-box-container">
                    {fourData.error ? (
                        <div className="error-message">{fourData.error}</div>
                    ) : fourData.loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="four-section-container">
                            {renderFourSection(3, fourData.four3)}
                            {renderFourSection(4, fourData.four4)}
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
                                <Button 
                                    onClick={handleCloseModal} 
                                    variant="contained" 
                                    style={{ marginTop: '20px' }}
                                >
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    </Fade>
                </Modal>
            </Box>
        </Sidebar>
    );
};

export default FourBoxViewer;