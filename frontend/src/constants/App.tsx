import React, {useState, useEffect} from 'react'
import './styles/App.css'
import {
    Users,
    Calendar,
    FileText,
    Award,
    BarChart3,
    Home,
    Menu,
    X,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Download,
    User,
    LogOut,
    Bell,
    Settings
} from 'lucide-react'

import EmployeForm from "../components/EmployeForm.tsx";
import EmployeDetails from "../components/EmployeDetails.tsx";
import {employeService, type Employe, demandeCongeService, type DemandeConge, authService} from '../services/api';
import DemandeCongeForm from '../components/DemandeCongeForm';
import LoginForm from '../components/LoginForm';
import Documents from '../components/Documents';
import Talents from '../components/Talents';
import EtatService from '../components/EtatService';

interface MenuItem {
    id: string
    name: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}
function App() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState<string>('dashboard')
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [employes, setEmployes] = useState<Employe[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        checkAuth();
        loadEmployes();
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Erreur de vérification auth:', error);
            localStorage.removeItem('token');
        }
    }

    const handleLogin = (userData: any) => {
        setUser(userData);
        setIsAuthenticated(true);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    }

    const handleViewDetails = (employe: Employe) => {
        setSelectedEmploye(employe);
    };

    const handleEdit = (employe: Employe) => {
        setEditingEmploye(employe);
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingEmploye(null);
        setShowForm(true);
    };

    const handleSave = () => {
        loadEmployes();
        setShowForm(false);
        setEditingEmploye(null);
    };

    const loadEmployes = async () => {
        try {
            setLoading(true)
            const data = await employeService.getAllEmployes()
            setEmployes(data)
            setError('')
        } catch (err) {
            setError('Erreur lors du chargement des employés')
            console.error('Erreur:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (term: string) => {
        setSearchTerm(term)
        if (term.trim() === '') {
            await loadEmployes()
        } else {
            try {
                const results = await employeService.searchEmployes(term)
                setEmployes(results)
            } catch (err) {
                console.error('Erreur de recherche:', err)
            }
        }
    }

    const handleDeleteEmploye = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
            try {
                await employeService.deleteEmploye(id)
                setEmployes(employes.filter(e => e.id !== id))
            } catch (err) {
                setError('Erreur lors de la suppression')
                console.error('Erreur:', err)
            }
        }
    }

    const menuItems: MenuItem[] = [
        {id: 'dashboard', name: 'Tableau de bord', icon: Home},
        {id: 'employes', name: 'Employés', icon: Users},
        {id: 'conges', name: 'Congés', icon: Calendar},
        {id: 'documents', name: 'Documents', icon: FileText},
        {id: 'talents', name: 'Talents', icon: Award},
        {id: 'etat-service', name: 'État de service', icon: BarChart3}
    ]

    // -------------------------------
    // Sidebar
    // -------------------------------
    const Sidebar = () => (
        <div
            className={`fixed inset-y-0 left-0 z-50 bg-blue-900 text-white transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className="flex items-center justify-between h-16 px-4 bg-blue-800">
                {!sidebarCollapsed && (
                    <div className="flex items-center space-x-2">
                        <img src="/logo-fmc.png" alt="Logo FMC" className="h-8 w-8"/>
                        <span className="text-xl font-semibold">RH FMC</span>
                    </div>
                )}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 rounded hover:bg-blue-700"
                >
                    {sidebarCollapsed ? <Menu size={20}/> : <X size={20}/>}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        setCurrentPage(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center rounded-lg p-3 transition-colors ${
                                        currentPage === item.id
                                            ? 'bg-blue-800 text-white'
                                            : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                                    }`}
                                >
                                    <IconComponent/>
                                    {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-blue-800">
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-800">
                    <div className="bg-blue-700 p-2 rounded-full">
                        <User size={20}/>
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.username || 'Admin'}</p>
                            <p className="text-xs text-blue-200 truncate">{user?.email || 'admin@fmc.mg'}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="p-1 rounded hover:bg-blue-700"
                        title="Déconnexion"
                    >
                        <LogOut size={16}/>
                    </button>
                </div>
            </div>
        </div>
    )

    const Header = () => (
        <header className="bg-white shadow-sm lg:static lg:overflow-y-visible">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-between xl:grid xl:grid-cols-12 lg:gap-8">
                    <div className="flex md:absolute md:left-0 md:inset-y-0 lg:static xl:col-span-2">
                        <div className="flex-shrink-0 flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            >
                                <Menu className="h-6 w-6"/>
                            </button>
                            {sidebarCollapsed && (
                                <img src="/logo-fmc.png" alt="Logo FMC" className="h-8 w-8 ml-2"/>
                            )}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
                        <div
                            className="flex items-center px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
                            <div className="w-full">
                                <label htmlFor="search" className="sr-only">
                                    Rechercher
                                </label>
                                <div className="relative">
                                    <div
                                        className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <Search className="h-5 w-5 text-gray-400"/>
                                    </div>
                                    <input
                                        id="search"
                                        name="search"
                                        className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Rechercher un employé..."
                                        type="search"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                <Bell className="h-5 w-5"/>
                            </button>
                            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                <Settings className="h-5 w-5"/>
                            </button>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-700">Bienvenue, {user?.username || 'Admin'}</span>
                                {user?.photoProfil ? (
                                    <img
                                        src={`http://localhost:8080/uploads/${user.photoProfil}`}
                                        alt={user.username}
                                        className="h-8 w-8 rounded-full ml-2"
                                    />
                                ) : (
                                    <div
                                        className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs ml-2">
                                        {user?.username?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )

    const Dashboard = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Vue d'ensemble de la gestion des ressources humaines
                </p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5 flex items-center">
                        <Users className="h-6 w-6 text-gray-400"/>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Total Employés</p>
                            <p className="text-lg font-medium text-gray-900">
                                {employes.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5 flex items-center">
                        <Users className="h-6 w-6 text-green-400"/>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Employés Actifs</p>
                            <p className="text-lg font-medium text-gray-900">
                                {employes.filter((e) => e.statut === 'ACTIF').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5 flex items-center">
                        <Users className="h-6 w-6 text-red-400"/>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Employés Inactifs</p>
                            <p className="text-lg font-medium text-gray-900">
                                {employes.filter((e) => e.statut === 'INACTIF').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5 flex items-center">
                        <Calendar className="h-6 w-6 text-blue-400"/>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Congés en cours</p>
                            <p className="text-lg font-medium text-gray-900">
                                {employes.filter((e) => e.statut === 'EN_CONGE').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Employés récents</h3>
                    <div className="space-y-4">
                        {employes.slice(0, 3).map(employe => (
                            <div key={employe.id} className="flex items-center">
                                {employe.photoProfil ? (
                                    <img
                                        src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                        alt={`${employe.prenom} ${employe.nom}`}
                                        className="h-10 w-10 rounded-full object-cover mr-3"
                                    />
                                ) : (
                                    <div
                                        className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                        {employe.prenom[0]}{employe.nom[0]}
                                    </div>
                                )}
                                <div className="ml-4">
                                    <h4 className="text-sm font-medium text-gray-900">{employe.prenom} {employe.nom}</h4>
                                    <p className="text-sm text-gray-500">{employe.poste.replace('_', ' ')}</p>
                                </div>
                                <div className="ml-auto">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employe.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : employe.statut === 'INACTIF' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {employe.statut}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques des postes</h3>
                    <div className="space-y-3">
                        {Array.from(new Set(employes.map(e => e.poste))).map(poste => (
                            <div key={poste}>
                                <div className="flex justify-between text-sm text-gray-700 mb-1">
                                    <span>{poste.replace('_', ' ')}</span>
                                    <span>{employes.filter(e => e.poste === poste).length}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{width: `${(employes.filter(e => e.poste === poste).length / employes.length) * 100}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

    const Employes = () => (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Employés</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Gestion de tous les employés de l'organisation
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2"/>
                    Nouvel employé
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Photo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employé
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Matricule
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Poste
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {employes.map((employe) => (
                            <tr key={employe.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {employe.photoProfil ? (
                                        <img
                                            src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                            alt={`${employe.prenom} ${employe.nom}`}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {employe.prenom[0]}{employe.nom[0]}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div
                                                className="text-sm font-medium text-gray-900">{employe.prenom} {employe.nom}</div>
                                            <div className="text-sm text-gray-500">{employe.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employe.matricule}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employe.poste.replace('_', ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employe.telephone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            employe.statut === 'ACTIF'
                                                ? 'bg-green-100 text-green-800'
                                                : employe.statut === 'INACTIF'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {employe.statut}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <button
                                        onClick={() => handleViewDetails(employe)}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                        title="Voir détails"
                                    >
                                        <Eye className="h-4 w-4"/>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(employe)}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                        title="Modifier"
                                    >
                                        <Edit className="h-4 w-4"/>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEmploye(employe.id)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                        title="Imprimer"
                                    >
                                        <Download className="h-4 w-4"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedEmploye && (
                <EmployeDetails
                    employe={selectedEmploye}
                    onClose={() => setSelectedEmploye(null)}
                    onEdit={handleEdit}
                />
            )}

            {showForm && (
                <EmployeForm
                    employe={editingEmploye}
                    onClose={() => {
                        setShowForm(false);
                        setEditingEmploye(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    )

    const Conges = () => {
        const [showDemandeForm, setShowDemandeForm] = useState(false)
        const [demandes, setDemandes] = useState<DemandeConge[]>([])
        const [loading, setLoading] = useState(true)

        const loadDemandes = async () => {
            try {
                const data = await demandeCongeService.getAllDemandes()
                setDemandes(data)
            } catch (err) {
                console.error('Erreur:', err)
            } finally {
                setLoading(false)
            }
        }

        useEffect(() => {
            loadDemandes()
        }, [])

        const handleCreateDemande = () => {
            setShowDemandeForm(true)
        }

        return (
            <div className="space-y-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Gestion des congés</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Gestion des demandes de congés des employés
                        </p>
                    </div>
                    <button
                        onClick={handleCreateDemande}
                        className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2"/>
                        Nouvelle demande
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : demandes.length === 0 ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                        <div className="text-center py-12">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400"/>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune demande de congé</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Les demandes de congés apparaitront ici.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employé
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Période
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {demandes.map(demande => (
                                <tr key={demande.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {demande.employe?.photoProfil ? (
                                                <img
                                                    src={`http://localhost:8080/uploads/${demande.employe.photoProfil}`}
                                                    alt={`${demande.employe.prenom} ${demande.employe.nom}`}
                                                    className="h-8 w-8 rounded-full object-cover mr-3"
                                                />
                                            ) : (
                                                <div
                                                    className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                                                    {demande.employe?.prenom[0]}{demande.employe?.nom[0]}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {demande.employe?.prenom} {demande.employe?.nom}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {demande.employe?.matricule}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {demande.typeConge?.nom}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(demande.dateDebut).toLocaleDateString()} - {new Date(demande.dateFin).toLocaleDateString()}
                                        <br/>
                                        <span className="text-xs text-gray-500">
                                            ({demande.joursDemandes} jours)
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            demande.statut === 'APPROUVE' ? 'bg-green-100 text-green-800' :
                                                demande.statut === 'REJETE' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {demande.statut}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                                            <Eye className="h-4 w-4"/>
                                        </button>
                                        <button className="text-green-600 hover:text-green-900 mr-3">
                                            <Edit className="h-4 w-4"/>
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showDemandeForm && (
                    <DemandeCongeForm
                        onClose={() => setShowDemandeForm(false)}
                        onSave={() => {
                            setShowDemandeForm(false);
                            loadDemandes();
                        }}
                    />
                )}
            </div>
        )
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard/>
            case 'employes':
                return <Employes/>
            case 'conges':
                return <Conges/>
            case 'documents':
                return <Documents/>
            case 'talents':
                return <Talents/>
            case 'etat-service':
                return <EtatService/>
            default:
                return <Dashboard/>
        }
    }

    if (!isAuthenticated) {
        return <LoginForm onLogin={handleLogin}/>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar/>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header/>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    )
}

export default App