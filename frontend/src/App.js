import React, { useState } from 'react';
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
    Trash2, Clock
} from 'lucide-react';
import AbsenceList from '../components/AbsenceList';
function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [employes, setEmployes] = useState([
        {
            id: 1,
            matricule: 'EMP001',
            nom: 'RAKOTO',
            prenom: 'Jean',
            poste: 'PASTEUR_TITULAIRE',
            email: 'jean.rakoto@example.com',
            telephone: '0341234567',
            statut: 'ACTIF'
        },
        {
            id: 2,
            matricule: 'EMP002',
            nom: 'RANDRIA',
            prenom: 'Marie',
            poste: 'SECRETAIRE_EXECUTIF',
            email: 'marie.randria@example.com',
            telephone: '0347654321',
            statut: 'ACTIF'
        }
    ]);

    const menuItems = [
        { id: 'dashboard', name: 'Tableau de bord', icon: Home },
        { id: 'employes', name: 'Employés', icon: Users },
        { id: 'conges', name: 'Congés', icon: Calendar },
        {id: 'absences', name: 'Absences', icon: Clock},
        {id: 'absences', name: 'Absences', icon: Calendar},
        { id: 'documents', name: 'Documents', icon: FileText },
        { id: 'talents', name: 'Talents', icon: Award },
        { id: 'etat-service', name: 'État de service', icon: BarChart3 }
    ];


    const Sidebar = () => (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
            <div className="flex items-center justify-between h-16 px-4 bg-slate-900">
                <h1 className="text-xl font-bold">RH Management</h1>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-1 rounded-md hover:bg-slate-700"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <nav className="mt-5 px-2">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentPage(item.id);
                                setSidebarOpen(false);
                            }}
                            className={`group flex items-center w-full px-2 py-2 text-base leading-6 font-medium rounded-md transition duration-150 ease-in-out mb-1 ${
                                currentPage === item.id
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            <IconComponent className="mr-4 h-5 w-5" />
                            {item.name}
                        </button>
                    );
                })}
            </nav>
        </div>
    );

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
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
                        <div className="flex items-center px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
                            <div className="w-full">
                                <label htmlFor="search" className="sr-only">Rechercher</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="search"
                                        name="search"
                                        className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Rechercher un employé..."
                                        type="search"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700">Bienvenue, Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );

    const Dashboard = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Vue d'ensemble de la gestion des ressources humaines
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Employés
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {employes.length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Employés Actifs
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {employes.filter(e => e.statut === 'ACTIF').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Calendar className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Congés en cours
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">0</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Documents
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">0</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Employés récents
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Liste des derniers employés ajoutés
                    </p>
                </div>
                <ul className="divide-y divide-gray-200">
                    {employes.slice(0, 5).map((employe) => (
                        <li key={employe.id}>
                            <div className="px-4 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-gray-600" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {employe.nom} {employe.prenom}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {employe.poste} - {employe.matricule}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employe.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employe.statut}
                  </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    const Employes = () => (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Employés</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Gestion de tous les employés de l'organisation
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvel employé
                    </button>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Liste des employés
                        </h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
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
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-gray-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employe.nom} {employe.prenom}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {employe.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {employe.matricule}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {employe.poste.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {employe.telephone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employe.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employe.statut}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'employes':
                return <Employes />;
            case 'conges':
                return (
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Gestion des congés</h3>
                        <p className="mt-1 text-sm text-gray-500">Cette fonctionnalité sera bientôt disponible.</p>
                    </div>
                );
            case 'absences':
                return <Absences/>
            case 'documents':
                return (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Gestion des documents</h3>
                        <p className="mt-1 text-sm text-gray-500">Cette fonctionnalité sera bientôt disponible.</p>
                    </div>
                );
            case 'talents':
                return (
                    <div className="text-center py-12">
                        <Award className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Gestion des talents</h3>
                        <p className="mt-1 text-sm text-gray-500">Cette fonctionnalité sera bientôt disponible.</p>
                    </div>
                );
            case 'etat-service':
                return (
                    <div className="text-center py-12">
                        <BarChart3 className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">État de service</h3>
                        <p className="mt-1 text-sm text-gray-500">Cette fonctionnalité sera bientôt disponible.</p>
                    </div>
                );
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default App;