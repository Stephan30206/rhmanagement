import React, { useState, useEffect, useMemo } from 'react';
import { Download, Calendar, User, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { employeService, type Employe } from '../services/api';

interface HistoriquePoste {
    id?: number;
    poste: string;
    organisation: string;
    dateDebut: string;
    dateFin: string | null;
    salairePleinTemps: number | null;
    pourcentageSalaire: number | null;
    salaireBase100: number | null;
}

const EtatService: React.FC = () => {
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
    const [historique, setHistorique] = useState<HistoriquePoste[]>([]);
    const [showHistoriqueForm, setShowHistoriqueForm] = useState(false);
    const [editingHistorique, setEditingHistorique] = useState<HistoriquePoste | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmployes();
    }, []);

    useEffect(() => {
        if (selectedEmploye) {
            loadHistorique();
        }
    }, [selectedEmploye]);

    // Ajouter cette fonction dans le composant EtatService
    const getPosteName = (historiqueItem: HistoriquePoste, employe: Employe) => {
        // Si c'est l'historique actuel et que l'employé a un poste personnalisé
        if (historiqueItem.poste === 'AUTRE' && employe.postePersonnalise) {
            return employe.postePersonnalise;
        }

        // Sinon, utiliser la correspondance habituelle
        const postes = {
            'EVANGELISTE': 'Évangéliste',
            'PASTEUR_STAGIAIRE': 'Pasteur stagiaire',
            'PASTEUR_AUTORISE': 'Pasteur autorisé',
            'PASTEUR_CONSACRE': 'Pasteur consacré',
            'SECRETAIRE_EXECUTIF': 'Secrétaire exécutif',
            'TRESORIER': 'Trésorier',
            'ASSISTANT_RH': 'Assistant RH',
            'VERIFICATEUR': 'Vérificateur',
            'AUTRE': 'Autre'
        };

        return postes[historiqueItem.poste as keyof typeof postes] || historiqueItem.poste;
    };

    const getPosteDisplay = (employe: Employe) => {
        if (employe.poste === 'AUTRE' && employe.postePersonnalise) {
            return employe.postePersonnalise;
        }

        const postes = {
            'EVANGELISTE': 'Évangéliste',
            'PASTEUR_STAGIAIRE': 'Pasteur stagiaire',
            'PASTEUR_AUTORISE': 'Pasteur autorisé',
            'PASTEUR_CONSACRE': 'Pasteur consacré',
            'SECRETAIRE_EXECUTIF': 'Secrétaire exécutif',
            'TRESORIER': 'Trésorier',
            'ASSISTANT_RH': 'Assistant RH',
            'VERIFICATEUR': 'Vérificateur',
            'AUTRE': 'Autre'
        };

        return postes[employe.poste as keyof typeof postes] || employe.poste;
    };
    const loadEmployes = async () => {
        try {
            const data = await employeService.getAllEmployes();
            setEmployes(data);
            if (data.length > 0 && !selectedEmploye) {
                setSelectedEmploye(data[0]);
            }
        } catch (error) {
            console.error('Erreur chargement employés:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHistorique = async () => {
        if (!selectedEmploye) return;
        try {
            const data = await employeService.getHistorique(selectedEmploye.id);
            // @ts-ignore si nécessaire selon le shape de la réponse
            setHistorique(data);
        } catch (error) {
            console.error('Erreur chargement historique:', error);
        }
    };

    const handleSaveHistorique = async (historiqueData: HistoriquePoste) => {
        if (!selectedEmploye) return;

        try {
            // ✅ Conversion uniquement pour l'appel API
            const apiHistoriqueData = {
                ...historiqueData,
                dateFin: historiqueData.dateFin ?? undefined,
                salairePleinTemps: historiqueData.salairePleinTemps ?? undefined,
                pourcentageSalaire: historiqueData.pourcentageSalaire ?? undefined,
                salaireBase100: historiqueData.salaireBase100 ?? undefined,
            };

            if (editingHistorique?.id) {
                // 🔄 Mise à jour
                await employeService.updateHistorique(
                    selectedEmploye.id,
                    editingHistorique.id,
                    apiHistoriqueData
                );
            } else {
                // ➕ Création
                await employeService.saveHistorique(
                    selectedEmploye.id,
                    apiHistoriqueData
                );
            }

            // ✅ Réinitialisation et rechargement après sauvegarde
            setShowHistoriqueForm(false);
            setEditingHistorique(null);
            loadHistorique();
        } catch (error) {
            console.error('Erreur sauvegarde historique:', error);
        }
    };

    const handleDeleteHistorique = async (id: number) => {
        if (!selectedEmploye) return;
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet historique ?')) {
            try {
                await employeService.deleteHistorique(selectedEmploye.id, id);
                loadHistorique();
            } catch (error) {
                console.error('Erreur suppression historique:', error);
            }
        }
    };

    const handleExport = async () => {
        if (!selectedEmploye) return;
        try {
            const response = await employeService.exportEtatService(selectedEmploye.id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `etat-service-${selectedEmploye.matricule}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Erreur export:', error);
        }
    };

    // --- TRI : ordre croissant par dateDebut (années ascendantes) ---
    const sortedHistorique = useMemo(() => {
        return [...historique].sort((a, b) => {
            const ta = a?.dateDebut ? new Date(a.dateDebut).getTime() : 0;
            const tb = b?.dateDebut ? new Date(b.dateDebut).getTime() : 0;
            return ta - tb; // croissant (ancien → récent)
        });
    }, [historique]);

    const filteredEmployes = employes.filter(emp =>
        emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">État de service</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Historique professionnel complet des employés
                    </p>
                </div>
                {selectedEmploye && (
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter PDF
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Liste des employés */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Employés</h3>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredEmployes.map((employe) => (
                                <div
                                    key={employe.id}
                                    onClick={() => setSelectedEmploye(employe)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedEmploye?.id === employe.id
                                        ? 'bg-blue-100 border border-blue-300'
                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {employe.photoProfil ? (
                                            <img
                                                src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                                alt={`${employe.prenom} ${employe.nom}`}
                                                className="h-8 w-8 rounded-full object-cover mr-3"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                                                {employe.prenom[0]}{employe.nom[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {employe.prenom} {employe.nom}
                                            </p>
                                            <p className="text-xs text-gray-500">{employe.matricule}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* État de service */}
                <div className="lg:col-span-3">
                    {selectedEmploye ? (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    {selectedEmploye.photoProfil ? (
                                        <img
                                            src={`http://localhost:8080/uploads/${selectedEmploye.photoProfil}`}
                                            alt={`${selectedEmploye.prenom} ${selectedEmploye.nom}`}
                                            className="h-16 w-16 rounded-full object-cover mr-4"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                                            {selectedEmploye.prenom[0]}{selectedEmploye.nom[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedEmploye.prenom} {selectedEmploye.nom}
                                        </h3>
                                        <p className="text-gray-600">
                                            {selectedEmploye.matricule} • {getPosteDisplay(selectedEmploye)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingHistorique(null);
                                        setShowHistoriqueForm(true);
                                    }}
                                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter
                                </button>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">État de service complet</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Période
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Poste
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Organisation
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Salaire
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedHistorique.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : ''}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : 'Présent'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {getPosteName(item, selectedEmploye)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{item.organisation}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {item.salairePleinTemps ? item.salairePleinTemps.toLocaleString() : '0'} MGA
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.pourcentageSalaire ?? 0}% ({item.salaireBase100 ? item.salaireBase100.toLocaleString() : '0'} MGA)
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingHistorique(item);
                                                                setShowHistoriqueForm(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHistorique(item.id!)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                {sortedHistorique.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <p>Aucun historique professionnel</p>
                                        <p className="text-sm">Commencez par ajouter un poste dans l'historique</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-12 text-center">
                            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un employé</h3>
                            <p className="text-gray-600">Choisissez un employé dans la liste pour voir son état de service</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal pour ajouter/modifier l'historique */}
            {showHistoriqueForm && selectedEmploye && (
                <HistoriqueForm
                    historique={editingHistorique}
                    selectedEmploye={selectedEmploye}
                    onClose={() => {
                        setShowHistoriqueForm(false);
                        setEditingHistorique(null);
                    }}
                    onSave={handleSaveHistorique}
                />
            )}
        </div>
    );
};

const getPosteDisplayForm = (employe: Employe, posteValue: string) => {
    // Si c'est le poste actuel et qu'il y a un poste personnalisé
    if (posteValue === 'AUTRE' && employe.postePersonnalise) {
        return employe.postePersonnalise;
    }

    // Sinon, utiliser la correspondance
    const postes = {
        'EVANGELISTE': 'Évangéliste',
        'PASTEUR_STAGIAIRE': 'Pasteur stagiaire',
        'PASTEUR_AUTORISE': 'Pasteur autorisé',
        'PASTEUR_CONSACRE': 'Pasteur consacré',
        'SECRETAIRE_EXECUTIF': 'Secrétaire exécutif',
        'TRESORIER': 'Trésorier',
        'ASSISTANT_RH': 'Assistant RH',
        'VERIFICATEUR': 'Vérificateur',
        'AUTRE': 'Autre'
    };

    return postes[posteValue as keyof typeof postes] || posteValue;
};

// Formulaire d'ajout/modification historique
const HistoriqueForm: React.FC<{
    historique: HistoriquePoste | null;
    selectedEmploye: Employe;
    onClose: () => void;
    onSave: (historique: HistoriquePoste) => void;
}> = ({ historique, selectedEmploye, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        poste: historique?.poste || selectedEmploye.poste || '',
        organisation: historique?.organisation || '',
        dateDebut: historique?.dateDebut || '',
        dateFin: historique?.dateFin || '',
        pourcentageSalaire: historique?.pourcentageSalaire || 100,
        salaireBase100: historique?.salaireBase100 || 0,
        salairePleinTemps: historique?.salairePleinTemps || 0
    });

    // Calcul automatique du salaire plein temps
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            salairePleinTemps: (prev.salaireBase100 ?? 0) * ((prev.pourcentageSalaire ?? 0) / 100)
        }));
    }, [formData.salaireBase100, formData.pourcentageSalaire]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h3 className="text-lg font-medium mb-4">
                    {historique ? "Modifier l'historique" : "Nouvel historique"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Poste</label>
                            <input
                                type="text"
                                value={getPosteDisplayForm(selectedEmploye, formData.poste)}
                                readOnly
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Organisation</label>
                            <input
                                type="text"
                                required
                                value={formData.organisation}
                                onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début</label>
                            <input
                                type="date"
                                required
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                            <input
                                type="date"
                                value={formData.dateFin || ''}
                                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pourcentage salaire</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.pourcentageSalaire}
                                onChange={(e) =>
                                    setFormData({ ...formData, pourcentageSalaire: parseFloat(e.target.value) })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Salaire base 100%</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.salaireBase100}
                                onChange={(e) =>
                                    setFormData({ ...formData, salaireBase100: parseFloat(e.target.value) })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="text-gray-700 text-sm">
                        Salaire plein temps calculé automatiquement: <strong>{(formData.salairePleinTemps ?? 0).toLocaleString()} MGA</strong>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EtatService;