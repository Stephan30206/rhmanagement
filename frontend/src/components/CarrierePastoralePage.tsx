// src/components/CarrierePastoralePage.tsx
import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { employeService, type Employe } from '../services/api';
import CarrierePastorale from './CarrierePastorale';

const CarrierePastoralePage: React.FC = () => {
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmployes();
    }, []);

    const loadEmployes = async () => {
        try {
            setLoading(true);
            const data = await employeService.getAllEmployes();
            // Filtrer seulement les pasteurs
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

    const filteredEmployes = employes.filter(employe =>
        employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employe.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedEmploye) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedEmploye(null)}
                    className="mb-4 inline-flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                    ← Retour à la liste
                </button>
                <CarrierePastorale employe={selectedEmploye} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Carrière Pastorale</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Gestion des affectations pastorales des employés
                    </p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un pasteur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredEmployes.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun pasteur trouvé</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun pasteur enregistré'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEmployes.map((employe) => (
                            <div
                                key={employe.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                                onClick={() => setSelectedEmploye(employe)}
                            >
                                <div className="flex items-center space-x-3">
                                    {employe.photoProfil ? (
                                        <img
                                            src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                            alt={`${employe.prenom} ${employe.nom}`}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {(employe.prenom?.[0] || '') + (employe.nom?.[0] || '')}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {employe.prenom} {employe.nom}
                                        </h4>
                                        <p className="text-sm text-gray-500 truncate">{employe.poste}</p>
                                        <p className="text-xs text-gray-400">{employe.matricule}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        employe.statut === 'ACTIF' ? 'bg-green-100 text-green-800' :
                                            employe.statut === 'INACTIF' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {employe.statut}
                                    </span>
                                    <span className="text-blue-600 hover:text-blue-800 text-sm">
                                        Voir carrière →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarrierePastoralePage;