
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
// import Dashboard from './pages/Dashboard';
import UserManagement from './pages/Users/UserManagement';
import Enfourneur from './pages/Chargement/Enfourneur';
import ChefDashboard from './pages/ChefDashboard';
import Selection from './pages/Selection';
import Recap from './pages/Chargement/WagonsRecap';
import Logout from './pages/Logout';
import ManageUsers from './pages/Users/ManageUsers';
import Fours from './pages/Fours/Fours';
import Wagons from './pages/Wagons/Wagons';
import Wagon_Visualization from './pages/Wagons/Wagon_Visualization';
import History from './pages/Chargement/History';
import ManageUsersAdd from './pages/Users/ManageUsersAdd';
import ManageUsersEdit from './pages/Users/ManageUsersEdit';
import WagonAdd from './pages/Wagons/WagonAdd';
import WagonEdit from './pages/Wagons/WagonEdit';
import { AuthProvider } from './context/AuthContext';
import Familles from './pages/Familles/Familles';
import FamilleEdit from './pages/Familles/FamilleEdit';
import FamilleAdd from './pages/Familles/FamilleAdd';
import WagonVisualization from './pages/Wagons/WagonVisualization';
import HistoriqueChargement from './pages/Chargement/HistoriqueChargement';
import ChargementContent from './pages/ChargementContent';
import TrieursTable from './pages/TrieursTable';
import EnfourneurTable from './pages/EnfourneurTable';
import AffectationContent from './pages/AffectationContent';
import Cuiseur from './pages/Cuiseur';
import Recherche from './pages/Recherche';
import TypeWagons from './pages/Wagons/TypeWagons';
import TypeWagonEdit from './pages/Wagons/TypeWagonEdit';
import TypeWagonAdd from './pages/Wagons/TypeWagonAdd';
import ArchiveChargements from './pages/Chargement/ArchiveChargements';
import AuditLogs from './pages/AuditLogs';
import AnneauxPage from './pages/AnneauxPage';
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/users" element={<UserManagement />} />
        <Route path="/Enfourneur" element={<Enfourneur />} />
        <Route path="/ChefDashboard" element={<ChefDashboard />} />
<Route path="/logout" element={<Logout />} />
        <Route path="/settings/manage-users" element={<ManageUsers />} />
        <Route path="/settings/manage-users/add" element={<ManageUsersAdd />} />
        <Route path="/settings/manage-users/edit/:id" element={<ManageUsersEdit />} />
        <Route path="/settings/fours" element={<Fours />} />
        <Route path="/settings/wagons" element={<Wagons />} />
        <Route path="/settings/type-wagons" element={<TypeWagons/>}/>
        <Route path="/settings/type-wagons/edit/:id" element={<TypeWagonEdit/>}/>
        <Route path="/settings/type-wagons/add" element={<TypeWagonAdd/>}/>
        <Route path="/settings/wagons/add" element={<WagonAdd />} />
        <Route path="/settings/wagons/edit/:id" element={<WagonEdit />} />
        <Route path="/wagon_visualization" element={<Wagon_Visualization />} />
        <Route path="/history" element={<History />} />
        <Route path="/selection" element={<Selection />} />
        <Route path="/recap" element={<Recap />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
        <Route path="/settings/familles" element={<Familles />} />
        <Route path="/settings/familles/add" element={<FamilleAdd />} />
        <Route path="/settings/familles/edit/:id" element={< FamilleEdit />}/>
        <Route path="/WagonVisualization" element={<WagonVisualization />} />
        <Route path="/historique" element={<HistoriqueChargement/>}/>
        <Route path="/ChargementContent" element={<ChargementContent/>}/>
        <Route path= "/team/trieurs" element={<TrieursTable/>}/>
        <Route path= "/team/enfourneur" element={<EnfourneurTable/>}/>
        <Route path="/affectation" element={<AffectationContent/>}/>
        <Route path="/cuiseur" element={<Cuiseur />} />
        <Route path="/recherche" element={<Recherche/>}/>
        <Route path="/archives-chargements" element={<ArchiveChargements />} />
        <Route path='/auditlogs' element={<AuditLogs/>}/>
        <Route path='/anneaux' element={<AnneauxPage/>}/>
      </Routes>
    </AuthProvider>
  );
}

export default App;