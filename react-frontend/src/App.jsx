
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
import TableauChargements from './pages/Chargement/TableauChargements';
import Controles from './pages/Controles/Controles';
import ControleAdd from './pages/Controles/ControleAdd';
import ControleEdit from './pages/Controles/ControleEdit';
import SaisieControles from './pages/Controles/SaisieControles';
import HistoriqueControles from './pages/Controles/HistoriqueControles';
import ProprieteGraphe from "./pages/ProprieteGraphe/ProprieteGraphe";
import ProprieteGrapheAdd from './pages/Proprietegraphe/ProprietegrapheAdd';
import ProprieteGrapheEdit from './pages/Proprietegraphe/ProprietegrapheEdit';
import Services from './pages/Services/Services';
import ServiceAdd from './pages/Services/ServiceAdd';
import ServiceEdit from './pages/Services/ServiceEdit';
import Essais from './pages/Essais/Essais';
import EssaiEdit from './pages/Essais/EssaiEdit';
import EssaiAdd from './pages/Essais/EssaiAdd';
import HistoriqueEssais from './pages/Essais/HistoriqueEssais';
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
        <Route path='/tableau_chargements' element={<TableauChargements/>}/>
        <Route path='/settings/controles' element={<Controles/>}/>
        <Route path='/settings/controles/add' element={<ControleAdd/>}/>
        <Route path='/settings/controles/edit/:id'element={<ControleEdit/>}/>
        <Route path="/controles/saisie" element={<SaisieControles />} />
        <Route path='/controles/historique' element={<HistoriqueControles/>}/>
        <Route path="/settings/propriete_graphe" element={<ProprieteGraphe />} />
        <Route path="/settings/propriete_graphe/add" element={<ProprieteGrapheAdd />} />
        <Route path="/settings/propriete_graphe/edit/:id" element={<ProprieteGrapheEdit />} />
        <Route path="/settings/services" element={<Services/>}/>
        <Route path="/settings/services/add" element={<ServiceAdd/>}/>
        <Route path="/settings/services/edit/:id" element={<ServiceEdit/>}/>
        <Route path="/settings/essais" element={<Essais/>}/>
        <Route path='/settings/essais/add' element={<EssaiAdd/>}/>
        <Route path="/settings/essais/edit/:id" element={<EssaiEdit/>}/>
        <Route path="/historique-essais" element={<HistoriqueEssais />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;