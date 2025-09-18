import React, { useState, useEffect } from 'react';
import { Users, Search, MapPin, Calendar, Award, ChevronRight, Church, BookOpen, Star } from 'lucide-react';
import { employeService, type Employe } from '../services/api';
import CarrierePastorale from './CarrierePastorale';

const CarrierePastoralePage: React.FC = () => {
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [posteFilter, setPosteFilter] = useState<string>('');

    useEffect(() => {
        loadEmployes();
    }, []);

    const loadEmployes = async () => {
        try {
            setLoading(true);
            const data = await employeService.getAllEmployes();
            // Filtrer seulement les pasteurs et évangélistes
            const pasteurs = data.filter(emp =>
                emp.poste?.includes('PASTEUR') ||
                emp.poste === 'EVANGELISTE' ||
                emp.poste === 'MISSIONNAIRE'
            );
            setEmployes(pasteurs);
        } catch (error) {
            console.error('Erreur lors du chargement des pasteurs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployes = employes.filter(employe => {
        const matchesSearch =
            employe.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employe.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employe.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employe.affectationActuelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employe.poste?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = !statusFilter || employe.statut === statusFilter;
        const matchesPoste = !posteFilter || employe.poste === posteFilter;

        return matchesSearch && matchesStatus && matchesPoste;
    });

    const getPosteDisplayName = (poste: string) => {
        const postes: { [key: string]: string } = {
            'PASTEUR_STAGIAIRE': 'Pasteur Stagiaire',
            'PASTEUR_AUTORISE': 'Pasteur Autorisé',
            'PASTEUR_CONSACRE': 'Pasteur Consacré',
            'EVANGELISTE': 'Évangéliste',
            'MISSIONNAIRE': 'Missionnaire',
            'PASTEUR_TITULAIRE': 'Pasteur Titulaire',
            'PASTEUR_ASSOCIE': 'Pasteur Associé'
        };
        return postes[poste] || poste?.replace('_', ' ') || 'Non spécifié';
    };

    const getNiveauAccreditation = (niveau: string) => {
        const niveaux: { [key: string]: string } = {
            'DISTRICT': 'District',
            'FEDERATION': 'Fédération'
        };
        return niveaux[niveau] || niveau;
    };

    const postesOptions = Array.from(new Set(employes.map(e => e.poste).filter(Boolean)));
    Array.from(new Set(employes.map(e => e.affectationActuelle).filter(Boolean)));
    if (selectedEmploye) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedEmploye(null)}
                    className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                    Retour à la liste des ministères
                </button>
                <CarrierePastorale employe={selectedEmploye} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Ministères Pastoraux</h1>
                        <p className="mt-2 text-gray-600">
                            Gestion des carrières et affectations des serviteurs de Dieu
                        </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <Church className="h-8 w-8 text-gray-600" />
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{employes.length}</p>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">En service</p>
                            <p className="text-2xl font-bold text-green-600">
                                {employes.filter(e => e.statut === 'ACTIF').length}
                            </p>
                        </div>
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Award className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inactif ou retraité</p>
                            <p className="text-2xl font-bold text-red-600">
                                {employes.filter(e => e.statut === 'INACTIF').length}
                            </p>
                        </div>
                        <div className="bg-red-100 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">En congé</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {employes.filter(e => e.statut === 'EN_CONGE').length}
                            </p>
                        </div>
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un serviteur (nom, prénom, matricule, affectation...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="ACTIF">Actif</option>
                            <option value="INACTIF">Inactif ou retraité</option>
                            <option value="EN_CONGE">En congé</option>
                        </select>

                        <select
                            value={posteFilter}
                            onChange={(e) => setPosteFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tous les postes</option>
                            {postesOptions.map(poste => (
                                <option key={poste} value={poste}>
                                    {getPosteDisplayName(poste)}
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-lg border ${
                                    viewMode === 'grid'
                                        ? 'bg-blue-100 border-blue-300 text-blue-600'
                                        : 'border-gray-300 text-gray-400 hover:text-gray-600'
                                }`}
                                title="Vue grille"
                            >
                                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                                    <div className="bg-current rounded-sm"></div>
                                    <div className="bg-current rounded-sm"></div>
                                    <div className="bg-current rounded-sm"></div>
                                    <div className="bg-current rounded-sm"></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-lg border ${
                                    viewMode === 'list'
                                        ? 'bg-blue-100 border-blue-300 text-blue-600'
                                        : 'border-gray-300 text-gray-400 hover:text-gray-600'
                                }`}
                                title="Vue liste"
                            >
                                <div className="space-y-1 w-4 h-4">
                                    <div className="bg-current h-0.5 rounded"></div>
                                    <div className="bg-current h-0.5 rounded"></div>
                                    <div className="bg-current h-0.5 rounded"></div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-600">Chargement des ministères...</p>
                    </div>
                ) : filteredEmployes.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchTerm || statusFilter || posteFilter
                                ? 'Aucun résultat trouvé'
                                : 'Aucun ministère enregistré'
                            }
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            {searchTerm || statusFilter || posteFilter
                                ? `Aucun serviteur ne correspond à vos critères de recherche.`
                                : 'Commencez par ajouter des serviteurs dans la section Employés.'
                            }
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEmployes.map((employe) => (
                            <div
                                key={employe.id}
                                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 group relative overflow-hidden"
                                onClick={() => setSelectedEmploye(employe)}
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gray-100 opacity-50 group-hover:opacity-70 transition-opacity"></div>

                                <div className="flex flex-col items-center text-center relative z-10">
                                    {/* Photo de profil */}
                                    <div className="relative mb-4">
                                        {employe.photoProfil ? (
                                            <img
                                                src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                                alt={`${employe.prenom} ${employe.nom}`}
                                                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                        ) : (
                                            <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                                                {(employe.prenom?.[0] || '') + (employe.nom?.[0] || '')}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                                            employe.statut === 'ACTIF' ? 'bg-green-400' :
                                                employe.statut === 'INACTIF' ? 'bg-red-400' :
                                                    'bg-yellow-400'
                                        }`}></div>
                                    </div>

                                    {/* Informations principales */}
                                    <div className="w-full">
                                        <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                                            {employe.prenom} {employe.nom}
                                        </h4>
                                        <p className="text-blue-600 font-medium text-sm mb-2">
                                            {getPosteDisplayName(employe.poste)}
                                        </p>
                                        <p className="text-gray-500 text-xs mb-4">{employe.matricule}</p>

                                        {/* Informations supplémentaires */}
                                        {employe.affectationActuelle && (
                                            <div className="flex items-center justify-center text-sm text-gray-600 mb-3">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                <span className="truncate">{employe.affectationActuelle}</span>
                                            </div>
                                        )}

                                        {employe.niveauAccreditation && (
                                            <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
                                                <Star className="h-3 w-3 mr-1" />
                                                <span>{getNiveauAccreditation(employe.niveauAccreditation)}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                employe.statut === 'ACTIF' ? 'bg-green-100 text-green-800' :
                                                    employe.statut === 'INACTIF' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {employe.statut === 'INACTIF' ? 'Inactif ou retraité' : employe.statut}
                                            </span>

                                            <div className="flex items-center text-blue-600 text-sm group-hover:text-blue-800 transition-colors">
                                                <span className="font-medium">Détails</span>
                                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredEmployes.map((employe) => (
                            <div
                                key={employe.id}
                                className="flex items-center p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-blue-300 group"
                                onClick={() => setSelectedEmploye(employe)}
                            >
                                {/* Photo */}
                                {employe.photoProfil ? (
                                    <img
                                        src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                        alt={`${employe.prenom} ${employe.nom}`}
                                        className="h-14 w-14 rounded-full object-cover mr-5 border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-5 border-2 border-white shadow-sm">
                                        {(employe.prenom?.[0] || '') + (employe.nom?.[0] || '')}
                                    </div>
                                )}

                                {/* Informations */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-base font-semibold text-gray-900">
                                            {employe.prenom} {employe.nom}
                                        </h4>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                            employe.statut === 'ACTIF' ? 'bg-green-100 text-green-800' :
                                                employe.statut === 'INACTIF' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {employe.statut === 'INACTIF' ? 'Inactif ou retraité' : employe.statut}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="text-blue-600 font-medium">
                                            {getPosteDisplayName(employe.poste)}
                                        </span>
                                        <span>•</span>
                                        <span>{employe.matricule}</span>
                                        {employe.affectationActuelle && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {employe.affectationActuelle}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 ml-4" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarrierePastoralePage;