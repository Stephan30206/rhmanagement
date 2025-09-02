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
    Settings,
    AlertTriangle,
    Save,
    Lock,
    Globe,
    Building,
    CreditCard,
    Shield,
    Database,
    HardDrive
} from 'lucide-react'

import EmployeForm from "../components/EmployeForm.tsx";
import EmployeDetails from "../components/EmployeDetails.tsx";
import {employeService, type Employe, demandeCongeService, type DemandeConge, authService} from '../services/api';
import DemandeCongeForm from '../components/DemandeCongeForm';
import LoginForm from '../components/LoginForm.tsx';
import RegisterForm from "../components/RegisterForm.tsx";
import Documents from '../components/Documents';
import Talents from '../components/Talents';
import EtatService from '../components/EtatService';

// Error Boundary Component
class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center">
                            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                            <h2 className="text-lg font-semibold text-gray-900">Une erreur est survenue</h2>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            L'application a rencontré une erreur inattendue. Veuillez recharger la page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            Recharger la page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

interface MenuItem {
    id: string
    name: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

function App() {
    const [employes, setEmployes] = useState<Employe[]>([])
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState<string>('dashboard')
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<any>(null)
    const [showRegister, setShowRegister] = useState(false)

    // Ensure employes is always an array
    const safeEmployes = React.useMemo(() => {
        return Array.isArray(employes) ? employes : [];
    }, [employes]);

    const handleRegister = (userData: any) => {
        setUser(userData);
        setIsAuthenticated(true);
        setShowRegister(false);
    };

    useEffect(() => {
        checkAuth();
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            loadEmployes();
        }
    }, [isAuthenticated])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await authService.getCurrentUser();
                // Assurez-vous que le backend renvoie toutes les informations
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setLoading(false);
            }
        } catch (error) {
            console.error('Erreur de vérification auth:', error);
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
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
        setEmployes([]);
        setCurrentPage('dashboard');
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
            setEmployes(Array.isArray(data) ? data : [])
            setError('')
        } catch (err) {
            setError('Erreur lors du chargement des employés')
            setEmployes([])
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
                setEmployes(Array.isArray(results) ? results : [])
            } catch (err) {
                console.error('Erreur de recherche:', err)
                setEmployes([])
            }
        }
    }

    const handleDeleteEmploye = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
            try {
                await employeService.deleteEmploye(id)
                setEmployes(prev => Array.isArray(prev) ? prev.filter(e => e.id !== id) : [])
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
        {id: 'etat-service', name: 'État de service', icon: BarChart3},
        {id: 'parametres', name: 'Paramètres', icon: Settings},
        {id: 'profil', name: 'Mon Profil', icon: User}
    ]

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

    const Profil = () => {
        if (!user) return null;

        const [activeTab, setActiveTab] = useState('informations');
        const [isEditing, setIsEditing] = useState(false);
        const [formData, setFormData] = useState({
            prenom: user.prenom || '',
            nom: user.nom || '',
            username: user.nom_utilisateur || user.username || '',
            email: user.email || '',
            telephone: user.telephone || '',
            poste: user.poste || '',
            departement: user.departement || '',
            adresse: user.adresse || '',
            dateNaissance: user.date_naissance || user.dateNaissance || '',
            genre: user.genre || ''
        });

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleSaveProfile = async () => {
            try {
                // Appel API pour mettre à jour le profil
                await authService.updateProfile(formData);

                // Mettre à jour l'utilisateur localement
                setUser({ ...user, ...formData });
                setIsEditing(false);

                alert('Profil mis à jour avec succès!');
            } catch (error) {
                console.error('Erreur lors de la mise à jour du profil:', error);
                alert('Erreur lors de la mise à jour du profil');
            }
        };

        const handleCancelEdit = () => {
            setFormData({
                prenom: user.prenom || '',
                nom: user.nom || '',
                username: user.nom_utilisateur || user.username || '',
                email: user.email || '',
                telephone: user.telephone || '',
                poste: user.poste || '',
                departement: user.departement || '',
                adresse: user.adresse || '',
                dateNaissance: user.date_naissance || user.dateNaissance || '',
                genre: user.genre || ''
            });
            setIsEditing(false);
        };

        const handleChangePassword = async () => {
            const newPassword = prompt('Entrez votre nouveau mot de passe:');
            if (newPassword) {
                try {
                    await authService.changePassword(user.id, newPassword);
                    alert('Mot de passe changé avec succès!');
                } catch (error) {
                    console.error('Erreur lors du changement de mot de passe:', error);
                    alert('Erreur lors du changement de mot de passe');
                }
            }
        };

        const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('photo', file);

                    const updatedUser = await authService.uploadProfilePhoto(user.id, formData);
                    setUser(updatedUser);
                    alert('Photo de profil mise à jour avec succès!');
                } catch (error) {
                    console.error('Erreur lors de l\'upload de la photo:', error);
                    alert('Erreur lors de l\'upload de la photo');
                }
            }
        };

        const handleExportData = () => {
            const dataStr = JSON.stringify(user, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = `donnees-personnelles-${user.nom_utilisateur || user.username}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };

        // Récupérer les informations de l'employé si l'utilisateur est lié à un employé
        const [employeData, setEmployeData] = useState<any>(null);
        useEffect(() => {
            if (user.employe_id) {
                employeService.getEmployeById(user.employe_id)
                    .then(data => setEmployeData(data))
                    .catch(error => console.error('Erreur lors du chargement des données employé:', error));
            }
        }, [user.employe_id]);

        return (
            <ErrorBoundary>
                <div className="space-y-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Mon Profil</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Gestion de vos informations personnelles et paramètres du compte
                            </p>
                        </div>
                        <div className="flex space-x-3 mt-4 sm:mt-0">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="inline-flex items-center px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Enregistrer
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="inline-flex items-center px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier le profil
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation par onglets */}
                    <div className="bg-white shadow-sm rounded-lg">
                        <nav className="flex space-x-8 px-6 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('informations')}
                                className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                    activeTab === 'informations'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Informations Personnelles
                            </button>
                            <button
                                onClick={() => setActiveTab('professionnel')}
                                className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                    activeTab === 'professionnel'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Informations Professionnelles
                            </button>
                            <button
                                onClick={() => setActiveTab('securite')}
                                className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                    activeTab === 'securite'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Sécurité
                            </button>
                        </nav>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-6 py-8">
                            {/* En-tête avec photo */}
                            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 mb-8">
                                <div className="relative">
                                    {user.photo_profil ? (
                                        <img
                                            src={`http://localhost:8080/uploads/${user.photo_profil}`}
                                            alt={user.nom_utilisateur || user.username}
                                            className="h-32 w-32 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                                        />
                                    ) : (
                                        <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-blue-100 shadow-lg">
                                            {user.prenom?.[0]?.toUpperCase() || ''}{user.nom?.[0]?.toUpperCase() || 'A'}
                                        </div>
                                    )}
                                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                        <Edit className="h-4 w-4" />
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleUploadPhoto}
                                        />
                                    </label>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {user.prenom} {user.nom}
                                    </h1>
                                    <p className="text-gray-600 text-lg">@{user.nom_utilisateur || user.username}</p>
                                    <p className="text-sm text-gray-500 mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block">
                                        {user.poste || 'Non spécifié'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        {user.role || 'Utilisateur'}
                                    </span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {user.actif ? 'ACTIF' : 'INACTIF'}
                                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu des onglets */}
                            {activeTab === 'informations' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations Personnelles</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="prenom"
                                                        value={formData.prenom}
                                                        onChange={handleInputChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.prenom || 'Non renseigné'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="nom"
                                                        value={formData.nom}
                                                        onChange={handleInputChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.nom || 'Non renseigné'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.email || 'Non renseigné'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        name="telephone"
                                                        value={formData.telephone}
                                                        onChange={handleInputChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.telephone || 'Non renseigné'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Détails Personnels</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        name="dateNaissance"
                                                        value={formData.dateNaissance}
                                                        onChange={handleInputChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {user.date_naissance ? new Date(user.date_naissance).toLocaleDateString('fr-FR') : 'Non renseigné'}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                                {isEditing ? (
                                                    <textarea
                                                        name="adresse"
                                                        value={formData.adresse}
                                                        onChange={handleInputChange}
                                                        rows={3}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.adresse || 'Non renseigné'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'professionnel' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations Professionnelles</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="poste"
                                                        value={formData.poste}
                                                        onChange={handleInputChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.poste || 'Non renseigné'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                                <p className="text-gray-900 bg-gray-50 p-2 rounded capitalize">{user.role?.toLowerCase() || 'Utilisateur'}</p>
                                            </div>

                                            {employeData && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
                                                        <p className="text-gray-900 bg-gray-50 p-2 rounded">{employeData.matricule || 'Non attribué'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                                        <p className="text-gray-900 bg-gray-50 p-2 rounded">{employeData.statut || 'Non spécifié'}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations du Compte</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                                                <p className="text-gray-900 bg-gray-50 p-2 rounded">@{user.nom_utilisateur || user.username}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                                                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                                                    {user.date_creation ? new Date(user.date_creation).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'Non disponible'}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Statut du compte</label>
                                                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                                                    {user.actif ? 'Actif' : 'Inactif'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'securite' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Sécurité du Compte</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 p-6 rounded-lg">
                                            <h4 className="text-md font-medium text-blue-900 mb-4">Changer le mot de passe</h4>
                                            <p className="text-sm text-blue-800 mb-4">
                                                Mettez à jour votre mot de passe régulièrement pour maintenir la sécurité de votre compte.
                                            </p>
                                            <button
                                                onClick={handleChangePassword}
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                <Lock className="h-4 w-4 mr-2" />
                                                Changer le mot de passe
                                            </button>
                                        </div>

                                        <div className="bg-purple-50 p-6 rounded-lg">
                                            <h4 className="text-md font-medium text-purple-900 mb-4">Export des données</h4>
                                            <p className="text-sm text-purple-800 mb-4">
                                                Téléchargez une copie de toutes vos données personnelles.
                                            </p>
                                            <button
                                                onClick={handleExportData}
                                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Exporter mes données
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    };

    const Header = () => (
        <header className="bg-white shadow-sm lg:static lg:overflow-y-visible">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    {/* Partie gauche - Menu burger + Barre de recherche */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <Menu className="h-6 w-6"/>
                        </button>

                        {/* Barre de recherche */}
                        <div className="w-64 lg:w-80">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
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

                    {/* Partie droite - Notifications + Paramètres + Profil + Logo FMC */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications et paramètres */}
                        <div className="hidden lg:flex items-center space-x-2">
                            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100" title="Notifications">
                                <Bell className="h-5 w-5"/>
                            </button>
                            <button
                                onClick={() => setCurrentPage('parametres')}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                title="Paramètres"
                            >
                                <Settings className="h-5 w-5"/>
                            </button>
                        </div>

                        {/* Profil utilisateur - navigation vers la page profil */}
                        <button
                            onClick={() => setCurrentPage('profil')}
                            className="flex items-center space-x-3 bg-blue-50 rounded-full px-3 py-2 border border-blue-200 hover:bg-blue-100 transition-colors"
                            title="Aller au profil"
                        >
                            {user?.photoProfil ? (
                                <img
                                    src={`http://localhost:8080/uploads/${user.photoProfil}`}
                                    alt={`${user.prenom} ${user.nom}`}
                                    className="h-9 w-9 rounded-full object-cover border-2 border-blue-400 shadow-sm"
                                />
                            ) : (
                                <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-blue-400 shadow-sm">
                                    {((user?.prenom?.[0] || '') + (user?.nom?.[0] || '')).toUpperCase() || 'A'}
                                </div>
                            )}
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                                <p className="text-xs text-blue-600 truncate max-w-32">{user?.poste}</p>
                            </div>
                        </button>

                        {/* Logo et nom FMC
                        <div className="flex items-center space-x-3 bg-green-50 rounded-full px-3 py-2 border border-green-200">
                            {/* Logo FMC - votre logo personnalisé
                            <img
                                src="/logo-fmc.png"
                                alt="Logo FMC"
                                className="h-9 w-9 rounded-full object-cover shadow-sm"
                                onError={(e) => {
                                    // Fallback si le logo ne charge pas
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTgiIGZpbGw9IiMxNjgzNzUiLz4KPHR0ZXh0IHg9IjE4IiB5PSIyMyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZNQzwvdGV4dD4KPC9zdmc+';
                                }}
                            />
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900">FMC</p>
                                <p className="text-xs text-green-600">FEDERATION MADAGASCAR CENTRE</p>
                            </div>
                        </div>
                        */}
                    </div>
                </div>
            </div>
        </header>
    )

    const Dashboard = () => {
        // Use the memoized safe array
        const totalEmployes = safeEmployes.length;
        const employesActifs = safeEmployes.filter(e => e.statut === 'ACTIF').length;
        const employesInactifs = safeEmployes.filter(e => e.statut === 'INACTIF').length;
        const employesEnConge = safeEmployes.filter(e => e.statut === 'EN_CONGE').length;
        const employesRecents = safeEmployes.slice(0, 3);
        const postes = [...new Set(safeEmployes.map(e => e.poste).filter(Boolean))];

        return (
            <ErrorBoundary>
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-8 border border-blue-100">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-500 rounded-full p-3">
                                <Home className="h-8 w-8 text-white"/>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">BIENVENUE !</h1>
                                <p className="text-lg text-gray-600">Système de gestion RH - FMC</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-light">{new Date().toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</div>
                        </div>
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
                                    <p className="text-lg font-medium text-gray-900">{totalEmployes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5 flex items-center">
                                <Users className="h-6 w-6 text-green-400"/>
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">Employés Actifs</p>
                                    <p className="text-lg font-medium text-gray-900">{employesActifs}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5 flex items-center">
                                <Users className="h-6 w-6 text-red-400"/>
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">Employés Inactifs</p>
                                    <p className="text-lg font-medium text-gray-900">{employesInactifs}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5 flex items-center">
                                <Calendar className="h-6 w-6 text-blue-400"/>
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">Congés en cours</p>
                                    <p className="text-lg font-medium text-gray-900">{employesEnConge}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Employés récents</h3>
                            <div className="space-y-4">
                                {employesRecents.length > 0 ? employesRecents.map(employe => (
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
                                                {(employe.prenom?.[0] || '') + (employe.nom?.[0] || '')}
                                            </div>
                                        )}
                                        <div className="ml-4">
                                            <h4 className="text-sm font-medium text-gray-900">{employe.prenom} {employe.nom}</h4>
                                            <p className="text-sm text-gray-500">{employe.poste?.replace('_', ' ')}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    employe.statut === 'ACTIF' ? 'bg-green-100 text-green-800' :
                                                        employe.statut === 'INACTIF' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {employe.statut}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500">Aucun employé trouvé</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques des postes</h3>
                            <div className="space-y-3">
                                {postes.length > 0 ? postes.map(poste => {
                                    const count = safeEmployes.filter(e => e.poste === poste).length;
                                    const percentage = totalEmployes > 0 ? (count / totalEmployes) * 100 : 0;

                                    return (
                                        <div key={poste}>
                                            <div className="flex justify-between text-sm text-gray-700 mb-1">
                                                <span>{poste?.replace('_', ' ')}</span>
                                                <span>{count}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{width: `${percentage}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-sm text-gray-500">Aucune statistique disponible</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    };

    const Employes = () => (
        <ErrorBoundary>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {safeEmployes.map((employe) => (
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
                                                {(employe.prenom?.[0] || '') + (employe.nom?.[0] || '')}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employe.poste?.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employe.telephone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            employe.statut === 'ACTIF' ? 'bg-green-100 text-green-800' :
                                                employe.statut === 'INACTIF' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                        }`}>
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
                        {safeEmployes.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400"/>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun employé</h3>
                                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouvel employé.</p>
                            </div>
                        )}
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
        </ErrorBoundary>
    )

    const Conges = () => {
        const [showDemandeForm, setShowDemandeForm] = useState(false)
        const [demandes, setDemandes] = useState<DemandeConge[]>([])
        const [loading, setLoading] = useState(true)

        const loadDemandes = async () => {
            try {
                const data = await demandeCongeService.getAllDemandes()
                setDemandes(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Erreur:', err)
                setDemandes([])
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
            <ErrorBoundary>
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
                                                        {(demande.employe?.prenom?.[0] || '') + (demande.employe?.nom?.[0] || '')}
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
                                            {demande.typeConge?.nom || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(demande.dateDebut).toLocaleDateString()} - {new Date(demande.dateFin).toLocaleDateString()}
                                            <br/>
                                            <span className="text-xs text-gray-500">
                                                ({demande.joursDemandes || 0} jours)
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
            </ErrorBoundary>
        )
    }

    const Parametres = () => {
        const [activeTab, setActiveTab] = useState('general');
        const [settings, setSettings] = useState({
            general: {
                nomOrganisation: "FMC - Fédération Madagascar Centre",
                adresse: "Lot II C 25 Ambohimangakely",
                email: "contact@fmc.mg",
                telephone: "+261 34 00 000 00",
                langue: "fr",
                fuseauHoraire: "Indian/Antananarivo"
            },
            utilisateurs: {
                roles: [
                    { id: 1, nom: "Administrateur", permissions: ["all"] },
                    { id: 2, nom: "RH", permissions: ["employes", "conges", "documents"] },
                    { id: 3, nom: "Manager", permissions: ["employes", "conges"] },
                    { id: 4, nom: "Employé", permissions: ["profil"] }
                ]
            },
            rh: {
                typesContrat: ["CDI", "CDD", "Stage", "Mission"],
                politiquesConges: {
                    annuel: 25,
                    maladie: 15,
                    maternite: 14,
                    paternite: 3
                }
            },
            paie: {
                modeCalcul: "fixe",
                methodesPaiement: ["Virement", "Espèces", "Chèque"]
            },
            securite: {
                complexiteMdp: 8,
                dureeValiditeMdp: 90,
                connexionsSimultanees: 1
            }
        });

        const handleSaveSettings = () => {
            // Ici, vous pourriez envoyer les paramètres au backend
            alert("Paramètres sauvegardés avec succès!");
        };

        return (
            <ErrorBoundary>
                <div className="space-y-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Paramètres</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Configuration du système RH FMC
                            </p>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            <Save className="h-4 w-4 mr-2"/>
                            Sauvegarder
                        </button>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8 px-6">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                        activeTab === 'general'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Globe className="h-4 w-4 inline mr-2" />
                                    Général
                                </button>
                                <button
                                    onClick={() => setActiveTab('utilisateurs')}
                                    className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                        activeTab === 'utilisateurs'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Users className="h-4 w-4 inline mr-2" />
                                    Utilisateurs
                                </button>
                                <button
                                    onClick={() => setActiveTab('rh')}
                                    className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                        activeTab === 'rh'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Building className="h-4 w-4 inline mr-2" />
                                    Paramètres RH
                                </button>
                                <button
                                    onClick={() => setActiveTab('paie')}
                                    className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                        activeTab === 'paie'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <CreditCard className="h-4 w-4 inline mr-2" />
                                    Paie
                                </button>
                                <button
                                    onClick={() => setActiveTab('securite')}
                                    className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                        activeTab === 'securite'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Shield className="h-4 w-4 inline mr-2" />
                                    Sécurité
                                </button>
                                <button
                                    onClick={() => setActiveTab('sauvegarde')}
                                    className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                        activeTab === 'sauvegarde'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Database className="h-4 w-4 inline mr-2" />
                                    Sauvegarde
                                </button>
                            </nav>
                        </div>

                        <div className="px-6 py-8">
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Paramètres généraux</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nom de l'organisation</label>
                                            <input
                                                type="text"
                                                value={settings.general.nomOrganisation}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    general: {...settings.general, nomOrganisation: e.target.value}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Adresse</label>
                                            <input
                                                type="text"
                                                value={settings.general.adresse}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    general: {...settings.general, adresse: e.target.value}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={settings.general.email}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    general: {...settings.general, email: e.target.value}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                                            <input
                                                type="text"
                                                value={settings.general.telephone}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    general: {...settings.general, telephone: e.target.value}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Langue</label>
                                            <select
                                                value={settings.general.langue}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    general: {...settings.general, langue: e.target.value}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="fr">Français</option>
                                                <option value="mg">Malagasy</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fuseau horaire</label>
                                            <select
                                                value={settings.general.fuseauHoraire}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    general: {...settings.general, fuseauHoraire: e.target.value}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="Indian/Antananarivo">Antananarivo (UTC+3)</option>
                                                <option value="UTC">UTC</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'utilisateurs' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h3>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-md font-medium text-gray-700 mb-4">Rôles et permissions</h4>

                                        <div className="space-y-4">
                                            {settings.utilisateurs.roles.map((role) => (
                                                <div key={role.id} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
                                                    <div>
                                                        <span className="font-medium">{role.nom}</span>
                                                        <p className="text-sm text-gray-500">
                                                            Permissions: {role.permissions.join(', ')}
                                                        </p>
                                                    </div>
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none">
                                            <Plus className="h-4 w-4 mr-1" />
                                            Ajouter un rôle
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rh' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Paramètres RH</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="text-md font-medium text-blue-900 mb-4">Types de contrats</h4>
                                            <ul className="space-y-2">
                                                {settings.rh.typesContrat.map((type, index) => (
                                                    <li key={index} className="flex items-center">
                                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                            {type}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="text-md font-medium text-green-900 mb-4">Politiques de congés (jours/an)</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span>Congés annuels</span>
                                                    <span className="font-medium">{settings.rh.politiquesConges.annuel} jours</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Congés maladie</span>
                                                    <span className="font-medium">{settings.rh.politiquesConges.maladie} jours</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Congés maternité</span>
                                                    <span className="font-medium">{settings.rh.politiquesConges.maternite} jours</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Congés paternité</span>
                                                    <span className="font-medium">{settings.rh.politiquesConges.paternite} jours</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'paie' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Paramètres de paie</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mode de calcul</label>
                                            <select
                                                value={settings.paie.modeCalcul}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    paie: {...settings.paie, modeCalcul: e.target.value}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="fixe">Salaire fixe</option>
                                                <option value="pourcentage">Pourcentage + fixe</option>
                                                <option value="variable">Variable selon objectifs</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Méthodes de paiement</label>
                                            <div className="mt-2 space-y-2">
                                                {settings.paie.methodesPaiement.map((methode, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`methode-${index}`}
                                                            defaultChecked
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor={`methode-${index}`} className="ml-2 block text-sm text-gray-700">
                                                            {methode}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'securite' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Paramètres de sécurité</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Complexité des mots de passe</label>
                                            <select
                                                value={settings.securite.complexiteMdp}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    securite: {...settings.securite, complexiteMdp: parseInt(e.target.value)}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="6">6 caractères minimum</option>
                                                <option value="8">8 caractères minimum</option>
                                                <option value="12">12 caractères minimum</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Durée de validité des mots de passe (jours)</label>
                                            <input
                                                type="number"
                                                value={settings.securite.dureeValiditeMdp}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    securite: {...settings.securite, dureeValiditeMdp: parseInt(e.target.value)}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Connexions simultanées autorisées</label>
                                            <input
                                                type="number"
                                                value={settings.securite.connexionsSimultanees}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    securite: {...settings.securite, connexionsSimultanees: parseInt(e.target.value)}
                                                })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'sauvegarde' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Sauvegarde et restauration</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="text-md font-medium text-blue-900 mb-4">Sauvegarde des données</h4>
                                            <p className="text-sm text-blue-800 mb-4">
                                                Créez une copie de sauvegarde de toutes les données du système.
                                            </p>
                                            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                                <HardDrive   className="h-4 w-4 mr-1" />
                                                Créer une sauvegarde
                                            </button>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="text-md font-medium text-green-900 mb-4">Restauration</h4>
                                            <p className="text-sm text-green-800 mb-4">
                                                Restaurez les données à partir d'une sauvegarde précédente.
                                            </p>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    id="backup-file"
                                                />
                                                <label htmlFor="backup-file" className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                                    <Database className="h-4 w-4 mr-1" />
                                                    Choisir un fichier
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <h4 className="text-md font-medium text-yellow-900 mb-2">Dernières sauvegardes</h4>
                                        <div className="text-sm text-yellow-800">
                                            <p>Aucune sauvegarde disponible</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    };

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
            case 'parametres':
                return <Parametres/>
            case 'profil':
                return <Profil/>
            default:
                return <Dashboard/>
        }
    }

    // Mise à jour : Correction de la condition d'authentification
    if (!isAuthenticated) {
        if (showRegister) {
            return <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />;
        } else {
            return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
        }
    }

    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
    )
}

// @ts-ignore
export default App