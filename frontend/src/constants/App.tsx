import React, {useState, useEffect} from 'react'
import './styles/App.css'
import CongesChecker from '../components/CongesChecker';
import { demandeCongeService } from '../services/api';
import {
    Users,
    Clock,
    Calendar,
    FileText,
    Award,
    BarChart3,
    Home,
    Menu,
    X,
    Church,
    Plus,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    User,
    LogOut,
    Bell,
    AlertTriangle,
    Lock,
    XCircle,
    Camera,
    Search
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";


import EmployeForm from "../components/EmployeForm.tsx";
import EmployeDetails from "../components/EmployeDetails.tsx";
import {employeService, type Employe, authService} from '../services/api';
import DemandeCongeForm from '../components/DemandeCongeForm';
import LoginForm from '../components/LoginForm.tsx';
import RegisterForm from "../components/RegisterForm.tsx";
import Documents from '../components/Documents';
import Talents from '../components/Talents';
import EtatService from '../components/EtatService';
import api from "../services/api";
import AbsenceList from '../components/AbsenceList'; // Nouvel import
import AbsenceForm from '../components/AbsenceForm';
import CarrierePastoralePage from '../components/CarrierePastoralePage';

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
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null)
    const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<any>(null)
    const [showRegister, setShowRegister] = useState(false)
    const [showDetails, setShowDetails] = useState(false);
    const [showEmployeForm, setShowEmployeForm] = useState(false);

// Modifiez les handlers
    const handleViewDetails = (employe: Employe) => {
        setSelectedEmploye(employe);
        setShowDetails(true);
        setShowEmployeForm(false);
        // Scroll vers le haut pour voir les détails
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (employe: Employe) => {
        setEditingEmploye(employe);
        setShowEmployeForm(true);
        setShowDetails(false);
        // Scroll vers le haut pour voir le formulaire
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreate = () => {
        setEditingEmploye(null);
        setShowEmployeForm(true);
        setShowDetails(false);
        // Scroll vers le haut pour voir le formulaire
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = () => {
        loadEmployes();
        setShowEmployeForm(false);
        setShowDetails(false);
        setEditingEmploye(null);
        setSelectedEmploye(null);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedEmploye(null);
    };

    const handleCloseForm = () => {
        setShowEmployeForm(false);
        setEditingEmploye(null);
    };

    // Ensure employes is always an array
    const safeEmployes = React.useMemo(() => {
        return Array.isArray(employes) ? employes : [];
    }, [employes]);

    // Ajoutez au début de votre composant
    useEffect(() => {
        const savedPage = localStorage.getItem('currentPage');
        if (savedPage) {
            setCurrentPage(savedPage);
        }
    }, []);

    const handleRegister = (userData: any) => {
        setUser(userData);
        setIsAuthenticated(true);
        setShowRegister(false);
    };

    useEffect(() => {
        if (isAuthenticated && safeEmployes.length > 0) {
            // Vérification périodique des congés (toutes les heures)
            const interval = setInterval(() => {
                safeEmployes.forEach(async (employe) => {
                    try {
                        await employeService.updateStatutFromConge(employe.id);
                    } catch (error) {
                        console.error(`Erreur mise à jour statut employé ${employe.id}:`, error);
                    }
                });
                // Recharger la liste après mise à jour
                loadEmployes();
            }, 60 * 60 * 1000); // 1 heure

            return () => clearInterval(interval);
        }
    }, [isAuthenticated, safeEmployes.length]);

    // Modifiez votre useEffect pour checkAuth
    useEffect(() => {
        const initAuth = async () => {
            try {
                setLoading(true);
                await checkAuth();
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);


// Modifiez checkAuth pour utiliser cette fonction

    const checkAuth = async (): Promise<boolean> => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            console.log('🔐 Vérification auth - Token:', token ? 'présent' : 'absent');
            console.log('👤 Utilisateur stocké:', storedUser ? 'présent' : 'absent');

            if (!token) {
                console.log('❌ Aucun token trouvé');
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }

            // Vérification de la structure du token
            if (token.split('.').length !== 3) {
                console.log('❌ Token mal formaté');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }

            // Vérification expiration
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const isExpired = payload.exp * 1000 < Date.now();

                if (isExpired) {
                    console.log('⏰ Token expiré');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                    setUser(null);
                    return false;
                }
            } catch (tokenError) {
                console.error('❌ Token invalide:', tokenError);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }

            // Tentative de récupération du profil
            try {
                const userData = await authService.getCurrentUser();
                console.log('✅ Profil récupéré avec succès:', userData);
                setUser(userData);
                setIsAuthenticated(true);

                // Mettre à jour le stockage local
                localStorage.setItem('user', JSON.stringify(userData));

                return true;
            } catch (userError: any) {
                console.error('❌ Erreur récupération utilisateur:', userError);

                // Si erreur 400/401, utiliser les données stockées en fallback
                if (userError.response?.status === 400 || userError.response?.status === 401) {
                    console.warn('⚠️ Utilisation des données utilisateur stockées en fallback');

                    if (storedUser) {
                        try {
                            const user = JSON.parse(storedUser);
                            setUser(user);
                            setIsAuthenticated(true);
                            return true;
                        } catch (parseError) {
                            console.error('❌ Erreur parsing stored user:', parseError);
                        }
                    }
                }

                // Déconnexion si échec
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }

        } catch (error) {
            console.error('❌ Erreur vérification auth:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }
    };

    // Ajoutez cette fonction dans App.tsx
    const setupAuthInterceptor = () => {
        api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Déconnexion automatique
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setUser(null);
                    setCurrentPage('dashboard');
                }
                return Promise.reject(error);
            }
        );
    };

// Utilisez-le dans useEffect
    useEffect(() => {
        setupAuthInterceptor();
    }, []);

// Ajouter cette fonction utilitaire dans App.tsx (en dehors du composant principal)
    const checkTokenExpiration = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiration = new Date(payload.exp * 1000);
            const now = new Date();
            const daysLeft = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            console.log('Jours restants:', daysLeft.toFixed(1));
        } catch (error) {
            console.error('Erreur analyse token:', error);
        }
    };

// Dans votre composant App, ajouter cet useEffect
    useEffect(() => {
        if (isAuthenticated) {
            // Vérifier la durée du token après connexion
            checkTokenExpiration();

            // Vérifier périodiquement
            const interval = setInterval(() => {
                checkTokenExpiration();
            }, 300000); // Toutes les 5 minutes

            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            loadEmployes();
        }
    }, [isAuthenticated])

    {/*
        const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
                setLoading(false);
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
    */}

// Appelez cette fonction après la connexion
    const handleLogin = async (userData: any) => {
        try {
            setUser(userData.user || userData);
            setIsAuthenticated(true);

            // Vérifier la durée du token après connexion
            setTimeout(() => {
                checkTokenExpiration();
            }, 1000);

        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setEmployes([]);
        setCurrentPage('dashboard');
    }

// Fonction pour vérifier et mettre à jour automatiquement les statuts de congé
    const verifierEtMettreAJourStatutConges = async () => {
        try {
            const aujourdhui = new Date().toISOString().split('T')[0];

            for (const employe of safeEmployes) {
                try {
                    // Récupérer les demandes de congé de l'employé
                    const demandes = await demandeCongeService.getByEmployeId(employe.id);

                    // Vérifier s'il y a un congé actif
                    const congeActif = demandes.find(demande =>
                        demande.statut === 'APPROUVE' &&
                        demande.dateDebut <= aujourdhui &&
                        demande.dateFin >= aujourdhui
                    );

                    // Mettre à jour le statut si nécessaire
                    if (congeActif && employe.statut !== 'EN_CONGE') {
                        console.log(`Mise à jour automatique: ${employe.prenom} ${employe.nom} -> EN_CONGE`);
                        await employeService.updateEmploye(employe.id, {
                            statut: 'EN_CONGE'
                        });
                    } else if (!congeActif && employe.statut === 'EN_CONGE') {
                        console.log(`Mise à jour automatique: ${employe.prenom} ${employe.nom} -> ACTIF`);
                        await employeService.updateEmploye(employe.id, {
                            statut: 'ACTIF'
                        });
                    }
                } catch (employeError) {
                    console.error(`Erreur pour l'employé ${employe.id}:`, employeError);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des congés:', error);
        }
    };
    
    // Modifiez la fonction loadEmployes existante :
    const loadEmployes = async () => {
        try {
            setLoading(true)
            const data = await employeService.getAllEmployes()
            setEmployes(Array.isArray(data) ? data : [])
            setError('')

            // Vérifier et mettre à jour les statuts de congé après le chargement
            if (Array.isArray(data) && data.length > 0) {
                setTimeout(() => {
                    verifierEtMettreAJourStatutConges();
                }, 1000); // Petit délai pour éviter trop de requêtes simultanées
            }
        } catch (err) {
            setError('Erreur lors du chargement des employés')
            setEmployes([])
            console.error('Erreur:', err)
        } finally {
            setLoading(false)
        }
    }

    // Ajoutez cet useEffect après les autres useEffect existants :
    useEffect(() => {
        if (isAuthenticated && safeEmployes.length > 0) {
            // Vérification périodique des congés (toutes les 5 minutes)
            const interval = setInterval(() => {
                verifierEtMettreAJourStatutConges().then(() => {
                    // Recharger la liste après mise à jour pour refléter les changements
                    loadEmployes();
                });
            }, 5 * 60 * 1000); // 5 minutes

            return () => clearInterval(interval);
        }
    }, [isAuthenticated, safeEmployes.length]);

    // Ajoutez aussi cette fonction pour vérifier les congés terminés (optionnel)
    const verifierCongesTermines = async () => {
        try {
            const employesAvecCongesTermines = await employeService.checkCongesTermines();

            if (employesAvecCongesTermines.length > 0) {
                console.log('Congés terminés détectés:', employesAvecCongesTermines);

                // Mettre à jour les statuts automatiquement
                for (const emp of employesAvecCongesTermines) {
                    try {
                        await employeService.mettreEmployeActif(emp.employeId);
                    } catch (error) {
                        console.error(`Erreur mise à jour employé ${emp.employeId}:`, error);
                    }
                }

                // Recharger la liste
                await loadEmployes();
            }
        } catch (error) {
            console.error('Erreur vérification congés terminés:', error);
        }
    };

    // Ajoutez cet useEffect pour vérifier les congés terminés au démarrage
    useEffect(() => {
        if (isAuthenticated) {
            // Vérifier immédiatement au chargement
            setTimeout(() => {
                verifierCongesTermines();
            }, 2000);

            // Vérifier toutes les heures
            const interval = setInterval(verifierCongesTermines, 60 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

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
        {id: 'carriere-pastorale', name: 'Carrière Pastorale', icon: Church},
        {id: 'absences', name: 'Absences', icon: Clock},
        {id: 'documents', name: 'Documents', icon: FileText},
        {id: 'talents', name: 'Talents', icon: Award},
        {id: 'etat-service', name: 'État de service', icon: BarChart3},
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
                            <p className="text-sm font-medium truncate">{user?.prenom} {user?.nom}</p>
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

// Dans le composant Header, ajoutez le CongesChecker
    const Header = () => (
        <header className="bg-white shadow-sm lg:static lg:overflow-y-visible">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    {/* Partie gauche - Menu burger */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <Menu className="h-6 w-6"/>
                        </button>
                    </div>

                    {/* Partie droite - Notifications + Profil */}
                    <div className="flex items-center space-x-4">
                        {/* Vérificateur de congés */}
                        <CongesChecker onEmployeUpdate={loadEmployes} />

                        {/* Notifications et paramètres */}
                        <div className="hidden lg:flex items-center space-x-2">
                            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100" title="Notifications">
                                <Bell className="h-5 w-5"/>
                            </button>
                        </div>

                        {/* Profil utilisateur */}
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
                                <p className="text-xs text-blue-600 truncate max-w-32">{user?.poste || 'Non spécifié'}</p>
                            </div>
                        </button>
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
                        {/* Diagramme par statut - Version contractée */}
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                Répartition par statut
                            </h3>

                            {safeEmployes.length > 0 ? (
                                <div className="relative">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart
                                            data={[
                                                { name: "Actifs", value: employesActifs, color: "#10B981" },
                                                { name: "Inactifs", value: employesInactifs, color: "#EF4444" },
                                                { name: "En congé", value: employesEnConge, color: "#F59E0B" }
                                            ]}
                                            margin={{ top: 15, right: 20, left: 15, bottom: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: '#4B5563', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fill: '#4B5563', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#F3F4F6' }}
                                                contentStyle={{
                                                    borderRadius: '8px',
                                                    border: '1px solid #E5E7EB',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    fontSize: '12px'
                                                }}
                                                formatter={(value, name) => [`${value} employés`, name]}
                                            />
                                            <Bar
                                                dataKey="value"
                                                name="Nombre d'employés"
                                                radius={[4, 4, 0, 0]}
                                            >
                                                {[
                                                    { name: "Actifs", value: employesActifs, color: "#10B981" },
                                                    { name: "Inactifs", value: employesInactifs, color: "#EF4444" },
                                                    { name: "En congé", value: employesEnConge, color: "#F59E0B" }
                                                ].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>

                                    {/* Légende compacte avec pourcentages */}
                                    <div className="flex flex-wrap justify-center mt-3 gap-3">
                                        {[
                                            { label: "Actifs", value: employesActifs, color: "#10B981" },
                                            { label: "Inactifs", value: employesInactifs, color: "#EF4444" },
                                            { label: "En congé", value: employesEnConge, color: "#F59E0B" }
                                        ].map((item, index) => {
                                            const percentage = safeEmployes.length > 0
                                                ? ((item.value / safeEmployes.length) * 100).toFixed(1)
                                                : 0;

                                            return (
                                                <div key={index} className="flex items-center">
                                                    <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-xs text-gray-600">{item.label}: <span className="font-medium">{item.value}</span> ({percentage}%)</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-52 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-center text-sm font-medium">Aucune donnée disponible</p>
                                    <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">
                                        Ajoutez des employés pour voir les statistiques
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Diagramme par poste - Version élargie */}
                        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                Répartition par poste
                            </h3>

                            {postes.length > 0 ? (
                                <div className="flex items-center justify-center">
                                    <div className="relative" style={{ width: '100%', height: '320px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={postes.map(poste => {
                                                        const count = safeEmployes.filter(e => e.poste === poste).length;
                                                        return {
                                                            name: poste?.replace('_', ' '),
                                                            value: count,
                                                            percentage: safeEmployes.length > 0 ? ((count / safeEmployes.length) * 100).toFixed(1) : 0
                                                        };
                                                    })}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={75}
                                                    outerRadius={110}
                                                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                                                    labelLine={false}
                                                >
                                                    {postes.map((poste, index) => (
                                                        <Cell
                                                            key={`cell-${poste}`}
                                                            fill={["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6", "#8B5CF6", "#EC4899"][index % 8]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value, name, props) => [`${value} employés (${props.payload.percentage}%)`, name]}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid #E5E7EB',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={40}
                                                    iconType="circle"
                                                    iconSize={10}
                                                    formatter={(value) => (
                                                        <span className="text-xs text-gray-600">{value}</span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Affichage du total au centre de l'anneau */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <div className="text-3xl font-bold text-gray-800">{safeEmployes.length}</div>
                                            <div className="text-sm text-gray-500 mt-1">Total employés</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-center font-medium">Aucune donnée disponible</p>
                                    <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">
                                        Ajoutez des postes pour voir les statistiques
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    };

    const Employes = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const [filteredEmployes, setFilteredEmployes] = useState<Employe[]>([]);

        // Filtrage intelligent des employés
        useEffect(() => {
            if (!searchTerm.trim()) {
                setFilteredEmployes(safeEmployes);
                return;
            }

            const term = searchTerm.toLowerCase().trim();
            const filtered = safeEmployes.filter(employe => {
                return (
                    employe.nom?.toLowerCase().includes(term) ||
                    employe.prenom?.toLowerCase().includes(term) ||
                    employe.matricule?.toLowerCase().includes(term) ||
                    employe.email?.toLowerCase().includes(term) ||
                    employe.telephone?.includes(term) ||
                    employe.poste?.toLowerCase().includes(term) ||
                    employe.statut?.toLowerCase().includes(term)
                );
            });

            setFilteredEmployes(filtered);
        }, [searchTerm, safeEmployes]);

        // Fonction pour obtenir la couleur du statut
        const getStatusColor = (statut: string) => {
            switch (statut) {
                case 'ACTIF': return 'bg-green-100 text-green-800';
                case 'INACTIF': return 'bg-red-100 text-red-800';
                case 'EN_CONGE': return 'bg-yellow-100 text-yellow-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };

        // Fonction pour formater le statut
        const formatStatut = (statut: string) => {
            switch (statut) {
                case 'EN_CONGE': return 'EN CONGÉ';
                default: return statut;
            }
        };

        return (
            <ErrorBoundary>
                <div className="space-y-6">
                    {/* En-tête */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employés</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Gestion de tous les employés de l'organisation
                                </p>
                            </div>

                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4 mr-2"/>
                                Nouvel employé
                            </button>
                        </div>

                    </div>

                    {/* Section Formulaire et Détails */}
                    {(showEmployeForm || showDetails) && (
                        <div className="bg-white rounded-lg shadow-lg border border-blue-200">
                            {/* Formulaire de modification/création d'employé */}
                            {showEmployeForm && (
                                <EmployeForm
                                    employe={editingEmploye}
                                    onClose={handleCloseForm}
                                    onSave={handleSave}
                                />
                            )}

                            {/* Détails de l'employé sélectionné */}
                            {showDetails && selectedEmploye && (
                                <EmployeDetails
                                    employe={selectedEmploye}
                                    onClose={handleCloseDetails}
                                    onEdit={handleEdit}
                                />
                            )}
                        </div>
                    )}
                    {/* Barre de recherche */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un employé par nom, prénom, matricule, poste, email, téléphone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Indicateur de résultats */}
                        {searchTerm && (
                            <div className="mt-2 text-sm text-gray-500">
                                {filteredEmployes.length} résultat(s) trouvé(s) pour "{searchTerm}"
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Liste des employés en bas - Version compacte */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredEmployes.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400"/>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">
                                    {searchTerm ? 'Aucun employé trouvé' : 'Aucun employé'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm
                                        ? 'Aucun résultat ne correspond à votre recherche'
                                        : 'Commencez par ajouter un nouvel employé.'
                                    }
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={handleCreate}
                                        className="mt-4 inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Ajouter un employé
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employé
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Matricule
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Poste
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEmployes.map((employe) => (
                                        <tr key={employe.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {employe.photoProfil ? (
                                                        <img
                                                            src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                                            alt={`${employe.prenom} ${employe.nom}`}
                                                            className="h-8 w-8 rounded-full object-cover mr-2"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">
                                                            {(employe.prenom?.[0] || '') + (employe.nom?.[0] || '')}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                                            {employe.prenom} {employe.nom}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                                            {employe.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                {employe.matricule}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 max-w-[100px] truncate">
                                                {employe.poste?.replace('_', ' ')}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                {employe.telephone}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employe.statut)}`}>
                                                    {formatStatut(employe.statut)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleViewDetails(employe)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                                        title="Voir détails"
                                                    >
                                                        <Eye className="h-3 w-3"/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(employe)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="h-3 w-3"/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEmploye(employe.id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-3 w-3"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </ErrorBoundary>
        );
    };

    const Conges = () => {
        const [showDemandeForm, setShowDemandeForm] = useState(false);
        const [selectedDemande, setSelectedDemande] = useState<any>(null);
        const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
        const [demandes, setDemandes] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');

        const loadDemandes = async () => {
            try {
                setLoading(true);
                const response = await api.get('/demandes-conge');
                const data = response.data;
                setDemandes(Array.isArray(data) ? data : []);
                setError('');
            } catch (err: any) {
                console.error('Erreur lors du chargement des demandes:', err);
                setError('Erreur lors du chargement des demandes');
                setDemandes([]);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            loadDemandes();
        }, []);

        const handleCreateDemande = () => {
            setSelectedDemande(null);
            setMode('create');
            setShowDemandeForm(true);
        };

        const handleViewDemande = (demande: any) => {
            setSelectedDemande(demande);
            setMode('view');
            setShowDemandeForm(true);
        };

        const handleEditDemande = (demande: any) => {
            setSelectedDemande(demande);
            setMode('edit');
            setShowDemandeForm(true);
        };

        const handleDeleteDemande = async (demandeId: number) => {
            if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
                return;
            }

            try {
                await api.delete(`/demandes-conge/${demandeId}`);
                loadDemandes(); // Recharger la liste
            } catch (err) {
                console.error('Erreur lors de la suppression:', err);
                alert('Erreur lors de la suppression de la demande');
            }
        };

        const handleApproveDemande = async (demandeId: number) => {
            try {
                await api.put(`/demandes-conge/${demandeId}/approve`);
                loadDemandes(); // Recharger la liste
            } catch (err) {
                console.error('Erreur lors de l\'approbation:', err);
                alert('Erreur lors de l\'approbation de la demande');
            }
        };

        const handleRejectDemande = async (demandeId: number) => {
            const motif = prompt('Motif de rejet (optionnel):');
            try {
                await api.put(`/demandes-conge/${demandeId}/reject`, { motifRejet: motif });
                loadDemandes(); // Recharger la liste
            } catch (err) {
                console.error('Erreur lors du rejet:', err);
                alert('Erreur lors du rejet de la demande');
            }
        };

        const getStatutBadgeClass = (statut: string) => {
            switch (statut) {
                case 'APPROUVE':
                    return 'bg-green-100 text-green-800';
                case 'REJETE':
                    return 'bg-red-100 text-red-800';
                case 'ANNULE':
                    return 'bg-gray-100 text-gray-800';
                default:
                    return 'bg-yellow-100 text-yellow-800';
            }
        };

        const calculateDays = (dateDebut: string, dateFin: string): number => {
            if (!dateDebut || !dateFin) return 0;

            const debut = new Date(dateDebut);
            const fin = new Date(dateFin);
            const timeDiff = fin.getTime() - debut.getTime();
            return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        };

        const formatStatut = (statut: string) => {
            switch (statut) {
                case 'EN_ATTENTE':
                    return 'EN ATTENTE';
                case 'APPROUVE':
                    return 'APPROUVÉ';
                case 'REJETE':
                    return 'REJETÉ';
                case 'ANNULE':
                    return 'ANNULÉ';
                default:
                    return statut;
            }
        };

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

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

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
                                {demandes.map((demande) => (
                                    <tr key={demande.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {demande.employe?.photoProfil ? (
                                                    <img
                                                        src={`http://localhost:8080/uploads/${demande.employe.photoProfil}`}
                                                        alt={`${demande.employe.prenom} ${demande.employe.nom}`}
                                                        className="h-8 w-8 rounded-full object-cover mr-3"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                                                        {demande.employe ?
                                                            (demande.employe.prenom?.[0] || '') + (demande.employe.nom?.[0] || '')
                                                            : '??'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {demande.employe ?
                                                            `${demande.employe.prenom || ''} ${demande.employe.nom || ''}`.trim()
                                                            : 'Employé inconnu'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {demande.employe?.matricule || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {demande.typeConge || 'Non spécifié'} {/* Afficher le type de congé */}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {demande.dateDebut && demande.dateFin ? (
                                                <>
                                                    {new Date(demande.dateDebut).toLocaleDateString('fr-FR')} - {new Date(demande.dateFin).toLocaleDateString('fr-FR')}
                                                    <br/>
                                                    <span className="text-xs text-gray-500">
                ({calculateDays(demande.dateDebut, demande.dateFin)} jours) {/* Calculer les jours */}
            </span>
                                                </>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutBadgeClass(demande.statut)}`}>
                        {formatStatut(demande.statut)}
                      </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                            <button
                                                onClick={() => handleViewDemande(demande)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                                title="Voir détails"
                                            >
                                                <Eye className="h-4 w-4"/>
                                            </button>

                                            {demande.statut === 'EN_ATTENTE' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApproveDemande(demande.id)}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                                                        title="Approuver"
                                                    >
                                                        <CheckCircle className="h-4 w-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectDemande(demande.id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                                        title="Rejeter"
                                                    >
                                                        <XCircle className="h-4 w-4"/>
                                                    </button>
                                                </>
                                            )}

                                            {demande.statut === 'EN_ATTENTE' && (
                                                <button
                                                    onClick={() => handleEditDemande(demande)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4"/>
                                                </button>
                                            )}

                                            {demande.statut === 'EN_ATTENTE' && (
                                                <button
                                                    onClick={() => handleDeleteDemande(demande.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {showDemandeForm && (
                        <DemandeCongeForm
                            demande={selectedDemande}
                            mode={mode}
                            onClose={() => {
                                setShowDemandeForm(false);
                                setSelectedDemande(null);
                            }}
                            onSave={() => {
                                setShowDemandeForm(false);
                                setSelectedDemande(null);
                                loadDemandes();
                            }}
                        />
                    )}
                </div>
            </ErrorBoundary>
        );
    };

    const Absences = () => {
        const [showAbsenceForm, setShowAbsenceForm] = useState(false);
        const [selectedAbsence, setSelectedAbsence] = useState<any>(null);

        return (
            <ErrorBoundary>
                <div className="space-y-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Gestion des Absences</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Gestion des absences et congés exceptionnels des employés
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAbsenceForm(true)}
                            className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2"/>
                            Nouvelle absence
                        </button>
                    </div>

                    <AbsenceList
                        onEditAbsence={setSelectedAbsence}
                        onCreateAbsence={() => setShowAbsenceForm(true)}
                    />

                    {showAbsenceForm && (
                        <AbsenceForm
                            absence={selectedAbsence}
                            onClose={() => {
                                setShowAbsenceForm(false);
                                setSelectedAbsence(null);
                            }}
                            onSave={() => {
                                setShowAbsenceForm(false);
                                setSelectedAbsence(null);
                                // Vous pourriez vouloir recharger la liste ici
                            }}
                        />
                    )}
                </div>
            </ErrorBoundary>
        );
    };

    const Profil = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [savingProfile, setSavingProfile] = useState(false);
        const [, setUploadingPhoto] = useState(false);
        const [formData, setFormData] = useState({
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            poste: '',
            adresse: '',
            dateNaissance: '',
            genre: ''
        });
        const [passwordForm, setPasswordForm] = useState({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (user) {
                setFormData({
                    nom: user.nom || '',
                    prenom: user.prenom || '',
                    email: user.email || '',
                    telephone: user.telephone || '',
                    poste: user.poste || '',
                    adresse: user.adresse || '',
                    dateNaissance: user.dateNaissance ? user.dateNaissance.split('T')[0] : '',
                    genre: user.genre || ''
                });
                setLoading(false);
            }
        }, [user]);

        if (!user || loading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        const handleSaveProfile = async () => {
            try {
                // Validation des données
                if (!formData.nom?.trim() || !formData.prenom?.trim()) {
                    alert('Le nom et le prénom sont obligatoires');
                    return;
                }

                // Vérification du token
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Session expirée. Veuillez vous reconnecter.');
                    handleLogout();
                    return;
                }

                setSavingProfile(true);

                // Nettoyage des données
                const cleanedData: any = {};

                if (formData.nom?.trim()) cleanedData.nom = formData.nom.trim();
                if (formData.prenom?.trim()) cleanedData.prenom = formData.prenom.trim();
                if (formData.email?.trim()) cleanedData.email = formData.email.trim();
                if (formData.telephone?.trim()) cleanedData.telephone = formData.telephone.trim();
                if (formData.poste?.trim()) cleanedData.poste = formData.poste.trim();
                if (formData.adresse?.trim()) cleanedData.adresse = formData.adresse.trim();
                if (formData.dateNaissance) cleanedData.dateNaissance = formData.dateNaissance;
                if (formData.genre) cleanedData.genre = formData.genre;

                console.log('📤 Données envoyées:', cleanedData);

                const updatedUser = await authService.updateProfile(cleanedData);

                // Mettre à jour l'état et le stockage
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setIsEditing(false);
                alert('Profil mis à jour avec succès!');

            } catch (error: any) {
                console.error('❌ Erreur détaillée:', error);

                let errorMessage = 'Erreur lors de la mise à jour du profil';

                if (error.response) {
                    // Erreur avec réponse du serveur
                    const { status, data } = error.response;

                    if (status === 401) {
                        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                        handleLogout();
                    } else if (status === 400) {
                        errorMessage = data?.error || data?.message || 'Données invalides';
                    } else if (status === 500) {
                        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                    } else {
                        errorMessage = data?.error || data?.message || `Erreur ${status}`;
                    }
                } else if (error.request) {
                    // Pas de réponse du serveur
                    errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
                } else {
                    // Erreur de configuration
                    errorMessage = error.message || 'Erreur inconnue';
                }

                alert(errorMessage);
            } finally {
                setSavingProfile(false);
            }
        };

        const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                setUploadingPhoto(true);

                // Vérification du token avant l'upload
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Session expirée. Veuillez vous reconnecter.');
                    handleLogout();
                    return;
                }

                // Vérifications du fichier
                if (file.size > 5 * 1024 * 1024) {
                    alert('Le fichier est trop volumineux (max 5MB)');
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    alert('Seules les images sont autorisées');
                    return;
                }

                const updatedUser = await authService.uploadProfilePhoto(file);
                setUser(updatedUser);
                alert('Photo de profil mise à jour avec succès!');

                // Recharger les données utilisateur
                await checkAuth();

            } catch (error: any) {
                console.error('Erreur upload photo:', error);

                if (error.message.includes('Token') || error.message.includes('non trouvé')) {
                    alert('Session expirée. Veuillez vous reconnecter.');
                    handleLogout();
                } else {
                    alert(error.response?.data?.error || 'Erreur lors de l\'upload de la photo');
                }
            } finally {
                setUploadingPhoto(false);
            }
        };

        return (
            <div className="space-y-6">
                {/* En-tête */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                            <p className="text-gray-600">Gérez vos informations personnelles</p>
                        </div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 flex items-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                                >
                                    {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Photo et informations de base */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            {user.photoProfil ? (
                                <img
                                    src={`http://localhost:8080/uploads/${user.photoProfil}`}
                                    alt={`${user.prenom} ${user.nom}`}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {user.prenom?.[0]}{user.nom?.[0]}
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-blue-900 text-white p-1 rounded-full cursor-pointer hover:bg-blue-800">
                                <Camera className="w-3 h-3" />
                                <input type="file" className="hidden" onChange={handleUploadPhoto} accept="image/*" />
                            </label>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{user.prenom} {user.nom}</h2>
                            <p className="text-gray-600">@{user.nomUtilisateur}</p>
                            <p className="text-blue-900 font-medium">{user.poste}</p>
                        </div>
                    </div>
                </div>

                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-900" />
                            Informations personnelles
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Prénom</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                                        className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                    />
                                ) : (
                                    <p className="py-2">{user.prenom}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Nom</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                                        className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                    />
                                ) : (
                                    <p className="py-2">{user.nom}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                    />
                                ) : (
                                    <p className="py-2">{user.email || 'Non renseigné'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sécurité */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Lock className="w-5 h-5 mr-2 text-blue-900" />
                            Sécurité
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Mot de passe actuel</label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                    className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    className="w-full border-b border-gray-400 focus:border-blue-700 focus:outline-none py-2"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
                                        alert('Veuillez remplir tous les champs');
                                        return;
                                    }
                                    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                                        alert('Les mots de passe ne correspondent pas');
                                        return;
                                    }
                                    try {
                                        await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        alert('Mot de passe changé avec succès!');
                                    } catch (error: any) {
                                        alert(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
                                    }
                                }}
                                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
                            >
                                Changer le mot de passe
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPage = () => {
        // Vérifier l'authentification avant de rendre la page
        if (!isAuthenticated && currentPage !== 'login') {
            return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard/>;
            case 'employes':
                return <Employes/>;
            case 'conges':
                return <Conges/>;
            case 'absences':
                return <Absences/>;
            case 'carriere-pastorale':
                return <CarrierePastoralePage/>;
            case 'documents':
                return <Documents/>;
            case 'talents':
                return <Talents/>;
            case 'etat-service':
                return <EtatService/>;
            case 'profil':
                return <Profil/>;
            default:
                return <Dashboard/>;
        }
    }

    // Condition d'authentification
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

export default App