import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkLoggedIn = async () => {
      try {
        const userData = await authService.getCurrentUser();
        console.log('Utilisateur connecté:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Utilisateur non connecté', error)
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  const login = async (matricule, nom) => {
    try {
      const userData = await authService.login(matricule, nom);
      setUser(userData)
      return userData
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error)
    }
  }

  const value = {
    user,
    loading,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
