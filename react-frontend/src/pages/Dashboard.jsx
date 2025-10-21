import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Card, CardContent, Container, CircularProgress } from '@mui/material';
import axios from 'axios';
import SidebarChef from '../components/layout/SidebarChef.jsx';
import TotalPiecesChart from '../components/layout/TotalPiecesChart';
import WagonsRecap from "./Chargement/WagonsRecap.jsx";
import ShiftChart from '../components/layout/shiftChart.jsx';

const Header = ({ title, subtitle }) => (
  <Box mb="20px">
    <Typography variant="h5" fontWeight="bold" sx={{ m: "0 0 5px 0" }}>
      {title}
    </Typography>
    <Typography variant="subtitle1" color="textSecondary">
      {subtitle}
    </Typography>
  </Box>
);

const StatCard = ({ icon, value, title, loading }) => (
  <Card elevation={3} sx={cardStyle}>
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {loading ? <CircularProgress size={22} /> : (value || '0')}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardContent = () => {
  const [stats, setStats] = useState({
    num_utilisateur: null,
    num_famille: null,
    num_wagon: null,
    num_chargement: null,
    num_affectation: null,
    username: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Récupérer le token depuis localStorage comme dans ChefDashboard
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        // Rediriger vers la page de login si pas de token
        window.location.href = '/';
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:8000/api/statistiques');
        setStats(response.data);
      } catch (error) {
        console.error('API error:', error.response?.data || error.message);
        setError(error.response?.data?.message || error.message);
        
        // Si erreur 401 (non autorisé), rediriger vers login
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Icônes SVG
  const userIcon = (
    <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" style={{ width: 36, height: 36, color: '#1976d2' }}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4" />
    </svg>
  );

  const familyIcon = (
    <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" style={{ width: 36, height: 36, color: '#1976d2' }}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5" />
    </svg>
  );

  const wagonIcon = (
    <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" style={{ width: 36, height: 36, color: '#1976d2' }}>
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2M9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z" />
    </svg>
  );

  const chargementIcon = (
    <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" style={{ width: 36, height: 36, color: '#1976d2' }}>
      <path d="M14 10H3v2h11zm0-4H3v2h11zM3 16h7v-2H3zm11.41 6L17 19.41 19.59 22 21 20.59 18.41 18 21 15.41 19.59 14 17 16.59 14.41 14 13 15.41 15.59 18 13 20.59z" />
    </svg>
  );

  const affectationIcon = (
    <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" style={{ width: 36, height: 36, color: '#1976d2' }}>
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1M7 7h10V5h2v14H5V5h2zm6 6H7v-2h6zm2-4H7V7h8z" />
    </svg>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      
      <Header
          title="Dashboard"
          subtitle="Welcome back  to Sedap Admin!"
        />
      {error && (
        <Box mb={3} sx={{ color: 'error.main' }}>
          <Typography>Error loading statistics: {error}</Typography>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard 
            icon={userIcon}
            value={stats.num_utilisateur}
            title="Utilisateurs"
            loading={loading}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard 
            icon={familyIcon}
            value={stats.num_famille}
            title="Total Famille"
            loading={loading}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard 
            icon={wagonIcon}
            value={stats.num_wagon}
            title="Total Wagon"
            loading={loading}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard 
            icon={chargementIcon}
            value={stats.num_chargement}
            title="Total Chargement"
            loading={loading}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard 
            icon={affectationIcon}
            value={stats.num_affectation}
            title="Total Affectation"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts and other components remain the same */}
      {/* 
       */}

     

<Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', mt: 2, pb: 1 }}>
  <Card sx={{ minWidth: 600, height: '400px', flex: '0 0 auto' }}>
    <CardContent sx={{ p: 0.2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" color="primary" gutterBottom>
        Total pièces par jour
      </Typography>
      <Box sx={{ flex: 1, minHeight: '300px' }}>
        <TotalPiecesChart />
      </Box>
    </CardContent>
  </Card>

  
<Card sx={{ minWidth: 460, height: '400px', flex: '0 0 auto' }}>
  <CardContent sx={{ p: 0.2, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Typography variant="h6" color="primary" gutterBottom>
      Total pièces par shift (dernier 24H)
    </Typography>
    <Box sx={{ flex: 1, minHeight: '300px' }}>
      <ShiftChart />
    </Box>
  </CardContent>
</Card>

</Box>
<Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card elevation={3} sx={{ ...cardStyle, display: 'flex' }}>
            <CardContent sx={{ p: 2, height: '100%', width: '100%' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Recap pour 30 derniers wagons
              </Typography>
              <Box sx={{ height: 400, overflow: 'auto', maxHeight: 600 }}>
                <WagonsRecap />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



    </Container>
  );
};

const Dashboard = () => {
  return (
    <SidebarChef initialPath="/dashboard">
      <DashboardContent />
    </SidebarChef>
  );
};

const cardStyle = {
  height: '100%',
  borderRadius: 2,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
  },
};

export default Dashboard;