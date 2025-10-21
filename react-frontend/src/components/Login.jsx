import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert
} from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";

function Login() {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/api/login", {
        matricule,
        password,
      });

      const { token, user } = res.data;

      // Stocker le token et les informations utilisateur
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirection basée sur le rôle
      switch (user.role) {
        case "admin":
          navigate("/dashboard");
          break;
        case "chef d'equipe":
          navigate("/chefDashboard");
          break;
        case "enfourneur":
          navigate("/enfourneur");
          break;
        case "trieur":
          navigate("/trieur");
          break;
        case "jeune four":
          navigate("/jeuneFour");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Échec de la connexion. Veuillez vérifier vos identifiants."
      );
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <LockIcon 
          color="primary" 
          sx={{ 
            fontSize: 40, 
            alignSelf: "center",
            mb: 1
          }} 
        />
        
        <Typography 
          variant="h5" 
          component="h1" 
          align="center"
          gutterBottom
        >
          Connexion
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="matricule"
            label="Matricule"
            name="matricule"
            autoComplete="username"
            autoFocus
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Se connecter"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;